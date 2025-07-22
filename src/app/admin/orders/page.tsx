
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllOrders, updateOrderStatus, deliverOrderManually, attemptAutoDelivery } from '@/services/orderService';
import { refundToWallet } from '@/services/walletService';
import type { Order } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCurrency } from '@/context/CurrencyContext';
import { KeySquare, Truck, Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


type OrderStatus = 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid';

const deliveryFormSchema = z.object({
  type: z.string().min(2, { message: 'Please provide a type for the delivery (e.g., Game Key, Account Info).' }),
  data: z.string().min(5, { message: 'Please provide the delivery data (key, credentials, etc.).' }),
  extraInfo: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

function DeliveryForm({ onSubmit, onCancel }: { onSubmit: (data: DeliveryFormData) => void; onCancel: () => void; }) {
    const form = useForm<DeliveryFormData>({
        resolver: zodResolver(deliveryFormSchema),
        defaultValues: { type: '', data: '', extraInfo: '' }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Delivery Type</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Game Key, Account Login" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Delivery Data</FormLabel>
                        <FormControl>
                            <Textarea placeholder="The key, username/password, or other main data." {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="extraInfo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Extra Info (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., instructions, recovery codes" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Delivering...' : 'Deliver to Customer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const { formatPrice, convertPrice, currency: currentDisplayCurrency } = useCurrency();


  const formatOrderPrice = (total: number, orderCurrency: 'TND' | 'USD') => {
    let displayTotal = total;
    if (currentDisplayCurrency === 'TND') {
      displayTotal = convertPrice(total);
    }
    return formatPrice(displayTotal, currentDisplayCurrency, true);
  }

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({ title: 'Error', description: 'Could not load orders.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    const { id: orderId, userId, total, currency } = order;
    try {
      if (status === 'refunded') {
        const refundAmount = total; 
        await refundToWallet(userId, refundAmount, orderId);
        toast({ title: 'Success', description: `Order refunded. ${formatOrderPrice(total, currency)} credited to user wallet.` });
      } else {
        await updateOrderStatus(orderId, status);
        toast({ title: 'Success', description: 'Order status updated successfully.' });
        if (status === 'paid') {
            await handleAutoDelivery(order);
        }
      }
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      toast({ title: 'Error', description: error.message || 'Failed to update order status.', variant: 'destructive' });
    }
  };

  const handleAutoDelivery = async (order: Order) => {
     try {
        const result = await attemptAutoDelivery(order.id);
        if (result.delivered) {
            toast({
                title: 'Auto-Delivery Successful',
                description: `Order ${order.id.substring(0,8)} was automatically delivered.`,
            });
            fetchOrders();
        }
     } catch(error: any) {
        toast({
            title: 'Auto-Delivery Failed',
            description: error.message || 'An unexpected error occurred during auto-delivery.',
            variant: 'destructive',
        });
     }
  }
  
  const handleDeliverySubmit = async (data: DeliveryFormData) => {
    if (!deliveringOrder) return;
    try {
        await deliverOrderManually(deliveringOrder.id, data);
        toast({ title: 'Success', description: 'Order delivered successfully.' });
        setDeliveringOrder(null);
        fetchOrders();
    } catch (error: any) {
        console.error("Failed to deliver order:", error);
        toast({ title: 'Error', description: error.message || 'Failed to deliver order.', variant: 'destructive' });
    }
  }

  const isOrderDeliverable = (order: Order): boolean => {
    return order.status === 'paid';
  };
  
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
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Order Management</h1>
          <p className="text-muted-foreground">A list of all orders placed on the platform.</p>
        </div>

        <Card>
          <CardHeader className="p-6">
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Review all customer purchases.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-28" /></TableCell>
                      </TableRow>
                  ))
                ) : orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{new Date(order.createdAt.toDate()).toLocaleDateString()}</TableCell>
                    <TableCell>{order.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant={'default'} className={cn('capitalize', getStatusBadgeClass(order.status))}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {order.items.map(item => (
                          <Badge key={item.id} variant='secondary'>
                            {item.name} (x{item.quantity})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatOrderPrice(order.total, order.currency)}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDeliveringOrder(order)}
                            disabled={!isOrderDeliverable(order) && order.status !== 'completed'}
                        >
                            <Truck className="mr-2 h-4 w-4" />
                            {order.deliveredAsset ? 'View Delivery' : 'Deliver'}
                        </Button>
                      <Select 
                        value={order.status}
                        onValueChange={(value: OrderStatus) => {
                            if (value === 'refunded') {
                                // Let the alert dialog handle the action
                                return;
                            }
                            handleStatusChange(order, value)
                        }}
                      >
                        <SelectTrigger className="w-[120px] inline-flex">
                            <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                      Refund
                                  </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will mark the order as refunded and credit {formatOrderPrice(order.total, order.currency)} to the customer's wallet. This action cannot be undone.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleStatusChange(order, 'refunded')}>
                                      Confirm Refund
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <Dialog open={!!deliveringOrder} onOpenChange={(isOpen) => !isOpen && setDeliveringOrder(null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{deliveringOrder?.deliveredAsset ? 'View Delivery Details' : 'Deliver Order Manually'}</DialogTitle>
                </DialogHeader>
                 {deliveringOrder?.deliveredAsset ? (
                     <div className="space-y-4 py-4">
                        <p><strong>Type:</strong> {deliveringOrder.deliveredAsset.type}</p>
                        <div>
                            <strong>Data:</strong>
                            <pre className="mt-1 font-mono text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{deliveringOrder.deliveredAsset.data}</pre>
                        </div>
                        {deliveringOrder.deliveredAsset.extraInfo && (
                            <div>
                                <strong>Extra Info:</strong>
                                <pre className="mt-1 font-mono text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{deliveringOrder.deliveredAsset.extraInfo}</pre>
                            </div>
                        )}
                        <Button onClick={() => setDeliveringOrder(null)}>Close</Button>
                     </div>
                 ) : (
                    <DeliveryForm
                        onSubmit={handleDeliverySubmit}
                        onCancel={() => setDeliveringOrder(null)}
                    />
                 )}
            </DialogContent>
        </Dialog>
    </>
  );
}

    
