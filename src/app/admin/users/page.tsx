
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, Star, Wallet } from 'lucide-react';
import { getAllUserProfiles, updateUserStatus } from '@/services/walletService';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getRankDetails } from '@/app/account/RankProgressCard';
import { RankIcon } from '@/app/account/RankProgressCard';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';


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
  
  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      await updateUserStatus(user.id, newStatus);
      toast({ title: 'Success', description: `User ${user.username} has been ${newStatus === 'banned' ? 'banned' : 'unbanned'}.` });
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to update user status.', variant: 'destructive' });
    }
  }

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
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
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
                        <TableCell className="text-right">
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant={user.status === 'banned' ? 'destructive' : 'outline'} size="sm">
                                    {user.status === 'banned' ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                    {user.status === 'banned' ? 'Banned' : 'Active'}
                                 </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will {user.status === 'banned' ? 'unban' : 'ban'} the user <span className="font-bold">{user.username}</span>. 
                                    {user.status !== 'banned' && ' They will not be able to log in.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => toggleUserStatus(user)} className={cn(user.status === 'banned' && 'bg-primary hover:bg-primary/90')}>
                                    Yes, {user.status === 'banned' ? 'unban' : 'ban'} user
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
