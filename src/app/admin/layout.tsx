
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { LayoutDashboard, ShoppingCart, Package, PanelLeft, Tag, Palette, CreditCard, Warehouse, Gift, Users, Shield, Smile, Handshake } from 'lucide-react';
import Link from 'next/link';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { getAllOrders } from '@/services/orderService';
import type { Order } from '@/lib/types';

const ADMIN_EMAIL = 'admin@example.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [uncompletedOrdersCount, setUncompletedOrdersCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchOrderCount = async () => {
        try {
            const orders = await getAllOrders();
            const pendingAndPaidOrders = orders.filter(order => order.status === 'pending' || order.status === 'paid');
            setUncompletedOrdersCount(pendingAndPaidOrders.length);
        } catch (error) {
            console.error("Failed to fetch order count:", error);
        }
    };
    
    fetchOrderCount();
    const interval = setInterval(fetchOrderCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="text-center container mx-auto px-4 py-8">Loading and verifying admin access...</div>;
  }

  return (
    <>
      <SidebarProvider>
          <Sidebar>
              <SidebarHeader>
                  <div className="flex items-center gap-2">
                      <SidebarTrigger />
                      <span className="text-lg font-semibold">Admin Panel</span>
                  </div>
              </SidebarHeader>
              <SidebarSeparator />
              <SidebarContent>
              <SidebarMenu className="mt-4">
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                      <Link href="/admin">
                      <LayoutDashboard />
                      Dashboard
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/appearance')}>
                      <Link href="/admin/appearance">
                      <Palette />
                      Appearance
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/payments')}>
                      <Link href="/admin/payments">
                      <CreditCard />
                      Payments
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/categories')}>
                      <Link href="/admin/categories">
                      <Tag />
                      Categories
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')}>
                      <Link href="/admin/products">
                      <Package />
                      Products
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/stock')}>
                      <Link href="/admin/stock">
                      <Warehouse />
                      Stock
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/coupons')}>
                      <Link href="/admin/coupons">
                      <Gift />
                      Coupons
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/affiliates')}>
                      <Link href="/admin/affiliates">
                      <Handshake />
                      Affiliates
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/orders')}>
                      <Link href="/admin/orders">
                      <ShoppingCart />
                      Orders
                      </Link>
                  </SidebarMenuButton>
                  {uncompletedOrdersCount > 0 && (
                    <SidebarMenuBadge className="bg-primary text-primary-foreground">{uncompletedOrdersCount}</SidebarMenuBadge>
                  )}
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
                      <Link href="/admin/users">
                      <Users />
                      Users
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/avatars')}>
                      <Link href="/admin/avatars">
                      <Smile />
                      Avatars
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="admin-sidebar-menu-item">
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/admins')}>
                      <Link href="/admin/admins">
                      <Shield />
                      Admins
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
              </SidebarContent>
          </Sidebar>
          <SidebarInset>
              <div className="p-4 md:p-8">{children}</div>
          </SidebarInset>
      </SidebarProvider>
      <MobileBottomNav />
    </>
  );
}
