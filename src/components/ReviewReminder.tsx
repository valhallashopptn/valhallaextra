
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrdersForUser } from '@/services/orderService';
import { getReviewsForProduct } from '@/services/reviewService';
import { getUserProfile, markReviewPrompted } from '@/services/walletService';
import type { Order, UserProfile } from '@/lib/types';
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
      
      const userProfile = await getUserProfile(user.uid);
      if (!userProfile) return;

      const userOrders = await getOrdersForUser(user.uid);
      
      const mostRecentCompletedOrder = userOrders
        .filter(o => o.status === 'completed')
        .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())[0];

      if (!mostRecentCompletedOrder) return;

      const alreadyPrompted = userProfile.reviewPromptedOrderIds?.includes(mostRecentCompletedOrder.id);
      if (alreadyPrompted) return;
      
      const productToReview = mostRecentCompletedOrder.items[0];
      if (!productToReview) return;
      
      const reviews = await getReviewsForProduct(productToReview.id);
      const hasReviewed = reviews.some(review => 
        review.userId === user.uid && review.createdAt.toDate() > mostRecentCompletedOrder.createdAt.toDate()
      );

      if (!hasReviewed) {
        setLastOrder(mostRecentCompletedOrder);
        setTimeout(() => setShowDialog(true), 3000);
      }
    };

    checkLastOrder();
  }, [user]);

  const handleDismiss = () => {
    if (lastOrder && user) {
      markReviewPrompted(user.uid, lastOrder.id);
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
