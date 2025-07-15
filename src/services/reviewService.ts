
import { db } from '@/lib/firebase';
import type { Review } from '@/lib/types';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

const reviewsCollectionRef = collection(db, 'reviews');

// Get all reviews for a specific product
export const getReviewsForProduct = async (productId: string): Promise<Review[]> => {
  const q = query(
    reviewsCollectionRef,
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Review[];
};

// Get all reviews
export const getAllReviews = async (): Promise<Review[]> => {
    const q = query(reviewsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Review[];
}

// Add a new review for a product
export const addReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt'>
) => {
  return await addDoc(reviewsCollectionRef, {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
};
