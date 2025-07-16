
'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, CreditCard, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from './ui/scroll-area';

function CartItem({ item }: { item: import('@/lib/types').CartItem }) {
  const { formatPrice } = useCurrency();
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    } else {
      removeFromCart(item.id);
    }
  };
  
  return (
    <div className="flex items-start space-x-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          data-ai-hint={item.dataAiHint}
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold text-base">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(item.price)}
            </p>
          </div>
          <p className="font-semibold text-base">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-md">
                <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(-1)}
                >
                <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(1)}
                >
                <Plus className="h-4 w-4" />
                </Button>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeFromCart(item.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}

export function CartPanel() {
  const {
    cartItems,
    cartTotal,
    isCartOpen,
    closeCart,
  } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Sheet open={isCartOpen} onOpenChange={(isOpen) => !isOpen && closeCart()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-2xl font-bold">Your Order</SheetTitle>
          <SheetDescription>
            Review your items and proceed to payment.
          </SheetDescription>
        </SheetHeader>
        <Separator />

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center px-6">
            <ShoppingBag className="h-24 w-24 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Your Cart is Empty</h3>
            <p className="text-muted-foreground">
              Looks like you haven't added anything yet.
            </p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="bg-background border-t p-6 space-y-4">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal</span>
                </div>
                <Separator />
                <div className="flex justify-end items-center">
                  <span className="text-2xl text-primary font-bold">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
