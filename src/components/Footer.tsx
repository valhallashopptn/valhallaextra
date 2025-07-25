
'use client';

import Link from 'next/link';
import { Logo } from './icons/Logo';
import { Button } from './ui/button';
import { Link as LinkIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { getSettings } from '@/services/settingsService';
import Image from 'next/image';
import { useTranslation } from '@/context/TranslationContext';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { SocialLink as SocialLinkType } from '@/lib/types';


function SocialLink({ link }: { link: SocialLinkType }) {
    return (
        <a href={link.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
                {link.iconUrl ? (
                    <Image src={link.iconUrl} alt={link.name} width={20} height={20} className="h-5 w-5" />
                ) : (
                    <LinkIcon className="h-5 w-5" />
                )}
                <span className="sr-only">{link.name}</span>
            </Button>
        </a>
    );
}

export function Footer() {
  const { t } = useTranslation();
  const { openCart } = useCart();
  const [settings, setSettings] = useState({ 
    siteTitle: 'TopUp Hub', 
    logoUrl: '',
    socialLinks: [] as SocialLinkType[]
  });

  useEffect(() => {
    getSettings(['siteTitle', 'logoUrl', 'socialLinks']).then(s => {
      setSettings({
        siteTitle: s.siteTitle || 'TopUp Hub',
        logoUrl: s.logoUrl || '',
        socialLinks: s.socialLinks || []
      });
    });
  }, []);

  const { siteTitle, logoUrl, socialLinks } = settings;

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
               {logoUrl ? (
                <Image src={logoUrl} alt={`${siteTitle} Logo`} width={32} height={32} className="h-8 w-8 text-primary" />
              ) : (
                <Logo className="h-8 w-8 text-primary" />
              )}
              <span className="text-xl font-bold font-headline">{siteTitle}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('Footer.description')}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">{t('Footer.quickLinks')}</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">{t('Footer.products')}</Link>
              <Link href="/reviews" className="text-muted-foreground hover:text-primary transition-colors">{t('Footer.reviews')}</Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('Footer.about')}</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">{t('Footer.contact')}</Link>
            </nav>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
             <h3 className="text-lg font-semibold mb-4">{t('Footer.accountLinks')}</h3>
             <nav className="flex flex-col space-y-2">
                <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">{t('Footer.myAccount')}</Link>
                 <button onClick={openCart} className="text-left text-muted-foreground hover:text-primary transition-colors">{t('Footer.cart')}</button>
             </nav>
          </div>

        </div>
         <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p className='mb-4 sm:mb-0'>&copy; {new Date().getFullYear()} {siteTitle}. {t('Footer.copyright')}</p>
             <div className="flex space-x-2">
                {socialLinks.map(link => (
                    <SocialLink key={link.id} link={link} />
                ))}
             </div>
        </div>
      </div>
    </footer>
  );
}
