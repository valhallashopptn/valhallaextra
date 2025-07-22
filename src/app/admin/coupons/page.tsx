
'use client';

import { useState, useEffect } from 'react';
import type { Coupon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CouponForm } from './CouponForm';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const couponsFromDb = await getCoupons();
      setCoupons(couponsFromDb);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast({ title: 'Error', description: 'Could not load coupons.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Coupon, 'id' | 'createdAt' | 'usedBy'>) => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, data);
        toast({ title: 'Success', description: 'Coupon updated successfully.' });
      } else {
        await addCoupon(data);
        toast({ title: 'Success', description: 'Coupon added successfully.' });
      }
      await fetchData();
      setIsDialogOpen(false);
      setEditingCoupon(null);
    } catch (error: any) {
       toast({ title: 'Error', description: error.message || 'Failed to save coupon.', variant: 'destructive' });
       console.error("Failed to save coupon", error);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      await deleteCoupon(couponId);
      toast({ title: 'Success', description: 'Coupon deleted successfully.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete coupon.', variant: 'destructive' });
      console.error("Failed to delete coupon", error);
    }
  };
  
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };
  
  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast({ title: 'Success', description: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'}.` });
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to update coupon status.', variant: 'destructive' });
    }
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    // Assuming USD for fixed amounts for now.
    return `$${coupon.discountValue.toFixed(2)}`;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingCoupon(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage discount codes for your store.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Your Coupons</CardTitle>
              <CardDescription>A list of all promotional coupons.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>One-Time Use</TableHead>
                  <TableHead>Times Used</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : coupons.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono text-primary">{coupon.code}</TableCell>
                    <TableCell className="font-medium">{formatDiscount(coupon)}</TableCell>
                    <TableCell>
                      <Badge variant={coupon.oneTimeUse ? 'default' : 'secondary'}>{coupon.oneTimeUse ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell>{coupon.usedBy.length}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={coupon.isActive}
                        onCheckedChange={() => toggleCouponStatus(coupon)}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                          <Edit className="h-4 w-4" />
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the coupon <span className="font-mono font-bold">{coupon.code}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(coupon.id)} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <CouponForm
            onSubmit={handleFormSubmit}
            initialData={editingCoupon}
            onCancel={() => setIsDialogOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
