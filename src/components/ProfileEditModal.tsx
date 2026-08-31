import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Upload, 
  Camera, 
  Image as ImageIcon,
  Check,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { processAvatarImage } from '../utils/imageHelper';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSave: (updatedProfile: TeacherProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=HoangTung',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [subject, setSubject] = useState(profile.subject);
  const [school, setSchool] = useState(profile.school);
  const [academicYear, setAcademicYear] = useState(profile.academicYear);
  const [quote, setQuote] = useState(profile.quote);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      const compressedDataUrl = await processAvatarImage(file);
      setAvatarUrl(compressedDataUrl);
    } catch (err) {
      setUploadError((err as Error).message || 'Lỗi khi tải ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be reselected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      const compressedDataUrl = await processAvatarImage(file);
      setAvatarUrl(compressedDataUrl);
    } catch (err) {
      setUploadError((err as Error).message || 'Lỗi khi tải ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name: name.trim(),
      role: role.trim(),
      subject: subject.trim(),
      school: school.trim(),
      academicYear: academicYear.trim(),
      quote: quote.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-[#0B101D] border border-blue-900/60 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="bg-[#06080D] px-6 py-4 border-b border-blue-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">Chỉnh sửa hồ sơ giáo viên</h3>
              <p className="text-xs text-sky-200/70">Cập nhật ảnh đại diện và thông tin cá nhân</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Avatar Upload Box */}
          <div className="bg-[#06080D] border border-blue-950 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                Ảnh đại diện hồ sơ
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                {showUrlInput ? 'Ẩn nhập URL' : 'Nhập liên kết URL ảnh'}
              </button>
            </div>

            {/* Hidden file input supporting both PC files and Phone camera/gallery */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="avatar-file-input"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Avatar Preview */}
              <div className="relative flex-shrink-0 group">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-sky-400/80 shadow-[0_0_15px_rgba(2,132,199,0.3)] bg-black/40 flex items-center justify-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center gap-1 text-sky-400">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-[9px] font-mono">Đang xử lý...</span>
                    </div>
                  ) : (
                    <img
                      src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : 'https://api.dicebear.com/7.x/bottts/svg?seed=Default'}
                      alt="Avatar"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Default';
                      }}
                    />
                  )}
                </div>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    title="Xóa ảnh hiện tại"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Upload Dropzone & Action Buttons */}
              <div className="flex-1 w-full space-y-2.5">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-950/20 hover:bg-sky-950/40 rounded-xl p-3.5 flex items-center justify-center gap-3 text-center cursor-pointer transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      Nhấn để tải ảnh lên từ máy tính hoặc điện thoại
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Hỗ trợ chụp trực tiếp hoặc chọn tệp PNG, JPG, JPEG (tự động tối ưu dung lượng)
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400 font-medium">{uploadError}</p>
                )}

                {/* Preset & URL controls */}
                {showUrlInput && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn URL ảnh trực tuyến..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-black/40 border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Hoặc chọn mẫu:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-6 h-6 rounded-full overflow-hidden border transition-all cursor-pointer ${
                          avatarUrl === preset ? 'border-sky-400 ring-2 ring-sky-500/50 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Họ và tên giáo viên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#06080D] border border-blue-950 rounded-lg text-white font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Chức danh / Vai trò
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Giáo viên / Tổ trưởng"
                className="w-full px-3.5 py-2 text-sm bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Subject & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Môn học giảng dạy
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Toán học"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Đơn vị trường học
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="THPT Tĩnh Gia 4"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Academic Year & Quote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Năm học thực hiện
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Năm học 2026 - 2027"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Châm ngôn / Câu trích dẫn
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="“Thầy giáo làng”"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 italic"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="07071987hoangtung@gmail.com"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0982.xxx.202"
                className="w-full px-3.5 py-2 text-xs bg-[#06080D] border border-blue-950 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-blue-950 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-blue-900/60"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer active:scale-95"
            >
              Cập nhật hồ sơ
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
