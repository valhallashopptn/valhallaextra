

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction, serverTimestamp, type Transaction, collection, query, orderBy, limit, getDocs, where, Timestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { updateOrderStatus } from './orderService';
import type { UserProfile, AdminPermission } from '@/lib/types';
import { getAvatarList } from './avatarService';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

const usersCollectionRef = 'users';
const COINS_EARNED_PER_DOLLAR = 10;
const XP_EARNED_PER_DOLLAR = 1000;
const AFFILIATE_COMMISSION_RATE = 0.05; // 5%

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
export const createUserProfile = async (userId: string, email: string, username: string, referredByCode?: string): Promise<UserProfile> => {
  const userDocRef = doc(db, usersCollectionRef, userId);
  const docSnap = await getDoc(userDocRef);
  const createdAt = serverTimestamp();

  if (await isUsernameTaken(username)) {
      throw new Error("Username is already taken.");
  }

  const avatarList = await getAvatarList();
  const randomAvatarUrl = avatarList.length > 0 ? avatarList[Math.floor(Math.random() * avatarList.length)] : '';

  if (!docSnap.exists()) {
    const newUserProfile: Omit<UserProfile, 'id' | 'createdAt'> = {
      username: username,
      email: email,
      avatarUrl: randomAvatarUrl,
      walletBalance: 0,
      valhallaCoins: 0,
      xp: 0,
      status: 'active',
      role: 'user',
      permissions: [],
      reviewPromptedOrderIds: [],
      affiliateStatus: 'none',
      affiliateEarnings: 0,
      createdAt: createdAt as any, // Temporary cast
    };

    if (referredByCode) {
      newUserProfile.referredBy = referredByCode;
    }

    await setDoc(userDocRef, newUserProfile);
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: randomAvatarUrl });
    }
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
    if (profileData.reviewPromptedOrderIds === undefined) {
        updates.reviewPromptedOrderIds = [];
    }
     if (profileData.avatarUrl === undefined) {
        updates.avatarUrl = '';
    }
    if (profileData.affiliateStatus === undefined) {
        updates.affiliateStatus = 'none';
    }

    if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates);
        return { ...profileData, ...updates };
    }
    return profileData;
  }
  
  return null;
};

/**
 * Updates a user's profile with partial data.
 */
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    
    if (data.avatarUrl && auth.currentUser && auth.currentUser.uid === userId) {
        try {
            await updateProfile(auth.currentUser, { photoURL: data.avatarUrl });
        } catch (error) {
            console.error("Failed to update Firebase Auth profile photo:", error);
        }
    }
    
    return await updateDoc(userDocRef, data);
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, usersCollectionRef);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.status) {
        data.status = 'active';
      }
      if (!data.role) {
        data.role = data.email === 'admin@example.com' ? 'admin' : 'user';
      }
      return { id: doc.id, ...data } as UserProfile;
    });
};

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

export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const userProfile = await getUserProfile(userId);
  return userProfile?.walletBalance || 0;
};

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
    
    const userProfile = await getUserProfile(userId);
    // Add affiliate commission if the user was referred
    if (userProfile?.referredBy) {
        const commissionAmount = purchaseAmountUSD * AFFILIATE_COMMISSION_RATE;
        if (commissionAmount > 0) {
            await addAffiliateCommission(userProfile.referredBy, commissionAmount);
        }
    }


    if (Object.keys(rewards).length > 0) {
        const userDocRef = doc(db, usersCollectionRef, userId);
        await updateDoc(userDocRef, rewards);
    }
};

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

export const addToWallet = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive.");
  }

  const userDocRef = doc(db, usersCollectionRef, userId);
  await getUserProfile(userId);

  return await updateDoc(userDocRef, {
    walletBalance: increment(amount)
  });
};

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

export const getTopUsers = async (count: number): Promise<UserProfile[]> => {
    const usersRef = collection(db, usersCollectionRef);
    const q = query(usersRef, orderBy('xp', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};

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

export const markReviewPrompted = async (userId: string, orderId: string) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    return await updateDoc(userDocRef, {
        reviewPromptedOrderIds: arrayUnion(orderId)
    });
};

// --- AFFILIATE SYSTEM FUNCTIONS ---

/**
 * Admin activates an affiliate, generates a unique code, and sets status to 'active'.
 */
export const activateAffiliate = async (userId: string) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    const userProfile = await getUserProfile(userId);
    if (!userProfile) throw new Error("User not found");

    // Generate a unique affiliate code
    const baseCode = userProfile.username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    let affiliateCode = baseCode;
    let isUnique = false;
    let counter = 1;
    while (!isUnique) {
        const q = query(collection(db, usersCollectionRef), where("affiliateCode", "==", affiliateCode));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            isUnique = true;
        } else {
            affiliateCode = `${baseCode}${counter}`;
            counter++;
        }
    }

    return updateDoc(userDocRef, {
        affiliateStatus: 'active',
        affiliateCode: affiliateCode
    });
};

/**
 * Admin revokes an affiliate's status.
 */
export const revokeAffiliate = async (userId: string) => {
    const userDocRef = doc(db, usersCollectionRef, userId);
    return updateDoc(userDocRef, { affiliateStatus: 'none', affiliateCode: '' });
};

/**
 * Adds commission to an affiliate's wallet balance and tracks total earnings.
 */
export const addAffiliateCommission = async (affiliateCode: string, commissionAmount: number) => {
    if (commissionAmount <= 0) return;

    const q = query(collection(db, usersCollectionRef), where("affiliateCode", "==", affiliateCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.error(`Affiliate with code ${affiliateCode} not found.`);
        return;
    }

    const affiliateDocRef = snapshot.docs[0].ref;
    
    // Use increment to avoid race conditions
    await updateDoc(affiliateDocRef, {
        walletBalance: increment(commissionAmount),
        affiliateEarnings: increment(commissionAmount)
    });
};

/**
 * Get all user profiles that are active affiliates.
 */
export const getAffiliates = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, usersCollectionRef);
    const q = query(usersRef, where('affiliateStatus', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};
