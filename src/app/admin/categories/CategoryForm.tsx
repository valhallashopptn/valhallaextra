
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Category } from '@/lib/types';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/300x200.png'),
  backImageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/300x200.png'),
});

type CategoryFormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category | null;
  onCancel: () => void;
}

export function CategoryForm({ onSubmit, initialData, onCancel }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: 'https://placehold.co/300x200.png',
      backImageUrl: 'https://placehold.co/300x200.png',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        imageUrl: 'https://placehold.co/300x200.png',
        backImageUrl: 'https://placehold.co/300x200.png',
      });
    }
  }, [initialData, form]);

  const { formState } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="pr-6 -mr-6 flex-grow">
          <div className="space-y-4 pr-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PC Games" {...field} />
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
                    <Textarea placeholder="A short description for the back of the card..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/300x200.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/300x200.png" {...field} />
                  </FormControl>
                  <FormMessage />
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
            {formState.isSubmitting ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
