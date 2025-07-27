

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction, serverTimestamp, type Transaction, collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { updateOrderStatus } from './orderService';
import type { UserProfile, AdminPermission } from '@/lib/types';

const usersCollectionRef = 'users';
const COINS_EARNED_PER_DOLLAR = 10;
const XP_EARNED_PER_DOLLAR = 1000;

/**
 * Checks if a username is already taken.
 */
const isUsernameTaken = async (username: string): Promise<boolean> => {
    const q = query(collection(db, usersCollectionRef), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

/**
 * Creates a user profile document if it doesn't exist.
 */
export const createUserProfile = async (userId: string, email: string, username: string): Promise<UserProfile> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);
  const createdAt = serverTimestamp();

  if (await isUsernameTaken(username)) {
      throw new Error("Username is already taken.");
  }

  if (!docSnap.exists()) {
    const newUserProfile: Omit<UserProfile, 'id' | 'createdAt'> = {
      username: username,
      email: email,
      walletBalance: 0,
      valhallaCoins: 0,
      xp: 0,
      status: 'active',
      role: 'user',
      permissions: [],
      createdAt: createdAt as any, // Temporary cast
    }
    await setDoc(userDocRef, newUserProfile);
    return { ...newUserProfile, id: userId, createdAt: new Date() } as UserProfile;
  }
  
  const profileData = { ...docSnap.data(), id: docSnap.id } as UserProfile;

  const updates: Partial<UserProfile> = {};
  if (profileData.valhallaCoins === undefined) {
    updates.valhallaCoins = 0;
  }
  if (profileData.xp === undefined) {
    updates.xp = 0;
  }
  if (profileData.status === undefined) {
    updates.status = 'active';
  }


  if (Object.keys(updates).length > 0) {
    await updateDoc(userDocRef, updates);
    return { ...profileData, ...updates };
  }
  
  return profileData;
};

/**
 * Gets the user profile, including wallet and coin balance.
 * Creates a profile if one doesn't exist.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const profileData = { ...docSnap.data(), id: docSnap.id } as UserProfile;
    const updates: Partial<UserProfile> = {};

    if (!profileData.username && profileData.email) {
        updates.username = profileData.email.split('@')[0];
    }
    if (profileData.valhallaCoins === undefined) {
      updates.valhallaCoins = 0;
    }
    if (profileData.xp === undefined) {
        updates.xp = 0;
    }
    if (profileData.status === undefined) {
        updates.status = 'active';
    }
    if (profileData.role === undefined) {
        updates.role = profileData.email === 'admin@example.com' ? 'admin' : 'user';
    }
     if (profileData.permissions === undefined) {
        updates.permissions = [];
    }

    if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates);
        return { ...profileData, ...updates };
    }
    return profileData;
  }
  
  // If user profile doesn't exist, return null. Creation happens on signup.
  return null;
};

/**
 * Gets all user profiles for the admin dashboard.
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, usersCollectionRef);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure status defaults to active if it's missing
      if (!data.status) {
        data.status = 'active';
      }
      if (!data.role) {
        data.role = 'user';
      }
      return { id: doc.id, ...data } as UserProfile;
    });
};

/**
 * Updates a user's status (e.g., to ban or unban them).
 */
export const updateUserStatus = async (userId: string, status: 'active' | 'banned' | 'suspended', durationDays?: number) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    const updateData: Partial<UserProfile> = { status };
    
    if (status === 'banned') {
        updateData.bannedAt = serverTimestamp() as Timestamp;
        updateData.suspendedUntil = undefined;
    } else if (status === 'suspended' && durationDays) {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);
        updateData.suspendedUntil = Timestamp.fromDate(suspendedUntil);
        updateData.bannedAt = undefined;
    } else if (status === 'active') {
        updateData.bannedAt = undefined;
        updateData.suspendedUntil = undefined;
    }
    
    return await updateDoc(userDocRef, updateData);
};

export const updateUserPermissions = async (userId: string, role: 'user' | 'admin', permissions: AdminPermission[]) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    const updateData: Partial<UserProfile> = { role, permissions };
    return await updateDoc(userDocRef, updateData);
};


/**
 * Gets the wallet balance for a given user.
 * Returns 0 if the user profile or wallet doesn't exist.
 */
export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const userProfile = await getUserProfile(userId);
  return userProfile?.walletBalance || 0;
};

/**
 * Adds Valhalla Coins and XP to a user's balance after a purchase.
 */
export const addRewardsForPurchase = async (userId: string, purchaseAmountUSD: number) => {
    if (purchaseAmountUSD <= 0) return;
    
    const coinsToAdd = Math.floor(purchaseAmountUSD * COINS_EARNED_PER_DOLLAR);
    const xpToAdd = Math.floor(purchaseAmountUSD * XP_EARNED_PER_DOLLAR);

    const rewards: { valhallaCoins?: any, xp?: any } = {};
    if (coinsToAdd > 0) {
        rewards.valhallaCoins = increment(coinsToAdd);
    }
    if (xpToAdd > 0) {
        rewards.xp = increment(xpToAdd);
    }

    if (Object.keys(rewards).length > 0) {
        const userDocRef = doc(db, usersCollectionRef, userId);
        await updateDoc(userDocRef, rewards);
    }
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
                    valhallaCoins: 0,
                    xp: 0,
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

/**
 * Gets the top users based on XP.
 */
export const getTopUsers = async (count: number): Promise<UserProfile[]> => {
    const usersRef = collection(db, usersCollectionRef);
    const q = query(usersRef, orderBy('xp', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};


/**
 * Gets the global rank of a specific user.
 */
export const getUserRank = async (userId: string): Promise<number | null> => {
    try {
        const usersRef = collection(db, usersCollectionRef);
        const q = query(usersRef, orderBy('xp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const userRanking = querySnapshot.docs.map(doc => doc.id);
        const rank = userRanking.indexOf(userId) + 1;

        return rank > 0 ? rank : null;
    } catch (error) {
        console.error("Failed to get user rank:", error);
        return null;
    }
};
