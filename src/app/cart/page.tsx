
'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  if (cartItems.length === 0) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">Your Cart is Empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.game}</p>
                      <p className="text-sm text-primary font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p>Qty: {item.quantity}</p>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className='text-primary'>{formatPrice(cartTotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/checkout">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
