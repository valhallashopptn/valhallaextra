
'use client';

import { createContext, useContext, useState, type ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
    setIsInitialized(true);
  }, []);
  
  useEffect(() => {
    if(isInitialized) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);


  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      // Create a unique ID for the cart item, including variant info if it exists
      const cartItemId = (product.variants && product.variants.length > 0 && product.name.includes('-')) 
        ? `${product.id}-${product.name.split('-')[1].trim()}` 
        : product.id;

      const existingItem = prevItems.find(item => item.id === cartItemId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItemId
           ? { ...item, quantity: item.quantity + quantity } 
           : item
        );
      }
      
      // Ensure customFieldData is initialized as an empty object for new items.
      const productToAdd = { 
        ...product, 
        id: cartItemId, 
        quantity, 
        customFieldData: {} 
      };

      return [...prevItems, productToAdd];
    });
    openCart();
  };
  
  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
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
    updateQuantity,
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
