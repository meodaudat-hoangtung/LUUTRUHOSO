import React, { useRef, useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  Camera, 
  School, 
  RefreshCw, 
  Pencil,
  Sliders
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { processAvatarImage } from '../utils/imageHelper';

interface ProfileHeroCardProps {
  profile: TeacherProfile;
  isAdmin?: boolean;
  onEditProfile: () => void;
  onUpdateAvatar?: (avatarDataUrl: string) => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  isAdmin = false,
  onEditProfile,
  onUpdateAvatar,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read visibility toggles with default fallback to true
  const showAvatar = profile.showAvatar ?? true;
  const showRole = profile.showRole ?? true;
  const showSubject = profile.showSubject ?? true;
  const showSchool = profile.showSchool ?? true;
  const showAcademicYear = profile.showAcademicYear ?? true;
  const showQuote = profile.showQuote ?? true;
  const showEmail = profile.showEmail ?? true;
  const showPhone = profile.showPhone ?? true;

  const avatarSrc = profile.avatarUrl && profile.avatarUrl.trim() !== ''
    ? profile.avatarUrl
    : 'https://api.dicebear.com/7.x/bottts/svg?seed=HoangTung';

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await processAvatarImage(file);
      if (onUpdateAvatar) {
        onUpdateAvatar(dataUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isAdmin) {
      onEditProfile();
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="relative bg-[#0284C7] rounded-xl border-2 border-amber-400 text-white p-4 lg:p-5 shadow-[0_4px_20px_rgba(2,132,199,0.3)]">
      
      {/* Hidden file input for direct photo upload from PC or Mobile */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleDirectAvatarUpload}
        className="hidden"
      />

      {/* Top right quick edit button */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
        <button
          onClick={onEditProfile}
          title="Tùy chỉnh thông tin & Ẩn/Hiện các mục trên thẻ hồ sơ"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-amber-300 hover:text-white border border-amber-400/50 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Tùy chỉnh thẻ</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 pr-24 sm:pr-28 lg:pr-0">
        
        {/* Left: Avatar & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full">
          
          {/* Avatar with flat 2D golden border (only shown if showAvatar is true) */}
          {showAvatar && (
            <div 
              className="relative flex-shrink-0 cursor-pointer group" 
              onClick={handleAvatarClick}
              title={isAdmin ? "Nhấn để tải ảnh đại diện mới" : "Nhấn để chỉnh sửa thẻ hồ sơ"}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-amber-400 bg-sky-950/40 relative">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                  </div>
                ) : (
                  <img
                    src={avatarSrc}
                    alt={profile.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=HoangTung';
                    }}
                  />
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              {/* Quick Upload Action Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="Tải ảnh mới từ máy tính / điện thoại"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 transition-colors border border-slate-900 cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-slate-950" />
                </button>
              )}
            </div>
          )}

          {/* Teacher Details */}
          <div className="space-y-2 flex-1 min-w-0">
            
            {/* Name + Role badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              <h2 
                onClick={onEditProfile}
                className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 cursor-pointer hover:text-amber-200 transition-colors"
                title="Nhấn để chỉnh sửa thông tin hồ sơ"
              >
                {profile.name || 'Họ và tên giáo viên'}
              </h2>

              {showRole && profile.role && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-300">
                  {profile.role}
                </span>
              )}

              <button
                onClick={onEditProfile}
                title="Chỉnh sửa thông tin hồ sơ"
                className="p-1 rounded bg-black/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subject, School, Academic Year */}
            {( (showSubject && profile.subject) || (showSchool && profile.school) || (showAcademicYear && profile.academicYear) ) && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm sm:text-base font-extrabold text-white">
                {showSubject && profile.subject && (
                  <span className="flex items-center gap-1.5 text-white">
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    <span>{profile.subject}</span>
                  </span>
                )}
                {showSubject && profile.subject && showSchool && profile.school && (
                  <span className="text-amber-300/80 font-black">•</span>
                )}
                {showSchool && profile.school && (
                  <span className="flex items-center gap-1.5 text-white">
                    <School className="w-4 h-4 text-amber-300" />
                    <span>{profile.school}</span>
                  </span>
                )}
                {((showSubject && profile.subject) || (showSchool && profile.school)) && showAcademicYear && profile.academicYear && (
                  <span className="text-amber-300/80 font-black">•</span>
                )}
                {showAcademicYear && profile.academicYear && (
                  <span className="flex items-center gap-1.5 text-amber-200 font-mono font-bold bg-black/20 px-2 py-0.5 rounded border border-amber-400/40">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>NH {profile.academicYear}</span>
                  </span>
                )}
              </div>
            )}

            {/* Teacher Quote */}
            {showQuote && profile.quote && (
              <p className="text-xs sm:text-sm text-sky-100 font-medium italic pt-0.5 line-clamp-1">
                "{profile.quote}"
              </p>
            )}

            {/* Email & Phone contact */}
            {((showEmail && profile.email) || (showPhone && profile.phone)) && (
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-white font-bold pt-0.5 font-mono">
                {showEmail && profile.email && (
                  <a 
                    href={`mailto:${profile.email}`} 
                    className="flex items-center gap-1.5 hover:text-amber-300 transition-colors bg-black/20 hover:bg-black/35 px-2.5 py-0.5 rounded border border-white/20"
                    title="Gửi email"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-bold">{profile.email}</span>
                  </a>
                )}
                {showPhone && profile.phone && (
                  <a 
                    href={`tel:${profile.phone}`} 
                    className="flex items-center gap-1.5 hover:text-amber-300 transition-colors bg-black/20 hover:bg-black/35 px-2.5 py-0.5 rounded border border-white/20"
                    title="Gọi điện thoại"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-bold">{profile.phone}</span>
                  </a>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
