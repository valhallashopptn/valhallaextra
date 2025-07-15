
'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import type { Product, Category } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsFromDb, categoriesFromDb] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsFromDb);
        setCategories(categoriesFromDb);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  
  const filteredProducts = useMemo(() => {
    let prods = products;
    if (searchQuery) {
        prods = prods.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.game.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (selectedCategory) {
      prods = prods.filter(p => p.categoryId === selectedCategory);
    }
    return prods;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      <div className="bg-card py-12">
        <PageWrapper>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              All Products
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Instantly top up your favorite games. Fast, secure, and reliable service.
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
         <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search products by name or game..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <ScrollArea className="w-full md:w-auto whitespace-nowrap">
                    <div className="flex items-center gap-2 pb-2 justify-start md:justify-center">
                        <Button
                            variant={!selectedCategory ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(null)}
                            className="rounded-full flex-shrink-0"
                        >
                            All
                        </Button>
                        {categories.map(category => (
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
                    <ScrollBar orientation="horizontal" className='md:hidden' />
                </ScrollArea>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
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
            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16 col-span-full">
                    <p className="text-xl font-semibold">No products found</p>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
         </div>
      </PageWrapper>
    </div>
  );
}
