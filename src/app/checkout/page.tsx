
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addOrder } from '@/services/orderService';
import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Lock } from 'lucide-react';

const checkoutFormSchema = z.object({
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), { message: "Card number must be 16 digits." }),
  expiryDate: z.string().refine((val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), { message: "Use MM/YY format." }),
  cvc: z.string().refine((val) => /^\d{3,4}$/.test(val), { message: "CVC must be 3 or 4 digits." }),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to proceed to checkout.',
        variant: 'destructive',
      });
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router, toast]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const handleCheckout = async (data: CheckoutFormData) => {
    if (!user) {
        // This should not happen due to the useEffect check, but as a safeguard.
        router.push('/login?redirect=/checkout');
        return;
    }
    
    setIsPlacingOrder(true);
    try {
      await addOrder({
        userId: user.uid,
        userEmail: user.email || 'Anonymous',
        items: cartItems,
        total: cartTotal,
      });

      clearCart();
      router.push('/order-confirmation');

    } catch (error) {
       toast({
        title: 'Order Failed',
        description: 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
       console.error("Failed to place order:", error);
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (authLoading || !user) {
    return <PageWrapper><div className="text-center">Loading...</div></PageWrapper>;
  }

  if (cartItems.length === 0) {
     return (
        <PageWrapper>
            <div className="text-center">
                <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
                <p className="mt-2 text-muted-foreground">Add some products before you can checkout.</p>
                <Button asChild className="mt-6">
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        </PageWrapper>
     )
  }

  return (
    <PageWrapper>
      <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-headline">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase by providing payment details.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your card information. This is a mock form.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isPlacingOrder}>
                     <Lock className="mr-2 h-4 w-4" />
                    {isPlacingOrder ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
           <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-4">
                     <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                     <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                       <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                     </div>
                     <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
           </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
