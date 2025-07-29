
'use client';

import type { MaintenanceModeSettings } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { PageWrapper } from './PageWrapper';

interface MaintenanceWrapperProps {
  maintenanceMode: MaintenanceModeSettings | null;
  children: React.ReactNode;
}

export function MaintenanceWrapper({ maintenanceMode, children }: MaintenanceWrapperProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.email === 'admin@example.com';
  const isMaintenanceActive = maintenanceMode?.enabled || false;

  // These pages should always be accessible, even during maintenance.
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/auth/action';

  if (!isMaintenanceActive || isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <PageWrapper>
        <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
                <ShieldAlert className="h-20 w-20 text-primary" />
                <h1 className="text-4xl font-bold font-headline">Under Maintenance</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                {maintenanceMode?.message || 'We are currently performing scheduled maintenance. We should be back online shortly.'}
                </p>
            </div>
        </div>
    </PageWrapper>
  );
}
