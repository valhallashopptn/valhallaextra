

import { db } from '@/lib/firebase';
import type { Order, CartItem, PaymentMethod, DeliveredAssetInfo, Product, DigitalAsset, UserProfile } from '@/lib/types';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  runTransaction,
  increment,
  limit,
  getDoc,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { debitFromWallet, addRewardsForPurchase, redeemCoins, getUserProfile } from './walletService';
import { getSetting } from './settingsService';

const ordersCollectionRef = collection(db, 'orders');
const productsCollectionRef = collection(db, 'products');
const digitalAssetsCollectionRef = collection(db, 'digital_assets');

// Add a new order
export const addOrder = async (orderData: {
  userId: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  walletDeduction: number;
  couponDiscount?: number;
  couponCode?: string;
  coinsRedeemed?: number;
  coinDiscount?: number;
  total: number;
  currency: 'TND' | 'USD';
  paymentMethod: { name: string; instructions: string; };
  paymentCustomData?: Record<string, string>;
  status?: 'pending' | 'completed' | 'paid';
}) => {

  const userProfile = await getUserProfile(orderData.userId);
  if (!userProfile) {
    throw new Error("User profile not found. Cannot place order.");
  }
  const username = userProfile.username;

  const sanitizedItems = orderData.items.map(item => {
    const { category, ...restOfItem } = item;
    return restOfItem;
  });

  const finalOrderData = {
    ...orderData,
    username: username,
    items: sanitizedItems,
  };


  const orderRef = await runTransaction(db, async (transaction) => {
    if (finalOrderData.walletDeduction > 0) {
      await debitFromWallet(transaction, finalOrderData.userId, finalOrderData.walletDeduction);
    }
    
    if (finalOrderData.coinsRedeemed && finalOrderData.coinsRedeemed > 0) {
      await redeemCoins(transaction, finalOrderData.userId, finalOrderData.coinsRedeemed);
    }

    if (finalOrderData.couponCode) {
        const couponQuery = query(collection(db, 'coupons'), where('code', '==', finalOrderData.couponCode));
        const couponSnapshot = await getDocs(couponQuery); 
        if (!couponSnapshot.empty) {
            const couponDoc = couponSnapshot.docs[0];
            transaction.update(couponDoc.ref, {
                usedBy: arrayUnion(finalOrderData.userId)
            });
        }
    }
    
    const newOrderRef = doc(collection(db, 'orders'));
    transaction.set(newOrderRef, {
      ...finalOrderData,
      couponCode: finalOrderData.couponCode || null,
      couponDiscount: finalOrderData.couponDiscount || 0,
      status: finalOrderData.status ?? 'pending',
      createdAt: serverTimestamp(),
    });

    return newOrderRef;
  });
  
  const webhookUrl = await getSetting('orderWebhookUrl');
  if (webhookUrl) {
    try {
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...finalOrderData,
          id: orderRef.id,
          createdAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error("Failed to send order notification webhook:", error);
    }
  }

  if (finalOrderData.status === 'paid') {
      try {
        attemptAutoDelivery(orderRef.id);
      } catch (error) {
          console.error(`Auto-delivery attempt failed for wallet order ${orderRef.id}:`, error);
      }
  }

  return orderRef;
};

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  const q = query(
    ordersCollectionRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
};

export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
};

export const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid') => {
  const orderDocRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderDocRef);
  if (!orderSnap.exists()) {
    throw new Error("Order not found");
  }
  const orderData = orderSnap.data() as Order;

  if (status === 'completed' && orderData.status !== 'completed') {
    await addRewardsForPurchase(orderData.userId, orderData.subtotal);
  }

  return await updateDoc(orderDocRef, { status: status });
};

export const deleteOrder = async (orderId: string) => {
    const orderDocRef = doc(db, 'orders', orderId);
    return await deleteDoc(orderDocRef);
};


export const deliverOrderManually = async (orderId: string, deliveryData: DeliveredAssetInfo) => {
    const orderDocRef = doc(db, 'orders', orderId);
     const orderSnap = await getDoc(orderDocRef);
      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }
    const orderData = orderSnap.data() as Order;
     if (orderData.status !== 'completed') {
        await addRewardsForPurchase(orderData.userId, orderData.subtotal);
    }

    return await updateDoc(orderDocRef, {
        deliveredAsset: deliveryData,
        status: 'completed'
    });
};

export const attemptAutoDelivery = async (orderId: string): Promise<{ delivered: boolean, message: string }> => {
    const orderDocRef = doc(db, 'orders', orderId);

    return await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderDocRef);
        if (!orderSnap.exists()) {
            throw new Error("Order not found.");
        }
        const orderData = orderSnap.data() as Order;

        if (orderData.status !== 'paid') {
            return { delivered: false, message: "Order is not in 'paid' status." };
        }
        
        if (orderData.items.length > 1) {
             return { delivered: false, message: "Auto-delivery is only supported for single-item orders." };
        }
        
        const itemToDeliver = orderData.items[0];
        
        const assetsQuery = query(
            digitalAssetsCollectionRef,
            where('productId', '==', itemToDeliver.id.split('-')[0]),
            where('status', '==', 'available'),
            limit(1)
        );
        
        const assetsSnap = await getDocs(assetsQuery);

        if (assetsSnap.empty) {
             return { delivered: false, message: `No automatic stock available for product: ${itemToDeliver.name}.` };
        }

        const assetDoc = assetsSnap.docs[0];
        const assetData = assetDoc.data() as DigitalAsset;
        
        const deliveredAsset: DeliveredAssetInfo = {
            data: assetData.data,
            extraInfo: assetData.extraInfo || '',
        };

        transaction.update(assetDoc.ref, {
            status: 'delivered',
            deliveredAt: serverTimestamp(),
            orderId: orderId,
        });

        await addRewardsForPurchase(orderData.userId, orderData.subtotal);

        transaction.update(orderDocRef, {
            deliveredAsset: deliveredAsset,
            status: 'completed'
        });

        return { delivered: true, message: "Order delivered successfully." };
    });
};
