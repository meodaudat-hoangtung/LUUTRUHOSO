export type FileFormat = 'PDF' | 'WORD DOCX' | 'EXCEL' | 'POWERPOINT';

export type Semester = 'Cả năm' | 'Học kỳ 1' | 'Học kỳ 2';

export type Grade = 'all' | '10' | '11' | '12';

export type DocumentCategory =
  | 'KH CÁ NHÂN'
  | 'KHGD NHÀ TRƯỜNG'
  | 'KHGD MÔN TOÁN'
  | 'GIÁO ÁN TOÁN 10'
  | 'GIÁO ÁN CĐ TOÁN 10'
  | 'GIÁO ÁN TOÁN 11'
  | 'GIÁO ÁN CĐ TOÁN 11'
  | 'GIÁO ÁN TOÁN 12'
  | 'GIÁO ÁN CĐ TOÁN 12'
  | 'NGÂN HÀNG ĐỀ THI'
  | 'SỔ CHỦ NHIỆM'
  | 'HỒ SƠ KHÁC';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  grade: Grade;
  semester: Semester;
  academicYear: string;
  fileType: FileFormat;
  fileSize?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  author: string;
  school: string;
  contentPreview?: string;
  tags?: string[];
  downloadUrl?: string;
  originalFileName?: string;
  fileDataUrl?: string;
  fileMimeType?: string;
  hasOriginalFile?: boolean;
}

export interface TeacherProfile {
  name: string;
  role: string;
  subject: string;
  school: string;
  academicYear: string;
  quote: string;
  email: string;
  phone: string;
  avatarUrl: string;
  adminTitle: string;
}

export interface FilterState {
  search: string;
  academicYear: string;
  grade: string;
  semester: string;
  fileType: string;
  sortBy: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'pinned_first';
  selectedCategory: string; // 'all' | 'pinned' | 'grade_10' | 'grade_11' | 'grade_12' | specific category name
  viewMode: 'grid' | 'list';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
