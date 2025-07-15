import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  backImageUrl: string;
  createdAt: Timestamp;
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
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  createdAt: Timestamp;
}

export type User = FirebaseUser;

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userEmail: string;
    rating: number;
    comment: string;
    createdAt: Timestamp;
}
