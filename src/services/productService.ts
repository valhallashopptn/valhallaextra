
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
  orderBy,
  getDoc
} from 'firebase/firestore';

const productsCollectionRef = collection(db, 'products');

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
    const productDocRef = doc(db, 'products', id);
    const docSnap = await getDoc(productDocRef);

    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Product;
    } else {
        console.warn(`No product found with id: ${id}`);
        return null;
    }
}

// Add a new product
export const addProduct = async (productData: Omit<Product, 'id' | 'category'>) => {
  return await addDoc(productsCollectionRef, {
    ...productData,
    createdAt: serverTimestamp(),
  });
};

// Update an existing product
export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'category'>>) => {
  const productDoc = doc(db, 'products', id);
  return await updateDoc(productDoc, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};
