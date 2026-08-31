import React from 'react';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  ArrowUpDown, 
  FileText, 
  Eye, 
  Pencil, 
  Trash2, 
  Star,
  Download,
  FolderOpen,
  UploadCloud
} from 'lucide-react';
import { DocumentItem, FilterState } from '../types';
import { DocumentCard } from './DocumentCard';

interface DocumentExplorerProps {
  documents: DocumentItem[];
  filteredDocuments: DocumentItem[];
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onOpenAddModal: () => void;
  onPreview: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDownload: (doc: DocumentItem) => void;
  isAdmin?: boolean;
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  filteredDocuments,
  filterState,
  onFilterChange,
  onOpenAddModal,
  onPreview,
  onEdit,
  onDelete,
  onTogglePin,
  onDownload,
  isAdmin = false
}) => {
  // Determine title based on active category
  const getCategoryTitle = () => {
    switch (filterState.selectedCategory) {
      case 'all':
        return 'Tất cả tài liệu và hồ sơ';
      case 'pinned':
        return 'Tài liệu đã ghim quan trọng';
      case 'grade_10_all':
      case 'GIÁO ÁN TOÁN 10':
      case 'GIÁO ÁN CĐ TOÁN 10':
        return 'Giáo án & Chuyên đề Khối 10';
      case 'grade_11_all':
      case 'GIÁO ÁN TOÁN 11':
      case 'GIÁO ÁN CĐ TOÁN 11':
        return 'Giáo án & Chuyên đề Khối 11';
      case 'grade_12_all':
      case 'GIÁO ÁN TOÁN 12':
      case 'GIÁO ÁN CĐ TOÁN 12':
        return 'Giáo án & Chuyên đề Khối 12';
      case 'KH CÁ NHÂN':
        return 'Kế hoạch cá nhân giáo viên';
      case 'KHGD NHÀ TRƯỜNG':
        return 'Kế hoạch giáo dục nhà trường';
      case 'KHGD MÔN TOÁN':
        return 'Kế hoạch giáo dục môn Toán';
      case 'NGÂN HÀNG ĐỀ THI':
        return 'Ngân hàng đề thi & Ma trận kiểm tra';
      default:
        return 'Tất cả tài liệu và hồ sơ';
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Header Row of Explorer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#090D16] p-3.5 rounded-xl border border-blue-950/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(2,132,199,0.8)]" />
              {getCategoryTitle()}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-sky-300 border border-blue-800/60 shadow-xs">
              {filteredDocuments.length} tài liệu
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Hệ thống giáo án các khối 10, 11, 12, chuyên đề, hồ sơ cá nhân và ngân hàng đề thi chuẩn CV 5512.
          </p>
        </div>

        {/* Right tools: View switcher & Add/Upload button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          
          {/* Grid / List Switcher */}
          <div className="flex items-center bg-[#05070B] border border-blue-950/80 rounded-lg p-0.5">
            <button
              onClick={() => onFilterChange({ viewMode: 'grid' })}
              title="Chế độ xem lưới"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                filterState.viewMode === 'grid'
                  ? 'bg-[#0284C7]/30 text-sky-400 font-semibold border border-sky-500/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterChange({ viewMode: 'list' })}
              title="Chế độ xem danh sách"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                filterState.viewMode === 'list'
                  ? 'bg-[#0284C7]/30 text-sky-400 font-semibold border border-sky-500/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* + Tải tài liệu lên / Thêm mới */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-semibold shadow-[0_2px_12px_rgba(2,132,199,0.4)] transition-all active:scale-95 cursor-pointer border border-sky-400/30"
            title="Tải tài liệu mới lên trang web (Yêu cầu mật khẩu quản trị)"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Tải tài liệu lên</span>
          </button>

        </div>

      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090D16] border border-blue-950/70 rounded-xl p-2 shadow-xs">
        
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          
          {/* Năm học */}
          <select
            value={filterState.academicYear}
            onChange={(e) => onFilterChange({ academicYear: e.target.value })}
            className="bg-[#05070B] text-slate-300 border border-blue-950/80 hover:border-blue-800/60 rounded-md text-[11px] px-2.5 py-1 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
          >
            <option value="all">Tất cả Năm học</option>
            <option value="2026 - 2027">Năm học 2026 - 2027</option>
            <option value="2025 - 2026">Năm học 2025 - 2026</option>
            <option value="2024 - 2025">Năm học 2024 - 2025</option>
          </select>

          {/* Khối */}
          <select
            value={filterState.grade}
            onChange={(e) => onFilterChange({ grade: e.target.value })}
            className="bg-[#05070B] text-slate-300 border border-blue-950/80 hover:border-blue-800/60 rounded-md text-[11px] px-2.5 py-1 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
          >
            <option value="all">Tất cả Khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>

          {/* Học kỳ */}
          <select
            value={filterState.semester}
            onChange={(e) => onFilterChange({ semester: e.target.value })}
            className="bg-[#05070B] text-slate-300 border border-blue-950/80 hover:border-blue-800/60 rounded-md text-[11px] px-2.5 py-1 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
          >
            <option value="all">Tất cả Học kỳ</option>
            <option value="Cả năm">Cả năm</option>
            <option value="Học kỳ 1">Học kỳ 1</option>
            <option value="Học kỳ 2">Học kỳ 2</option>
          </select>

          {/* Định dạng file */}
          <select
            value={filterState.fileType}
            onChange={(e) => onFilterChange({ fileType: e.target.value })}
            className="bg-[#05070B] text-slate-300 border border-blue-950/80 hover:border-blue-800/60 rounded-md text-[11px] px-2.5 py-1 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
          >
            <option value="all">Định dạng file</option>
            <option value="PDF">PDF (*.pdf)</option>
            <option value="WORD DOCX">Word (*.docx)</option>
            <option value="EXCEL">Excel (*.xlsx)</option>
            <option value="POWERPOINT">PowerPoint (*.pptx)</option>
          </select>

        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-[#05070B] text-slate-300 border border-blue-950/80 hover:border-blue-800/60 rounded-md text-[11px] pl-6 pr-3 py-1 focus:outline-none focus:border-sky-500 cursor-pointer appearance-none transition-colors"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="pinned_first">Đã ghim lên đầu</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="title_asc">Tên (A - Z)</option>
              <option value="title_desc">Tên (Z - A)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-sky-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Main Content View: Grid or List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-[#090D16] border border-blue-950/80 rounded-xl p-10 text-center space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-lg bg-sky-950/40 text-sky-400 flex items-center justify-center mx-auto border border-sky-800/40">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không có hồ sơ nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Bạn có thể xóa bộ lọc hoặc tải tài liệu mới lên.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2.5">
            <button
              onClick={() => onFilterChange({ 
                search: '', 
                academicYear: 'all', 
                grade: 'all', 
                semester: 'all', 
                fileType: 'all',
                selectedCategory: 'all'
              })}
              className="px-3.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-sky-300 text-xs font-medium cursor-pointer border border-blue-800/40 transition-colors"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-medium cursor-pointer transition-colors shadow-[0_2px_10px_rgba(2,132,199,0.4)]"
            >
              + Tải tài liệu lên
            </button>
          </div>
        </div>
      ) : filterState.viewMode === 'grid' ? (
        
        /* Grid Mode (Compact cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isAdmin={isAdmin}
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onDownload={onDownload}
            />
          ))}
        </div>

      ) : (

        /* List / Table Mode */
        <div className="bg-[#090D16] border border-blue-950/80 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05070B] border-b border-blue-950/80 text-sky-300/80 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Ghim</th>
                  <th className="py-2.5 px-3">Tên tài liệu / Kế hoạch</th>
                  <th className="py-2.5 px-3">Danh mục</th>
                  <th className="py-2.5 px-3">Định dạng</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Ngày cập nhật</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/40">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-950/30 transition-colors">
                    <td className="py-2 px-3 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => onTogglePin(doc.id)}
                          className="cursor-pointer"
                          title={doc.isPinned ? 'Bỏ ghim' : 'Ghim tài liệu'}
                        >
                          {doc.isPinned ? (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mx-auto" />
                          ) : (
                            <Star className="w-3.5 h-3.5 text-slate-600 hover:text-amber-400 mx-auto transition-colors" />
                          )}
                        </button>
                      ) : (
                        doc.isPinned && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mx-auto" title="Đã ghim" />
                        )
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div 
                        onClick={() => onPreview(doc)}
                        className="font-semibold text-slate-200 hover:text-sky-300 cursor-pointer flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="line-clamp-1">{doc.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {doc.description || `${doc.author} • ${doc.school}`}
                      </p>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-950/60 text-sky-300 border border-blue-900/40">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        doc.fileType === 'PDF' 
                          ? 'bg-red-950/80 text-red-400 border border-red-800/40' 
                          : doc.fileType === 'WORD DOCX'
                          ? 'bg-blue-900/80 text-sky-200 border border-sky-700/40'
                          : doc.fileType === 'EXCEL'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                      }`}>
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-mono text-[10px]">
                      <div>{doc.academicYear}</div>
                      <div className="text-[9px] text-slate-500">{doc.semester}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                      {doc.updatedAt}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPreview(doc)}
                          title="Xem trước tài liệu"
                          className="p-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownload(doc)}
                          title="Tải xuống"
                          className="p-1 rounded hover:bg-blue-950/60 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(doc)}
                          title="Chỉnh sửa"
                          className="p-1 rounded hover:bg-blue-950/60 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(doc.id)}
                          title="Xóa"
                          className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
