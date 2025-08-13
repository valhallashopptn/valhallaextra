
'use client';

import type { Product, Review } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, CheckCircle, ArrowRight, Star, Heart } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getReviewsForProduct } from '@/services/reviewService';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface ProductCardProps {
  product: Product;
}

function StarRating({ rating, size = 'sm' }: { rating: number, size?: 'sm' | 'md' }) {
  const starClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(starClasses, i < Math.round(rating) ? 'text-accent fill-current' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
        try {
            const productReviews = await getReviewsForProduct(product.id);
            setReviews(productReviews);
        } catch (error) {
            console.error("Failed to fetch reviews for product card", error);
        } finally {
            setLoadingReviews(false);
        }
    };
    fetchReviews();
  }, [product.id]);

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

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);
  
  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };
  
  const handleBuyNowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };


  return (
    <Card className={cn(
      "group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:-translate-y-1 w-full"
      )}>
      <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`} className="block">
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
        </Link>
        
        <div className="mt-2 md:mt-4 flex flex-col flex-grow">
          <Link href={`/product/${product.id}`} className="block flex-grow">
              <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors pr-2">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs md:text-xs flex-shrink-0">{product.categoryName}</Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 flex-grow">{shortDescription}</p>
          </Link>
        </div>
        
        <div className="mt-auto pt-2 md:pt-4 space-y-2 md:space-y-3">
           {loadingReviews ? (
              <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
           ) : reviews.length > 0 ? (
              <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} />
                  <span className="text-xs text-muted-foreground">({reviews.length})</span>
              </div>
           ) : (
              <div className="flex items-center gap-2">
                  <StarRating rating={0} />
                  <span className="text-xs text-muted-foreground">(0)</span>
              </div>
           )}
           <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                    <p className="text-base md:text-xl font-bold text-primary">
                        {product.variants && product.variants.length > 0 ? "From " : ""}{formatPrice(displayPrice)}
                    </p>
                    {originalPrice && (
                        <>
                        <Separator orientation="vertical" className="h-4" />
                        <p className="text-sm md:text-base text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                        </p>
                        </>
                    )}
                </div>
              <div className="flex items-center gap-2">
                  <Button asChild variant="default" size="sm" className="w-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-9 text-xs md:text-sm">
                      <Link href={`/product/${product.id}`} onClick={handleBuyNowClick}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Buy Now
                      </Link>
                  </Button>
                  <Button name="wishlist" onClick={handleWishlistClick} variant="outline" size="icon" className="flex-shrink-0 h-9 w-9">
                      <Heart className={cn("h-4 w-4", isWishlisted && "text-primary fill-current")} />
                  </Button>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
