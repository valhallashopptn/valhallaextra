
'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  settings: {
    enabled: boolean;
    text: string;
    countdownDate: string;
    linkUrl: string;
    linkText: string;
  } | null;
}

export function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: '00', hours: '00', minutes: '00', seconds: '00'
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!settings?.countdownDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const countdown = new Date(settings.countdownDate).getTime();
      const distance = countdown - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.countdownDate]);

  if (!isClient || !settings || !settings.enabled) {
    return null;
  }

  const hasCountdown = settings.countdownDate && new Date(settings.countdownDate).getTime() > new Date().getTime();

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <p>{settings.text}</p>
        
        {hasCountdown && (
          <div className="flex items-center gap-2 font-mono" suppressHydrationWarning>
            <span>{timeLeft.days}d</span>:
            <span>{timeLeft.hours}h</span>:
            <span>{timeLeft.minutes}m</span>:
            <span>{timeLeft.seconds}s</span>
          </div>
        )}

        {settings.linkUrl && settings.linkText && (
          <Button asChild variant="secondary" size="sm" className="h-7 px-3 py-1 text-xs">
            <Link href={settings.linkUrl}>
              {settings.linkText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
