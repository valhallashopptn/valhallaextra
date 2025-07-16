
'use client';

import { useTranslation } from '@/context/TranslationContext';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLocale} aria-label="Switch language">
      <Globe className="h-5 w-5" />
    </Button>
  );
}
