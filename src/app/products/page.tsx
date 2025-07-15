
'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import type { Product, Category } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PageWrapper } from '@/components/PageWrapper';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!selectedCategory) {
      return products;
    }
    return products.filter(p => p.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="space-y-12">
      <div className="bg-background py-12">
        <PageWrapper>
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
                Game Top-Ups
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
                Instantly top up your favorite games. Fast, secure, and reliable service.
              </p>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex w-max space-x-2 pb-4 justify-center">
                <Button
                    variant={!selectedCategory ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full"
                  >
                    All
                  </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </PageWrapper>
      </div>

      <div className="bg-card py-12">
        <PageWrapper>
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
        </PageWrapper>
      </div>
    </div>
  );
}
