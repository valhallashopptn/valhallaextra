
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getAffiliates, activateAffiliate, revokeAffiliate, getAllUserProfiles } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Handshake, Link as LinkIcon, Copy, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrency } from '@/context/CurrencyContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


function AddAffiliateDialog({ isOpen, onOpenChange, onAdd, allUsers, existingAffiliateIds }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onAdd: (userId: string) => void, allUsers: UserProfile[], existingAffiliateIds: string[] }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const availableUsers = allUsers.filter(u => !existingAffiliateIds.includes(u.id));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Affiliate</DialogTitle>
                    <DialogDescription>Select a user to enroll in the affiliate program. They will be immediately activated.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a user..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.username} ({user.email})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => onAdd(selectedUserId)} disabled={!selectedUserId}>Add Affiliate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AffiliatesPage() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [affiliates, setAffiliates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [affiliateData, allUsersData] = await Promise.all([
          getAffiliates(),
          getAllUserProfiles()
      ]);
      setAffiliates(affiliateData);
      setAllUsers(allUsersData);
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
      toast({ title: 'Error', description: 'Could not load affiliate data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAffiliate = async (userId: string) => {
    try {
      await activateAffiliate(userId);
      toast({ title: 'Success', description: 'Affiliate activated.' });
      fetchData();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to activate affiliate.', variant: 'destructive' });
    }
  };
  
  const handleRevoke = async (userId: string) => {
     try {
      await revokeAffiliate(userId);
      toast({ title: 'Success', description: 'Affiliate status revoked.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to revoke affiliate status.', variant: 'destructive' });
    }
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Affiliate code copied to clipboard.' });
  };

  return (
    <>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Affiliate Management</h1>
        <p className="text-muted-foreground">Manage your affiliate partners.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Affiliates</CardTitle>
            <CardDescription>A list of all active affiliate partners.</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Affiliate
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : affiliates.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {user.affiliateCode ? (
                        <Button variant="ghost" size="sm" onClick={() => handleCopyCode(user.affiliateCode!)}>
                            {user.affiliateCode} <Copy className="ml-2 h-3 w-3" />
                        </Button>
                    ) : 'N/A'}
                  </TableCell>
                   <TableCell className="font-semibold">
                    {formatPrice(user.affiliateEarnings || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                               <Trash2 className="mr-2 h-4 w-4" /> Revoke
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove {user.username} from the affiliate program. Their code will no longer work, but their past earnings will remain. This action can be undone by adding them again.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRevoke(user.id)} className="bg-destructive hover:bg-destructive/90">Confirm Revoke</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {!loading && affiliates.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No active affiliates found.</p>
          )}
        </CardContent>
      </Card>
    </div>
    <AddAffiliateDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddAffiliate}
        allUsers={allUsers}
        existingAffiliateIds={affiliates.map(a => a.id)}
    />
    </>
  );
}
