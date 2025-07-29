
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const avatarsCollectionRef = collection(db, 'avatars');

// Get all avatar URLs
export const getAvatarList = async (): Promise<string[]> => {
  const snapshot = await getDocs(query(avatarsCollectionRef, orderBy('createdAt', 'asc')));
  if (snapshot.empty) {
    // If no avatars are in the database, return a default list to ensure sign-up doesn't fail.
    // This also populates the system for the first time.
    const defaultAvatars = [
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F01.png?alt=media&token=c23d9a94-c241-42b7-a870-7613a4563456',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F02.png?alt=media&token=737b8449-c1e1-409e-a89a-9e196428d022',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F03.png?alt=media&token=6f5e7c23-45f8-410u-a5a5-120536d29fee',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F04.png?alt=media&token=603b9b4a-a3a8-4447-b716-16e6d7a46e9b',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F05.png?alt=media&token=40422d8b-6f17-4522-92e1-85b2c7e9c7f7',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F06.png?alt=media&token=b7367c3d-3b7c-4a3a-96e2-b0a395c5a044',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F07.png?alt=media&token=26d1d2b8-9f1e-4c57-b242-2b62058b29c2',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F08.png?alt=media&token=26a9787e-3944-4113-9118-2e02f2323e2b',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F09.png?alt=media&token=6a12b3a1-7e8c-4f5c-8a2e-4b7d159a2f2a',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F10.png?alt=media&token=b1e7b1a2-8f9c-4d5e-9e8c-8f9c8d5e9e8c',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F11.png?alt=media&token=8d0d5b4a-8c1b-4b2a-8c1b-8d0d5b4a8c1b',
        'https://firebasestorage.googleapis.com/v0/b/digital-product-marketplace-b6748.appspot.com/o/avatars%2F12.png?alt=media&token=4a4b4c4d-4e4f-4g4h-4i4j-4k4l4m4n4o4p',
    ];
    // Add these defaults to the database for future use
    for (const url of defaultAvatars) {
        await addAvatar(url);
    }
    return defaultAvatars;
  }
  return snapshot.docs.map(doc => doc.data().url);
};

// Get all avatar URLs with their document IDs for admin management
export const getAvatarListWithIds = async (): Promise<{ id: string, url: string }[]> => {
  const snapshot = await getDocs(query(avatarsCollectionRef, orderBy('createdAt', 'asc')));
  return snapshot.docs.map(doc => ({ id: doc.id, url: doc.data().url }));
};

// Add a new avatar URL
export const addAvatar = async (url: string) => {
  return await addDoc(avatarsCollectionRef, {
    url,
    createdAt: serverTimestamp(),
  });
};

// Delete an avatar by its document ID
export const deleteAvatar = async (id: string) => {
  const avatarDoc = doc(db, 'avatars', id);
  return await deleteDoc(avatarDoc);
};
