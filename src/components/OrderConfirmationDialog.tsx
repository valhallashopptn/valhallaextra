
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function OrderConfirmationDialog({ isOpen, onOpenChange }: OrderConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
            <CheckCircle2 className="h-24 w-24 text-primary animate-in zoom-in duration-500" />
            <DialogTitle className="mt-6 text-2xl font-bold tracking-tight text-primary font-headline">
                Thank You For Your Order!
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-2xl mx-auto text-lg">
                Your purchase is complete. If you have any questions, please check your order history or contact support.
            </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2">
            <Button asChild onClick={() => onOpenChange(false)}>
                <Link href="/account">View Order History</Link>
            </Button>
            <Button asChild variant="secondary" onClick={() => onOpenChange(false)}>
                <Link href="/reviews">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Leave a Review
                </Link>
            </Button>
            <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
                <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
