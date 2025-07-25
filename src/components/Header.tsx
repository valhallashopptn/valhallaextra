
'use client';

import Link from 'next/link';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck, Search, Menu, Wallet, Star, Trophy, Crown, ShieldOff, Shield, Sword, Swords, Gem, Diamond, Hexagon } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import React, { useEffect, useState, useRef } from 'react';
import { getProducts } from '@/services/productService';
import type { Product, UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Logo } from './icons/Logo';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/context/TranslationContext';
import { CurrencySwitcher } from './CurrencySwitcher';
import { CartPanel } from './CartPanel';
import { getUserProfile } from '@/services/walletService';
import { useCurrency } from '@/context/CurrencyContext';
import { Progress } from './ui/progress';

export const ranks = [
  { name: 'F-Rank', minXp: 0, color: 'text-gray-400', icon: <ShieldOff /> },
  { name: 'E-Rank', minXp: 6000, color: 'text-green-400', icon: <Shield /> },
  { name: 'D-Rank', minXp: 9600, color: 'text-cyan-400', icon: <ShieldCheck /> },
  { name: 'C-Rank', minXp: 15360, color: 'text-blue-400', icon: <Sword /> },
  { name: 'B-Rank', minXp: 24576, color: 'text-purple-400', icon: <Swords /> },
  { name: 'A-Rank', minXp: 39321, color: 'text-pink-400', icon: <Gem /> },
  { name: 'S-Rank', minXp: 62914, color: 'text-red-400', icon: <Diamond /> },
  { name: 'SS-Rank', minXp: 100663, color: 'text-yellow-400', icon: <Trophy /> },
  { name: 'Legend', minXp: 161061, color: 'text-violet-400', isLegend: true, icon: <Crown /> },
  { name: 'LORD', minXp: 257698, color: 'text-orange-400', isRgb: true, icon: <Hexagon /> },
];

export const getRankDetails = (xp: number) => {
  let currentRank = ranks[0];
  let nextRank = ranks[1] || null;

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].minXp) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1] || null;
      break;
    }
  }

  const xpInCurrentRank = xp - currentRank.minXp;
  const xpForNextRank = nextRank ? nextRank.minXp - currentRank.minXp : 0;
  const progressPercentage = nextRank ? (xpInCurrentRank / xpForNextRank) * 100 : 100;

  return { currentRank, nextRank, xp, xpInCurrentRank, xpForNextRank, progressPercentage };
};


export const RankIcon = ({ rank, size = 'sm' }: { rank: any, size?: 'sm' | 'lg' }) => {
    let sizeClass = "h-4 w-4";
    if (size === 'lg') sizeClass = 'h-10 w-10';
    
    return React.cloneElement(rank.icon, {
      className: cn(
        sizeClass,
        rank.isRgb ? 'text-rgb-animate' : rank.color,
        rank.isLegend && 'text-legend-glow'
      )
    });
}

interface HeaderProps {
    siteTitle?: string;
    logoUrl?: string;
}

function RankDisplay({ xp }: { xp: number }) {
  const { currentRank, nextRank, progressPercentage } = getRankDetails(xp);
  const xpToNext = nextRank ? nextRank.minXp - xp : 0;
  
  return (
    <div className="px-2 py-1.5 text-sm">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <RankIcon rank={currentRank} size="sm" />
          <span className={cn("font-semibold", currentRank.isRgb ? 'text-rgb-animate' : currentRank.color, currentRank.isLegend && 'text-legend-glow')}>{currentRank.name}</span>
        </div>
        {nextRank && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
             <span className={cn("font-semibold", nextRank.isRgb ? 'text-rgb-animate' : nextRank.color, nextRank.isLegend && 'text-legend-glow')}>{nextRank.name}</span>
            <RankIcon rank={nextRank} size="sm" />
          </div>
        )}
      </div>
      {nextRank ? (
        <>
          <Progress value={progressPercentage} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            Earn {xpToNext.toLocaleString()} XP more to rank up.
          </p>
        </>
      ) : (
        <p className="text-xs text-amber-400 font-semibold text-center mt-2">
            Maximum Rank Achieved!
        </p>
      )}
    </div>
  )
}

export function Header({ siteTitle = 'TopUp Hub', logoUrl }: HeaderProps) {
  const { cartCount, openCart } = useCart();
  const { user, loading, logOut } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !loading) {
        const fetchProfile = async () => {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
        };
        fetchProfile();
        
        const interval = setInterval(fetchProfile, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    } else {
        setUserProfile(null);
    }
}, [user, loading]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      const products = await getProducts();
      setAllProducts(products);
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearchOpen(true);
    } else {
      setResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isAdmin = user?.email === 'admin@example.com';

  const handleSearchResultClick = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex h-14 items-center">
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-3/4 bg-background/50 backdrop-blur-sm"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            </SheetHeader>
             <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center space-x-2 pb-4 border-b">
                    {logoUrl ? (
                        <Image src={logoUrl} alt={`${siteTitle} Logo`} width={24} height={24} className="h-6 w-6 text-primary" />
                    ) : (
                        <Logo className="h-6 w-6 text-primary" />
                    )}
                    <span className="font-bold font-headline text-foreground whitespace-nowrap">
                    {siteTitle}
                    </span>
                </div>
                
                <div className="relative w-full">
                  <form onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${searchQuery}`); handleSearchResultClick(); }}>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t('Header.search')}
                        className="w-full rounded-lg bg-background/80 pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery) setIsSearchOpen(true)}}
                        autoFocus={false}
                      />
                       {isSearchOpen && searchResults.length > 0 && (
                          <div className="absolute top-full mt-2 w-full rounded-md border bg-card text-card-foreground shadow-lg z-50 max-h-60 overflow-y-auto">
                            <ul>
                              {searchResults.map(product => (
                                <li key={product.id}>
                                  <Link href={`/product/${product.id}`} className="block hover:bg-muted" onClick={handleSearchResultClick}>
                                    <div className="flex items-center gap-4 p-2">
                                      <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                      <div>
                                        <p className="text-sm font-medium">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </form>
                </div>


                <nav className="flex flex-col gap-4 mt-2">
                    <Link 
                    href="/" 
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t('Header.home')}
                    </Link>
                    <Link 
                    href="/products" 
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t('Header.products')}
                    </Link>
                    <Link 
                    href="/reviews" 
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t('Header.reviews')}
                    </Link>
                    <Link 
                    href="/about" 
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t('Header.about')}
                    </Link>
                    <Link 
                    href="/contact" 
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {t('Header.contact')}
                    </Link>
                </nav>

                {user && userProfile && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-lg bg-card hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Wallet Balance</p>
                            <p className="text-sm text-muted-foreground">{formatPrice(userProfile.walletBalance)}</p>
                        </div>
                      </div>
                    </Link>
                     <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 rounded-lg bg-card hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <Star className="h-6 w-6 text-accent" />
                        <div>
                            <p className="font-semibold">Valhalla Coins</p>
                            <p className="text-sm text-muted-foreground">{userProfile.valhallaCoins.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
                
                {!user && (
                    <div className="mt-auto pt-4 border-t">
                        <Button className="w-full" onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            {t('Header.login')}
                        </Button>
                    </div>
                )}
            </div>
          </SheetContent>
        </Sheet>


        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
             {logoUrl ? (
                <Image src={logoUrl} alt={`${siteTitle} Logo`} width={24} height={24} className="h-6 w-6 text-primary" />
             ) : (
                <Logo className="h-6 w-6 text-primary" />
             )}
            <span className="font-bold sm:inline-block font-headline text-foreground whitespace-nowrap">
              {siteTitle}
            </span>
          </Link>
           <nav className="hidden md:flex items-center gap-4 ml-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {t('Header.home')}
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {t('Header.products')}
            </Link>
             <Link href="/reviews" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {t('Header.reviews')}
            </Link>
             <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {t('Header.about')}
            </Link>
             <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {t('Header.contact')}
            </Link>
            </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end">
          <div className="relative hidden md:block w-full max-w-sm" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${searchQuery}`); handleSearchResultClick(); }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('Header.search')}
                  className="w-full rounded-lg bg-background/50 pl-8 md:w-[200px] lg:w-[320px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if(searchQuery) setIsSearchOpen(true)}}
                />
                 {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full rounded-md border bg-card text-card-foreground shadow-lg z-50 max-h-96 overflow-y-auto">
                    <ul>
                      {searchResults.map(product => (
                        <li key={product.id}>
                          <Link href={`/product/${product.id}`} className="block hover:bg-muted" onClick={handleSearchResultClick}>
                            <div className="flex items-center gap-4 p-2">
                               <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                               <div>
                                 <p className="text-sm font-medium">{product.name}</p>
                                 <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                               </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {user && userProfile && (
              <Link href="/account" className="hidden md:flex items-center gap-2 border border-border rounded-md px-3 h-10 transition-colors hover:bg-muted">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{formatPrice(userProfile.walletBalance)}</span>
              </Link>
            )}

            <CurrencySwitcher />
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
            <CartPanel />
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userProfile && (
                    <>
                      <div className="px-2 py-1.5 space-y-2">
                        <div className="flex items-center gap-2 text-sm w-full">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Wallet:</span>
                            <span className="font-semibold ml-auto">{formatPrice(userProfile.walletBalance)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm w-full">
                            <Star className="h-4 w-4 text-accent" />
                            <span className="text-muted-foreground">Coins:</span>
                            <span className="font-semibold ml-auto">{userProfile.valhallaCoins.toLocaleString()}</span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <RankDisplay xp={userProfile.xp} />
                      <DropdownMenuSeparator />
                    </>
                  )}
                    <DropdownMenuItem onSelect={() => router.push('/account')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t('Header.account')}</span>
                    </DropdownMenuItem>
                     {isAdmin && (
                      <DropdownMenuItem onSelect={() => router.push('/admin')}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        <span>{t('Header.admin')}</span>
                      </DropdownMenuItem>
                    )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    <span>{t('Header.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push('/login')} className="hidden md:inline-flex">
                <UserIcon className="mr-2 h-4 w-4" />
                {t('Header.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
