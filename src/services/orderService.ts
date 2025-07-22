

import { db } from '@/lib/firebase';
import type { Order, CartItem, PaymentMethod, DeliveredAssetInfo, Product, DigitalAsset } from '@/lib/types';
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
  arrayUnion
} from 'firebase/firestore';
import { debitFromWallet } from './walletService';

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
  walletDeduction: number; // This should be in USD for consistent wallet logic
  couponDiscount?: number;
  couponCode?: string;
  total: number;
  currency: 'TND' | 'USD';
  paymentMethod: { name: string; instructions: string };
  status?: 'pending' | 'completed' | 'paid';
}) => {

  // Sanitize items to remove potentially problematic fields for Firestore
  const sanitizedItems = orderData.items.map(item => {
    // The 'category' object can contain undefined 'customFields' which Firestore rejects.
    // It's not needed in the final order document anyway.
    const { category, ...restOfItem } = item;
    return restOfItem;
  });

  const finalOrderData = {
    ...orderData,
    items: sanitizedItems,
  };


  return runTransaction(db, async (transaction) => {
    // 1. Debit from wallet if used
    if (finalOrderData.walletDeduction > 0) {
      await debitFromWallet(transaction, finalOrderData.userId, finalOrderData.walletDeduction);
    }

    // 2. Mark coupon as used if applicable
    if (finalOrderData.couponCode) {
        const couponQuery = query(collection(db, 'coupons'), where('code', '==', finalOrderData.couponCode));
        const couponSnapshot = await getDocs(couponQuery); // Note: getDocs is not a transaction operation. This is a limitation. For true atomicity, we'd need a Cloud Function.
        if (!couponSnapshot.empty) {
            const couponDoc = couponSnapshot.docs[0];
            if (couponDoc.data().oneTimeUse) {
                 transaction.update(couponDoc.ref, {
                    usedBy: arrayUnion(finalOrderData.userId)
                });
            }
        }
    }
    
    // 3. Create the order document
    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, {
      ...finalOrderData,
      status: finalOrderData.status ?? 'pending',
      createdAt: serverTimestamp(),
    });

    return orderRef;
  });
};

// Get all orders for a specific user
export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  const q = query(
    ordersCollectionRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
};

// Get all orders (for admin)
export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
};

// Update an order's status
export const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid') => {
  const orderDocRef = doc(db, 'orders', orderId);
  return await updateDoc(orderDocRef, { status: status });
};

// Deliver an order manually
export const deliverOrderManually = async (orderId: string, deliveryData: DeliveredAssetInfo) => {
    const orderDocRef = doc(db, 'orders', orderId);
    return await updateDoc(orderDocRef, {
        deliveredAsset: deliveryData,
        status: 'completed'
    });
};

// Attempt to automatically deliver an order
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
            // This is a simplified check. A more complex system might handle this differently.
             return { delivered: false, message: "Auto-delivery is only supported for single-item orders." };
        }
        
        const itemToDeliver = orderData.items[0];
        
        // Find an available digital asset for this product
        // Note: Using `itemToDeliver.id` which might be a composite ID if variants are used.
        // It should match the `productId` on the DigitalAsset document.
        const assetsQuery = query(
            digitalAssetsCollectionRef,
            where('productId', '==', itemToDeliver.id.split('-')[0]), // Use base product ID
            where('status', '==', 'available'),
            limit(1)
        );
        
        const assetsSnap = await getDocs(assetsQuery);

        if (assetsSnap.empty) {
             return { delivered: false, message: `No automatic stock available for product: ${itemToDeliver.name}.` };
        }

        const assetDoc = assetsSnap.docs[0];
        const assetData = assetDoc.data() as DigitalAsset;
        
        // Prepare delivery info
        const deliveredAsset: DeliveredAssetInfo = {
            data: assetData.data,
            extraInfo: assetData.extraInfo || '',
        };

        // Update the asset to mark as delivered
        transaction.update(assetDoc.ref, {
            status: 'delivered',
            deliveredAt: serverTimestamp(),
            orderId: orderId,
        });

        // Update the order with the delivery info and set status to completed
        transaction.update(orderDocRef, {
            deliveredAsset: deliveredAsset,
            status: 'completed'
        });

        return { delivered: true, message: "Order delivered successfully." };
    });
};
