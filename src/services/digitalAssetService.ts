
import { db } from '@/lib/firebase';
import type { DigitalAsset } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

const assetsCollectionRef = collection(db, 'digital_assets');

// Get all digital assets, optionally filtered by product
export const getDigitalAssets = async (productId?: string): Promise<DigitalAsset[]> => {
  let q = query(assetsCollectionRef, orderBy('createdAt', 'desc'));
  if (productId) {
    q = query(assetsCollectionRef, where('productId', '==', productId), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as DigitalAsset[];
};

// Get a single asset by ID
export const getDigitalAssetById = async (id: string): Promise<DigitalAsset | null> => {
    const docRef = doc(db, 'digital_assets', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DigitalAsset;
    }
    return null;
}

// Add a new digital asset
export const addDigitalAsset = async (assetData: Omit<DigitalAsset, 'id' | 'createdAt' | 'status'>) => {
  return await addDoc(assetsCollectionRef, {
    ...assetData,
    status: 'available',
    createdAt: serverTimestamp(),
  });
};

// Update an existing digital asset
export const updateDigitalAsset = async (id: string, assetData: Partial<Omit<DigitalAsset, 'id' | 'createdAt'>>) => {
  const assetDoc = doc(db, 'digital_assets', id);
  return await updateDoc(assetDoc, {
    ...assetData,
    updatedAt: serverTimestamp(),
  });
};

// Delete a digital asset
export const deleteDigitalAsset = async (id: string) => {
  const assetDoc = doc(db, 'digital_assets', id);
  return await deleteDoc(assetDoc);
};

    