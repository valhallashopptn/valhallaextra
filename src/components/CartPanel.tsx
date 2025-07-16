
'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, CreditCard, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from './ui/scroll-area';

export function CartPanel() {
  const {
    cartItems,
    removeFromCart,
    cartTotal,
    isCartOpen,
    closeCart,
  } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Sheet open={isCartOpen} onOpenChange={(isOpen) => !isOpen && closeCart()}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartItems.length})</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
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
              <div className="flex flex-col gap-6 p-6 pr-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                      data-ai-hint={item.dataAiHint}
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-primary font-bold">
                        {formatPrice(item.price)}
                      </p>
                      {item.customFieldData && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(item.customFieldData).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{' '}
                                {value}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="bg-background border-t p-6 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full" size="lg">
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
