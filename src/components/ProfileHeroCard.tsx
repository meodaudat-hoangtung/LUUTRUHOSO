import React, { useRef, useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  Camera, 
  School, 
  RefreshCw, 
  Pencil 
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
    <div className="relative overflow-hidden bg-[#0284C7] rounded-xl border border-sky-300/40 text-white p-4 lg:p-5 transition-all shadow-[0_6px_24px_rgba(2,132,199,0.35)]">
      
      {/* Top subtle radiant light line for depth */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-white/60 via-sky-200 to-transparent" />

      {/* Hidden file input for direct photo upload from PC or Mobile */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleDirectAvatarUpload}
        className="hidden"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-5">
        
        {/* Left: Avatar & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 w-full">
          
          {/* Avatar with edit / direct upload button */}
          <div 
            className="relative flex-shrink-0 cursor-pointer group" 
            onClick={handleAvatarClick}
            title={isAdmin ? "Nhấn để tải ảnh đại diện từ máy tính hoặc điện thoại" : "Hồ sơ cá nhân giáo viên"}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-white/40 shadow-[0_0_14px_rgba(0,0,0,0.25)] bg-black/20 relative">
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/50 text-white">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <img
                  src={avatarSrc}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=HoangTung';
                  }}
                />
              )}

              {/* Hover overlay hint (Admin only) */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Quick Upload Action Button (Admin only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Tải ảnh mới từ máy tính / điện thoại"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-white text-[#0284C7] shadow flex items-center justify-center hover:bg-sky-50 transition-colors border border-white/80 cursor-pointer"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Teacher Details */}
          <div className="space-y-2 flex-1">
            
            {/* Name + Role badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              <h2 
                onClick={onEditProfile}
                className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 cursor-pointer hover:text-amber-200 transition-colors drop-shadow-sm"
                title={isAdmin ? "Nhấn để chỉnh sửa thông tin hồ sơ" : profile.name}
              >
                {profile.name}
              </h2>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black uppercase tracking-wider bg-black/35 text-white border border-white/30 shadow-xs">
                {profile.role}
              </span>
              {isAdmin && (
                <button
                  onClick={onEditProfile}
                  title="Chỉnh sửa thông tin hồ sơ"
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white hover:text-amber-200 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subject, School, Academic Year */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-sm sm:text-base font-bold text-white">
              {profile.subject && (
                <span className="flex items-center gap-1.5 text-white font-extrabold drop-shadow-xs">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>{profile.subject}</span>
                </span>
              )}
              {profile.subject && profile.school && (
                <span className="text-white/50 font-normal">/</span>
              )}
              {profile.school && (
                <span className="flex items-center gap-1.5 text-white font-extrabold drop-shadow-xs">
                  <School className="w-4 h-4 text-amber-300" />
                  <span>{profile.school}</span>
                </span>
              )}
              {(profile.subject || profile.school) && profile.academicYear && (
                <span className="text-white/50 font-normal">/</span>
              )}
              {profile.academicYear && (
                <span className="flex items-center gap-1.5 text-white font-mono font-bold">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>{profile.academicYear}</span>
                </span>
              )}
            </div>

            {/* Teacher Quote */}
            {profile.quote && (
              <p className="text-xs sm:text-sm text-sky-100 font-medium italic pt-0.5 line-clamp-1">
                "{profile.quote}"
              </p>
            )}

            {/* Email & Phone contact */}
            <div className="flex items-center flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm text-white font-semibold pt-0.5 font-mono">
              <a 
                href={`mailto:${profile.email}`} 
                className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
                title="Gửi email"
              >
                <Mail className="w-4 h-4 text-sky-200" />
                <span className="font-bold">{profile.email}</span>
              </a>
              <a 
                href={`tel:${profile.phone}`} 
                className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
                title="Gọi điện thoại"
              >
                <Phone className="w-4 h-4 text-sky-200" />
                <span className="font-bold">{profile.phone}</span>
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
