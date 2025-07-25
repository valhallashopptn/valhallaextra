
'use client';

import type { Product, Category } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  useEffect(() => {
    if (product.categoryId) {
      setIsLoadingCategory(false);
    } else {
        setIsLoadingCategory(false);
    }
  }, [product.categoryId]);

  const shortDescription = product.description.length > 80 
    ? product.description.substring(0, 80) + '...'
    : product.description;

  const displayPrice = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
        const lowestPrice = Math.min(...product.variants.map(v => v.price));
        return lowestPrice;
    }
    return product.price;
  }, [product]);
  
  const priceLabel = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
        return "From";
    }
    return "Price";
  }, [product]);

  return (
    <Link href={`/product/${product.id}`} className="flex h-full">
      <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:-translate-y-1 w-full">
        <CardContent className="p-4 flex flex-col flex-grow">
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{product.name}</h3>
            <Badge variant="outline">Digital</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{shortDescription}</p>

          <div className="aspect-video relative rounded-md overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint || product.categoryName}
            />
          </div>

          <div className="mt-auto flex justify-between items-center pt-4">
            <div>
              <p className="text-sm text-muted-foreground">{priceLabel}</p>
              <p className="text-xl font-bold text-primary">{formatPrice(displayPrice)}</p>
            </div>
            <Button 
              variant="outline"
              disabled={product.stock === 0 || isLoadingCategory} 
              className="w-36 transition-all"
            >
              {product.stock === 0 ? 'Out of Stock' : isLoadingCategory ? 'Loading...' : (
                <>
                  View Details
                  <ArrowRight className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
