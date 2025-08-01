
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getAffiliates, approveAffiliate, denyAffiliate } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Handshake, Link as LinkIcon, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrency } from '@/context/CurrencyContext';

export default function AffiliatesPage() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [affiliates, setAffiliates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAffiliates();
      setAffiliates(data);
    } catch (error) {
      console.error("Failed to fetch affiliates:", error);
      toast({ title: 'Error', description: 'Could not load affiliate data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveAffiliate(userId);
      toast({ title: 'Success', description: 'Affiliate approved.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve affiliate.', variant: 'destructive' });
    }
  };
  
  const handleDeny = async (userId: string) => {
     try {
      await denyAffiliate(userId);
      toast({ title: 'Success', description: 'Affiliate denied.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to deny affiliate.', variant: 'destructive' });
    }
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Affiliate code copied to clipboard.' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Affiliate Management</h1>
        <p className="text-muted-foreground">Manage your affiliate partners and review applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliates & Applicants</CardTitle>
          <CardDescription>A list of all active affiliates and pending applications.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
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
                  <TableCell>
                    <Badge variant={user.affiliateStatus === 'active' ? 'default' : 'secondary'} className={user.affiliateStatus === 'active' ? 'bg-green-600' : 'bg-yellow-500'}>
                      {user.affiliateStatus}
                    </Badge>
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
                    {user.affiliateStatus === 'pending' ? (
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleApprove(user.id)}>
                          <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeny(user.id)}>
                           <X className="mr-2 h-4 w-4" /> Deny
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No actions</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {!loading && affiliates.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No affiliates or applicants found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
