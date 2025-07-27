
import { db } from '@/lib/firebase';
import type { Review, UserProfile } from '@/lib/types';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { getUserProfile } from './walletService';

const reviewsCollectionRef = collection(db, 'reviews');
const productsCollectionRef = collection(db, 'products');

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

// Add a new review for a product and update the product's average rating
export const addReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'username' | 'userEmail'>
) => {
  const userProfile = await getUserProfile(reviewData.userId);
  if (!userProfile) {
      throw new Error("User profile not found. Cannot add review.");
  }
  const fullReviewData = {
    ...reviewData,
    username: userProfile.username,
    userEmail: userProfile.email,
  }

  const productDocRef = doc(productsCollectionRef, reviewData.productId);

  await runTransaction(db, async (transaction) => {
    // 1. READ all necessary documents first.
    const productDoc = await transaction.get(productDocRef);
    if (!productDoc.exists()) {
      throw new Error("Product not found to update rating.");
    }
    
    // Read existing reviews for the product within the transaction
    const reviewsQuery = query(reviewsCollectionRef, where('productId', '==', reviewData.productId));
    const reviewsSnapshot = await getDocs(reviewsQuery); // This is a normal getDocs, not a transaction.get, which is fine for this case as we need to query.
    const existingReviews = reviewsSnapshot.docs.map(d => d.data() as Review);

    // 2. Perform calculations with the data read.
    const allRatings = [...existingReviews.map(r => r.rating), reviewData.rating];
    const newReviewCount = allRatings.length;
    const newAverageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / newReviewCount;

    // 3. WRITE all documents last.
    const newReviewRef = doc(collection(db, 'reviews'));
    transaction.set(newReviewRef, {
      ...fullReviewData,
      createdAt: serverTimestamp(),
    });
    
    transaction.update(productDocRef, {
      reviewCount: newReviewCount,
      averageRating: newAverageRating,
    });
  });
};
