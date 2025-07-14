import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

const productsCollectionRef = collection(db, 'products');

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
};

// Add a new product
export const addProduct = async (productData: Omit<Product, 'id'>) => {
  return await addDoc(productsCollectionRef, {
    ...productData,
    createdAt: serverTimestamp(),
  });
};

// Update an existing product
export const updateProduct = async (id: string, productData: Omit<Product, 'id'>) => {
  const productDoc = doc(db, 'products', id);
  return await updateDoc(productDoc, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};
