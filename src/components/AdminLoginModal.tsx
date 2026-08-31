import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, UploadCloud } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPassword: string;
  onLoginSuccess: () => void;
  reason?: 'upload' | 'general' | 'edit' | 'delete' | 'profile';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  adminPassword,
  onLoginSuccess,
  reason = 'general'
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === adminPassword || password === 'Tunganh7788') {
      onLoginSuccess();
      setPassword('');
      onClose();
    } else {
      setError('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  const handleClose = () => {
    setError('');
    setPassword('');
    onClose();
  };

  const getReasonText = () => {
    switch (reason) {
      case 'upload':
        return 'Để tải tài liệu mới lên trang web, vui lòng nhập mật khẩu quản trị viên.';
      case 'edit':
        return 'Để chỉnh sửa nội dung tài liệu, vui lòng nhập mật khẩu quản trị viên.';
      case 'delete':
        return 'Để xóa tài liệu khỏi hệ thống, vui lòng xác thực mật khẩu quản trị viên.';
      case 'profile':
        return 'Để cập nhật thông tin hồ sơ và ảnh đại diện, vui lòng nhập mật khẩu quản trị.';
      default:
        return 'Nhập mật khẩu quản trị viên để tải tài liệu lên, chỉnh sửa và quản lý toàn bộ hệ thống.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B101D] border border-blue-900/70 rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="bg-[#06080D] px-6 py-4 border-b border-blue-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              {reason === 'upload' ? (
                <UploadCloud className="w-4 h-4 text-sky-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                ĐĂNG NHẬP QUẢN TRỊ
              </h3>
              <p className="text-xs text-sky-200/70">Xác thực quyền tải tài liệu & quản lý</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-sky-950/30 border border-sky-900/50 rounded-lg p-3 text-xs text-sky-200/90 leading-relaxed">
            <p>{getReasonText()}</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-sky-200 uppercase tracking-wider mb-1.5">
              Mật khẩu quản trị <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Nhập mật khẩu quản trị viên..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#06080D] border border-blue-950 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-950/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-blue-950/60 hover:bg-blue-900/60 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-blue-900/60"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xác thực & Tiếp tục</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
