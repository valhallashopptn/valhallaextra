
'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}
