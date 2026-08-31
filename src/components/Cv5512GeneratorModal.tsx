import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  FileCheck, 
  Layers,
  Save
} from 'lucide-react';
import { DocumentCategory, DocumentItem, Grade, TeacherProfile } from '../types';

interface Cv5512GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToPortfolio: (doc: DocumentItem) => void;
  profile: TeacherProfile;
}

const MATH_TOPICS = {
  '10': [
    { name: 'Mệnh đề và Tập hợp', periods: 3, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn', periods: 2, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Hàm số bậc hai và Đồ thị', periods: 3, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Hệ thức lượng trong tam giác', periods: 3, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Vectơ và các phép toán vectơ', periods: 4, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Thống kê và Xác suất cơ bản', periods: 3, book: 'Kết nối tri thức / Cánh diều' }
  ],
  '11': [
    { name: 'Hàm số lượng giác và Phương trình lượng giác', periods: 4, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Dãy số, Cấp số cộng và Cấp số nhân', periods: 4, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Giới hạn và Hàm số liên tục', periods: 4, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Đạo hàm và Ý nghĩa hình học của đạo hàm', periods: 4, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Đường thẳng và Mặt phẳng song song trong không gian', periods: 3, book: 'Kết nối tri thức / Cánh diều' },
    { name: 'Quan hệ vuông góc trong không gian', periods: 4, book: 'Kết nối tri thức / Cánh diều' }
  ],
  '12': [
    { name: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số', periods: 5, book: 'GDPT 2018 mới' },
    { name: 'Tọa độ vectơ trong không gian Oxyz', periods: 4, book: 'GDPT 2018 mới' },
    { name: 'Nguyên hàm và Tích phân', periods: 5, book: 'GDPT 2018 mới' },
    { name: 'Ứng dụng hình học của Tích phân (Diện tích, Thể tích)', periods: 4, book: 'GDPT 2018 mới' },
    { name: 'Xác suất có điều kiện và Công thức xác suất toàn phần', periods: 4, book: 'GDPT 2018 mới' },
    { name: 'Phương trình mặt phẳng và mặt cầu trong không gian', periods: 4, book: 'GDPT 2018 mới' }
  ]
};

export const Cv5512GeneratorModal: React.FC<Cv5512GeneratorModalProps> = ({
  isOpen,
  onClose,
  onSaveToPortfolio,
  profile
}) => {
  const [grade, setGrade] = useState<'10' | '11' | '12'>('10');
  const [selectedTopic, setSelectedTopic] = useState(MATH_TOPICS['10'][0].name);
  const [duration, setDuration] = useState('2 tiết');
  const [copied, setCopied] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    const topicObj = MATH_TOPICS[grade].find(t => t.name === selectedTopic) || MATH_TOPICS[grade][0];
    
    const text = `
TRƯỜNG THPT TĨNH GIA 4
TỔ: TOÁN - TIN HỌC
Họ và tên giáo viên: ${profile.name.toUpperCase()}

KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CÔNG VĂN 5512)
MÔN: TOÁN HỌC - KHỐI ${grade}
NĂM HỌC: ${profile.academicYear.replace('Năm học ', '')}

TÊN BÀI DẠY: ${selectedTopic.toUpperCase()}
Thời lượng thực hiện: ${duration} (${topicObj.periods} tiết toàn chủ đề)
Bộ sách: ${topicObj.book}

I. MỤC TIÊU BÀI HỌC
1. Về kiến thức:
- Học sinh hiểu và nhận biết được các khái niệm, định lý, công thức trọng tâm của "${selectedTopic}".
- Vận dụng thành thạo thuật toán và phương pháp giải quyết các dạng bài tập điển hình từ mức độ Nhận biết, Thông hiểu đến Vận dụng.

2. Về năng lực:
- Năng lực tư duy và lập luận toán học: Biết so sánh, khái quát hóa, phát hiện bản chất vấn đề.
- Năng lực mô hình hóa toán học: Biết chuyển hóa bài toán thực tiễn sang ngôn ngữ giải tích / hình học.
- Năng lực giải quyết vấn đề toán học: Lập kế hoạch các bước giải toán mạch lạc, chính xác.
- Năng lực sử dụng công cụ, phương tiện học toán: Sử dụng hiệu quả máy tính Casio fx-580VNX/880BTG và phần mềm GeoGebra trực quan.

3. Về phẩm chất:
- Chăm chỉ: Chủ động tìm tòi, tích cực xây dựng bài và làm việc nhóm.
- Trung thực: Khách quan trong thảo luận và đánh giá kết quả của bạn bè.
- Trách nhiệm: Hoàn thành đầy đủ nhiệm vụ học tập được giao trên lớp và ở nhà.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
1. Thiết bị của Giáo viên:
- Kế hoạch bài dạy (Word & PDF), Bài giảng trình chiếu PowerPoint tương tác.
- Phiếu học tập số 1, 2, 3 in sẵn cho các nhóm học sinh.
- Máy chiếu, bảng phụ hoặc phần mềm mô phỏng hình học GeoGebra.

2. Thiết bị của Học sinh:
- SGK Toán ${grade}, vở ghi bài, đồ dùng thước kẻ compa, máy tính bỏ túi.

III. TIẾN TRÌNH DẠY HỌC (CHUỖI 4 HOẠT ĐỘNG)

1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (Xác định vấn đề / Nhiệm vụ học tập) - 7 phút
a) Mục tiêu: Kích hoạt kiến thức nền tảng, tạo nhu cầu nhận thức bài "${selectedTopic}".
b) Nội dung: GV trình chiếu tình huống thực tiễn mở đầu bài học và câu hỏi gợi mở.
c) Sản phẩm: Câu trả lời dự đoán ban đầu của các nhóm học sinh.
d) Tổ chức thực hiện:
   - Bước 1 (Giao nhiệm vụ): GV chia lớp thành 4 nhóm lớn, nêu câu hỏi khởi động.
   - Bước 2 (Thực hiện): Các nhóm suy nghĩ, thảo luận nhanh trong 2 phút.
   - Bước 3 (Báo cáo): Đại diện 1 nhóm trình bày, nhóm khác nhận xét bổ sung.
   - Bước 4 (Kết luận): GV dẫn dắt khéo léo vào nội dung chính của bài học.

2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (Khám phá) - 20 phút
a) Mục tiêu: Nắm vững định nghĩa, tính chất, hệ quả và phương pháp giải của "${selectedTopic}".
b) Nội dung: Hoàn thành nội dung trong Phiếu học tập số 1 và các hoạt động Khám phá trong SGK.
c) Sản phẩm: Lời giải hoàn chỉnh và bảng tổng kết kiến thức trọng tâm.
d) Tổ chức thực hiện:
   - GV hướng dẫn từng bước suy luận, cho học sinh tự phát hiện quy luật.
   - Học sinh ghi nhận định nghĩa, công thức vào vở ghi.
   - GV nhấn mạnh các lỗi sai học sinh hay mắc phải khi làm bài.

3. HOẠT ĐỘNG 3: LUYỆN TẬP (Củng cố kỹ năng) - 12 phút
a) Mục tiêu: Khắc sâu kiến thức vừa học qua hệ thống bài tập mẫu và bài tập phân hóa.
b) Nội dung: Giải quyết bài tập tự luận và câu hỏi trắc nghiệm nhanh 4 đáp án.
c) Sản phẩm: Lời giải chi tiết trên bảng của học sinh được chỉ định.
d) Tổ chức thực hiện:
   - GV gọi 2 học sinh lên bảng giải 2 câu tiêu biểu.
   - Cả lớp làm độc lập vào vở, sau đó đối chiếu lời giải chuẩn của GV.

4. HOẠT ĐỘNG 4: VẬN DỤNG (Liên hệ thực tế và mở rộng) - 6 phút
a) Mục tiêu: Phát triển năng lực tư duy toán học gắn liền với thực tiễn cuộc sống.
b) Nội dung: Bài toán ứng dụng của "${selectedTopic}" trong kinh tế, kỹ thuật hoặc vật lý.
c) Sản phẩm: Báo cáo ngắn gọn hoặc sơ đồ tư duy tóm tắt bài học.
d) Hướng dẫn về nhà: Hoàn thành bài tập SGK/SBT và chuẩn bị bài học tiếp theo.
    `.trim();

    setGeneratedDoc(text);
  };

  const handleCopy = () => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDoc = () => {
    if (!generatedDoc) return;
    const today = new Date().toISOString().split('T')[0];
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: `GIÁO ÁN TOÁN ${grade} - ${selectedTopic.toUpperCase()}`,
      category: `GIÁO ÁN TOÁN ${grade}` as DocumentCategory,
      grade: grade as Grade,
      semester: 'Học kỳ 1',
      academicYear: '2026 - 2027',
      fileType: 'WORD DOCX',
      fileSize: '2.1 MB',
      isPinned: false,
      createdAt: today,
      updatedAt: today,
      description: `Giáo án chuẩn CV 5512 bài học ${selectedTopic} môn Toán lớp ${grade}.`,
      author: profile.name,
      school: profile.school,
      contentPreview: generatedDoc,
      tags: [`Toán ${grade}`, 'CV 5512', 'Kế hoạch bài dạy']
    };

    onSaveToPortfolio(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-[#16191E] border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F1115] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-tight">Tạo Giáo án Mẫu Chuẩn Công Văn 5512</h3>
              <p className="text-xs text-slate-400">Chuẩn hóa 4 hoạt động dạy học: Khởi động, Khám phá, Luyện tập, Vận dụng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Grade & Topic Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0F1115] p-4 rounded-xl border border-slate-800">
            
            {/* Grade */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Chọn Khối Lớp
              </label>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700">
                {(['10', '11', '12'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGrade(g);
                      setSelectedTopic(MATH_TOPICS[g][0].name);
                    }}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
                      grade === g ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Khối {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Chủ đề / Bài học
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {MATH_TOPICS[grade].map((topic, i) => (
                  <option key={i} value={topic.name}>
                    {topic.name} ({topic.periods} tiết)
                  </option>
                ))}
              </select>
            </div>

            {/* Duration & Trigger Button */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Thời lượng tiết dạy
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="2 tiết"
                  className="w-24 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo giáo án</span>
                </button>
              </div>
            </div>

          </div>

          {/* Generated Result Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
                Xem trước nội dung giáo án hoàn chỉnh
              </label>
              {generatedDoc && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer border border-slate-700 font-mono"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              )}
            </div>

            {generatedDoc ? (
              <textarea
                readOnly
                rows={12}
                value={generatedDoc}
                className="w-full p-4 text-xs bg-[#0F1115] border border-slate-800 rounded-xl text-slate-300 font-mono leading-relaxed focus:outline-none"
              />
            ) : (
              <div className="border border-dashed border-slate-800 rounded-xl p-10 text-center bg-[#0F1115] space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs text-slate-400">
                  Chọn Khối lớp và Bài học ở trên, sau đó bấm nút <strong className="text-indigo-400">"Tạo giáo án"</strong>.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#0F1115] px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors cursor-pointer border border-slate-700"
          >
            Đóng
          </button>

          {generatedDoc && (
            <button
              onClick={handleSaveDoc}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu vào hồ sơ cá nhân</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
