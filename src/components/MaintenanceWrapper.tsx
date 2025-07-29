
'use client';

import type { MaintenanceModeSettings } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface MaintenanceWrapperProps {
  maintenanceMode: MaintenanceModeSettings | null;
  children: React.ReactNode;
}

export function MaintenanceWrapper({ maintenanceMode, children }: MaintenanceWrapperProps) {
  const { user, loading } = useAuth();

  const isAdmin = user?.email === 'admin@example.com';
  const isMaintenanceActive = maintenanceMode?.enabled || false;

  if (!isMaintenanceActive || isAdmin) {
    return <>{children}</>;
  }

  // Still show children if auth is loading to prevent flashing the maintenance page
  // for an admin who is still being authenticated.
  if (loading) {
     return <>{children}</>;
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <ShieldAlert className="h-20 w-20 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Under Maintenance</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {maintenanceMode?.message || 'We are currently performing scheduled maintenance. We should be back online shortly.'}
        </p>
      </div>
    </div>
  );
}
