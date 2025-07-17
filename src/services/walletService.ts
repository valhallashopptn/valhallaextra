
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { updateOrderStatus } from './orderService';

// This collection will store user profiles, including their wallet balance.
const usersCollectionRef = 'users';

/**
 * Creates a user profile document if it doesn't exist.
 * This is useful to call upon user registration.
 */
export const createUserProfile = async (userId: string, email: string) => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    await setDoc(userDocRef, {
      email: email,
      walletBalance: 0,
      createdAt: serverTimestamp(),
    });
  }
};

/**
 * Gets the wallet balance for a given user.
 * Returns 0 if the user profile or wallet doesn't exist.
 */
export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data().walletBalance || 0;
  }
  
  // If user profile doesn't exist, create it with a zero balance
  await createUserProfile(userId, 'unknown'); // Ideally, you'd pass the email
  return 0;
};

/**
 * Adds a specified amount to a user's wallet.
 */
export const addToWallet = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive.");
  }

  const userDocRef = doc(db, usersCollectionRef, userId);
  
  // Check if user profile exists, if not create one.
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
     await createUserProfile(userId, 'unknown-user');
  }

  return await updateDoc(userDocRef, {
    walletBalance: increment(amount)
  });
};

/**
 * Processes a refund by adding the order total to the user's wallet
 * and updating the order status to 'refunded'. This is a transaction
 * to ensure both operations succeed or fail together.
 */
export const refundToWallet = async (userId: string, amount: number, orderId: string) => {
    if (amount <= 0) {
        throw new Error("Refund amount must be positive.");
    }

    const userDocRef = doc(db, usersCollectionRef, userId);
    const orderDocRef = doc(db, 'orders', orderId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            
            if (!userDoc.exists()) {
                // If the user profile doesn't exist, create it within the transaction
                 transaction.set(userDocRef, {
                    walletBalance: amount,
                    createdAt: serverTimestamp()
                 });
            } else {
                 transaction.update(userDocRef, {
                    walletBalance: increment(amount)
                 });
            }
            
            // Update the order status to refunded
            transaction.update(orderDocRef, { status: 'refunded' });
        });
    } catch (e) {
        console.error("Refund transaction failed: ", e);
        throw new Error("Failed to process refund.");
    }
};
