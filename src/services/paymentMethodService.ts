
import { db } from '@/lib/firebase';
import type { PaymentMethod } from '@/lib/types';
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

const paymentMethodsCollectionRef = collection(db, 'paymentMethods');

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const q = query(paymentMethodsCollectionRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PaymentMethod[];
};

export const addPaymentMethod = async (data: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
  return await addDoc(paymentMethodsCollectionRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updatePaymentMethod = async (id: string, data: Partial<Omit<PaymentMethod, 'id' | 'createdAt'>>) => {
  const methodDoc = doc(db, 'paymentMethods', id);
  return await updateDoc(methodDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
