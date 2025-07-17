
'use client';

import type { Product, Category } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getCategoryById } from '@/services/categoryService';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (product.categoryId) {
      getCategoryById(product.categoryId).then(setCategory);
    }
  }, [product.categoryId]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    const productWithCategory = { ...product, category: category || undefined };
    addToCart(productWithCategory, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const shortDescription = product.description.length > 80 
    ? product.description.substring(0, 80) + '...'
    : product.description;

  return (
    <Link href={`/product/${product.id}`} className="flex h-full">
      <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 w-full">
        <CardContent className="p-4 flex flex-col flex-grow">
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{product.name}</h3>
            <Badge variant="outline">Digital</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{shortDescription}</p>

          <div className="aspect-video relative rounded-md overflow-hidden my-4">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>

          <div className="mt-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
            <Button onClick={handleAddToCart} disabled={isAdded || product.stock === 0 || !category} className={cn("w-36 transition-all", {
              'bg-green-600': isAdded,
            })}>
              {product.stock === 0 ? 'Out of Stock' : isAdded ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 animate-in fade-in" />
                  {t('ProductCard.added')}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t('ProductCard.addToCart')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
