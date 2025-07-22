
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function OrderConfirmationDialog({ isOpen, onOpenChange }: OrderConfirmationDialogProps) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      router.push('/');
    }
  };
  
  const handleLinkClick = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center text-center p-6">
            <CheckCircle2 className="h-24 w-24 text-primary animate-in zoom-in duration-500" />
            <DialogHeader className="mt-6 text-center">
              <DialogTitle className="text-2xl font-bold tracking-tight text-primary font-headline">
                  Thank You For Your Order!
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                  Your purchase is complete. If you have any questions, please check your order history or contact support.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                <Button asChild onClick={handleLinkClick}>
                    <Link href="/account">View Order History</Link>
                </Button>
                <Button asChild variant="secondary" onClick={handleLinkClick}>
                    <Link href="/reviews">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Leave a Review
                    </Link>
                </Button>
                <Button asChild variant="outline" onClick={handleLinkClick}>
                    <Link href="/">
                       <Home className="mr-2 h-4 w-4" />
                       Continue Shopping
                    </Link>
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
