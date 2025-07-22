
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PaymentMethod } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters.' }),
  taxRate: z.coerce.number().min(0, { message: 'Tax rate must be non-negative.' }).max(100, { message: 'Tax rate cannot exceed 100.' }),
  iconUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type PaymentMethodFormData = z.infer<typeof formSchema>;

interface PaymentMethodFormProps {
  onSubmit: (data: PaymentMethodFormData) => void;
  initialData?: PaymentMethod | null;
  onCancel: () => void;
}

export function PaymentMethodForm({ onSubmit, initialData, onCancel }: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instructions: '',
      taxRate: 0,
      iconUrl: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        taxRate: Number(initialData.taxRate),
        iconUrl: initialData.iconUrl || '',
      });
    } else {
        form.reset({
            name: '',
            instructions: '',
            taxRate: 0,
            iconUrl: '',
        });
    }
  }, [initialData, form]);

  const { formState } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bank Transfer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="iconUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/icon.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide payment instructions for the customer..." {...field} rows={5}/>
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
            {formState.isSubmitting ? 'Saving...' : 'Save Method'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
