
'use client';

import Link from 'next/link';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck, Search, Menu } from 'lucide-react';
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
import { useEffect, useState, useRef } from 'react';
import { getProducts } from '@/services/productService';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Logo } from './icons/Logo';

interface HeaderProps {
    siteTitle?: string;
    logoUrl?: string;
}

export function Header({ siteTitle = 'TopUp Hub', logoUrl }: HeaderProps) {
  const { cartCount } = useCart();
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.game.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
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
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex h-14 items-center">
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-3/4 bg-slate-900/50 backdrop-blur-sm">
            <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            </SheetHeader>
             <div className="flex items-center space-x-2 pb-4 border-b">
                 {logoUrl ? (
                    <Image src={logoUrl} alt={`${siteTitle} Logo`} width={24} height={24} className="h-6 w-6 text-primary" />
                 ) : (
                    <Logo className="h-6 w-6 text-primary" />
                 )}
                <span className="font-bold font-headline text-foreground">
                  {siteTitle}
                </span>
            </div>
            <nav className="flex flex-col gap-4 mt-6">
                <Link 
                  href="/products" 
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                    Products
                </Link>
                 <Link 
                  href="/reviews" 
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reviews
                </Link>
                <Link 
                  href="/about" 
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                </Link>
                 <Link 
                  href="/contact" 
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                </Link>
            </nav>
          </SheetContent>
        </Sheet>


        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
             {logoUrl ? (
                <Image src={logoUrl} alt={`${siteTitle} Logo`} width={24} height={24} className="h-6 w-6 text-primary" />
             ) : (
                <Logo className="h-6 w-6 text-primary" />
             )}
            <span className="font-bold sm:inline-block font-headline text-foreground">
              {siteTitle}
            </span>
          </Link>
           <nav className="hidden md:flex items-center gap-4 ml-6">
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Products
            </Link>
             <Link href="/reviews" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Reviews
            </Link>
             <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                About Us
            </Link>
             <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Contact Us
            </Link>
            </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none" ref={searchRef}>
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
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
                                 <p className="text-xs text-muted-foreground">{product.game}</p>
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
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push('/cart')}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
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
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push('/account')}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                    <span>Account</span>
                  </DropdownMenuItem>
                   {isAdmin && (
                    <DropdownMenuItem onSelect={() => router.push('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                      <span>Admin</span>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/login')}>
              <UserIcon className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
