
'use client';

import { createContext, useContext, useState, type ReactNode, useMemo, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartItemCustomData: (itemId: string, fieldLabel: string, value: string) => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
           ? { ...item, quantity: item.quantity + quantity } 
           : item
        );
      }
      return [...prevItems, { ...product, quantity, customFieldData: {} }];
    });
    openCart();
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const updateCartItemCustomData = useCallback((itemId: string, fieldLabel: string, value: string) => {
    setCartItems(prevItems => prevItems.map(item => {
        if (item.id === itemId) {
            return {
                ...item,
                customFieldData: {
                    ...item.customFieldData,
                    [fieldLabel]: value
                }
            };
        }
        return item;
    }));
  }, []);

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
    updateCartItemCustomData,
    cartCount,
    cartTotal,
    isCartOpen,
    openCart,
    closeCart,
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
