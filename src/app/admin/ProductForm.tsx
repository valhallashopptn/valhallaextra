
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  game: z.string().min(2, { message: 'Game name must be at least 2 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative integer.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/600x400.png'),
  dataAiHint: z.string().min(2, { message: 'AI hint must be at least 2 characters.' }),
});

type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
  onCancel: () => void;
}

export function ProductForm({ onSubmit, initialData, onCancel }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: Number(initialData.price),
      stock: Number(initialData.stock),
    } : {
      name: '',
      game: '',
      price: 0,
      stock: 100,
      imageUrl: 'https://placehold.co/600x400.png',
      dataAiHint: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        price: Number(initialData.price),
        stock: Number(initialData.stock),
      });
    } else {
        form.reset({
            name: '',
            game: '',
            price: 0,
            stock: 100,
            imageUrl: 'https://placehold.co/600x400.png',
            dataAiHint: '',
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1000 Diamonds" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="game"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Mobile Legends" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="9.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://placehold.co/600x400.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Hint</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., fantasy battle" {...field} />
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
            {formState.isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
