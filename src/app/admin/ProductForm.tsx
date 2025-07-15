
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Product, Category } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  game: z.string().min(2, { message: 'Game name must be at least 2 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative integer.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/600x400.png'),
  dataAiHint: z.string().min(2, { message: 'AI hint must be at least 2 characters.' }),
});

type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData & { categoryName: string }) => void;
  initialData?: Product | null;
  onCancel: () => void;
  categories: Category[];
}

export function ProductForm({ onSubmit, initialData, onCancel, categories }: ProductFormProps) {
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
      categoryId: '',
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
            categoryId: '',
            imageUrl: 'https://placehold.co/600x400.png',
            dataAiHint: '',
        });
    }
  }, [initialData, form]);

  const { formState } = form;

  const handleFormSubmit = (data: ProductFormData) => {
    const selectedCategory = categories.find(c => c.id === data.categoryId);
    if (selectedCategory) {
      onSubmit({ ...data, categoryName: selectedCategory.name });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
