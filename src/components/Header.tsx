import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  KeyRound, 
  LogOut,
  Lock,
  UploadCloud
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface HeaderProps {
  profile?: TeacherProfile;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isAdmin: boolean;
  onOpenLoginModal: (reason?: 'upload' | 'general') => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onOpenChangePasswordModal: () => void;
  onOpenProfileModal: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  onOpenCv5512Generator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onOpenLoginModal,
  onLogout,
  onOpenAddModal,
  onOpenChangePasswordModal,
  onOpenProfileModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#06080D]/95 backdrop-blur-md border-b border-blue-950/80 px-4 lg:px-6 py-2.5 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2.5">
        
        {/* Left: Logo & Title */}
        <div 
          className={`flex items-center gap-2.5 ${isAdmin ? 'cursor-pointer group' : ''}`}
          onClick={isAdmin ? onOpenProfileModal : undefined}
          title={isAdmin ? 'Nhấp để xem/sửa hồ sơ giáo viên' : 'Hồ sơ cá nhân giáo viên'}
        >
          <div className="w-7 h-7 rounded-lg bg-[#0284C7] flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-[0_0_12px_rgba(2,132,199,0.5)] group-hover:scale-105 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase group-hover:text-sky-300 transition-colors">
            HỒ SƠ CÁ NHÂN GIÁO VIÊN
          </h1>
        </div>

        {/* Right: Actions & Auth */}
        <div className="flex items-center gap-2">
          
          {/* Upload / Add Document Button (Always accessible to trigger workflow) */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-[0_2px_10px_rgba(2,132,199,0.3)] border border-sky-400/30"
            title="Tải tài liệu mới lên trang web (Yêu cầu mật khẩu quản trị)"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải tài liệu lên</span>
          </button>

          {isAdmin ? (
            /* Admin Logged-In Controls */
            <div className="flex items-center bg-[#040508] border border-blue-950/80 rounded-lg px-2.5 py-1 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-slate-200 text-[11px] hidden sm:inline">Quản trị viên</span>
              </div>

              <div className="h-3 w-[1px] bg-blue-950" />

              <button
                onClick={onOpenChangePasswordModal}
                title="Đổi mật khẩu quản trị"
                className="flex items-center gap-1 text-slate-400 hover:text-sky-300 hover:bg-blue-950/60 px-1.5 py-0.5 rounded transition-all cursor-pointer text-[10px]"
              >
                <KeyRound className="w-3 h-3" />
                <span>Đổi MK</span>
              </button>

              <button
                onClick={onLogout}
                title="Thoát chế độ quản trị"
                className="text-slate-400 hover:text-red-400 hover:bg-blue-950/60 px-1.5 py-0.5 rounded transition-all cursor-pointer text-[10px] flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Thoát</span>
              </button>
            </div>
          ) : (
            /* Guest / Visitor Login Button */
            <button
              onClick={() => onOpenLoginModal('general')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#040508] hover:bg-blue-950/80 text-sky-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-blue-900/80 cursor-pointer active:scale-95 shadow-xs"
              title="Đăng nhập tài khoản Quản trị viên"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>ĐĂNG NHẬP QUẢN TRỊ</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
