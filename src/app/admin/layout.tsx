
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
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
} from '@/components/ui/sidebar';
import { LayoutDashboard, ShoppingCart, Package, PanelLeft, Tag, Palette, CreditCard, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const ADMIN_EMAIL = 'admin@example.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/orders')}>
                      <Link href="/admin/orders">
                      <ShoppingCart />
                      Orders
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

    