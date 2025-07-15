
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCategories } from '@/services/categoryService';
import type { Category, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSetting } from '@/services/settingsService';

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.id}`}>
      <div className="flip-card aspect-[3/2] rounded-lg">
        <div className="flip-card-inner rounded-lg">
          <div className="flip-card-front overflow-hidden rounded-lg">
            <div className="relative h-full w-full">
              <Image
                src={category.imageUrl || 'https://placehold.co/300x200.png'}
                alt={category.name}
                fill
                className="object-cover"
                data-ai-hint="game category"
              />
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
              </div>
            </div>
          </div>
          <div className="flip-card-back overflow-hidden rounded-lg">
             <div className="relative h-full w-full">
                <Image
                    src={category.backImageUrl || 'https://placehold.co/300x200.png'}
                    alt={`${category.name} (back)`}
                    fill
                    className="object-cover"
                    data-ai-hint="game category alternative"
                />
                <div className="absolute inset-0 bg-black/60"></div>
                 <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center text-white">
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        <p className="text-sm mt-1">View Products</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesFromDb, productsFromDb, heroUrl] = await Promise.all([
            getCategories(),
            getProducts(),
            getSetting('heroImageUrl', 'https://placehold.co/1920x1080.png?text=TopUp+Hub')
        ]);
        setCategories(categoriesFromDb);
        setProducts(productsFromDb);
        setHeroImageUrl(heroUrl);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const featuredCategories = useMemo(() => categories.slice(0, 3), [categories]);

  const filteredProducts = useMemo(() => {
    let prods = products;
    if (searchQuery) {
        prods = prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.game.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory) {
        prods = prods.filter(p => p.categoryId === selectedCategory);
    }
    return prods.slice(0, 4); // Show only 4 products on homepage
  }, [products, searchQuery, selectedCategory]);


  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <>
            <Image 
              src={heroImageUrl}
              alt="Digital Marketplace"
              fill
              className="object-cover"
              data-ai-hint="dark abstract background"
              priority
            />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-headline">
                  Your Digital Marketplace
              </h1>
              <p className="mt-3 text-lg text-white/80 sm:text-xl max-w-2xl mx-auto">
                  Instant top-ups for your favorite games and digital products. Quick, secure, and reliable service at your fingertips.
              </p>
              <Button asChild size="lg" className="mt-8">
                  <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Main Content Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 md:space-y-24">
         {/* Browse by Category Section */}
         <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold font-headline">Browse by Category</h2>
                <Button variant="ghost" asChild>
                    <Link href="/products">
                        View All Categories <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))
                ) : (
                featuredCategories.map((category: Category) => (
                    <CategoryCard key={category.id} category={category} />
                ))
                )}
            </div>
        </div>

        {/* Our Products Section */}
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Our Products</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <div className="flex items-center gap-2 pb-2 justify-center">
                    <Button
                        variant={!selectedCategory ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                        className={cn("flex-shrink-0", !selectedCategory && "bg-primary text-primary-foreground")}
                    >
                        All
                    </Button>
                    {featuredCategories.map((category, index) => (
                        <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn("flex-shrink-0", selectedCategory === category.id && (index % 2 === 0 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"))}
                        >
                        {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[175px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                    </div>
                ))
                ) : (
                filteredProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
