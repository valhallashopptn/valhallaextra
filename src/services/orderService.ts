
import { db } from '@/lib/firebase';
import type { Order, CartItem, PaymentMethod } from '@/lib/types';
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
  increment
} from 'firebase/firestore';
import { debitFromWallet } from './walletService';

const ordersCollectionRef = collection(db, 'orders');

// Add a new order
export const addOrder = async (orderData: {
  userId: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  walletDeduction: number; // This should be in USD for consistent wallet logic
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


  if (finalOrderData.walletDeduction > 0) {
    // This is a transaction involving the wallet
    return runTransaction(db, async (transaction) => {
      // 1. Debit from wallet (wallet is always in USD)
      await debitFromWallet(transaction, finalOrderData.userId, finalOrderData.walletDeduction);
      
      // 2. Create the order document
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, {
        ...finalOrderData,
        status: finalOrderData.status ?? 'pending',
        createdAt: serverTimestamp(),
      });
      return orderRef;
    });
  } else {
    // This is a standard manual payment method without wallet usage
    return await addDoc(ordersCollectionRef, {
      ...finalOrderData,
      status: finalOrderData.status ?? 'pending', // Default status for manual payments
      createdAt: serverTimestamp(),
    });
  }
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
  const orderDoc = doc(db, 'orders', orderId);
  return await updateDoc(orderDoc, { status });
};
