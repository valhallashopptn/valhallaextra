'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '@/services/productService';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof id !== 'string') return;
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };


  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <Skeleton className="aspect-video rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="mt-2 text-muted-foreground">The product you are looking for does not exist.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-video relative">
                <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.dataAiHint}
                />
            </div>

            <div className="p-8 flex flex-col">
                <div className='flex-grow'>
                    <p className="text-sm font-medium text-muted-foreground">{product.game}</p>
                    <h1 className="text-4xl font-bold mt-2 font-headline">{product.name}</h1>
                    <p className="text-4xl font-bold text-primary mt-6">${product.price.toFixed(2)}</p>
                </div>
                
                <div className="mt-8">
                    <Button onClick={handleAddToCart} disabled={isAdded} size="lg" className={cn("w-full md:w-auto transition-all", {
                        'bg-green-600': isAdded,
                    })}>
                         {isAdded ? (
                            <>
                            <CheckCircle className="mr-2 h-5 w-5 animate-in fade-in" />
                            Added to Cart
                            </>
                        ) : (
                            <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    </Card>
  );
}
