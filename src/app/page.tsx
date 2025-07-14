'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsFromDb = await getProducts();
        setProducts(productsFromDb);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
          Game Top-Ups
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
          Instantly top up your favorite games. Fast, secure, and reliable service.
        </p>
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
          products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
