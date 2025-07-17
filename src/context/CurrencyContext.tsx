
'use client';

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

type Currency = 'TND' | 'USD';

export const CONVERSION_RATE_USD_TO_TND = 3.1;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number, overrideCurrency?: Currency, isAlreadyConverted?: boolean) => string;
  convertPrice: (price: number) => number;
  CONVERSION_RATE_USD_TO_TND: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);


export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('TND');

  const convertPrice = useCallback((priceInUsd: number) => {
      if (currency === 'TND') {
          return priceInUsd * CONVERSION_RATE_USD_TO_TND;
      }
      return priceInUsd;
  }, [currency]);
  
  const formatPrice = useCallback((priceInUsd: number, overrideCurrency?: Currency, isAlreadyConverted = false) => {
    const targetCurrency = overrideCurrency || currency;
    let priceToFormat = priceInUsd;

    if (!isAlreadyConverted) {
      if (targetCurrency === 'TND') {
        priceToFormat = priceInUsd * CONVERSION_RATE_USD_TO_TND;
      }
    }
    
    const formatter = new Intl.NumberFormat(targetCurrency === 'TND' ? 'fr-TN' : 'en-US', {
        style: 'currency',
        currency: targetCurrency,
    });

    return formatter.format(priceToFormat);
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    formatPrice,
    convertPrice,
    CONVERSION_RATE_USD_TO_TND
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

    