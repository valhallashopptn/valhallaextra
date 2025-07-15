import Link from 'next/link';
import { Logo } from './icons/Logo';
import { Button } from './ui/button';
import { Github, Twitter, Facebook } from 'lucide-react';
import type { ComponentProps } from 'react';
import { getSettings } from '@/services/settingsService';
import Image from 'next/image';

function SocialLink({ icon: Icon, ...props }: { icon: React.ElementType } & ComponentProps<typeof Link>) {
    return (
        <Link {...props}>
            <Button variant="ghost" size="icon">
                <Icon className="h-5 w-5" />
                <span className="sr-only">{props['aria-label']}</span>
            </Button>
        </Link>
    );
}

export async function Footer() {
  const { siteTitle = 'ApexTop', logoUrl } = await getSettings(['siteTitle', 'logoUrl']);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center space-x-2 mb-4">
               {logoUrl ? (
                <Image src={logoUrl} alt={`${siteTitle} Logo`} width={32} height={32} className="h-8 w-8 text-primary" />
              ) : (
                <Logo className="h-8 w-8 text-primary" />
              )}
              <span className="text-xl font-bold font-headline">{siteTitle}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop shop for instant game top-ups and digital vouchers. Quick, secure, and always on.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link>
              <Link href="/reviews" className="text-muted-foreground hover:text-primary transition-colors">Reviews</Link>
              <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">My Account</Link>
              <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Cart</Link>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-end">
             <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
             <div className="flex space-x-2">
                <SocialLink href="#" icon={Twitter} aria-label="Twitter" />
                <SocialLink href="#" icon={Facebook} aria-label="Facebook" />
                <SocialLink href="#" icon={Github} aria-label="Github" />
             </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {siteTitle}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
