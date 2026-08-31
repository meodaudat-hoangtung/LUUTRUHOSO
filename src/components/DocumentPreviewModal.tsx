import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Star, 
  FileText, 
  Calendar, 
  User, 
  School, 
  Copy, 
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileSpreadsheet,
  FileCheck,
  Layers,
  Info,
  Eye,
  RefreshCw,
  AlertCircle,
  Trash2,
  Pencil
} from 'lucide-react';
import * as XLSX from 'xlsx';
import * as docx from 'docx-preview';
import { DocumentItem } from '../types';
import { getOriginalFile, downloadRealDocument, StoredFileRecord, getFreshArrayBuffer } from '../utils/fileStorage';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onDownload: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onTogglePin,
  onDownload,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'formatted' | 'meta'>('original');
  const [loadingFile, setLoadingFile] = useState(false);
  const [storedFile, setStoredFile] = useState<StoredFileRecord | null>(null);
  
  // Excel states
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [sheetHtml, setSheetHtml] = useState<string>('');
  
  // DOCX ref
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const [docxError, setDocxError] = useState<string | null>(null);

  // Load original file when document changes
  useEffect(() => {
    let isMounted = true;

    async function loadFile() {
      if (!document) return;
      setLoadingFile(true);
      setDocxError(null);
      setSheetHtml('');
      setExcelSheets([]);

      try {
        const file = await getOriginalFile(document.id);
        if (isMounted) {
          setStoredFile(file);
          if (file) {
            setActiveTab('original');
            // If Excel, parse sheets
            if (
              document.fileType === 'EXCEL' || 
              file.fileName.toLowerCase().endsWith('.xlsx') || 
              file.fileName.toLowerCase().endsWith('.xls') || 
              file.fileName.toLowerCase().endsWith('.csv')
            ) {
              try {
                const buffer = await getFreshArrayBuffer(file, document.fileDataUrl);
                if (buffer) {
                  const wb = XLSX.read(buffer.slice(0), { type: 'array' });
                  setExcelSheets(wb.SheetNames);
                  if (wb.SheetNames.length > 0) {
                    const firstSheet = wb.Sheets[wb.SheetNames[0]];
                    const html = XLSX.utils.sheet_to_html(firstSheet, { id: 'excel-table', editable: false });
                    setSheetHtml(html);
                  }
                }
              } catch (e) {
                console.error('Failed to parse Excel workbook:', e);
              }
            }
          } else {
            // No custom uploaded file, default to formatted CV 5512 or auto-generated view
            setActiveTab('formatted');
          }
        }
      } catch (err) {
        console.error('Error loading file from storage:', err);
      } finally {
        if (isMounted) setLoadingFile(false);
      }
    }

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [document]);

  // Handle DOCX rendering when container is ready or tab switches to original
  useEffect(() => {
    let isCancelled = false;
    if (
      activeTab === 'original' &&
      storedFile &&
      docxContainerRef.current &&
      (document?.fileType === 'WORD DOCX' || storedFile.fileName.toLowerCase().endsWith('.docx') || storedFile.fileName.toLowerCase().endsWith('.doc'))
    ) {
      const container = docxContainerRef.current;
      container.innerHTML = '';
      setDocxError(null);

      (async () => {
        try {
          const buffer = await getFreshArrayBuffer(storedFile, document?.fileDataUrl);
          if (!buffer || buffer.byteLength === 0) {
            throw new Error('Dữ liệu tệp Word rỗng.');
          }
          if (isCancelled) return;

          await docx.renderAsync(buffer.slice(0), container, undefined, {
            className: 'docx-preview-rendered',
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true
          });
        } catch (err: any) {
          if (!isCancelled) {
            console.warn('docx-preview error, showing fallback:', err);
            setDocxError('Tệp Word này có thể dùng định dạng cũ (.doc) hoặc chứa macro. Vui lòng chuyển qua tab "Kế hoạch CV 5512" hoặc Tải xuống để mở trên Microsoft Word.');
          }
        }
      })();
    }
    return () => {
      isCancelled = true;
    };
  }, [activeTab, storedFile, document]);

  // Handle switching Excel sheets
  const handleSelectExcelSheet = async (sheetName: string, index: number) => {
    if (!storedFile) return;
    try {
      setActiveSheetIndex(index);
      const buffer = await getFreshArrayBuffer(storedFile, document.fileDataUrl);
      if (buffer) {
        const wb = XLSX.read(buffer.slice(0), { type: 'array' });
        const sheet = wb.Sheets[sheetName];
        if (sheet) {
          const html = XLSX.utils.sheet_to_html(sheet, { id: 'excel-table', editable: false });
          setSheetHtml(html);
        }
      }
    } catch (e) {
      console.error('Failed to change sheet:', e);
    }
  };

  if (!document) return null;

  const handleCopyText = () => {
    if (document.contentPreview) {
      navigator.clipboard.writeText(document.contentPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenInNewTab = async () => {
    if (storedFile) {
      try {
        const blob = storedFile.blob || (
          storedFile.uint8Array ? new Blob([storedFile.uint8Array], { type: storedFile.mimeType || 'application/pdf' }) :
          new Blob([await getFreshArrayBuffer(storedFile, document.fileDataUrl) || ''], { type: storedFile.mimeType || 'application/pdf' })
        );
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        if (storedFile.dataUrl) window.open(storedFile.dataUrl, '_blank');
      }
    }
  };

  const isPdf = document.fileType === 'PDF' || (storedFile && storedFile.fileName.toLowerCase().endsWith('.pdf'));
  const isDocx = document.fileType === 'WORD DOCX' || (storedFile && (storedFile.fileName.toLowerCase().endsWith('.docx') || storedFile.fileName.toLowerCase().endsWith('.doc')));
  const isExcel = document.fileType === 'EXCEL' || (storedFile && (storedFile.fileName.toLowerCase().endsWith('.xlsx') || storedFile.fileName.toLowerCase().endsWith('.xls') || storedFile.fileName.toLowerCase().endsWith('.csv')));
  const isImage = storedFile && (storedFile.mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(storedFile.fileName));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      
      <div 
        className={`
          bg-[#16191E] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[92vh]'}
        `}
      >
        {/* Header Bar */}
        <div className="bg-[#0F1115] px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center flex-shrink-0">
              {isPdf ? <FileText className="w-4 h-4 text-red-400" /> : isExcel ? <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase truncate">
                  {document.title}
                </h3>
                {storedFile && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px] font-mono font-medium flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    <span>Tệp gốc thực tế</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {storedFile ? storedFile.fileName : `${document.category} • ${document.academicYear}`} • {document.fileType} {document.fileSize ? `(${document.fileSize})` : ''}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {storedFile?.dataUrl && (
              <button
                onClick={handleOpenInNewTab}
                title="Mở tệp trong cửa sổ mới"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer hidden sm:block"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onTogglePin(document.id)}
              title={document.isPinned ? 'Bỏ ghim' : 'Ghim quan trọng'}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {document.isPinned ? (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Star className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleCopyText}
              title="Sao chép nội dung văn bản"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer hidden sm:block"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              title="In tài liệu"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDownload(document)}
              title="Tải xuống tệp thực tế"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải xuống tệp</span>
            </button>

            <button
              onClick={() => onEdit(document)}
              title="Chỉnh sửa thông tin tài liệu"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(document.id)}
                title="Xóa tài liệu này"
                className="p-1.5 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer hidden md:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Navigation Mode Tabs Bar */}
        <div className="bg-[#12151B] px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'original'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{storedFile ? 'Xem trước Tệp Gốc' : 'Xem trước Tài Liệu'}</span>
            </button>

            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'formatted'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kế hoạch & Giáo án CV 5512</span>
            </button>

            <button
              onClick={() => setActiveTab('meta')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'meta'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Thông tin hồ sơ</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="hidden sm:inline text-slate-500">Người lập: <strong className="text-slate-300 font-sans">{document.author}</strong></span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {document.academicYear}
            </span>
          </div>

        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto bg-[#0A0C10] text-slate-200 p-3 sm:p-6 flex flex-col">
          
          {loadingFile ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-mono text-slate-400">Đang tải và dựng nội dung tệp bản gốc...</p>
            </div>
          ) : activeTab === 'original' ? (
            
            <div className="flex-1 flex flex-col w-full h-full min-h-[500px]">
              
              {/* REAL PDF PREVIEW (Rendered natively via Canvas to bypass browser iframe blocking) */}
              {isPdf && (storedFile || document.fileDataUrl) ? (
                <div className="flex-1 flex flex-col w-full h-full min-h-[580px]">
                  <PdfCanvasViewer
                    fileRecord={storedFile}
                    blob={storedFile?.blob}
                    dataUrl={storedFile?.dataUrl || document.fileDataUrl}
                    arrayBuffer={storedFile?.arrayBuffer}
                    fileName={storedFile?.fileName || document.originalFileName}
                    title={document.title}
                    onDownload={() => onDownload(document)}
                  />
                </div>
              ) : isPdf && !storedFile ? (
                /* Fallback PDF view with rich simulated PDF reader */
                <div className="max-w-3xl mx-auto w-full bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl font-serif">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <div>
                        <p>SỞ GD&ĐT THANH HÓA</p>
                        <p className="text-blue-900">{document.school}</p>
                      </div>
                      <div className="text-right">
                        <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="normal-case italic font-normal text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                      </div>
                    </div>
                    <div className="text-center mt-6">
                      <h1 className="text-xl font-bold uppercase text-slate-900">{document.title}</h1>
                      <p className="text-xs font-sans text-slate-600 mt-1">
                        Danh mục: {document.category} • Năm học: {document.academicYear}
                      </p>
                    </div>
                  </div>
                  <div className="font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {document.contentPreview || 'Kế hoạch dạy học phân phối chương trình môn Toán học chuẩn GDPT 2018.'}
                  </div>
                  <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between text-xs font-sans text-slate-600">
                    <div>Mã lưu trữ: {document.id}</div>
                    <div className="text-center font-serif">
                      <p className="font-bold text-slate-900">{document.author}</p>
                      <p className="text-[11px] italic">Giáo viên bộ môn Toán</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* REAL WORD DOCX PREVIEW */}
              {isDocx && (
                <div className="flex-1 flex flex-col w-full">
                  {docxError && (
                    <div className="p-3 mb-4 rounded-lg bg-amber-950/60 border border-amber-800/50 text-xs text-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{docxError}</span>
                    </div>
                  )}

                  {storedFile ? (
                    <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto w-full min-h-[600px] overflow-x-auto">
                      <div ref={docxContainerRef} className="docx-container font-serif leading-relaxed" />
                    </div>
                  ) : (
                    /* Default Word document sheet */
                    <div className="bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl max-w-3xl mx-auto w-full font-serif min-h-[500px]">
                      <div className="flex justify-between text-xs font-bold uppercase border-b border-slate-300 pb-4 mb-6">
                        <div>
                          <p>SỞ GD&ĐT THANH HÓA</p>
                          <p>{document.school}</p>
                        </div>
                        <div className="text-right">
                          <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                          <p className="normal-case italic font-normal text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-center uppercase mb-2">{document.title}</h2>
                      <p className="text-xs text-center italic text-slate-600 mb-6 font-sans">
                        Hồ sơ chuyên môn sư phạm • Năm học: {document.academicYear}
                      </p>
                      <div className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-line text-slate-800">
                        {document.contentPreview || 'Kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT-GDTrH.'}
                      </div>
                      <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between text-xs font-sans text-slate-600">
                        <div>Ngày cập nhật: {document.updatedAt}</div>
                        <div className="text-center">
                          <p className="font-bold text-slate-900">{document.author}</p>
                          <p className="text-[11px] italic">Giáo viên Toán học</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REAL EXCEL SPREADSHEET PREVIEW */}
              {isExcel && (
                <div className="flex-1 flex flex-col w-full h-full bg-[#16191E] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                  {/* Excel Sheet Tabs */}
                  {excelSheets.length > 0 && (
                    <div className="bg-[#0F1115] px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                      <span className="text-[11px] font-mono text-slate-500 mr-2 flex items-center gap-1">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        Trang tính:
                      </span>
                      {excelSheets.map((sheet, idx) => (
                        <button
                          key={sheet}
                          onClick={() => handleSelectExcelSheet(sheet, idx)}
                          className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                            activeSheetIndex === idx
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sheet}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Rendered HTML Sheet or Built-in Grid */}
                  <div className="flex-1 overflow-auto p-4 bg-slate-950">
                    {sheetHtml ? (
                      <div 
                        className="excel-table-container text-xs text-slate-200 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-700 [&_th]:bg-slate-800 [&_th]:p-2.5 [&_th]:border [&_th]:border-slate-700 [&_th]:font-mono [&_th]:text-slate-300 [&_td]:p-2 [&_td]:border [&_td]:border-slate-800 [&_td]:bg-slate-900/60 hover:[&_tr]:bg-slate-800/40"
                        dangerouslySetInnerHTML={{ __html: sheetHtml }}
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse border border-slate-700 font-mono">
                          <thead>
                            <tr className="bg-slate-800 text-slate-200">
                              <th className="p-2.5 border border-slate-700 w-12 text-center">STT</th>
                              <th className="p-2.5 border border-slate-700">Nội dung / Chủ đề bài học</th>
                              <th className="p-2.5 border border-slate-700">Khối lớp</th>
                              <th className="p-2.5 border border-slate-700">Thời lượng</th>
                              <th className="p-2.5 border border-slate-700">Hình thức tổ chức</th>
                              <th className="p-2.5 border border-slate-700">Ghi chú CV 5512</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            <tr className="hover:bg-slate-900/80">
                              <td className="p-2 border border-slate-800 text-center">1</td>
                              <td className="p-2 border border-slate-800 font-medium text-slate-100">Hàm số bậc hai và đồ thị</td>
                              <td className="p-2 border border-slate-800">Khối 10</td>
                              <td className="p-2 border border-slate-800">04 tiết</td>
                              <td className="p-2 border border-slate-800">Dạy học trực tiếp + GeoGebra</td>
                              <td className="p-2 border border-slate-800 text-emerald-400">Đạt chuẩn</td>
                            </tr>
                            <tr className="hover:bg-slate-900/80">
                              <td className="p-2 border border-slate-800 text-center">2</td>
                              <td className="p-2 border border-slate-800 font-medium text-slate-100">Phương pháp tọa độ trong mặt phẳng Oxy</td>
                              <td className="p-2 border border-slate-800">Khối 10</td>
                              <td className="p-2 border border-slate-800">06 tiết</td>
                              <td className="p-2 border border-slate-800">Thực hành giải toán theo nhóm</td>
                              <td className="p-2 border border-slate-800 text-emerald-400">Đạt chuẩn</td>
                            </tr>
                            <tr className="hover:bg-slate-900/80">
                              <td className="p-2 border border-slate-800 text-center">3</td>
                              <td className="p-2 border border-slate-800 font-medium text-slate-100">Thống kê và các số đặc trưng đo xu thế trung tâm</td>
                              <td className="p-2 border border-slate-800">Khối 10</td>
                              <td className="p-2 border border-slate-800">03 tiết</td>
                              <td className="p-2 border border-slate-800">Dự án thu thập số liệu thực tế</td>
                              <td className="p-2 border border-slate-800 text-emerald-400">Đạt chuẩn</td>
                            </tr>
                            <tr className="hover:bg-slate-900/80">
                              <td className="p-2 border border-slate-800 text-center">4</td>
                              <td className="p-2 border border-slate-800 font-medium text-slate-100">Kiểm tra định kỳ giữa học kỳ</td>
                              <td className="p-2 border border-slate-800">Khối 10</td>
                              <td className="p-2 border border-slate-800">01 tiết</td>
                              <td className="p-2 border border-slate-800">Đề trắc nghiệm kết hợp tự luận</td>
                              <td className="p-2 border border-slate-800 text-amber-400">Đánh giá chung</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* IMAGE PREVIEW */}
              {isImage && storedFile?.dataUrl && (
                <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <img
                    src={storedFile.dataUrl}
                    alt={document.title}
                    className="max-h-[550px] max-w-full object-contain rounded-lg shadow-xl"
                  />
                </div>
              )}

              {/* POWERPOINT OR OTHER ATTACHMENTS */}
              {!isPdf && !isDocx && !isExcel && !isImage && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#16191E] rounded-xl border border-slate-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800/50 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">{document.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {storedFile ? storedFile.fileName : `Định dạng ${document.fileType}`} • {document.fileSize || '2.4 MB'}
                    </p>
                  </div>
                  <button
                    onClick={() => onDownload(document)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải xuống tệp gốc</span>
                  </button>
                </div>
              )}

            </div>

          ) : activeTab === 'formatted' ? (
            
            /* Official Formatted Plan View (CV 5512) */
            <div className="max-w-3xl mx-auto w-full bg-[#16191E] border border-slate-800 rounded-xl p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0">
              
              {/* Header Document Formal Banner */}
              <div className="border-b border-slate-800 pb-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center sm:text-left text-xs font-semibold text-slate-300 mb-4">
                  <div>
                    <p className="uppercase font-bold">SỞ GD&ĐT THANH HÓA</p>
                    <p className="font-bold text-indigo-400 uppercase">{document.school}</p>
                  </div>
                  <div className="text-right">
                    <p className="uppercase font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[11px] italic font-normal text-slate-400">Độc lập - Tự do - Hạnh phúc</p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 uppercase tracking-tight">
                    {document.title}
                  </h2>
                  <p className="text-xs text-indigo-300 mt-1 font-mono">
                    {document.category} • Chuẩn GDPT 2018 & CV 5512
                  </p>
                </div>
              </div>

              {/* Document Content Text / Markdown Body */}
              {document.contentPreview ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-300 font-sans">
                  {document.contentPreview}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p>Tài liệu đính kèm định dạng {document.fileType}.</p>
                  <button
                    onClick={() => onDownload(document)}
                    className="mt-3 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống để xem đầy đủ
                  </button>
                </div>
              )}

              {/* Document Signoff Footer */}
              <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-end text-xs text-slate-400 font-mono">
                <div>
                  <p className="italic font-sans">Lưu trữ: Hồ sơ cá nhân giáo viên</p>
                  <p className="text-[11px] text-slate-500">Mã văn bản: {document.id}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-300 mb-1 font-sans">Người lập kế hoạch</p>
                  <p className="font-bold text-slate-100 text-sm font-sans">{document.author}</p>
                  <p className="text-[10px] text-indigo-400">Giáo viên Toán học</p>
                </div>
              </div>

            </div>

          ) : (

            /* Tab 3: Detailed Metadata */
            <div className="max-w-2xl mx-auto w-full bg-[#16191E] border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Info className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-100 uppercase">Thuộc tính định danh hồ sơ</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Mã số tài liệu:</span>
                  <p className="font-mono text-indigo-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.id}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Tên văn bản / Giáo án:</span>
                  <p className="text-slate-200 font-bold bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.title}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Phân loại chuyên môn:</span>
                  <p className="text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.category}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Khối lớp áp dụng:</span>
                  <p className="text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                    {document.grade === 'all' ? 'Tất cả các khối (10, 11, 12)' : `Khối ${document.grade}`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Năm học & Học kỳ:</span>
                  <p className="text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.academicYear} ({document.semester})</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Định dạng & Dung lượng:</span>
                  <p className="text-slate-200 font-mono bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.fileType} - {document.fileSize || '1.8 MB'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Giáo viên tác giả:</span>
                  <p className="text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">{document.author} ({document.school})</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-mono">Tình trạng tệp gốc:</span>
                  <p className={`px-2.5 py-1.5 rounded border font-mono ${storedFile ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                    {storedFile ? `Đã lưu tệp nhị phân (${storedFile.fileName})` : 'Tạo lập trực tiếp trên hệ thống'}
                  </p>
                </div>
              </div>

              {document.description && (
                <div className="pt-2">
                  <span className="text-slate-400 text-xs font-mono block mb-1">Mô tả / Ghi chú:</span>
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 leading-relaxed">
                    {document.description}
                  </p>
                </div>
              )}
            </div>

          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#0F1115] px-4 sm:px-6 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-400 font-mono">
            Cập nhật: <span className="text-slate-300">{document.updatedAt}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(document);
              }}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
            >
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
