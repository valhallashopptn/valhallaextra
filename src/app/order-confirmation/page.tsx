'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <CheckCircle2 className="h-24 w-24 text-primary animate-in zoom-in duration-500" />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary font-headline">
        Thank You For Your Order!
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
        Your top-up is being processed and will be credited to your account shortly.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/account">View Order History</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
