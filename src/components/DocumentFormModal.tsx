import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Check, 
  Star,
  FileCheck,
  FileSpreadsheet,
  AlertCircle,
  Globe
} from 'lucide-react';
import { DocumentCategory, DocumentItem, FileFormat, Grade, Semester, TeacherProfile } from '../types';
import { saveOriginalFile, inferFileFormat, formatBytes } from '../utils/fileStorage';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: DocumentItem) => void;
  initialDoc?: DocumentItem | null;
  profile: TeacherProfile;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDoc,
  profile
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('GIÁO ÁN TOÁN 10');
  const [grade, setGrade] = useState<Grade>('10');
  const [semester, setSemester] = useState<Semester>('Cả năm');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [fileType, setFileType] = useState<FileFormat>('PDF');
  const [description, setDescription] = useState('');
  const [contentPreview, setContentPreview] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [externalLink, setExternalLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialDoc) {
      setTitle(initialDoc.title);
      setCategory(initialDoc.category);
      setGrade(initialDoc.grade);
      setSemester(initialDoc.semester);
      setAcademicYear(initialDoc.academicYear);
      setFileType(initialDoc.fileType);
      setDescription(initialDoc.description || '');
      setContentPreview(initialDoc.contentPreview || '');
      setIsPinned(initialDoc.isPinned);
      setFileSize(initialDoc.fileSize || '2.4 MB');
      setFileName(initialDoc.originalFileName || `${initialDoc.title.toLowerCase().replace(/\s+/g, '_')}.${initialDoc.fileType === 'PDF' ? 'pdf' : 'docx'}`);
      setExternalLink(initialDoc.externalLink || '');
      setSelectedFile(null);
    } else {
      // Reset form
      setTitle('');
      setCategory('GIÁO ÁN TOÁN 10');
      setGrade('10');
      setSemester('Cả năm');
      setAcademicYear('2026 - 2027');
      setFileType('PDF');
      setDescription('');
      setContentPreview('');
      setIsPinned(false);
      setFileName('');
      setFileSize('1.8 MB');
      setExternalLink('');
      setSelectedFile(null);
    }
  }, [initialDoc, isOpen]);

  if (!isOpen) return null;

  const handleApplySampleCv5512 = () => {
    setTitle(`GIÁO ÁN TOÁN ${grade.toUpperCase()} - CHỦ ĐỀ CHUẨN CV 5512`);
    setContentPreview(`
KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
MÔN: TOÁN HỌC - KHỐI ${grade === 'all' ? '10' : grade}
NĂM HỌC 2026 - 2027
(Theo Công văn số 5512/BGDĐT-GDTrH của Bộ Giáo dục và Đào tạo)

TÊN BÀI DẠY: BÀI HỌC TRỌNG TÂM GDPT 2018
Thời lượng: 02 tiết

I. MỤC TIÊU
1. Về kiến thức:
- Nắm vững định nghĩa, tính chất, định lý và các công thức toán học cơ bản.
- Vận dụng linh hoạt các bước suy luận logic để giải quyết dạng toán trọng tâm.

2. Về năng lực:
- Năng lực tư duy và lập luận toán học.
- Năng lực giải quyết vấn đề toán học và mô hình hóa toán học vào thực tiễn.
- Năng lực sử dụng công cụ, phương tiện học toán (máy tính cầm tay, phần mềm GeoGebra).

3. Về phẩm chất:
- Rèn luyện tính cẩn thận, chính xác, tư duy độc lập và sáng tạo.
- Tinh thần hợp tác, trách nhiệm khi làm việc nhóm.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Giáo viên: Kế hoạch bài dạy, bài giảng điện tử (PowerPoint), phiếu học tập, ứng dụng GeoGebra.
- Học sinh: SGK Toán ${grade}, vở ghi, đồ dùng học tập, máy tính cầm tay.

III. TIẾN TRÌNH DẠY HỌC
1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (XÁC ĐỊNH VẤN ĐỀ) - 7 phút
a) Mục tiêu: Tạo tâm thế hứng thú, kết nối kiến thức đã học với bài toán thực tế.
b) Nội dung: GV đưa ra bài toán tình huống thực tế đời sống.
c) Sản phẩm: Câu trả lời dự đoán và nhu cầu tìm hiểu lời giải chính xác của học sinh.
d) Tổ chức thực hiện: Học sinh thảo luận theo cặp trong 3 phút, đại diện báo cáo.

2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI - 20 phút
a) Mục tiêu: Khám phá định nghĩa và chứng minh tính chất trọng tâm.
b) Nội dung: Hoàn thành Phiếu học tập số 1 theo nhóm 4 học sinh.
c) Sản phẩm: Kết quả điền trên bảng phụ của các nhóm.
d) Tổ chức thực hiện: GV quan sát, trợ giúp các nhóm gặp khó khăn, chốt kiến thức chuẩn.

3. HOẠT ĐỘNG 3: LUYỆN TẬP - 12 phút
a) Mục tiêu: Củng cố và thành thạo các kĩ năng giải bài tập cơ bản và nâng cao.
b) Nội dung: Giải các bài toán trắc nghiệm nhanh và tự luận ngắn.
c) Sản phẩm: Lời giải chi tiết trong vở của học sinh.

4. HOẠT ĐỘNG 4: VẬN DỤNG - 6 phút
a) Mục tiêu: Vận dụng kiến thức bài học để giải quyết bài toán tối ưu trong đời sống.
b) Nhiệm vụ về nhà: Tìm hiểu thêm các mô hình toán học ứng dụng thực tế.
    `.trim());
    if (!description) {
      setDescription(`Giáo án môn Toán khối ${grade} thiết kế theo chuẩn quy trình 4 hoạt động của Công văn 5512/BGDĐT.`);
    }
  };

  const processUploadedFile = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    const sizeStr = formatBytes(file.size);
    setFileSize(sizeStr);

    // Auto set title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.toUpperCase());
    }

    // Auto detect file type
    const detectedType = inferFileFormat(file.name, file.type);
    setFileType(detectedType);

    // If it's a text-based file, read preview text
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && !contentPreview) {
          setContentPreview(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const docId = initialDoc?.id || `doc-${Date.now()}`;

    let originalFileName = initialDoc?.originalFileName;
    let fileMimeType = initialDoc?.fileMimeType;
    let fileDataUrl = initialDoc?.fileDataUrl;
    let hasOriginalFile = initialDoc?.hasOriginalFile || false;
    let hasCloudFile = initialDoc?.hasCloudFile || false;

    if (selectedFile) {
      try {
        const record = await saveOriginalFile(docId, selectedFile);
        originalFileName = record.fileName;
        fileMimeType = record.mimeType;
        fileDataUrl = record.dataUrl;
        hasOriginalFile = true;
        hasCloudFile = record.isCloudSynced || true;
      } catch (err) {
        console.error('Error saving original file:', err);
      }
    }

    const docItem: DocumentItem = {
      id: docId,
      title: title.trim().toUpperCase(),
      category,
      grade,
      semester,
      academicYear,
      fileType,
      fileSize: fileSize || '1.5 MB',
      isPinned,
      createdAt: initialDoc?.createdAt || today,
      updatedAt: today,
      description: description.trim(),
      author: profile.name,
      school: profile.school,
      contentPreview: contentPreview.trim(),
      tags: [category, `Khối ${grade}`, semester, fileType],
      originalFileName,
      fileMimeType,
      fileDataUrl,
      hasOriginalFile,
      hasCloudFile,
      externalLink: externalLink.trim()
    };

    setIsSaving(false);
    onSave(docItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-[#16191E] border border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0F1115] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-tight">
                {initialDoc ? 'Chỉnh sửa tài liệu hồ sơ' : 'Tải lên & Thêm mới tài liệu giáo án'}
              </h3>
              <p className="text-xs text-slate-400">
                Lưu trữ tệp gốc thực tế (PDF, Word, Excel, PowerPoint) và xem trước trực tiếp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Quick CV 5512 Template Helper Banner */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-slate-300">
                Nhanh chóng tạo mẫu khung Kế hoạch bài dạy chuẩn <strong className="text-slate-100 font-medium">Công văn 5512</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplySampleCv5512}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium shadow-xs transition-colors cursor-pointer flex-shrink-0"
            >
              Áp dụng mẫu CV 5512
            </button>
          </div>

          {/* REAL FILE UPLOAD DROPZONE */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Đính kèm tệp gốc thực tế</span>
              <span className="text-[11px] text-indigo-400 lowercase font-normal">hỗ trợ .pdf, .docx, .xlsx, .pptx</span>
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-indigo-400 bg-indigo-950/30' 
                  : selectedFile || fileName
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-700 hover:border-indigo-500 bg-[#0F1115]'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1.5 pointer-events-none">
                {selectedFile || fileName ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mb-1">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-emerald-300">
                      Đã nạp tệp: {fileName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Dung lượng: {fileSize} • Định dạng: {fileType} (Sẽ được lưu vào bộ nhớ để xem trước bản gốc)
                    </p>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-8 h-8 mx-auto text-indigo-400 mb-1" />
                    <p className="text-xs font-medium text-slate-200">
                      Kéo thả tệp tài liệu vào đây hoặc <span className="text-indigo-400 underline">chọn tệp từ máy tính</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      PDF, Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Tên tài liệu / Kế hoạch <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: KẾ HOẠCH GD MÔN TOÁN NH 2026 - 2027"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold uppercase"
            />
          </div>

          {/* Grid Category & File Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Danh mục phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="KH CÁ NHÂN">KH CÁ NHÂN</option>
                <option value="KHGD NHÀ TRƯỜNG">KHGD NHÀ TRƯỜNG</option>
                <option value="KHGD MÔN TOÁN">KHGD MÔN TOÁN</option>
                <option value="GIÁO ÁN TOÁN 10">GIÁO ÁN TOÁN 10</option>
                <option value="GIÁO ÁN CĐ TOÁN 10">GIÁO ÁN CĐ TOÁN 10</option>
                <option value="GIÁO ÁN TOÁN 11">GIÁO ÁN TOÁN 11</option>
                <option value="GIÁO ÁN CĐ TOÁN 11">GIÁO ÁN CĐ TOÁN 11</option>
                <option value="GIÁO ÁN TOÁN 12">GIÁO ÁN TOÁN 12</option>
                <option value="GIÁO ÁN CĐ TOÁN 12">GIÁO ÁN CĐ TOÁN 12</option>
                <option value="NGÂN HÀNG ĐỀ THI">NGÂN HÀNG ĐỀ THI</option>
                <option value="SỔ CHỦ NHIỆM">SỔ CHỦ NHIỆM</option>
                <option value="HỒ SƠ KHÁC">HỒ SƠ KHÁC</option>
              </select>
            </div>

            {/* File Format */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Định dạng tệp
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as FileFormat)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="PDF">PDF Document (*.pdf)</option>
                <option value="WORD DOCX">Word Document (*.docx)</option>
                <option value="EXCEL">Excel Spreadsheet (*.xlsx)</option>
                <option value="POWERPOINT">PowerPoint Presentation (*.pptx)</option>
              </select>
            </div>

          </div>

          {/* Grid Grade, Semester, Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Grade */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Khối lớp
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Tất cả các khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Học kỳ
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as Semester)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Cả năm">Cả năm</option>
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Năm học
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026 - 2027"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

          </div>

          {/* External Google Drive / Cloud Link */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Link Google Drive / OneDrive / Xem trực tuyến (Tùy chọn)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Hỗ trợ xem tệp mọi lúc mọi nơi</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/... hoặc https://onedrive.live.com/..."
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Dán link Google Drive chia sẻ công khai để bất kỳ điện thoại hay máy tính nào cũng mở xem mượt mà 100%.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Ghi chú tóm tắt / Mô tả
            </label>
            <input
              type="text"
              placeholder="VD: Kế hoạch dạy học phân môn Đại số và Hình học học kỳ 1..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Content Preview Text Area */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Nội dung văn bản / Xem trước Kế hoạch CV 5512
            </label>
            <textarea
              rows={6}
              placeholder="Nhập nội dung kế hoạch bài dạy hoặc bấm 'Áp dụng mẫu CV 5512' ở trên..."
              value={contentPreview}
              onChange={(e) => setContentPreview(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Star / Pin Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinDoc"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <label htmlFor="pinDoc" className="text-xs text-slate-300 font-medium flex items-center gap-1 cursor-pointer">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Ghim tài liệu này vào mục quan trọng</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors cursor-pointer border border-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu tệp...</span>
                </>
              ) : (
                <span>{initialDoc ? 'Lưu thay đổi' : 'Lưu & Tải lên'}</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
