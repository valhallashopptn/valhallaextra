
'use client';

import type { Product, Category } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, CheckCircle, ArrowRight, Star } from 'lucide-react';
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

  const shortDescription = product.description.length > 80 
    ? product.description.substring(0, 80) + '...'
    : product.description;

  const hasDiscount = (product.discountPrice && product.discountPrice > 0) || (product.variants && product.variants.some(v => v.discountPrice && v.discountPrice > 0));
  
  const displayPrice = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
        const lowestPrice = Math.min(...product.variants.map(v => (v.discountPrice && v.discountPrice > 0) ? v.discountPrice : v.price));
        return lowestPrice;
    }
    return hasDiscount ? product.discountPrice! : product.price;
  }, [product, hasDiscount]);
  
  const originalPrice = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
        const lowestVariant = product.variants.reduce((min, v) => (((v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price) < ((min.discountPrice && min.discountPrice > 0 ? min.discountPrice : min.price))) ? v : min), product.variants[0]);
        if(lowestVariant.discountPrice && lowestVariant.discountPrice > 0) return lowestVariant.price;
        return null;
    }
    return hasDiscount ? product.price : null;
  }, [product, hasDiscount]);

  const priceLabel = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
        return "From ";
    }
    return "";
  }, [product]);

  return (
    <Link href={`/product/${product.id}`} className="flex h-full">
      <Card className={cn(
        "group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:-translate-y-1 w-full"
        )}>
        <CardContent className="p-4 flex flex-col flex-grow min-h-[380px]">
          <div className="mb-4">
             <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors pr-2">{product.name}</h3>
                <Badge variant="secondary" className="flex-shrink-0">{product.categoryName}</Badge>
             </div>
            <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{shortDescription}</p>
          </div>

          <div className="mt-auto flex-grow">
              <div className="aspect-[3/2] relative rounded-md overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={product.dataAiHint || product.categoryName}
                />
                {hasDiscount && (
                    <div className="sale-ribbon-wrapper">
                        <div className="sale-ribbon">Sale</div>
                    </div>
                )}
              </div>
          </div>
          
          <div className="mt-auto flex justify-between items-end pt-4">
             <div className="flex flex-col items-start">
                 <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-primary">
                        <span className="text-xl font-bold text-foreground">{priceLabel}</span>
                        {formatPrice(displayPrice)}
                    </p>
                    {originalPrice && (
                        <p className="text-base text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                        </p>
                    )}
                 </div>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
