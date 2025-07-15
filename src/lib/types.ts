import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  game: string;
  price: number;
  imageUrl: string;
  stock: number;
  dataAiHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id:string;
  date: string;
  items: CartItem[];
  total: number;
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
