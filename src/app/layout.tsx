

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Inter } from 'next/font/google';
import { getSettings } from '@/services/settingsService';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import type { AnnouncementSettings, SocialLink, MaintenanceModeSettings } from '@/lib/types';
import { MusicPlayer } from '@/components/MusicPlayer';
import Script from 'next/script';
import { Logo } from '@/components/icons/Logo';
import { ReviewReminder } from '@/components/ReviewReminder';
import { MaintenanceWrapper } from '@/components/MaintenanceWrapper';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(['siteTitle', 'faviconUrl']);
  const siteTitle = settings.siteTitle || 'Valhalla Shop';
  
  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings(['theme', 'siteTitle', 'logoUrl', 'announcement', 'enableBackgroundMusic', 'backgroundMusicUrl', 'socialLinks', 'maintenanceMode']);
  const themeName = settings.theme || 'Night Runner';
  const activeTheme = themes.find(t => t.name === themeName) || themes[0];
  const announcementSettings = settings.announcement as AnnouncementSettings | null;
  const maintenanceMode = settings.maintenanceMode as MaintenanceModeSettings | null;
  
  const themeStyle = {
    '--background': activeTheme.colors.background,
    '--foreground': activeTheme.colors.foreground,
    '--card': activeTheme.colors.card,
    '--card-foreground': activeTheme.colors.cardForeground,
    '--popover': activeTheme.colors.popover,
    '--popover-foreground': activeTheme.colors.popoverForeground,
    '--primary': activeTheme.colors.primary,
    '--primary-foreground': activeTheme.colors.primaryForeground,
    '--secondary': activeTheme.colors.secondary,
    '--secondary-foreground': activeTheme.colors.secondaryForeground,
    '--muted': activeTheme.colors.muted,
    '--muted-foreground': activeTheme.colors.mutedForeground,
    '--accent': activeTheme.colors.accent,
    '--accent-foreground': activeTheme.colors.accentForeground,
    '--destructive': activeTheme.colors.destructive,
    '--destructive-foreground': activeTheme.colors.destructiveForeground,
    '--border': activeTheme.colors.border,
    '--input': activeTheme.colors.input,
    '--ring': activeTheme.colors.ring,
    '--radius': activeTheme.radius,
    '--font-headline': 'var(--font-body)',
  } as React.CSSProperties;

  return (
    <html lang="en" className={cn(inter.variable, 'dark')} style={themeStyle}>
      <head>
        {/* The dynamic favicon is handled by generateMetadata for optimal loading */}
      </head>
      <body>
        <Providers>
          <AnnouncementBar settings={announcementSettings} />
          <Header siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />
          <main className="flex-grow">
            <MaintenanceWrapper maintenanceMode={maintenanceMode}>
              {children}
            </MaintenanceWrapper>
          </main>
          <Toaster />
          <Footer siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />
          {settings.enableBackgroundMusic && settings.backgroundMusicUrl && (
            <MusicPlayer src={settings.backgroundMusicUrl} />
          )}
          <ReviewReminder />
        </Providers>
        <Script id="tawk-to-script" strategy="lazyOnload">
        {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6885851b9462141926a5e799/default';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
        `}
        </Script>
      </body>
    </html>
  );
}
