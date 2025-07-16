
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod } from '@/services/paymentMethodService';
import type { PaymentMethod } from '@/lib/types';
import { PlusCircle, Edit } from 'lucide-react';
import { PaymentMethodForm } from './PaymentMethodForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const methodsFromDb = await getPaymentMethods();
      setMethods(methodsFromDb);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast({ title: 'Error', description: 'Could not load payment methods.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, data);
        toast({ title: 'Success', description: 'Payment method updated successfully.' });
      } else {
        await addPaymentMethod(data);
        toast({ title: 'Success', description: 'Payment method added successfully.' });
      }
      await fetchData();
      setIsDialogOpen(false);
      setEditingMethod(null);
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to save payment method.', variant: 'destructive' });
       console.error("Failed to save payment method", error);
    }
  };
  
  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingMethod(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Payment Methods</h1>
          <p className="text-muted-foreground">Manage manual payment options for your customers.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>A list of all manual payment methods available.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Method
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : methods.map(method => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{method.taxRate}%</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{method.instructions}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                          <Edit className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
        </DialogHeader>
        <PaymentMethodForm
          onSubmit={handleFormSubmit}
          initialData={editingMethod}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
