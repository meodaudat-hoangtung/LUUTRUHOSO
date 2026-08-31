import React from 'react';
import { 
  Calendar, 
  Download, 
  Eye, 
  Pencil, 
  Trash2, 
  Star,
  Clock
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentCardProps {
  document: DocumentItem;
  isAdmin?: boolean;
  onPreview: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isAdmin = false,
  onPreview,
  onEdit,
  onDelete,
  onTogglePin,
  onDownload
}) => {
  const isPinned = document.isPinned;

  return (
    <div 
      className={`
        relative flex flex-col justify-between
        rounded-xl p-3.5 transition-all duration-200 group
        bg-[#0284C7] hover:bg-[#0369A1] text-white
        ${isPinned 
          ? 'border-2 border-amber-300 shadow-[0_6px_22px_-2px_rgba(2,132,199,0.5),0_0_12px_rgba(252,211,77,0.5)] ring-1 ring-amber-300/60' 
          : 'border border-sky-300/40 hover:border-white/80 shadow-[0_4px_18px_rgba(0,0,0,0.3),0_2px_10px_rgba(2,132,199,0.3)] hover:shadow-[0_8px_24px_rgba(2,132,199,0.45)] hover:-translate-y-0.5'
        }
      `}
    >
      {/* Top subtle sky highlight reflection */}
      <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Top section: Tags & Pin */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2.5">
          
          {/* Tag row */}
          <div className="flex flex-wrap items-center gap-1">
            
            {/* Category tag */}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/25 text-white border border-white/20 backdrop-blur-xs">
              {document.category}
            </span>

            {/* File format tag */}
            {document.fileType === 'PDF' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-red-600/90 text-white border border-red-400/50 shadow-2xs">
                PDF
              </span>
            )}
            {document.fileType === 'WORD DOCX' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-blue-950/80 text-sky-200 border border-sky-400/40 shadow-2xs">
                DOCX
              </span>
            )}
            {document.fileType === 'EXCEL' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-emerald-600/90 text-white border border-emerald-400/50 shadow-2xs">
                XLSX
              </span>
            )}
            {document.fileType === 'POWERPOINT' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-amber-500/90 text-white border border-amber-300/50 shadow-2xs">
                PPTX
              </span>
            )}
            {document.hasOriginalFile && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs" title="Tệp gốc thực tế được lưu trữ an toàn">
                Tệp gốc
              </span>
            )}
          </div>

          {/* Pin / Star button */}
          {isAdmin ? (
            <button
              onClick={() => onTogglePin(document.id)}
              title={isPinned ? 'Bỏ ghim tài liệu' : 'Ghim tài liệu quan trọng'}
              className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer text-white/90 flex-shrink-0"
            >
              {isPinned ? (
                <Star className="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-xs" />
              ) : (
                <Star className="w-3.5 h-3.5 text-white/70 hover:text-amber-300 transition-colors" />
              )}
            </button>
          ) : isPinned ? (
            <div className="p-1 text-amber-300 flex-shrink-0" title="Tài liệu đã ghim quan trọng">
              <Star className="w-4 h-4 fill-amber-300" />
            </div>
          ) : null}

        </div>

        {/* Semester / Academic Tag */}
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-sky-100 bg-black/20 border border-white/15">
            <Clock className="w-2.5 h-2.5 text-sky-200" />
            <span>{document.semester}</span>
          </span>
          <span className="text-[10px] font-mono text-sky-100 font-medium">
            NH {document.academicYear}
          </span>
        </div>

        {/* Document Title */}
        <h3 
          onClick={() => onPreview(document)}
          className="text-xs font-bold text-white uppercase tracking-tight line-clamp-2 leading-relaxed cursor-pointer hover:text-amber-200 transition-colors mb-3 drop-shadow-xs"
          title={document.title}
        >
          {document.title}
        </h3>
      </div>

      {/* Bottom section: Action bar */}
      <div className="pt-2.5 border-t border-white/20 flex items-center justify-between gap-1 text-white">
        
        {/* Left icons: Calendar & Download */}
        <div className="flex items-center gap-1">
          <div 
            className="p-1.5 rounded-md hover:bg-white/15 text-sky-100 hover:text-white transition-colors cursor-pointer"
            title={`Năm học ${document.academicYear} • Tạo ngày ${document.createdAt}`}
          >
            <Calendar className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={() => onDownload(document)}
            className="p-1.5 rounded-md hover:bg-white/15 text-sky-100 hover:text-white transition-colors cursor-pointer"
            title="Tải xuống tài liệu"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Xem trước (Preview) Button */}
        <button
          onClick={() => onPreview(document)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-[#0369A1] hover:bg-sky-50 text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-3.5 h-3.5 text-[#0369A1]" />
          <span>Xem trước</span>
        </button>

        {/* Right icons: Edit & Delete (Admin only) */}
        {isAdmin ? (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(document)}
              className="p-1.5 rounded-md hover:bg-white/15 text-sky-100 hover:text-white transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(document.id)}
              className="p-1.5 rounded-md hover:bg-red-600 text-sky-100 hover:text-white transition-colors cursor-pointer"
              title="Xóa tài liệu"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-3" />
        )}

      </div>

    </div>
  );
};
