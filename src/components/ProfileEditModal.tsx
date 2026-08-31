import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Upload, 
  RefreshCw, 
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  School,
  Calendar,
  Mail,
  Phone,
  Quote,
  Check,
  Sparkles
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
  // Content values state
  const [name, setName] = useState(profile.name || '');
  const [role, setRole] = useState(profile.role || '');
  const [subject, setSubject] = useState(profile.subject || '');
  const [school, setSchool] = useState(profile.school || '');
  const [academicYear, setAcademicYear] = useState(profile.academicYear || '');
  const [quote, setQuote] = useState(profile.quote || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');

  // Visibility toggle states (mặc định true nếu chưa định nghĩa)
  const [showAvatar, setShowAvatar] = useState<boolean>(profile.showAvatar ?? true);
  const [showRole, setShowRole] = useState<boolean>(profile.showRole ?? true);
  const [showSubject, setShowSubject] = useState<boolean>(profile.showSubject ?? true);
  const [showSchool, setShowSchool] = useState<boolean>(profile.showSchool ?? true);
  const [showAcademicYear, setShowAcademicYear] = useState<boolean>(profile.showAcademicYear ?? true);
  const [showQuote, setShowQuote] = useState<boolean>(profile.showQuote ?? true);
  const [showEmail, setShowEmail] = useState<boolean>(profile.showEmail ?? true);
  const [showPhone, setShowPhone] = useState<boolean>(profile.showPhone ?? true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'preview'>('info');

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
      setShowAvatar(true);
    } catch (err) {
      setUploadError((err as Error).message || 'Lỗi khi tải ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
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
      setShowAvatar(true);
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
      avatarUrl: avatarUrl.trim(),
      showAvatar,
      showRole,
      showSubject,
      showSchool,
      showAcademicYear,
      showQuote,
      showEmail,
      showPhone
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="bg-[#0B101D] border border-blue-900/80 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#06080D] px-5 py-3.5 border-b border-blue-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span>Tùy chỉnh thẻ hồ sơ giáo viên</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  Ẩn / Hiện theo ý muốn
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chỉnh sửa nội dung và chọn đối tượng nào được hiển thị trên thẻ hồ sơ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="p-3 bg-[#070b14] border-b border-blue-950/80">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Xem trước giao diện thẻ hồ sơ thực tế:</span>
          </div>

          {/* Mini Live Profile Card Preview */}
          <div className="bg-[#0284C7] rounded-xl border-2 border-amber-400 text-white p-3 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {showAvatar && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-amber-400 bg-sky-950/40 flex-shrink-0">
                <img
                  src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : 'https://api.dicebear.com/7.x/bottts/svg?seed=HoangTung'}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white truncate">
                  {name || 'Họ và tên giáo viên'}
                </span>
                {showRole && role && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-extrabold uppercase bg-amber-400 text-slate-950">
                    {role}
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-white">
                {showSubject && subject && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-300" />
                    <span>{subject}</span>
                  </span>
                )}
                {showSchool && school && (
                  <span className="flex items-center gap-1">
                    <School className="w-3 h-3 text-amber-300" />
                    <span>{school}</span>
                  </span>
                )}
                {showAcademicYear && academicYear && (
                  <span className="flex items-center gap-1 text-amber-200 font-mono text-[11px] bg-black/25 px-1.5 py-0.5 rounded">
                    <Calendar className="w-3 h-3 text-amber-300" />
                    <span>NH {academicYear}</span>
                  </span>
                )}
              </div>

              {showQuote && quote && (
                <div className="text-[11px] text-sky-100 italic truncate">
                  "{quote}"
                </div>
              )}

              <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono">
                {showEmail && email && (
                  <span className="flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded text-white">
                    <Mail className="w-3 h-3 text-amber-300" />
                    <span>{email}</span>
                  </span>
                )}
                {showPhone && phone && (
                  <span className="flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded text-white">
                    <Phone className="w-3 h-3 text-amber-300" />
                    <span>{phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* 1. Avatar Section */}
          <div className={`rounded-xl p-3.5 border transition-colors ${showAvatar ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-60'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  1. Ảnh đại diện hồ sơ
                </span>
                <span className="text-[11px] text-slate-400">
                  ({showAvatar ? 'Đang hiển thị' : 'Đã ẩn'})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatar(!showAvatar)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  showAvatar 
                    ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {showAvatar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showAvatar ? 'Hiển thị ảnh' : 'Ẩn ảnh đại diện'}</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-sky-400 bg-black/40 flex items-center justify-center">
                  {isUploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                  ) : (
                    <img
                      src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : 'https://api.dicebear.com/7.x/bottts/svg?seed=Default'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    title="Xóa ảnh"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-950/20 hover:bg-sky-950/40 rounded-xl p-2.5 flex items-center justify-center gap-2.5 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4 text-sky-300 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white hover:text-sky-300">
                      Tải ảnh từ máy tính hoặc chụp ảnh từ điện thoại
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Mẫu:</span>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset);
                          setShowAvatar(true);
                        }}
                        className={`w-5 h-5 rounded-full overflow-hidden border cursor-pointer ${
                          avatarUrl === preset ? 'border-sky-400 ring-2 ring-sky-500' : 'border-slate-700 opacity-60'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                  >
                    {showUrlInput ? 'Ẩn URL' : 'Nhập URL'}
                  </button>
                </div>

                {showUrlInput && (
                  <input
                    type="text"
                    placeholder="Dán link ảnh URL..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-black/40 border border-blue-950 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. Họ và tên & Chức danh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Họ và tên */}
            <div className="bg-[#06080D] border border-blue-950 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                Họ và tên giáo viên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Hoàng Tùng"
                className="w-full px-3 py-1.5 text-sm bg-black/50 border border-blue-900/60 rounded-lg text-white font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Chức danh / Vai trò */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showRole ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Chức danh / Vai trò
                </label>
                <button
                  type="button"
                  onClick={() => setShowRole(!showRole)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showRole ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showRole ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showRole ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="VD: Giáo viên / Tổ trưởng"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

          </div>

          {/* 3. Môn học & Trường học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Môn học */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showSubject ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Môn học giảng dạy
                </label>
                <button
                  type="button"
                  onClick={() => setShowSubject(!showSubject)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showSubject ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showSubject ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showSubject ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Toán học"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Đơn vị trường */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showSchool ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Đơn vị trường học
                </label>
                <button
                  type="button"
                  onClick={() => setShowSchool(!showSchool)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showSchool ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showSchool ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showSchool ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="VD: THPT Tĩnh Gia 4"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

          </div>

          {/* 4. Năm học & Châm ngôn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Năm học */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showAcademicYear ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Năm học thực hiện
                </label>
                <button
                  type="button"
                  onClick={() => setShowAcademicYear(!showAcademicYear)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showAcademicYear ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showAcademicYear ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showAcademicYear ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="VD: Năm học 2026 - 2027"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Châm ngôn */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showQuote ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Châm ngôn / Câu trích dẫn
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuote(!showQuote)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showQuote ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showQuote ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showQuote ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="VD: “Thầy giáo làng”"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 italic"
              />
            </div>

          </div>

          {/* 5. Email & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Email */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showEmail ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showEmail ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showEmail ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showEmail ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: 07071987hoangtung@gmail.com"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Số điện thoại */}
            <div className={`rounded-xl p-3 border space-y-1.5 transition-colors ${showPhone ? 'bg-[#06080D] border-blue-950' : 'bg-slate-900/30 border-slate-800/60 opacity-70'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-sky-200 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    showPhone ? 'text-sky-300 hover:text-white bg-sky-950 border border-sky-800' : 'text-slate-500 bg-slate-800'
                  }`}
                >
                  {showPhone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showPhone ? 'Hiện' : 'Ẩn'}</span>
                </button>
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0982.xxx.202"
                className="w-full px-3 py-1.5 text-xs bg-black/50 border border-blue-900/60 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

          </div>

          {/* Quick toggle all action */}
          <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl flex items-center justify-between">
            <span className="text-xs text-sky-200">
              💡 Bấm vào nút <b>Hiện / Ẩn</b> cạnh mỗi trường để tùy biến thẻ hồ sơ theo ý muốn.
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAvatar(true);
                setShowRole(true);
                setShowSubject(true);
                setShowSchool(true);
                setShowAcademicYear(true);
                setShowQuote(true);
                setShowEmail(true);
                setShowPhone(true);
              }}
              className="text-xs font-bold text-amber-300 hover:underline cursor-pointer flex-shrink-0"
            >
              Hiện tất cả
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-blue-950 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu và cập nhật hồ sơ</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
