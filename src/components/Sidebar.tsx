import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Star, 
  BookOpen, 
  Bookmark, 
  GraduationCap, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  Layers,
  FolderLock,
  Archive
} from 'lucide-react';
import { DocumentItem } from '../types';

interface SidebarProps {
  documents: DocumentItem[];
  selectedCategory: string;
  onSelectCategory: (categoryKey: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  selectedCategory,
  onSelectCategory,
  isOpenMobile,
  onCloseMobile
}) => {
  // Folder expanded states
  const [openGrade10, setOpenGrade10] = useState(true);
  const [openGrade11, setOpenGrade11] = useState(true);
  const [openGrade12, setOpenGrade12] = useState(true);
  const [openOther, setOpenOther] = useState(false);

  // Compute live badge counts
  const totalDocsCount = documents.length;
  const pinnedCount = documents.filter(d => d.isPinned).length;

  const grade10AllCount = documents.filter(d => d.grade === '10' || d.category.includes('10')).length;
  const grade10ToanCount = documents.filter(d => d.category === 'GIÁO ÁN TOÁN 10').length;
  const grade10CdCount = documents.filter(d => d.category === 'GIÁO ÁN CĐ TOÁN 10').length;

  const grade11AllCount = documents.filter(d => d.grade === '11' || d.category.includes('11')).length;
  const grade11ToanCount = documents.filter(d => d.category === 'GIÁO ÁN TOÁN 11').length;
  const grade11CdCount = documents.filter(d => d.category === 'GIÁO ÁN CĐ TOÁN 11').length;

  const grade12AllCount = documents.filter(d => d.grade === '12' || d.category.includes('12')).length;
  const grade12ToanCount = documents.filter(d => d.category === 'GIÁO ÁN TOÁN 12').length;
  const grade12CdCount = documents.filter(d => d.category === 'GIÁO ÁN CĐ TOÁN 12').length;

  const examCount = documents.filter(d => d.category === 'NGÂN HÀNG ĐỀ THI').length;
  const adminDocCount = documents.filter(d => d.category === 'KH CÁ NHÂN' || d.category === 'KHGD NHÀ TRƯỜNG' || d.category === 'KHGD MÔN TOÁN' || d.category === 'SỔ CHỦ NHIỆM').length;

  const handleSelect = (categoryKey: string) => {
    onSelectCategory(categoryKey);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40
        w-60 bg-[#06080D] border-r border-blue-950/80
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out shrink-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Scrollable folder area */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          
          {/* Section: Chế độ xem */}
          <div>
            <h3 className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider mb-1.5 px-2.5">
              CHẾ ĐỘ XEM
            </h3>
            <div className="space-y-0.5">
              
              {/* Tất cả tài liệu */}
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tất cả tài liệu</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60' 
                    : 'bg-[#040508] text-slate-400'
                }`}>
                  {totalDocsCount}
                </span>
              </button>

              {/* Đã ghim quan trọng */}
              <button
                onClick={() => handleSelect('pinned')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === 'pinned'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Đã ghim quan trọng</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  selectedCategory === 'pinned' 
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50' 
                    : 'bg-[#040508] text-slate-400'
                }`}>
                  {pinnedCount}
                </span>
              </button>

            </div>
          </div>

          {/* Section: Giáo án Khối 10 */}
          <div className="border-t border-blue-950/70 pt-2.5">
            <div 
              onClick={() => setOpenGrade10(!openGrade10)}
              className="flex items-center justify-between px-2 py-1 text-slate-300 hover:text-white rounded-md hover:bg-blue-950/40 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>GIÁO ÁN 10</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">
                  {grade10AllCount}
                </span>
                {openGrade10 ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            </div>

            {openGrade10 && (
              <div className="mt-1 ml-2 pl-2 border-l border-blue-950/80 space-y-0.5">
                <button
                  onClick={() => handleSelect('grade_10_all')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'grade_10_all'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>Tất cả Giáo án 10</span>
                  <span className="text-[10px] font-mono text-slate-400">{grade10AllCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN TOÁN 10')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN TOÁN 10'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3 h-3 text-blue-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN TOÁN 10</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade10ToanCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN CĐ TOÁN 10')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN CĐ TOÁN 10'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3 h-3 text-cyan-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN CĐ TOÁN 10</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade10CdCount}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Giáo án Khối 11 */}
          <div className="border-t border-blue-950/70 pt-2.5">
            <div 
              onClick={() => setOpenGrade11(!openGrade11)}
              className="flex items-center justify-between px-2 py-1 text-slate-300 hover:text-white rounded-md hover:bg-blue-950/40 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                <span>GIÁO ÁN 11</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">
                  {grade11AllCount}
                </span>
                {openGrade11 ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            </div>

            {openGrade11 && (
              <div className="mt-1 ml-2 pl-2 border-l border-blue-950/80 space-y-0.5">
                <button
                  onClick={() => handleSelect('grade_11_all')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'grade_11_all'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>Tất cả Giáo án 11</span>
                  <span className="text-[10px] font-mono text-slate-400">{grade11AllCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN TOÁN 11')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN TOÁN 11'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3 h-3 text-blue-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN TOÁN 11</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade11ToanCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN CĐ TOÁN 11')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN CĐ TOÁN 11'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3 h-3 text-cyan-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN CĐ TOÁN 11</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade11CdCount}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Giáo án Khối 12 */}
          <div className="border-t border-blue-950/70 pt-2.5">
            <div 
              onClick={() => setOpenGrade12(!openGrade12)}
              className="flex items-center justify-between px-2 py-1 text-slate-300 hover:text-white rounded-md hover:bg-blue-950/40 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>GIÁO ÁN 12</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">
                  {grade12AllCount}
                </span>
                {openGrade12 ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            </div>

            {openGrade12 && (
              <div className="mt-1 ml-2 pl-2 border-l border-blue-950/80 space-y-0.5">
                <button
                  onClick={() => handleSelect('grade_12_all')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'grade_12_all'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>Tất cả Giáo án 12</span>
                  <span className="text-[10px] font-mono text-slate-400">{grade12AllCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN TOÁN 12')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN TOÁN 12'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3 h-3 text-blue-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN TOÁN 12</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade12ToanCount}</span>
                </button>

                <button
                  onClick={() => handleSelect('GIÁO ÁN CĐ TOÁN 12')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'GIÁO ÁN CĐ TOÁN 12'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3 h-3 text-cyan-400/70 shrink-0" />
                    <span className="truncate">GIÁO ÁN CĐ TOÁN 12</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{grade12CdCount}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Hồ sơ khác & Kế hoạch */}
          <div className="border-t border-blue-950/70 pt-2.5">
            <div 
              onClick={() => setOpenOther(!openOther)}
              className="flex items-center justify-between px-2 py-1 text-slate-300 hover:text-white rounded-md hover:bg-blue-950/40 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Archive className="w-3.5 h-3.5 text-blue-400" />
                <span>HỒ SƠ CHUYÊN MÔN</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">
                  {adminDocCount + examCount}
                </span>
                {openOther ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            </div>

            {openOther && (
              <div className="mt-1 ml-2 pl-2 border-l border-blue-950/80 space-y-0.5">
                <button
                  onClick={() => handleSelect('KH CÁ NHÂN')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'KH CÁ NHÂN'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>KH Cá Nhân</span>
                </button>

                <button
                  onClick={() => handleSelect('KHGD NHÀ TRƯỜNG')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'KHGD NHÀ TRƯỜNG'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>KHGD Nhà Trường</span>
                </button>

                <button
                  onClick={() => handleSelect('KHGD MÔN TOÁN')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'KHGD MÔN TOÁN'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>KHGD Môn Toán</span>
                </button>

                <button
                  onClick={() => handleSelect('NGÂN HÀNG ĐỀ THI')}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === 'NGÂN HÀNG ĐỀ THI'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                  }`}
                >
                  <span>Ngân hàng Đề thi</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-blue-950/80 bg-[#040508] flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500">GDPT 2018 / 5512</span>
          <span className="text-blue-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
            v2.5 Pro
          </span>
        </div>
      </aside>
    </>
  );
};
