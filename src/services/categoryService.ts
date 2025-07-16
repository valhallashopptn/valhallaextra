import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const categoriesCollectionRef = collection(db, 'categories');

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const q = query(categoriesCollectionRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Category[];
};

// Add a new category
export const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
  return await addDoc(categoriesCollectionRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
  });
};

// Update an existing category
export const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
  const categoryDoc = doc(db, 'categories', id);
  return await updateDoc(categoryDoc, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  });
};
