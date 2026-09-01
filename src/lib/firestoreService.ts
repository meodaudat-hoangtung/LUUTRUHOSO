import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc, 
  onSnapshot, 
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { DocumentItem, TeacherProfile } from '../types';
import { initialDocuments, initialTeacherProfile, DEFAULT_ADMIN_PASSWORD } from '../data/initialData';

// Helper to remove undefined fields because Firestore does not allow undefined values
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

// Convert Uint8Array to base64 safely without callstack overflow
export function uint8ArrayToBase64(uint8: Uint8Array): string {
  let binary = '';
  const len = uint8.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = uint8.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return window.btoa(binary);
}

// Convert base64 back to Uint8Array safely
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Base64 chunk character length: 450,000 characters ~ 330KB binary per chunk
const BASE64_CHUNK_SIZE = 450000;

/**
 * Save binary file chunks to Firestore for cross-device synchronization
 */
export async function saveFileChunksToFirestore(
  docId: string, 
  fileMeta: { fileName: string; mimeType: string; fileSize: string; uint8Array: Uint8Array }
): Promise<void> {
  try {
    const base64Data = uint8ArrayToBase64(fileMeta.uint8Array);
    const totalLength = base64Data.length;
    const totalChunks = Math.ceil(totalLength / BASE64_CHUNK_SIZE) || 1;

    // Delete any old chunks first if there were more chunks previously
    await deleteFileChunksFromFirestore(docId);

    const chunksColRef = collection(db, 'documents', docId, 'file_chunks');
    const batch = writeBatch(db);

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = base64Data.substring(i * BASE64_CHUNK_SIZE, (i + 1) * BASE64_CHUNK_SIZE);
      const chunkDocRef = doc(chunksColRef, `chunk_${i}`);
      batch.set(chunkDocRef, {
        chunkIndex: i,
        totalChunks,
        data: chunkData,
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
        fileSize: fileMeta.fileSize,
        updatedAt: new Date().toISOString()
      });
    }

    // Update main document flag
    const mainDocRef = doc(db, 'documents', docId);
    batch.update(mainDocRef, {
      hasCloudFile: true,
      hasOriginalFile: true,
      originalFileName: fileMeta.fileName,
      fileMimeType: fileMeta.mimeType,
      fileSize: fileMeta.fileSize,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  } catch (err) {
    console.error('Error saving file chunks to Firestore:', err);
    throw err;
  }
}

/**
 * Retrieve binary file chunks from Firestore and reconstruct original Uint8Array / Blob
 */
export async function getFileChunksFromFirestore(docId: string): Promise<{
  fileName: string;
  mimeType: string;
  fileSize: string;
  uint8Array: Uint8Array;
  blob: Blob;
  arrayBuffer: ArrayBuffer;
} | null> {
  try {
    const chunksColRef = collection(db, 'documents', docId, 'file_chunks');
    const snapshot = await getDocs(chunksColRef);
    if (snapshot.empty) {
      return null;
    }

    const chunkDocs: { chunkIndex: number; totalChunks: number; data: string; fileName?: string; mimeType?: string; fileSize?: string }[] = [];
    snapshot.forEach((snap) => {
      chunkDocs.push(snap.data() as any);
    });

    // Sort chunks by index 0, 1, 2...
    chunkDocs.sort((a, b) => a.chunkIndex - b.chunkIndex);

    let fullBase64 = '';
    for (const chunk of chunkDocs) {
      fullBase64 += chunk.data;
    }

    const firstChunk = chunkDocs[0];
    const mimeType = firstChunk.mimeType || 'application/pdf';
    const fileName = firstChunk.fileName || 'document.pdf';
    const fileSize = firstChunk.fileSize || '';

    const uint8Array = base64ToUint8Array(fullBase64);
    const blob = new Blob([uint8Array], { type: mimeType });
    const arrayBuffer = uint8Array.buffer.slice(0);

    return {
      fileName,
      mimeType,
      fileSize,
      uint8Array,
      blob,
      arrayBuffer
    };
  } catch (err) {
    console.error('Error getting file chunks from Firestore:', err);
    return null;
  }
}

/**
 * Delete all file chunks for a document from Firestore
 */
export async function deleteFileChunksFromFirestore(docId: string): Promise<void> {
  try {
    const chunksColRef = collection(db, 'documents', docId, 'file_chunks');
    const snapshot = await getDocs(chunksColRef);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.forEach((snap) => {
      batch.delete(snap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Error deleting file chunks from Firestore:', err);
  }
}

/**
 * Real-time subscription to documents collection across all devices & browsers.
 * If this is a brand-new cloud database initialization, seeds initial documents once.
 * If documents were previously deleted by user, maintains empty state permanently.
 */
export function subscribeToDocuments(onData: (docs: DocumentItem[]) => void, onError?: (err: any) => void) {
  const docsColRef = collection(db, 'documents');
  const settingsDocRef = doc(db, 'settings', 'app_init');

  const unsubscribe = onSnapshot(
    docsColRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const settingsSnap = await getDoc(settingsDocRef);
          const isInitialized = settingsSnap.exists() && settingsSnap.data()?.isInitialized === true;

          // Only seed if cloud database was NEVER initialized before
          if (!isInitialized) {
            console.log('Seeding initial documents to cloud Firestore...');
            const batch = writeBatch(db);
            
            // Mark as initialized first
            batch.set(settingsDocRef, {
              isInitialized: true,
              adminPassword: DEFAULT_ADMIN_PASSWORD,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });

            // Add default initial documents
            for (const item of initialDocuments) {
              const docRef = doc(db, 'documents', item.id);
              batch.set(docRef, sanitizeForFirestore(item));
            }

            await batch.commit();
            // Snapshot will automatically fire again with seeded data
            return;
          } else {
            // Already initialized in the past, user deliberately has 0 documents
            onData([]);
            return;
          }
        } catch (err) {
          console.error('Error checking initialization in Firestore:', err);
          onData([]);
          return;
        }
      }

      const items: DocumentItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || 'Tài liệu không tên',
          category: data.category || 'HỒ SƠ KHÁC',
          grade: data.grade || 'all',
          semester: data.semester || 'Cả năm',
          academicYear: data.academicYear || '2026 - 2027',
          fileType: data.fileType || 'PDF',
          fileSize: data.fileSize || '1.0 MB',
          isPinned: Boolean(data.isPinned),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          description: data.description || '',
          author: data.author || 'Hoàng Tùng',
          school: data.school || 'THPT Tĩnh Gia 4',
          contentPreview: data.contentPreview || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          downloadUrl: data.downloadUrl || '',
          originalFileName: data.originalFileName || '',
          fileDataUrl: data.fileDataUrl || '',
          fileMimeType: data.fileMimeType || '',
          hasOriginalFile: Boolean(data.hasOriginalFile),
          hasCloudFile: Boolean(data.hasCloudFile),
          externalLink: data.externalLink || ''
        } as DocumentItem);
      });

      onData(items);
    },
    (err) => {
      console.error('Firestore onSnapshot error for documents:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to teacher profile.
 */
export function subscribeToProfile(onData: (profile: TeacherProfile) => void) {
  const profileDocRef = doc(db, 'profile', 'main');

  const unsubscribe = onSnapshot(profileDocRef, async (docSnap) => {
    if (!docSnap.exists()) {
      try {
        await setDoc(profileDocRef, sanitizeForFirestore(initialTeacherProfile));
        onData(initialTeacherProfile);
      } catch (err) {
        console.error('Error setting initial profile in Firestore:', err);
        onData(initialTeacherProfile);
      }
    } else {
      const data = docSnap.data();
      onData({
        name: data.name || initialTeacherProfile.name,
        role: data.role || initialTeacherProfile.role,
        subject: data.subject || initialTeacherProfile.subject,
        school: data.school || initialTeacherProfile.school,
        academicYear: data.academicYear || initialTeacherProfile.academicYear,
        quote: data.quote !== undefined ? data.quote : initialTeacherProfile.quote,
        email: data.email || initialTeacherProfile.email,
        phone: data.phone || initialTeacherProfile.phone,
        avatarUrl: data.avatarUrl || initialTeacherProfile.avatarUrl,
        adminTitle: data.adminTitle || initialTeacherProfile.adminTitle,
        showAvatar: data.showAvatar !== undefined ? Boolean(data.showAvatar) : true,
        showRole: data.showRole !== undefined ? Boolean(data.showRole) : true,
        showSubject: data.showSubject !== undefined ? Boolean(data.showSubject) : true,
        showSchool: data.showSchool !== undefined ? Boolean(data.showSchool) : true,
        showAcademicYear: data.showAcademicYear !== undefined ? Boolean(data.showAcademicYear) : true,
        showQuote: data.showQuote !== undefined ? Boolean(data.showQuote) : true,
        showEmail: data.showEmail !== undefined ? Boolean(data.showEmail) : true,
        showPhone: data.showPhone !== undefined ? Boolean(data.showPhone) : true
      });
    }
  }, (err) => {
    console.error('Firestore onSnapshot error for profile:', err);
  });

  return unsubscribe;
}

/**
 * Real-time subscription to app settings (Admin password, etc.).
 */
export function subscribeToSettings(onPasswordChange: (password: string) => void) {
  const settingsDocRef = doc(db, 'settings', 'app_init');

  const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.adminPassword) {
        onPasswordChange(data.adminPassword);
      }
    }
  }, (err) => {
    console.error('Firestore onSnapshot error for settings:', err);
  });

  return unsubscribe;
}

/**
 * Save or update document in Firestore.
 */
export async function saveDocumentToFirestore(document: DocumentItem): Promise<void> {
  const docRef = doc(db, 'documents', document.id);
  const data = sanitizeForFirestore({
    ...document,
    updatedAt: new Date().toISOString()
  });
  await setDoc(docRef, data, { merge: true });
}

/**
 * Delete document permanently from Firestore.
 */
export async function deleteDocumentFromFirestore(id: string): Promise<void> {
  // Delete file chunks subcollection first
  await deleteFileChunksFromFirestore(id);
  const docRef = doc(db, 'documents', id);
  await deleteDoc(docRef);
}

/**
 * Toggle pin status in Firestore.
 */
export async function togglePinInFirestore(id: string, isPinned: boolean): Promise<void> {
  const docRef = doc(db, 'documents', id);
  await updateDoc(docRef, { isPinned, updatedAt: new Date().toISOString() });
}

/**
 * Save teacher profile in Firestore.
 */
export async function saveProfileToFirestore(profile: TeacherProfile): Promise<void> {
  const profileDocRef = doc(db, 'profile', 'main');
  await setDoc(profileDocRef, sanitizeForFirestore({
    ...profile,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

/**
 * Save admin password in Firestore.
 */
export async function saveAdminPasswordToFirestore(newPassword: string): Promise<void> {
  const settingsDocRef = doc(db, 'settings', 'app_init');
  await setDoc(settingsDocRef, {
    isInitialized: true,
    adminPassword: newPassword,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
