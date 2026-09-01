import { get, set, del } from 'idb-keyval';
import * as XLSX from 'xlsx';
import { DocumentItem, FileFormat } from '../types';
import { 
  saveFileChunksToFirestore, 
  getFileChunksFromFirestore, 
  deleteFileChunksFromFirestore 
} from '../lib/firestoreService';

export interface StoredFileRecord {
  docId: string;
  fileName: string;
  mimeType: string;
  fileSize: string;
  updatedAt: string;
  blob?: Blob;
  uint8Array?: Uint8Array;
  arrayBuffer?: ArrayBuffer;
  dataUrl?: string;
  isCloudSynced?: boolean;
}

const STORAGE_PREFIX = 'teacher_doc_file_';

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Infer FileFormat enum from MIME type and filename
 */
export function inferFileFormat(fileName: string, mimeType: string): FileFormat {
  const lowerName = fileName.toLowerCase();
  if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
    return 'PDF';
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument.wordprocessingml') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    return 'WORD DOCX';
  }
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('csv') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv')
  ) {
    return 'EXCEL';
  }
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint') ||
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.ppt')
  ) {
    return 'POWERPOINT';
  }
  return 'PDF';
}

/**
 * Safely convert Base64 DataURL to ArrayBuffer without callstack overflow on large files
 */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Always obtain a fresh, non-detached ArrayBuffer from a stored record
 */
export async function getFreshArrayBuffer(
  record: StoredFileRecord | null | undefined,
  fallbackDataUrl?: string
): Promise<ArrayBuffer | null> {
  if (!record && !fallbackDataUrl) return null;

  try {
    // 1. If stored as a Blob (best for large files), read fresh ArrayBuffer
    if (record?.blob) {
      return await record.blob.arrayBuffer();
    }

    // 2. If stored as Uint8Array, clone the slice
    if (record?.uint8Array) {
      const cloned = record.uint8Array.slice();
      return cloned.buffer;
    }

    // 3. If stored as an ArrayBuffer, check if detached and clone
    if (record?.arrayBuffer && record.arrayBuffer.byteLength > 0) {
      return record.arrayBuffer.slice(0);
    }

    // 4. If stored as DataUrl
    const url = record?.dataUrl || fallbackDataUrl;
    if (url) {
      return dataUrlToArrayBuffer(url);
    }
  } catch (err) {
    console.error('Error getting fresh ArrayBuffer from record:', err);
  }

  return null;
}

/**
 * Save an uploaded file to IndexedDB for a document and sync to Cloud Firestore
 * Supports cross-device synchronization so any device can view the full original document!
 */
export async function saveOriginalFile(
  docId: string,
  file: File
): Promise<StoredFileRecord> {
  // Read array buffer once to create a Uint8Array copy
  const arrayBuf = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuf);

  // Store Blob directly in IndexedDB (fastest & most reliable for local cache)
  const record: StoredFileRecord = {
    docId,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: formatBytes(file.size),
    updatedAt: new Date().toISOString(),
    blob: file,
    uint8Array: uint8,
    isCloudSynced: false
  };

  try {
    await set(`${STORAGE_PREFIX}${docId}`, record);
  } catch (err) {
    console.warn('IndexedDB save error, storing with Uint8Array fallback:', err);
    try {
      await set(`${STORAGE_PREFIX}${docId}`, {
        docId,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: formatBytes(file.size),
        updatedAt: new Date().toISOString(),
        uint8Array: uint8,
      });
    } catch (e2) {
      console.error('Fatal IndexedDB fallback save failure:', e2);
    }
  }

  // Synchronize binary chunks to Cloud Firestore for cross-device viewing
  try {
    await saveFileChunksToFirestore(docId, {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSize: formatBytes(file.size),
      uint8Array: uint8
    });
    record.isCloudSynced = true;
  } catch (cloudErr) {
    console.warn('Could not sync file chunks to Firestore (might be offline or too large):', cloudErr);
  }

  return record;
}

/**
 * Retrieve an uploaded file from IndexedDB or Cloud Firestore
 */
export async function getOriginalFile(docId: string): Promise<StoredFileRecord | null> {
  // 1. First check local IndexedDB
  try {
    const record = (await get(`${STORAGE_PREFIX}${docId}`)) as StoredFileRecord | undefined;
    if (record && (record.blob || record.uint8Array || record.arrayBuffer || record.dataUrl)) {
      return record;
    }
  } catch (err) {
    console.warn('Failed to retrieve from IndexedDB:', err);
  }

  // 2. If not found in local IndexedDB (e.g. user is on a new device/browser), download from Cloud Firestore
  try {
    const cloudFile = await getFileChunksFromFirestore(docId);
    if (cloudFile) {
      const reconstructedRecord: StoredFileRecord = {
        docId,
        fileName: cloudFile.fileName,
        mimeType: cloudFile.mimeType,
        fileSize: cloudFile.fileSize,
        updatedAt: new Date().toISOString(),
        blob: cloudFile.blob,
        uint8Array: cloudFile.uint8Array,
        arrayBuffer: cloudFile.arrayBuffer,
        isCloudSynced: true
      };

      // Cache into local IndexedDB for instant loads on subsequent clicks
      try {
        await set(`${STORAGE_PREFIX}${docId}`, reconstructedRecord);
      } catch (cacheErr) {
        console.warn('Could not cache cloud file into IndexedDB:', cacheErr);
      }

      return reconstructedRecord;
    }
  } catch (cloudErr) {
    console.error('Error fetching file chunks from Cloud Firestore:', cloudErr);
  }

  return null;
}

/**
 * Delete an uploaded file from IndexedDB and Cloud Firestore
 */
export async function deleteOriginalFile(docId: string): Promise<void> {
  try {
    await del(`${STORAGE_PREFIX}${docId}`);
  } catch (err) {
    console.warn('Failed to delete from IndexedDB:', err);
  }

  try {
    await deleteFileChunksFromFirestore(docId);
  } catch (err) {
    console.warn('Failed to delete chunks from Firestore:', err);
  }
}

/**
 * Trigger browser download from real data URL or Blob
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Generate and download actual real binary file for any DocumentItem
 */
export async function downloadRealDocument(doc: DocumentItem): Promise<void> {
  // 1. Check if original uploaded file exists in IndexedDB
  const stored = await getOriginalFile(doc.id);
  if (stored) {
    if (stored.blob) {
      triggerBlobDownload(stored.blob, stored.fileName || doc.title);
      return;
    }
    const freshBuf = await getFreshArrayBuffer(stored, doc.fileDataUrl);
    if (freshBuf) {
      const blob = new Blob([freshBuf], { type: stored.mimeType || 'application/octet-stream' });
      triggerBlobDownload(blob, stored.fileName || `${doc.title}.${doc.fileType === 'PDF' ? 'pdf' : 'docx'}`);
      return;
    }
  }

  if (doc.fileDataUrl) {
    const buffer = dataUrlToArrayBuffer(doc.fileDataUrl);
    const blob = new Blob([buffer], { type: doc.fileMimeType || 'application/octet-stream' });
    triggerBlobDownload(blob, doc.originalFileName || `${doc.title}.${doc.fileType === 'PDF' ? 'pdf' : 'docx'}`);
    return;
  }

  // 2. Otherwise generate a real native file corresponding to doc.fileType
  const cleanTitle = doc.title.replace(/[/\\?%*:|"<>]/g, '_');

  if (doc.fileType === 'EXCEL') {
    // Generate real .xlsx file with SheetJS
    const rows = [
      ['SỞ GD&ĐT THANH HÓA', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
      [doc.school.toUpperCase(), '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
      [],
      [doc.title],
      [`Danh mục: ${doc.category}`, '', `Năm học: ${doc.academicYear}`, '', `Học kỳ: ${doc.semester}`],
      [`Giáo viên: ${doc.author}`, '', `Môn học: Toán học`, '', `Ngày lập: ${doc.createdAt}`],
      [],
      ['STT', 'Mã kế hoạch / Nội dung', 'Khối lớp', 'Thời lượng', 'Hình thức tổ chức', 'Ghi chú / Đánh giá'],
      [1, 'Chủ đề 1: Hàm số & Đồ thị', doc.grade === 'all' ? '10-12' : `Khối ${doc.grade}`, '12 tiết', 'Trực tiếp trên lớp', 'Đạt chuẩn CV 5512'],
      [2, 'Chủ đề 2: Hình học không gian & Vectơ', doc.grade === 'all' ? '10-12' : `Khối ${doc.grade}`, '16 tiết', 'Thực hành GeoGebra', 'Kiểm tra 45 phút'],
      [3, 'Chủ đề 3: Phương pháp tọa độ', doc.grade === 'all' ? '10-12' : `Khối ${doc.grade}`, '14 tiết', 'Dạy học dự án', 'Báo cáo nhóm'],
      [4, 'Chủ đề 4: Thống kê & Xác suất', doc.grade === 'all' ? '10-12' : `Khối ${doc.grade}`, '10 tiết', 'Bài tập tình huống thực tế', 'Đánh giá thường xuyên'],
      [5, 'Ôn tập và Đánh giá cuối kỳ', doc.grade === 'all' ? '10-12' : `Khối ${doc.grade}`, '4 tiết', 'Đề kiểm tra ma trận 4 mức độ', 'Tổng kết điểm số'],
      [],
      ['', '', '', '', 'Người lập kế hoạch', ''],
      ['', '', '', '', doc.author, '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KeHoachGiaoDuc');
    XLSX.writeFile(wb, `${cleanTitle}.xlsx`);
    return;
  }

  if (doc.fileType === 'WORD DOCX') {
    // Generate valid Microsoft Word HTML Document (.doc) that opens cleanly in MS Word
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${doc.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; }
          .header-table { width: 100%; border: none; margin-bottom: 20px; }
          .header-table td { border: none; vertical-align: top; font-size: 11pt; }
          .title { text-align: center; font-size: 16pt; font-weight: bold; margin-top: 15px; margin-bottom: 15px; text-transform: uppercase; }
          .subtitle { text-align: center; font-style: italic; font-size: 12pt; margin-bottom: 25px; }
          .content { text-align: justify; font-size: 13pt; line-height: 1.5; }
          .footer-table { width: 100%; border: none; margin-top: 40px; }
          .footer-table td { border: none; text-align: center; font-size: 12pt; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>SỞ GD&ĐT THANH HÓA</strong><br/>
              <strong>${doc.school.toUpperCase()}</strong>
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
              <em>-------------------</em>
            </td>
          </tr>
        </table>

        <div class="title">${doc.title}</div>
        <div class="subtitle">Năm học: ${doc.academicYear} • ${doc.semester} • Chuẩn Công văn 5512/BGDĐT</div>

        <div class="content">
          ${(doc.contentPreview || 'Kế hoạch bài dạy chi tiết môn Toán học.').replace(/\n/g, '<br/>')}
        </div>

        <table class="footer-table">
          <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%;">
              <em>Thanh Hóa, ngày ${doc.createdAt}</em><br/>
              <strong>NGƯỜI LẬP KẾ HOẠCH</strong><br/><br/><br/><br/>
              <strong>${doc.author}</strong>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
    triggerBlobDownload(blob, `${cleanTitle}.doc`);
    return;
  }

  // Default PDF or Plain Document download
  const content = `
================================================================================
SỞ GD&ĐT THANH HÓA                               CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
${doc.school.toUpperCase().padEnd(45, ' ')}Độc lập - Tự do - Hạnh phúc
================================================================================

TÊN TÀI LIỆU: ${doc.title}
DANH MỤC:     ${doc.category}
KHỐI LỚP:     ${doc.grade === 'all' ? 'Tất cả các khối' : `Khối ${doc.grade}`}
HỌC KỲ:       ${doc.semester}
NĂM HỌC:      ${doc.academicYear}
NGÀY TẠO:     ${doc.createdAt}
TÁC GIẢ:      ${doc.author} (${doc.school})

--------------------------------------------------------------------------------
NỘI DUNG VĂN BẢN / KẾ HOẠCH BÀI DẠY (CHUẨN CV 5512):
--------------------------------------------------------------------------------

${doc.contentPreview || doc.description || 'Nội dung kế hoạch giáo dục môn Toán học.'}

================================================================================
Lưu trữ: Hồ sơ chuyên môn cá nhân giáo viên
Mã số tài liệu: ${doc.id}
================================================================================
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, `${cleanTitle}.txt`);
}
