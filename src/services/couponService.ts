
import { db } from '@/lib/firebase';
import type { Coupon } from '@/lib/types';
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
  deleteDoc,
  where
} from 'firebase/firestore';

const couponsCollectionRef = collection(db, 'coupons');

export const getCoupons = async (): Promise<Coupon[]> => {
  const q = query(couponsCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Coupon[];
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
    const q = query(couponsCollectionRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const couponDoc = snapshot.docs[0];
    return { ...couponDoc.data(), id: couponDoc.id } as Coupon;
}

export const addCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedBy'>) => {
  return await addDoc(couponsCollectionRef, {
    ...couponData,
    usedBy: [],
    createdAt: serverTimestamp(),
  });
};

export const updateCoupon = async (id: string, couponData: Partial<Omit<Coupon, 'id' | 'createdAt'>>) => {
  const couponDoc = doc(db, 'coupons', id);
  return await updateDoc(couponDoc, {
    ...couponData,
  });
};

export const deleteCoupon = async (id: string) => {
  const couponDoc = doc(db, 'coupons', id);
  return await deleteDoc(couponDoc);
};
