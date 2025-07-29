
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrdersForUser } from '@/services/orderService';
import { getReviewsForProduct } from '@/services/reviewService';
import type { Order, Product } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function ReviewReminder() {
  const { user } = useAuth();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkLastOrder = async () => {
      if (!user) return;

      const userOrders = await getOrdersForUser(user.uid);
      
      // Find the most recent 'completed' order
      const mostRecentCompletedOrder = userOrders
        .filter(o => o.status === 'completed')
        .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())[0];

      if (!mostRecentCompletedOrder) return;

      // Check if the user has already been prompted for this order
      const dismissed = localStorage.getItem(`review_prompt_dismissed_${mostRecentCompletedOrder.id}`);
      if (dismissed) return;
      
      // For simplicity, we'll prompt for a review on the first item in the order.
      // A more complex system could check all items.
      const productToReview = mostRecentCompletedOrder.items[0];
      if (!productToReview) return;
      
      // Check if the user has already reviewed this product since the order was placed
      const reviews = await getReviewsForProduct(productToReview.id);
      const hasReviewed = reviews.some(review => 
        review.userId === user.uid && review.createdAt.toDate() > mostRecentCompletedOrder.createdAt.toDate()
      );

      if (!hasReviewed) {
        setLastOrder(mostRecentCompletedOrder);
        // Delay showing the dialog slightly to not be too intrusive on page load
        setTimeout(() => setShowDialog(true), 3000);
      }
    };

    checkLastOrder();
  }, [user]);

  const handleDismiss = () => {
    if (lastOrder) {
      localStorage.setItem(`review_prompt_dismissed_${lastOrder.id}`, 'true');
    }
    setShowDialog(false);
  };
  
  const handleReviewClick = () => {
    handleDismiss();
  };

  if (!showDialog || !lastOrder) {
    return null;
  }
  
  const productToReview = lastOrder.items[0];

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent onEscapeKeyDown={handleDismiss}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">How was your experience?</DialogTitle>
          <DialogDescription className="text-center">
            Your feedback helps us and other customers. Please consider leaving a review for your recent purchase.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-4">
            <Image 
                src={productToReview.imageUrl}
                alt={productToReview.name}
                width={100}
                height={100}
                className="rounded-lg border-2 border-primary"
                data-ai-hint={productToReview.dataAiHint}
            />
            <p className="font-semibold text-lg">{productToReview.name}</p>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
            <Button variant="ghost" onClick={handleDismiss}>
                <X className="mr-2 h-4 w-4" />
                Maybe Later
            </Button>
            <Button asChild onClick={handleReviewClick}>
                <Link href={`/product/${productToReview.id}#reviews`}>
                    <Star className="mr-2 h-4 w-4" />
                    Leave a Review
                </Link>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

