
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff } from 'lucide-react';
import { getAllUserProfiles, updateUserStatus } from '@/services/walletService';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { getRankDetails } from '@/app/account/RankProgressCard';
import { RankIcon } from '@/app/account/RankProgressCard';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';


function UserStatusBadge({ user }: { user: UserProfile }) {
    if (user.status === 'banned') {
        return <Badge variant="destructive">Banned</Badge>;
    }
    if (user.status === 'suspended') {
        const now = new Date();
        const suspendedUntil = user.suspendedUntil?.toDate();
        if (suspendedUntil && suspendedUntil > now) {
            return <Badge variant="destructive" className="bg-yellow-600">Suspended</Badge>;
        }
    }
    return <Badge variant="secondary" className="bg-green-600">Active</Badge>;
}

function ManageUserStatusDialog({ user, onStatusChange, children }: { user: UserProfile, onStatusChange: (userId: string, status: 'active' | 'banned' | 'suspended', duration?: number) => void, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (status: 'active' | 'banned' | 'suspended', duration?: number) => {
    onStatusChange(user.id, status, duration);
    setIsOpen(false);
  };
  
  const isSuspended = user.status === 'suspended' && user.suspendedUntil && user.suspendedUntil.toDate() > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User: {user.username}</DialogTitle>
          <DialogDescription>
            {user.status === 'active' ? 'Apply a restriction to this user.' : 'Remove restrictions for this user.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {user.status !== 'active' ? (
            <div>
              <p className="mb-4 text-center">This user is currently <span className="font-bold">{isSuspended ? 'suspended' : 'banned'}</span>.</p>
              <Button onClick={() => handleAction('active')} className="w-full">
                <Shield className="mr-2 h-4 w-4" /> Unban / Remove Suspension
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <p className="text-sm text-muted-foreground">Choose a suspension duration or apply a permanent ban.</p>
              <Button onClick={() => handleAction('suspended', 1)} variant="outline">Suspend for 1 Day</Button>
              <Button onClick={() => handleAction('suspended', 7)} variant="outline">Suspend for 7 Days</Button>
              <Button onClick={() => handleAction('suspended', 30)} variant="outline">Suspend for 30 Days</Button>
              <Button onClick={() => handleAction('banned')} variant="destructive">
                <ShieldOff className="mr-2 h-4 w-4" /> Ban Permanently
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersFromDb = await getAllUserProfiles();
      setUsers(usersFromDb);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ title: 'Error', description: 'Could not load users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (userId: string, status: 'active' | 'banned' | 'suspended', duration?: number) => {
    try {
      await updateUserStatus(userId, status, duration);
      toast({ title: 'Success', description: `User status updated successfully.` });
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to update user status.', variant: 'destructive' });
    }
  };

  return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users on the platform.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : users.map(user => {
                  const { currentRank } = getRankDetails(user.xp);
                   return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                            <RankIcon rank={currentRank} size="sm" />
                            <span className={cn("font-semibold", currentRank.customClass || currentRank.color)}>{currentRank.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(user.walletBalance)}</TableCell>
                        <TableCell>{user.valhallaCoins.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">{user.xp.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                            <UserStatusBadge user={user} />
                        </TableCell>
                        <TableCell className="text-right">
                            <ManageUserStatusDialog user={user} onStatusChange={handleStatusChange}>
                                <Button variant="outline" size="sm">Manage</Button>
                           </ManageUserStatusDialog>
                        </TableCell>
                      </TableRow>
                   )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
