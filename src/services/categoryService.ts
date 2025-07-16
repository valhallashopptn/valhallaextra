
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
  getDoc,
} from 'firebase/firestore';

const categoriesCollectionRef = collection(db, 'categories');

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const q = query(categoriesCollectionRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Category[];
};

// Get a single category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
    const categoryDocRef = doc(db, 'categories', id);
    const docSnap = await getDoc(categoryDocRef);

    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Category;
    } else {
        console.warn(`No category found with id: ${id}`);
        return null;
    }
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
