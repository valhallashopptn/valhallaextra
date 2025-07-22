

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction, serverTimestamp, type Transaction } from 'firebase/firestore';
import { updateOrderStatus } from './orderService';
import type { UserProfile } from '@/lib/types';

const usersCollectionRef = 'users';
const COINS_EARNED_PER_DOLLAR = 1;

/**
 * Creates a user profile document if it doesn't exist.
 */
export const createUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);
  const createdAt = serverTimestamp();

  if (!docSnap.exists()) {
    const newUserProfile: Omit<UserProfile, 'id'> = {
      email: email,
      walletBalance: 0,
      valhallaCoins: 0,
      createdAt: createdAt as any, // Temporary cast
    }
    await setDoc(userDocRef, newUserProfile);
    return { ...newUserProfile, id: userId, createdAt: new Date() } as UserProfile;
  }
  
  const profileData = { ...docSnap.data(), id: docSnap.id } as UserProfile;

  // Backfill valhallaCoins if it's missing for an existing user
  if (profileData.valhallaCoins === undefined) {
    await updateDoc(userDocRef, { valhallaCoins: 0 });
    profileData.valhallaCoins = 0;
  }
  
  return profileData;
};

/**
 * Gets the user profile, including wallet and coin balance.
 * Creates a profile if one doesn't exist.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const profileData = { ...docSnap.data(), id: docSnap.id } as UserProfile;
    // Backfill valhallaCoins if it's missing for an existing user
    if (profileData.valhallaCoins === undefined) {
      await updateDoc(userDocRef, { valhallaCoins: 0 });
      profileData.valhallaCoins = 0;
    }
    return profileData;
  }
  
  // If user profile doesn't exist, create it with zero balances
  // This assumes we don't have the user's email at this point, which is okay.
  return await createUserProfile(userId, 'unknown@user.com');
};


/**
 * Gets the wallet balance for a given user.
 * Returns 0 if the user profile or wallet doesn't exist.
 */
export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const userProfile = await getUserProfile(userId);
  return userProfile.walletBalance || 0;
};

/**
 * Adds Valhalla Coins to a user's balance after a purchase.
 */
export const addCoinsForPurchase = async (userId: string, purchaseAmountUSD: number) => {
    if (purchaseAmountUSD <= 0) return;
    const coinsToAdd = Math.floor(purchaseAmountUSD * COINS_EARNED_PER_DOLLAR);
    if (coinsToAdd <= 0) return;
    
    const userDocRef = doc(db, usersCollectionRef, userId);
    await updateDoc(userDocRef, {
        valhallaCoins: increment(coinsToAdd)
    });
};

/**
 * Redeems a user's Valhalla coins for a discount.
 * Designed to be used within a Firestore transaction.
 */
export const redeemCoins = async (transaction: Transaction, userId: string, coinsToRedeem: number) => {
    if (coinsToRedeem <= 0) return;

    const userDocRef = doc(db, usersCollectionRef, userId);
    const userDoc = await transaction.get(userDocRef);

    if (!userDoc.exists()) {
        throw new Error("User profile not found for coin redemption.");
    }
    const currentCoins = userDoc.data().valhallaCoins || 0;
    if (currentCoins < coinsToRedeem) {
        throw new Error("Insufficient Valhalla Coins.");
    }

    transaction.update(userDocRef, {
        valhallaCoins: increment(-coinsToRedeem)
    });
};


/**
 * Adds a specified amount to a user's wallet.
 */
export const addToWallet = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive.");
  }

  const userDocRef = doc(db, usersCollectionRef, userId);
  await getUserProfile(userId); // Ensures profile exists

  return await updateDoc(userDocRef, {
    walletBalance: increment(amount)
  });
};

/**
 * Debits an amount from a user's wallet.
 * This function is designed to be used within a Firestore transaction.
 */
export const debitFromWallet = async (transaction: Transaction, userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error("Debit amount must be positive.");
  }

  const userDocRef = doc(db, usersCollectionRef, userId);
  const userDoc = await transaction.get(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("User profile not found.");
  }
  
  const currentBalance = userDoc.data().walletBalance || 0;
  if (currentBalance < amount) {
    throw new Error("Insufficient wallet balance.");
  }

  transaction.update(userDocRef, {
    walletBalance: increment(-amount)
  });
}


/**
 * Processes a refund by adding the order's subtotal to the user's wallet
 * and updating the order status to 'refunded'. This is a transaction
 * to ensure both operations succeed or fail together.
 */
export const refundToWallet = async (userId: string, subtotal: number, orderId: string) => {
    if (subtotal <= 0) {
        throw new Error("Refund amount must be positive.");
    }

    const userDocRef = doc(db, usersCollectionRef, userId);
    const orderDocRef = doc(db, 'orders', orderId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            
            if (!userDoc.exists()) {
                 transaction.set(userDocRef, {
                    walletBalance: subtotal,
                    valhallaCoins: 0, // Don't give coins on a new profile from refund
                    createdAt: serverTimestamp()
                 });
            } else {
                 transaction.update(userDocRef, {
                    walletBalance: increment(subtotal)
                 });
            }
            
            transaction.update(orderDocRef, { status: 'refunded' });
        });
    } catch (e) {
        console.error("Refund transaction failed: ", e);
        throw new Error("Failed to process refund.");
    }
};
