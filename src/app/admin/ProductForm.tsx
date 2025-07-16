
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Product, Category } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const productTabSchema = z.object({
  id: z.string().default(() => `tab_${crypto.randomUUID()}`),
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative integer.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/600x400.png'),
  tabs: z.array(productTabSchema).optional(),
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
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 100,
      categoryId: '',
      imageUrl: 'https://placehold.co/600x400.png',
      tabs: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tabs",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        price: Number(initialData.price),
        stock: Number(initialData.stock),
        tabs: initialData.tabs || [],
      });
    } else {
        form.reset({
            name: '',
            description: '',
            price: 0,
            stock: 100,
            categoryId: '',
            imageUrl: 'https://placehold.co/600x400.png',
            tabs: [],
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description for the product page..." {...field} />
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
        
        <Separator />
        
        <div>
            <h3 className="text-lg font-medium mb-2">Product Page Tabs</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md relative">
                        <FormField
                            control={form.control}
                            name={`tabs.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tab Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Instructions" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`tabs.${index}.content`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tab Content</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter content for this tab..." {...field} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            className="absolute top-2 right-2"
                        >
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
                onClick={() => append({ id: `tab_${crypto.randomUUID()}`, title: '', content: '' })}
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tab
            </Button>
        </div>


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
