
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Inter } from 'next/font/google';
import { getSettings } from '@/services/settingsService';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSettings(['siteTitle']).then(s => s.siteTitle || 'TopUp Hub');
  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: 'Top up your favorite games.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings(['theme', 'siteTitle', 'logoUrl']);
  const themeName = settings.theme || 'Night Runner';
  const activeTheme = themes.find(t => t.name === themeName) || themes[0];
  
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
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <Providers>
          <Header siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />
          <main className="flex-grow">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
