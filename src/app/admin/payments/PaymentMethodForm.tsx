
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PaymentMethod } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const customFieldSchema = z.object({
  id: z.string().default(() => `field_${crypto.randomUUID()}`),
  label: z.string().min(2, { message: 'Label must be at least 2 characters.' }),
  type: z.enum(['text', 'number', 'email'], {
    errorMap: () => ({ message: 'Please select a valid field type.' }),
  }),
});


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters.' }),
  taxRate: z.coerce.number().min(0, { message: 'Tax rate must be non-negative.' }).max(100, { message: 'Tax rate cannot exceed 100.' }),
  iconUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
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
      customFields: [],
    },
  });
  
  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });


  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        taxRate: Number(initialData.taxRate),
        iconUrl: initialData.iconUrl || '',
        customFields: initialData.customFields || [],
      });
    } else {
        form.reset({
            name: '',
            instructions: '',
            taxRate: 0,
            iconUrl: '',
            customFields: [],
        });
    }
  }, [initialData, form]);

  const { formState } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="space-y-4 pr-1">
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
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium mb-2">Custom Payment Fields</h3>
                <p className="text-sm text-muted-foreground mb-2">Add custom fields for users to fill out when they select this payment method (e.g., Transaction ID, Sender Name).</p>
                <div className="space-y-4">
                    {customFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`customFields.${index}.label`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Field Label</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Transaction ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`customFields.${index}.type`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeCustomField(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendCustomField({ id: `field_${crypto.randomUUID()}`, label: '', type: 'text' })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Field
                </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6">
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
