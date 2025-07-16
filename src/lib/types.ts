
import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  backImageUrl: string;
  createdAt: Timestamp;
  customFields?: CustomField[];
}

export interface Product {
  id: string;
  name: string;
  game: string;
  price: number;
  imageUrl: string;
  stock: number;
  dataAiHint: string;
  categoryId: string;
  categoryName: string;
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
  createdAt: Timestamp;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: 'TND' | 'USD';
  paymentMethod?: {
    name: string;
    instructions: string;
  };
  createdAt: Timestamp;
}

export type User = FirebaseUser;

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
