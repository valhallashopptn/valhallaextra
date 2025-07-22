
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
import { ScrollArea } from '@/components/ui/scroll-area';

const productTabSchema = z.object({
  id: z.string().default(() => `tab_${crypto.randomUUID()}`),
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
});

const productVariantSchema = z.object({
  id: z.string().default(() => `variant_${crypto.randomUUID()}`),
  name: z.string().min(1, { message: 'Variant name is required.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
});

const customFieldSchema = z.object({
  id: z.string().default(() => `field_${crypto.randomUUID()}`),
  label: z.string().min(2, { message: 'Label must be at least 2 characters.' }),
  type: z.enum(['text', 'number', 'email'], {
    errorMap: () => ({ message: 'Please select a valid field type.' }),
  }),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock must be a non-negative integer.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).default('https://placehold.co/600x400.png'),
  deliveryType: z.enum(['standard', 'automatic_delivery']).default('standard'),
  tabs: z.array(productTabSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),
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
      deliveryType: 'standard',
      tabs: [],
      variants: [],
      customFields: [],
    },
  });
  
  const { fields: tabFields, append: appendTab, remove: removeTab } = useFieldArray({
    control: form.control,
    name: "tabs",
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control: form.control,
    name: 'customFields',
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        price: Number(initialData.price),
        stock: Number(initialData.stock),
        deliveryType: initialData.deliveryType || 'standard',
        tabs: initialData.tabs || [],
        variants: initialData.variants || [],
        customFields: initialData.customFields || [],
      });
    } else {
        form.reset({
            name: '',
            description: '',
            price: 0,
            stock: 100,
            categoryId: '',
            imageUrl: 'https://placehold.co/600x400.png',
            deliveryType: 'standard',
            tabs: [],
            variants: [],
            customFields: [],
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
        <ScrollArea className="pr-6 -mr-6 flex-grow">
          <div className="space-y-4 pr-6">
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
             <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="deliveryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a delivery type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard (No Digital Delivery)</SelectItem>
                        <SelectItem value="automatic_delivery">Automatic Digital Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Default Price</FormLabel>
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
              <h3 className="text-lg font-medium mb-2">Product Variants</h3>
              <p className="text-sm text-muted-foreground mb-2">Add variants if this product comes in different options (e.g., sizes, amounts). Variants will override the default price.</p>
              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-end gap-2 p-3 border rounded-md relative">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500 Diamonds" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="4.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeVariant(index)}
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
                onClick={() => appendVariant({ id: `variant_${crypto.randomUUID()}`, name: '', price: 0 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium mb-2">Custom Fields</h3>
                <p className="text-sm text-muted-foreground mb-2">Add custom fields for users to fill out on the product page (e.g., Player ID, Server Name).</p>
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
            
            <Separator />
            
            <div>
                <h3 className="text-lg font-medium mb-2">Product Page Tabs</h3>
                <div className="space-y-4">
                    {tabFields.map((field, index) => (
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
                                onClick={() => removeTab(index)}
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
                    onClick={() => appendTab({ id: `tab_${crypto.randomUUID()}`, title: '', content: '' })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Tab
                </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6">
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

    