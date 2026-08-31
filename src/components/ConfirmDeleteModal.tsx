import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { DocumentItem } from '../types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  document,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-[#0B101D] border-2 border-red-500/80 rounded-2xl p-5 shadow-[0_10px_40px_rgba(239,68,68,0.35)] text-slate-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Xác nhận xóa tài liệu
              </h3>
              <p className="text-xs text-red-300 font-medium">
                Hành động này sẽ xóa vĩnh viễn dữ liệu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Details Box */}
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 space-y-2">
          <p className="text-xs text-slate-300">
            Bạn có chắc chắn muốn xóa tài liệu sau đây khỏi hệ thống đám mây?
          </p>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-amber-300 font-bold break-all">
            {document.title}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-red-400 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tệp sẽ bị xóa vĩnh viễn trên mọi thiết bị và không thể khôi phục.</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all cursor-pointer shadow-[0_2px_12px_rgba(239,68,68,0.4)] disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
