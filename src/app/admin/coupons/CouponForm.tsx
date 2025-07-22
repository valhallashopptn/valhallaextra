
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Coupon } from '@/lib/types';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  code: z.string().min(3, { message: 'Code must be at least 3 characters.' }).max(50).transform(v => v.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0.01, { message: 'Discount value must be positive.' }),
  isActive: z.boolean().default(true),
  oneTimeUse: z.boolean().default(false),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount cannot exceed 100.',
    path: ['discountValue'],
});

type CouponFormData = z.infer<typeof formSchema>;

interface CouponFormProps {
  onSubmit: (data: CouponFormData) => void;
  initialData?: Coupon | null;
  onCancel: () => void;
}

export function CouponForm({ onSubmit, initialData, onCancel }: CouponFormProps) {
  const form = useForm<CouponFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
      oneTimeUse: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        discountValue: Number(initialData.discountValue),
      });
    } else {
        form.reset({
            code: '',
            discountType: 'percentage',
            discountValue: 10,
            isActive: true,
            oneTimeUse: false,
        });
    }
  }, [initialData, form]);

  const { formState, watch } = form;
  const discountType = watch('discountType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="pr-6 -mr-6 flex-grow">
          <div className="space-y-4 pr-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SUMMER20" {...field} />
                  </FormControl>
                  <FormDescription>
                    Customers will enter this code at checkout.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type="number" step="0.01" {...field} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {discountType === 'percentage' ? '%' : '$'}
                                </span>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Allow customers to use this coupon.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="oneTimeUse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>One-Time Use</FormLabel>
                    <FormDescription>
                      Limit this coupon to one use per customer.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Saving...' : 'Save Coupon'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
