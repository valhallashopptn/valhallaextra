

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCurrency } from '@/context/CurrencyContext';
import { KeySquare, Truck, Bot, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';


type OrderStatus = 'pending' | 'completed' | 'canceled' | 'refunded' | 'paid';

const deliveryFormSchema = z.object({
  data: z.string().min(5, { message: 'Please provide the delivery data (key, credentials, etc.).' }),
  extraInfo: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

function DeliveryForm({ onSubmit, onCancel }: { onSubmit: (data: DeliveryFormData) => void; onCancel: () => void; }) {
    const form = useForm<DeliveryFormData>({
        resolver: zodResolver(deliveryFormSchema),
        defaultValues: { data: '', extraInfo: '' }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
   const formatItemPrice = (price: number, quantity: number, orderCurrency: 'TND' | 'USD') => {
    let displayPrice = price * quantity;
    if (currentDisplayCurrency === 'TND') {
        displayPrice = convertPrice(price) * quantity;
    }
    return formatPrice(displayPrice, currentDisplayCurrency, true);
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
    const { id: orderId, userId, subtotal, currency } = order;
    try {
      if (status === 'refunded') {
        const refundAmount = subtotal; 
        await refundToWallet(userId, refundAmount, orderId);
        toast({ title: 'Success', description: `Order refunded. ${formatOrderPrice(refundAmount, currency)} credited to user wallet.` });
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
    return order.status === 'paid' || order.status === 'pending';
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
            {loading ? (
                 <div className="p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full mb-2" />
                    ))}
                 </div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {orders.map(order => (
                        <AccordionItem value={order.id} key={order.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="grid grid-cols-5 md:grid-cols-6 gap-4 items-center w-full text-sm px-4 text-left">
                                    <span className="font-medium truncate col-span-2 md:col-span-1">#{order.id.substring(0, 8)}</span>
                                    <span className="hidden md:block truncate">{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
                                    <span className="truncate">{order.userEmail}</span>
                                    <span>
                                        <Badge variant={'default'} className={cn('capitalize', getStatusBadgeClass(order.status))}>
                                            {order.status}
                                        </Badge>
                                    </span>
                                    <span className="font-bold text-primary text-right">{formatOrderPrice(order.total, order.currency)}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 mr-4" />
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="bg-muted/50 p-4 space-y-4">
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
                                            <p className="font-semibold min-w-[80px] text-right">{formatItemPrice(item.price, item.quantity, order.currency)}</p>
                                        </div>
                                    ))}
                                    <Separator />
                                     <div className="text-sm text-muted-foreground space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatOrderPrice(order.subtotal, order.currency)}</span>
                                        </div>
                                        {order.couponDiscount && order.couponDiscount > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <span>Coupon ({order.couponCode}):</span>
                                                <span>-{formatOrderPrice(order.couponDiscount, order.currency)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>{formatOrderPrice(order.tax, order.currency)}</span>
                                        </div>
                                        {order.tip && order.tip > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tip:</span>
                                                <span>{formatOrderPrice(order.tip, order.currency)}</span>
                                            </div>
                                        )}
                                        {order.walletDeduction > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <span>Wallet Credit:</span>
                                                <span>-{formatOrderPrice(order.walletDeduction, order.currency)}</span>
                                            </div>
                                        )}
                                        {order.coinsRedeemed && order.coinsRedeemed > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <span>Valhalla Coins ({order.coinsRedeemed}):</span>
                                                <span>-{formatOrderPrice(order.coinDiscount ?? 0, order.currency)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-foreground">
                                            <span>Total Paid:</span>
                                            <span>{formatOrderPrice(order.total, order.currency)}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid md:grid-cols-2 gap-4 items-start">
                                        <div>
                                            <h4 className="font-semibold">Payment Method: {order.paymentMethod?.name || 'N/A'}</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{order.paymentMethod?.instructions}</p>
                                        </div>
                                        <div className="flex items-start justify-end gap-2">
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
                                                    if (value === 'refunded') return;
                                                    handleStatusChange(order, value)
                                                }}
                                                >
                                                <SelectTrigger className="w-[120px] h-9">
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
                                                            This will refund {formatOrderPrice(order.subtotal, order.currency)} to the customer's wallet and mark the order as refunded. This action cannot be undone.
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
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
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
