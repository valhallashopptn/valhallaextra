
'use client';

import { useEffect, useState } from 'react';
import type { Review, Product } from '@/lib/types';
import { getAllReviews } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveReviewDialog } from './LeaveReviewDialog';
import Image from 'next/image';

function StarRating({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) {
  const starClasses = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
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

function AverageRatingDisplay({ rating, count }: { rating: number, count: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-background px-4 py-2">
       <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn('h-5 w-5', i < Math.round(rating) ? 'text-accent fill-current' : 'text-muted-foreground/50')} />
        ))}
      </div>
      <span className="text-lg font-bold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground">from {count} reviews</span>
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await getAllReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast({ title: 'Error', description: 'Could not load reviews.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [toast]);

  const onReviewSubmitted = () => {
    fetchReviews();
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-12">
      <div className="bg-muted -mx-4 md:-mx-6 lg:-mx-8 -mt-8 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
            Customer Reviews
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            See what our community is saying about their experience.
            </p>
            {loading ? (
                <Skeleton className="h-12 w-80 mx-auto" />
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <AverageRatingDisplay rating={averageRating} count={reviews.length} />
                    <LeaveReviewDialog onReviewSubmitted={onReviewSubmitted} />
                </div>
            )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-8 w-40" />
                    </CardContent>
                </Card>
            ))
        ) : (
            reviews.map(review => (
            <Card key={review.id} className="flex flex-col">
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                          <AvatarFallback>{review.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-semibold text-lg">{review.userEmail.split('@')[0]}</p>
                          <StarRating rating={review.rating} size="sm" />
                      </div>
                  </div>
                  <blockquote className="mt-4 text-muted-foreground flex-grow">
                      &quot;{review.comment}&quot;
                  </blockquote>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link href={`/product/${review.productId}`} className="flex items-center gap-2 group">
                      <Image src={review.productImage || 'https://placehold.co/32x32.png'} alt={review.productName} width={32} height={32} className="rounded-sm object-cover" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Review for: {review.productName}
                      </span>
                    </Link>
                  </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
