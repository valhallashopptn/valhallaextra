
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'completed' | 'canceled';

function formatPrice(total: number, currency: 'TND' | 'USD') {
    const safeTotal = typeof total === 'number' ? total : 0;
    if (currency === 'TND') {
        return `${safeTotal.toFixed(2)} TND`;
    }
    // Default to USD if currency is not specified or is USD
    return `$${safeTotal.toFixed(2)}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({ title: 'Success', description: 'Order status updated successfully.' });
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    }
  };
  
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  }

  return (
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
                        <Badge key={item.id} variant="secondary">
                          {item.name} (x{item.quantity})
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">{formatPrice(order.total, order.currency)}</TableCell>
                  <TableCell className="text-right">
                    <Select value={order.status} onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
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
  );
}
