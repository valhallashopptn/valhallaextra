
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DigitalAsset, Product } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  productId: z.string().min(1, { message: 'Please select a product.' }),
  type: z.string().min(2, { message: 'Asset type must be at least 2 characters.' }),
  data: z.string().min(5, { message: 'Data must be at least 5 characters.' }),
  extraInfo: z.string().optional(),
});

type AssetFormData = z.infer<typeof formSchema>;

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  initialData?: DigitalAsset | null;
  onCancel: () => void;
  products: Product[];
}

export function AssetForm({ onSubmit, initialData, onCancel, products }: AssetFormProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      type: '',
      data: '',
      extraInfo: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        extraInfo: initialData.extraInfo || '',
      });
    } else {
        form.reset({
            productId: '',
            type: '',
            data: '',
            extraInfo: '',
        });
    }
  }, [initialData, form]);

  const { formState } = form;

  // Filter products that are set up for automatic delivery
  const automaticDeliveryProducts = products.filter(p => p.deliveryType === 'automatic_delivery');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product for this asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {automaticDeliveryProducts.length > 0 ? (
                    automaticDeliveryProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No products are configured for automatic delivery.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Steam Key, Netflix Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Data (The actual key, login, etc.)</FormLabel>
              <FormControl>
                <Textarea placeholder="The key, username/password, or other main data." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="extraInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extra Info (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., instructions, recovery codes, region lock info" {...field} rows={3}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Saving...' : 'Save Asset'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    