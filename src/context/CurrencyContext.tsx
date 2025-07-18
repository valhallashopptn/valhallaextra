
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
    
    // Using 'en-US' for both provides consistent formatting with a dot for the decimal separator.
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: targetCurrency,
        currencyDisplay: 'code', // Use 'code' to ensure "TND" is displayed instead of a symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Remove the currency code from the start if Intl.NumberFormat adds it (some locales do)
    return formatter.format(priceToFormat).replace(targetCurrency, '').trim() + ` ${targetCurrency}`;
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

    