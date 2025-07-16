
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addOrder } from '@/services/orderService';
import { getPaymentMethods } from '@/services/paymentMethodService';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import type { PaymentMethod, CartItem } from '@/lib/types';
import { Lock, Info, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

function CustomFieldInput({ item, field, value, onChange }: { item: CartItem; field: any; value: string; onChange: (itemId: string, fieldLabel: string, value: string) => void; }) {
  const [error, setError] = useState('');

  const validate = (val: string) => {
    if (!val) {
        setError('This field is required.');
        return false;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setError('Please enter a valid email.');
        return false;
    }
    if (field.type === 'number' && !/^\d+$/.test(val)) {
        setError('Please enter a valid number.');
        return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    validate(newValue);
    onChange(item.id, field.label, newValue);
  };
  
  // Initial validation
  useEffect(() => {
    validate(value);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${item.id}-${field.id}`}>{field.label}</Label>
      <Input
        id={`${item.id}-${field.id}`}
        type={field.type}
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, updateCartItemCustomData } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { currency, formatPrice } = useCurrency();
  const router = useRouter();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethodId(methods[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        toast({ title: 'Error', description: 'Could not load payment options.', variant: 'destructive' });
      }
    };
    fetchPaymentMethods();
  }, [toast]);

  const selectedMethod = useMemo(() => {
    return paymentMethods.find(method => method.id === selectedMethodId);
  }, [paymentMethods, selectedMethodId]);

  const taxAmount = useMemo(() => {
    if (!selectedMethod) return 0;
    return cartTotal * (selectedMethod.taxRate / 100);
  }, [cartTotal, selectedMethod]);

  const finalTotal = useMemo(() => {
    return cartTotal + taxAmount;
  }, [cartTotal, taxAmount]);

  const itemsWithCustomFields = useMemo(() => {
    return cartItems.filter(item => item.category?.customFields && item.category.customFields.length > 0);
  }, [cartItems]);

  const areAllCustomFieldsValid = useMemo(() => {
    return itemsWithCustomFields.every(item => 
        item.category?.customFields?.every(field => {
            const value = item.customFieldData?.[field.label];
            if (!value) return false;
             if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
            if (field.type === 'number' && !/^\d+$/.test(value)) return false;
            return true;
        })
    );
  }, [itemsWithCustomFields]);

  const handleCustomFieldChange = useCallback((itemId: string, fieldLabel: string, value: string) => {
    updateCartItemCustomData(itemId, fieldLabel, value);
  }, [updateCartItemCustomData]);

  const handleCheckout = async () => {
    if (!user) {
        router.push('/login?redirect=/checkout');
        return;
    }
    if (!selectedMethod) {
        toast({ title: 'Payment method required', description: 'Please select a payment method.', variant: 'destructive' });
        return;
    }
    if (!areAllCustomFieldsValid) {
        toast({ title: 'Information Required', description: 'Please fill out all required fields for your items.', variant: 'destructive' });
        return;
    }
    
    setIsPlacingOrder(true);
    try {
      await addOrder({
        userId: user.uid,
        userEmail: user.email || 'Anonymous',
        items: cartItems,
        subtotal: cartTotal,
        tax: taxAmount,
        total: finalTotal,
        currency: currency,
        paymentMethod: {
            name: selectedMethod.name,
            instructions: selectedMethod.instructions
        }
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
          <p className="text-muted-foreground mt-2">Complete your purchase by providing the necessary details.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
            {itemsWithCustomFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Required Information</CardTitle>
                        <CardDescription>Please provide the following details for your items.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {itemsWithCustomFields.map(item => (
                            <div key={item.id} className="p-4 border rounded-lg space-y-4">
                                <h3 className="font-semibold">{item.name}</h3>
                                {item.category?.customFields?.map(field => (
                                    <CustomFieldInput 
                                        key={field.id}
                                        item={item}
                                        field={field}
                                        value={item.customFieldData?.[field.label] || ''}
                                        onChange={handleCustomFieldChange}
                                    />
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred way to pay.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedMethodId ?? ''}
                onValueChange={setSelectedMethodId}
                className="space-y-4"
              >
                {paymentMethods.map(method => (
                  <Label key={method.id} htmlFor={method.id} className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <span className="ml-4 font-semibold">{method.name}</span>
                  </Label>
                ))}
              </RadioGroup>
              
              {paymentMethods.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No payment methods available. Please contact support.</p>
              )}

              {selectedMethod && (
                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>{selectedMethod.name} Instructions</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">
                    {selectedMethod.instructions}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
           <Card className="bg-muted/50 sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start space-x-4">
                     <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                     <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                       <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        {item.customFieldData && (
                            <div className="text-xs text-muted-foreground mt-1">
                            {Object.entries(item.customFieldData).map(([key, value]) => (
                                <div key={key} className="truncate">
                                <span className="font-medium">{key}:</span> {value}
                                </div>
                            ))}
                            </div>
                        )}
                     </div>
                     <p className="font-semibold text-right flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax ({selectedMethod?.taxRate ?? 0}%)</span>
                        <span>{formatPrice(taxAmount)}</span>
                    </div>
                </div>
                 <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </CardContent>
             <CardFooter className='flex-col items-stretch gap-4'>
                 <Button onClick={handleCheckout} className="w-full mt-2" size="lg" disabled={isPlacingOrder || !selectedMethod || !areAllCustomFieldsValid}>
                     <Lock className="mr-2 h-4 w-4" />
                    {isPlacingOrder ? 'Processing...' : `Place Order for ${formatPrice(finalTotal)}`}
                  </Button>
            </CardFooter>
           </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
