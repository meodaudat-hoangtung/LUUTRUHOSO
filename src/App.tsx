import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { 
  DocumentItem, 
  FilterState, 
  TeacherProfile, 
  ToastMessage 
} from './types';
import { initialTeacherProfile, DEFAULT_ADMIN_PASSWORD } from './data/initialData';
import { downloadRealDocument, deleteOriginalFile } from './utils/fileStorage';
import { 
  subscribeToDocuments, 
  subscribeToProfile, 
  subscribeToSettings, 
  saveDocumentToFirestore, 
  deleteDocumentFromFirestore, 
  togglePinInFirestore, 
  saveProfileToFirestore, 
  saveAdminPasswordToFirestore 
} from './lib/firestoreService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProfileHeroCard } from './components/ProfileHeroCard';
import { DocumentExplorer } from './components/DocumentExplorer';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DocumentFormModal } from './components/DocumentFormModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Cv5512GeneratorModal } from './components/Cv5512GeneratorModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  // Cloud Firestore-synced teacher profile state
  const [profile, setProfile] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem('teacher_profile');
      return saved ? JSON.parse(saved) : initialTeacherProfile;
    } catch {
      return initialTeacherProfile;
    }
  });

  // Cloud Firestore-synced documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('teacher_documents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cloud Firestore-synced admin password
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('teacher_admin_password');
      if (saved && saved !== 'Tunganh7787') {
        return saved;
      }
      return DEFAULT_ADMIN_PASSWORD;
    } catch {
      return DEFAULT_ADMIN_PASSWORD;
    }
  });

  // Admin authentication state (Session-based, protects data from unauthorized modifications)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('is_teacher_admin') === 'true';
    } catch {
      return false;
    }
  });

  // Filter and view state
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    academicYear: 'all',
    grade: 'all',
    semester: 'all',
    fileType: 'all',
    sortBy: 'newest',
    selectedCategory: 'all',
    viewMode: 'grid'
  });

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<'upload' | 'general' | 'edit' | 'delete' | 'profile'>('general');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [cv5512ModalOpen, setCv5512ModalOpen] = useState(false);
  
  // Confirm Delete Dialog state
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 1. Real-time Firestore synchronizer across ALL browsers, devices and tabs
  useEffect(() => {
    // Realtime documents listener
    const unsubDocs = subscribeToDocuments((cloudDocs) => {
      setDocuments(cloudDocs);
      try {
        localStorage.setItem('teacher_documents', JSON.stringify(cloudDocs));
      } catch (e) {
        console.error(e);
      }
    });

    // Realtime profile listener
    const unsubProfile = subscribeToProfile((cloudProfile) => {
      setProfile(cloudProfile);
      try {
        localStorage.setItem('teacher_profile', JSON.stringify(cloudProfile));
      } catch (e) {
        console.error(e);
      }
    });

    // Realtime password & settings listener
    const unsubSettings = subscribeToSettings((cloudPassword) => {
      setAdminPassword(cloudPassword);
      try {
        localStorage.setItem('teacher_admin_password', cloudPassword);
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      unsubDocs();
      unsubProfile();
      unsubSettings();
    };
  }, []);

  // Handle filter updates
  const handleUpdateFilter = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  // Authentication Handlers
  const handleOpenLogin = (
    reason: 'upload' | 'general' | 'edit' | 'delete' | 'profile' = 'general',
    actionAfterLogin?: () => void
  ) => {
    setLoginReason(reason);
    if (actionAfterLogin) {
      setPendingAction(() => actionAfterLogin);
    } else {
      setPendingAction(null);
    }
    setAdminLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      sessionStorage.setItem('is_teacher_admin', 'true');
    } catch (e) {
      console.error(e);
    }
    showToast('Xác thực quản trị viên thành công! Bạn có toàn quyền tải tài liệu và quản trị.');
    
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        action();
      }, 100);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('is_teacher_admin');
    } catch (e) {
      console.error(e);
    }
    showToast('Đã đăng xuất quyền quản trị. Trang web đang ở chế độ xem an toàn.', 'info');
  };

  const handleChangePassword = async (newPass: string) => {
    setAdminPassword(newPass);
    try {
      localStorage.setItem('teacher_admin_password', newPass);
      await saveAdminPasswordToFirestore(newPass);
      showToast('Đổi mật khẩu quản trị thành công! Đã đồng bộ lên cơ sở dữ liệu.');
    } catch (e) {
      console.error(e);
      showToast('Đã đổi mật khẩu cục bộ.');
    }
  };

  // Document Operations (Real-time Cloud Firestore)
  const handleTogglePin = async (id: string) => {
    if (!isAdmin) {
      handleOpenLogin('general', () => handleTogglePin(id));
      return;
    }
    const target = documents.find((d) => d.id === id);
    if (!target) return;
    const nextState = !target.isPinned;
    
    // Optimistic UI update
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isPinned: nextState } : doc))
    );

    try {
      await togglePinInFirestore(id, nextState);
      showToast(nextState ? 'Đã ghim tài liệu quan trọng lên đầu!' : 'Đã bỏ ghim tài liệu.', 'info');
    } catch (err) {
      console.error('Error toggling pin in Firestore:', err);
    }
  };

  // Trigger Delete flow (prompts login if not admin, then opens clean in-app confirm dialog)
  const handleDeleteDoc = (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (!target) return;

    if (!isAdmin) {
      handleOpenLogin('delete', () => {
        setDocToDelete(target);
        setConfirmDeleteOpen(true);
      });
      return;
    }

    setDocToDelete(target);
    setConfirmDeleteOpen(true);
  };

  // Confirm and execute document deletion
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    const target = docToDelete;
    setIsDeletingDoc(true);

    try {
      // Optimistic UI update
      setDocuments((prev) => prev.filter((d) => d.id !== target.id));
      
      // If currently previewing the deleted document, close preview
      if (previewDoc && previewDoc.id === target.id) {
        setPreviewDoc(null);
      }

      // Delete from cloud Firestore
      await deleteDocumentFromFirestore(target.id);
      // Delete from IndexedDB binary cache
      await deleteOriginalFile(target.id);

      showToast(`Đã xóa vĩnh viễn "${target.title}" thành công trên mọi thiết bị.`, 'warning');
    } catch (err) {
      console.error('Error deleting document from Firestore:', err);
      showToast('Đã xóa tài liệu khỏi bộ nhớ.', 'warning');
    } finally {
      setIsDeletingDoc(false);
      setConfirmDeleteOpen(false);
      setDocToDelete(null);
    }
  };

  const handleSaveDoc = async (doc: DocumentItem) => {
    const exists = documents.some((d) => d.id === doc.id);
    
    // Optimistic UI update
    if (exists) {
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    } else {
      setDocuments((prev) => [doc, ...prev]);
    }

    try {
      await saveDocumentToFirestore(doc);
      if (exists) {
        showToast(`Đã cập nhật "${doc.title}" và đồng bộ lên đám mây thành công!`);
      } else {
        showToast(`Đã tải lên và đồng bộ "${doc.title}" trên tất cả các trình duyệt!`);
      }
    } catch (err) {
      console.error('Error saving document to Firestore:', err);
      showToast(`Đã lưu "${doc.title}" vào bộ nhớ.`);
    }
  };

  const handleSaveProfile = async (updatedProfile: TeacherProfile) => {
    setProfile(updatedProfile);
    try {
      await saveProfileToFirestore(updatedProfile);
      showToast('Đã cập nhật hồ sơ giáo viên và đồng bộ trên mọi thiết bị!');
    } catch (err) {
      console.error('Error saving profile to Firestore:', err);
      showToast('Đã cập nhật hồ sơ giáo viên!');
    }
  };

  const handleUpdateAvatarDirectly = async (avatarDataUrl: string) => {
    if (!isAdmin) {
      handleOpenLogin('profile');
      return;
    }
    const updated = { ...profile, avatarUrl: avatarDataUrl };
    setProfile(updated);
    try {
      await saveProfileToFirestore(updated);
      showToast('Đã cập nhật ảnh đại diện mới và đồng bộ trên mọi thiết bị!');
    } catch (err) {
      console.error('Error saving avatar to Firestore:', err);
      showToast('Đã cập nhật ảnh đại diện mới!');
    }
  };

  const handleDownloadDoc = (doc: DocumentItem) => {
    downloadRealDocument(doc);
    showToast(`Đang tải xuống tệp ${doc.title}...`, 'info');
  };

  // Filter and Search logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search term
      if (filterState.search.trim() !== '') {
        const query = filterState.search.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(query);
        const matchCategory = doc.category.toLowerCase().includes(query);
        const matchSubject = doc.subject?.toLowerCase().includes(query) || false;
        const matchDesc = doc.description?.toLowerCase().includes(query) || false;
        const matchContent = doc.contentPreview?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchCategory && !matchSubject && !matchDesc && !matchContent) {
          return false;
        }
      }

      // Academic Year match
      if (filterState.academicYear !== 'all' && doc.academicYear !== filterState.academicYear) {
        return false;
      }

      // Grade match
      if (filterState.grade !== 'all' && doc.grade !== 'all' && doc.grade !== filterState.grade) {
        return false;
      }

      // Semester match
      if (filterState.semester !== 'all' && doc.semester !== filterState.semester) {
        return false;
      }

      // File type match
      if (filterState.fileType !== 'all' && doc.fileType !== filterState.fileType) {
        return false;
      }

      // Sidebar category selection match
      if (filterState.selectedCategory === 'pinned') {
        return doc.isPinned;
      } else if (filterState.selectedCategory === 'grade_10_all') {
        return doc.grade === '10' || doc.category.includes('10');
      } else if (filterState.selectedCategory === 'grade_11_all') {
        return doc.grade === '11' || doc.category.includes('11');
      } else if (filterState.selectedCategory === 'grade_12_all') {
        return doc.grade === '12' || doc.category.includes('12');
      } else if (filterState.selectedCategory !== 'all') {
        return doc.category === filterState.selectedCategory;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'pinned_first') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (filterState.sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (filterState.sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (filterState.sortBy === 'title_asc') {
        return a.title.localeCompare(b.title, 'vi');
      }
      if (filterState.sortBy === 'title_desc') {
        return b.title.localeCompare(a.title, 'vi');
      }
      return 0;
    });
  }, [documents, filterState]);

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-300 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        profile={profile}
        searchTerm={filterState.search}
        onSearchChange={(search) => handleUpdateFilter({ search })}
        isAdmin={isAdmin}
        onOpenLoginModal={(reason) => handleOpenLogin(reason || 'general')}
        onLogout={handleLogout}
        onOpenAddModal={() => {
          if (isAdmin) {
            setEditingDoc(null);
            setFormModalOpen(true);
          } else {
            handleOpenLogin('upload', () => {
              setEditingDoc(null);
              setFormModalOpen(true);
            });
          }
        }}
        onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
        onOpenProfileModal={() => {
          if (isAdmin) {
            setProfileModalOpen(true);
          } else {
            handleOpenLogin('profile', () => setProfileModalOpen(true));
          }
        }}
        onOpenCv5512Generator={() => {
          if (isAdmin) {
            setCv5512ModalOpen(true);
          } else {
            handleOpenLogin('upload', () => setCv5512ModalOpen(true));
          }
        }}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          documents={documents}
          selectedCategory={filterState.selectedCategory}
          onSelectCategory={(cat) => handleUpdateFilter({ selectedCategory: cat })}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Main Content */}
        <main className="flex-1 p-3.5 lg:p-5 overflow-x-hidden space-y-4">
          
          {/* Mobile Sidebar Toggle Button */}
          <div className="lg:hidden flex items-center justify-between bg-[#0B101D] border border-blue-950/80 p-2 rounded-lg">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-200 px-3 py-1.5 rounded-md bg-blue-950/70 hover:bg-blue-900/80 cursor-pointer border border-blue-800/60"
            >
              <Menu className="w-3.5 h-3.5 text-sky-400" />
              <span>Mở danh mục hồ sơ</span>
            </button>
            <span className="text-xs text-sky-300 font-mono">
              {profile.school}
            </span>
          </div>

          {/* Teacher Profile Hero Card (Flat 2D with golden border) */}
          <ProfileHeroCard
            profile={profile}
            isAdmin={isAdmin}
            onEditProfile={() => {
              if (isAdmin) {
                setProfileModalOpen(true);
              } else {
                handleOpenLogin('profile', () => setProfileModalOpen(true));
              }
            }}
            onUpdateAvatar={handleUpdateAvatarDirectly}
          />

          {/* Documents Explorer (Filters, Grid/List views, Cards) */}
          <DocumentExplorer
            documents={documents}
            filteredDocuments={filteredDocuments}
            filterState={filterState}
            onFilterChange={handleUpdateFilter}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              if (isAdmin) {
                setEditingDoc(null);
                setFormModalOpen(true);
              } else {
                handleOpenLogin('upload', () => {
                  setEditingDoc(null);
                  setFormModalOpen(true);
                });
              }
            }}
            onPreview={(doc) => setPreviewDoc(doc)}
            onEdit={(doc) => {
              if (isAdmin) {
                setEditingDoc(doc);
                setFormModalOpen(true);
              } else {
                handleOpenLogin('edit', () => {
                  setEditingDoc(doc);
                  setFormModalOpen(true);
                });
              }
            }}
            onDelete={handleDeleteDoc}
            onTogglePin={handleTogglePin}
            onDownload={handleDownloadDoc}
          />

        </main>

      </div>

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onTogglePin={handleTogglePin}
        onDownload={handleDownloadDoc}
        onDelete={handleDeleteDoc}
        onEdit={(doc) => {
          if (isAdmin) {
            setPreviewDoc(null);
            setEditingDoc(doc);
            setFormModalOpen(true);
          } else {
            handleOpenLogin('edit', () => {
              setPreviewDoc(null);
              setEditingDoc(doc);
              setFormModalOpen(true);
            });
          }
        }}
      />

      <DocumentFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingDoc(null);
        }}
        onSave={handleSaveDoc}
        initialDoc={editingDoc}
        profile={profile}
      />

      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        currentPassword={adminPassword}
        onChangePassword={handleChangePassword}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => {
          setAdminLoginModalOpen(false);
          setPendingAction(null);
        }}
        adminPassword={adminPassword}
        onLoginSuccess={handleLoginSuccess}
        reason={loginReason}
      />

      <Cv5512GeneratorModal
        isOpen={cv5512ModalOpen}
        onClose={() => setCv5512ModalOpen(false)}
        onSaveToPortfolio={handleSaveDoc}
        profile={profile}
      />

      {/* Confirmation Modal for Document Deletion */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        document={docToDelete}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setDocToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingDoc}
      />

      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

    </div>
  );
}
