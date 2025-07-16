
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

const customFieldSchema = z.object({
  id: z.string().default(() => `field_${crypto.randomUUID()}`),
  label: z.string().min(2, { message: 'Label must be at least 2 characters.' }),
  type: z.enum(['text', 'number', 'email'], {
    errorMap: () => ({ message: 'Please select a valid field type.' }),
  }),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/300x200.png'),
  backImageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/300x200.png'),
  customFields: z.array(customFieldSchema).optional(),
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
      customFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        customFields: initialData.customFields || [],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        imageUrl: 'https://placehold.co/300x200.png',
        backImageUrl: 'https://placehold.co/300x200.png',
        customFields: [],
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
        
        <Separator />
        
        <div>
            <h3 className="text-lg font-medium mb-2">Custom Fields</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                        <FormField
                            control={form.control}
                            name={`customFields.${index}.label`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormLabel>Field Label</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Player ID" {...field} />
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
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
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
                onClick={() => append({ id: `field_${crypto.randomUUID()}`, label: '', type: 'text' })}
                >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Field
            </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
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
