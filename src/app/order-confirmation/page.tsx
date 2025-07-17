
'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';

export default function OrderConfirmationPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-24 w-24 text-primary animate-in zoom-in duration-500" />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary font-headline">
          Thank You For Your Order!
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your purchase is complete. If you have any questions, please check your order history or contact support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/account">View Order History</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/reviews">
                <MessageSquare className="mr-2 h-4 w-4" />
                Leave a Review
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
