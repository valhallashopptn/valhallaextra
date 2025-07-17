
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
  total: number;
  currency: 'TND' | 'USD';
  paymentMethod: { name: string; instructions: string };
  status?: 'pending' | 'completed';
}) => {
  if (orderData.paymentMethod.name === 'Wallet Balance') {
    // This is a wallet transaction
    return runTransaction(db, async (transaction) => {
      // 1. Debit from wallet
      await debitFromWallet(transaction, orderData.userId, orderData.total);
      
      // 2. Create the order document
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, {
        ...orderData,
        status: orderData.status ?? 'completed', // Wallet orders are completed instantly
        createdAt: serverTimestamp(),
      });
      return orderRef;
    });
  } else {
    // This is a manual payment method
    return await addDoc(ordersCollectionRef, {
      ...orderData,
      status: orderData.status ?? 'pending', // Default status for manual payments
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
export const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'canceled' | 'refunded') => {
  const orderDoc = doc(db, 'orders', orderId);
  return await updateDoc(orderDoc, { status });
};
