

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
  discountPrice?: number;
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
  discountPrice?: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  category?: Category;
  tabs?: ProductTab[];
  variants?: ProductVariant[];
  customFields?: CustomField[];
  dataAiHint?: string;
  requirePurchaseAgreement?: boolean;
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
  customFields?: CustomField[];
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
  username: string;
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
  paymentCustomData?: Record<string, string>;
  createdAt: Timestamp;
  deliveredAsset?: DeliveredAssetInfo;
}

export type User = FirebaseUser;

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    walletBalance: number;
    valhallaCoins: number;
    xp: number;
    status: 'active' | 'banned' | 'suspended';
    createdAt: Timestamp;
    bannedAt?: Timestamp;
    suspendedUntil?: Timestamp;
}

export interface Review {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    userId: string;
    username: string;
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

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  iconUrl: string;
}

export interface AnnouncementSettings {
    enabled: boolean;
    text: string;
    countdownDate: string;
    linkUrl: string;
    linkText: string;
}

export interface AboutPageContent {
  mainTitle: string;
  subtitle: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  missionTitle: string;
  missionText: string;
  valuesTitle: string;
  valuesSubtitle: string;
  chooseUsTitle: string;
  chooseUsSubtitle: string;
}

export interface ContactPageContent {
  mainTitle: string;
  subtitle: string;
  infoTitle: string;
  infoSubtitle: string;
  email: string;
  phone: string;
  address: string;
}
