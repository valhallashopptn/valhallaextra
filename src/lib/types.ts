

import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  backImageUrl: string;
  createdAt: Timestamp;
}

export interface ProductTab {
    id: string;
    title: string;
    content: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  category?: Category;
  tabs?: ProductTab[];
  variants?: ProductVariant[];
  customFields?: CustomField[];
  dataAiHint?: string;
}

export interface CartItem extends Product {
  quantity: number;
  customFieldData?: Record<string, string>;
}

export interface PaymentMethod {
  id:string;
  name: string;
  instructions: string;
  taxRate: number; // Stored as a percentage, e.g., 5 for 5%
  iconUrl?: string;
  webhookUrl?: string;
  createdAt: Timestamp;
}

export interface DeliveredAssetInfo {
  data: string;
  extraInfo?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  oneTimeUse: boolean;
  usedBy: string[]; // Array of user IDs
  createdAt: Timestamp;
}

export interface Order {
  id: string;
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
  status: 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid';
  paymentMethod?: {
    name: string;
    instructions: string;
  };
  createdAt: Timestamp;
  deliveredAsset?: DeliveredAssetInfo;
}

export type User = FirebaseUser;

export interface UserProfile {
    id: string;
    email: string;
    walletBalance: number;
    valhallaCoins: number;
    createdAt: Timestamp;
}

export interface Review {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    userId: string;
    userEmail: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}

export interface DigitalAsset {
  id: string;
  productId: string;
  productName?: string; // Optional, for display purposes
  data: string;
  extraInfo?: string;
  status: 'available' | 'delivered';
  createdAt: Timestamp;
  deliveredAt?: Timestamp;
  orderId?: string;
}
