
'use client';

import { createContext, useContext, useState, type ReactNode, useMemo, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartItemCustomData: (itemId: string, fieldLabel: string, value: string) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      // For this app, we assume unique custom fields are handled per purchase,
      // so we don't stack items that would have different custom data.
      // If an identical product is added, we just increase quantity.
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
           ? { ...item, quantity: item.quantity + 1 } 
           : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, customFieldData: {} }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
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
