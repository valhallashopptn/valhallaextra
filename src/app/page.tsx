
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

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.id}`} className="group relative block overflow-hidden rounded-lg">
        <Image
          src={category.imageUrl || 'https://placehold.co/300x200.png'}
          alt={category.name}
          width={300}
          height={200}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="game category"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex items-end p-4">
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
        </div>
    </Link>
  );
}


export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesFromDb, productsFromDb] = await Promise.all([
            getCategories(),
            getProducts()
        ]);
        setCategories(categoriesFromDb);
        setProducts(productsFromDb);
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
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <div className="relative -mx-4 -mt-8 h-96 overflow-hidden flex items-center justify-center text-center text-white">
        <Image 
            src="https://placehold.co/1920x1080.png" 
            alt="Digital Marketplace" 
            fill 
            className="object-cover"
            data-ai-hint="fantasy battle"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-2xl px-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-headline">
                Your Digital Marketplace
            </h1>
            <p className="mt-3 text-lg text-gray-300 sm:text-xl">
                Instant top-ups for your favorite games and digital products. Quick, secure, and reliable service at your fingertips.
            </p>
            <Button asChild size="lg" className="mt-8">
                <Link href="/products">Browse Products</Link>
            </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16 md:space-y-24">
         {/* Browse by Category Section */}
         <div className="space-y-6">
            <div className="text-center space-y-2">
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
                    <ScrollArea className="w-full md:w-auto whitespace-nowrap">
                        <div className="flex items-center gap-2 pb-2 justify-center">
                            <Button
                                variant={!selectedCategory ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-full flex-shrink-0"
                                >
                                All
                            </Button>
                            {featuredCategories.map(category => (
                                <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category.id)}
                                className="rounded-full flex-shrink-0"
                                >
                                {category.name}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
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
