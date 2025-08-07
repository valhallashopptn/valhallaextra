
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSetting } from '@/services/settingsService';
import type { PageHeaders } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { PageWrapper } from './PageWrapper';

type PageKey = keyof PageHeaders;

interface PageHeaderProps {
  pageKey: PageKey;
  children?: React.ReactNode;
}

export function PageHeader({ pageKey, children }: PageHeaderProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [background, setBackground] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderSettings = async () => {
      setLoading(true);
      try {
        const headers = await getSetting('pageHeaders');
        if (headers && headers[pageKey]) {
          setTitle(headers[pageKey].title);
          setSubtitle(headers[pageKey].subtitle);
          setBackground(headers[pageKey].background);
        } else {
          // Fallback titles if settings not found
          setTitle(pageKey.charAt(0).toUpperCase() + pageKey.slice(1));
          setSubtitle(`This is the ${pageKey} page.`);
          setBackground('https://placehold.co/1920x400.png');
        }
      } catch (error) {
        console.error("Failed to fetch page header settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderSettings();
  }, [pageKey]);

  const isUrl = background.startsWith('http') || background.startsWith('/');

  const headerStyle = !isUrl ? { backgroundColor: background } : {};

  return (
    <div className="relative py-12 bg-card" style={headerStyle}>
      {isUrl && (
        <Image
          src={background}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10">
        <PageWrapper>
          <div className="space-y-4 text-center">
            {loading ? (
                <>
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                </>
            ) : (
                <>
                    <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {title}
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-white/90 sm:text-xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                        {subtitle}
                    </p>
                </>
            )}
             {children && <div className="pt-4">{children}</div>}
          </div>
        </PageWrapper>
      </div>
    </div>
  );
}
