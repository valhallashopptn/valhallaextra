
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod } from '@/services/paymentMethodService';
import { getSetting, updateSetting } from '@/services/settingsService';
import type { PaymentMethod } from '@/lib/types';
import { PlusCircle, Edit, AlertTriangle } from 'lucide-react';
import { PaymentMethodForm } from './PaymentMethodForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';


const warningFormSchema = z.object({
  message: z.string().min(10, { message: "Warning must be at least 10 characters." }),
});

type WarningFormData = z.infer<typeof warningFormSchema>;

function PaymentWarningForm() {
  const { toast } = useToast();
  const form = useForm<WarningFormData>({
    resolver: zodResolver(warningFormSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    getSetting('paymentWarningMessage').then(value => {
      if (value) {
        form.setValue('message', value);
      } else {
        form.setValue('message', 'Please submit accurate payment details. Submitting fake information will result in order cancellation and may lead to account suspension.');
      }
    });
  }, [form]);

  const handleWarningSubmit = async (data: WarningFormData) => {
    try {
      await updateSetting('paymentWarningMessage', data.message);
      toast({ title: "Success", description: "Payment warning message updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update warning message.", variant: 'destructive' });
      console.error("Failed to update warning message", error);
    }
  };

  return (
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Payment Warning Message</CardTitle>
              <CardDescription>This message will be displayed to users on the checkout page to discourage fake payment submissions.</CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleWarningSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Warning Message</FormLabel>
                                  <FormControl>
                                      <Textarea {...field} rows={4} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? "Saving..." : "Save Message"}
                      </Button>
                  </form>
              </Form>
          </CardContent>
      </Card>
  );
}


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
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : methods.map(method => (
                  <TableRow key={method.id}>
                    <TableCell>
                      {method.iconUrl ? (
                        <Image src={method.iconUrl} alt={method.name} width={32} height={32} className="rounded-md object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">No Icon</div>
                      )}
                    </TableCell>
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
        
        <PaymentWarningForm />

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
