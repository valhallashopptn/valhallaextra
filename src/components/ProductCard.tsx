
'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Link href={`/product/${product.id}`} className="flex">
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 w-full">
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <p className="text-sm text-muted-foreground">{product.game}</p>
          <CardTitle className="text-lg font-semibold mt-1">{product.name}</CardTitle>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
          <Button onClick={handleAddToCart} disabled={isAdded || product.stock === 0} className={cn("w-36 transition-all", {
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
        </CardFooter>
      </Card>
    </Link>
  );
}
