'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOrdersForUser } from '@/services/orderService';
import type { Order } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setOrdersLoading(true);
        const userOrders = await getOrdersForUser(user.uid);
        setOrders(userOrders);
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading || !user) {
    return <div className="text-center container mx-auto px-4 py-8">Loading account details...</div>;
  }

  return (
    <div className="space-y-8 container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Account</h1>
        <p className="text-muted-foreground">Manage your account and view your order history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
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
                        <div className="flex justify-between w-full pr-4">
                          <span>Order #{order.id.substring(0, 8)}</span>
                          <span className="text-muted-foreground">{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
                           <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                              <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-end font-bold">
                            <p>Total: ${order.total.toFixed(2)}</p>
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
  );
}
