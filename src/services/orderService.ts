
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
} from 'firebase/firestore';

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
}) => {
  return await addDoc(ordersCollectionRef, {
    ...orderData,
    status: 'pending', // Default status
    createdAt: serverTimestamp(),
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
export const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'canceled') => {
  const orderDoc = doc(db, 'orders', orderId);
  return await updateDoc(orderDoc, { status });
};
