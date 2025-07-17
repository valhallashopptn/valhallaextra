
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOrdersForUser } from '@/services/orderService';
import { getUserWalletBalance } from '@/services/walletService';
import type { Order } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { PageWrapper } from '@/components/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

type OrderStatus = 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid';

export default function AccountPage() {
  const { user, loading, logOut } = useAuth();
  const { formatPrice: formatCurrency, convertPrice, currency: currentDisplayCurrency } = useCurrency();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchAccountData = async () => {
      if (user) {
        setOrdersLoading(true);
        const [userOrders, balance] = await Promise.all([
            getOrdersForUser(user.uid),
            getUserWalletBalance(user.uid)
        ]);
        setOrders(userOrders);
        setWalletBalance(balance);
        setOrdersLoading(false);
      }
    };
    fetchAccountData();
  }, [user]);
  
  const formatOrderPrice = (total: number, orderCurrency: 'TND' | 'USD') => {
    // Orders are stored in USD. We need to display them in the user's selected currency.
    let displayTotal = total;
    if (currentDisplayCurrency === 'TND') {
      displayTotal = convertPrice(total);
    }
    return formatCurrency(displayTotal, currentDisplayCurrency, true);
  }

  const formatItemPrice = (price: number, quantity: number, orderCurrency: 'TND' | 'USD') => {
    let displayPrice = price * quantity;
    if (currentDisplayCurrency === 'TND') {
        displayPrice = convertPrice(price) * quantity;
    }
    return formatCurrency(displayPrice, currentDisplayCurrency, true);
  }

  if (loading || !user) {
    return <div className="text-center container mx-auto px-4 py-8">Loading account details...</div>;
  }

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'paid':
        return 'bg-blue-600';
      case 'pending':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-600';
      case 'refunded':
        return 'bg-purple-600';
      default:
        return 'bg-gray-500';
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Account</h1>
          <p className="text-muted-foreground">Manage your account and view your order history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="destructive" className='w-full' onClick={logOut}>Log Out</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                    {walletBalance !== null ? formatCurrency(walletBalance) : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                    Your available credit for purchases.
                </p>
              </CardContent>
            </Card>

          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Review your past purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">Loading your orders...</div>
                ) : orders.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {orders.map(order => (
                      <AccordionItem value={order.id} key={order.id}>
                        <AccordionTrigger>
                          <div className="flex justify-between items-center w-full pr-4">
                            <span>Order #{order.id.substring(0, 8)}</span>
                            <span className="text-muted-foreground">{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
                            <Badge variant={'default'} className={cn('capitalize', getStatusBadgeClass(order.status))}>
                                {order.status}
                            </Badge>
                            <span className="font-bold text-primary">{formatOrderPrice(order.total, order.currency)}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {order.items.map((item, index) => (
                              <div key={item.id + index} className="flex items-center space-x-4">
                                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                                <div className="flex-grow">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                   {item.customFieldData && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {Object.entries(item.customFieldData).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="font-medium">{key}:</span> {value}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="font-semibold">{formatItemPrice(item.price, item.quantity, order.currency)}</p>
                              </div>
                            ))}
                            <Separator />
                            <div className="text-sm text-muted-foreground space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatOrderPrice(order.subtotal, order.currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>{formatOrderPrice(order.tax, order.currency)}</span>
                                </div>
                                {order.walletDeduction > 0 && (
                                     <div className="flex justify-between text-primary">
                                        <span>Wallet Credit:</span>
                                        <span>-{formatOrderPrice(order.walletDeduction, order.currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-foreground">
                                    <span>Total Paid:</span>
                                    <span>{formatOrderPrice(order.total, order.currency)}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold">Payment Method: {order.paymentMethod?.name || 'N/A'}</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{order.paymentMethod?.instructions}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground text-center py-8">You have no past orders.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
