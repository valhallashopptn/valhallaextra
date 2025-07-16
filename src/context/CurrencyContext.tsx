
'use client';

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

type Currency = 'TND' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CONVERSION_RATE_USD_TO_TND = 3.1;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('TND');

  const formatPrice = useCallback((price: number) => {
    if (currency === 'TND') {
      return `${(price * CONVERSION_RATE_USD_TO_TND).toFixed(2)} TND`;
    }
    return `$${price.toFixed(2)}`;
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    formatPrice,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
