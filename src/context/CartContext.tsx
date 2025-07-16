
'use client';

import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, customFieldData?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product, customFieldData?: Record<string, string>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && JSON.stringify(item.customFieldData) === JSON.stringify(customFieldData));
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && JSON.stringify(item.customFieldData) === JSON.stringify(customFieldData)
           ? { ...item, quantity: item.quantity + 1 } 
           : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, customFieldData }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    // Note: This simple implementation removes all items of a certain product ID,
    // regardless of customFieldData. For this app's logic (quantity is usually 1), this is fine.
    // A more complex app might need to distinguish between items with different custom data.
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);
  
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
