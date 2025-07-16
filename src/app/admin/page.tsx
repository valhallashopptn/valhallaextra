
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getProducts } from '@/services/productService';
import { getAllOrders } from '@/services/orderService';
import type { Product, Order } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Package, DollarSign, ShoppingCart } from 'lucide-react';

export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, orders] = await Promise.all([
          getProducts(),
          getAllOrders()
        ]);
        
        setProductCount(products.length);
        setOrderCount(orders.length);
        
        // Note: This revenue is a simple sum and does not account for different currencies.
        // For accurate reporting, a conversion step would be needed here.
        const revenue = orders.reduce((sum, order) => {
            // Assuming base price is in USD
            return sum + order.total
        }, 0);
        setTotalRevenue(revenue);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your store's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted"></div>
            ) : (
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">Note: Revenue shown in USD, ignoring currency conversions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="h-8 w-1/4 animate-pulse rounded-md bg-muted"></div>
            ) : (
                <div className="text-2xl font-bold">{orderCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="h-8 w-1/4 animate-pulse rounded-md bg-muted"></div>
            ) : (
                 <div className="text-2xl font-bold">{productCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>Use the sidebar to manage your store.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>This is your central hub for managing the TopUp Hub store. You can add new game credits, manage payment methods, update existing products, and keep an eye on all the orders coming through the platform.</p>
        </CardContent>
       </Card>
    </div>
  );
}
