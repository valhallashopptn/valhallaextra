
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '@/services/productService';
import { getReviewsForProduct, addReview } from '@/services/reviewService';
import type { Product, Review } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReviewForm } from './ReviewForm';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function StarRating({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' }) {
  const starClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(starClasses, i < Math.round(rating) ? 'text-primary fill-current' : 'text-muted-foreground/50')}
        />
      ))}
    </div>
  );
}


export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (typeof id !== 'string') return;
      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
            getProductById(id),
            getReviewsForProduct(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch product or reviews:', error);
        toast({ title: 'Error', description: 'Could not load product details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id, toast]);
  
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user || !product) {
      toast({ title: 'Error', description: 'You must be logged in to leave a review.', variant: 'destructive' });
      return;
    }
    
    try {
        await addReview(product.id, {
            userId: user.uid,
            userEmail: user.email || 'Anonymous',
            rating,
            comment,
        });
        const updatedReviews = await getReviewsForProduct(product.id);
        setReviews(updatedReviews);
        toast({ title: 'Success', description: 'Your review has been submitted!' });
    } catch (error) {
        console.error('Failed to submit review:', error);
        toast({ title: 'Error', description: 'Failed to submit your review.', variant: 'destructive' });
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);


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
    <div className="space-y-12">
      <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
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
                       <div className="mt-4 flex items-center gap-2">
                          <StarRating rating={averageRating} />
                          <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                        </div>
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

      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                        <StarRating rating={averageRating} />
                        <p className="text-muted-foreground">Based on {reviews.length} reviews</p>
                    </div>
                </div>
                <ReviewForm onSubmit={handleReviewSubmit} />
            </div>
        </CardHeader>
        <CardContent>
            {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                           <Avatar>
                                <AvatarFallback>{review.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{review.userEmail}</p>
                                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt.toDate()).toLocaleDateString()}</span>
                                </div>
                                <StarRating rating={review.rating} size="sm" />
                                <p className="mt-2 text-muted-foreground">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No reviews yet.</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
