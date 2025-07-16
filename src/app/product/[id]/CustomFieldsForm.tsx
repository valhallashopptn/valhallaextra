
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { CustomField } from '@/lib/types';
import { Edit } from 'lucide-react';
import { useState } from 'react';

interface CustomFieldsFormDialogProps {
  fields: CustomField[];
  onSave: (data: Record<string, string>) => void;
  productName: string;
  isCustomized: boolean;
}

export function CustomFieldsFormDialog({ fields, onSave, productName, isCustomized }: CustomFieldsFormDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formSchema = z.object(
    fields.reduce((acc, field) => {
      let schema;
      switch (field.type) {
        case 'email':
          schema = z.string().email({ message: 'Please enter a valid email.' });
          break;
        case 'number':
          schema = z.string().regex(/^\d+$/, { message: 'Please enter a valid number.' });
          break;
        default:
          schema = z.string().min(1, { message: 'This field is required.' });
      }
      acc[field.label] = schema;
      return acc;
    }, {} as Record<string, z.ZodType<any, any>>)
  );

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.label] = '';
      return acc;
    }, {} as Record<string, string>),
  });

  const handleFormSubmit = (data: FormData) => {
    onSave(data);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full md:w-auto">
          <Edit className="mr-2 h-5 w-5" />
          {isCustomized ? 'Edit Customization' : 'Customize'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize {productName}</DialogTitle>
          <DialogDescription>
            Please provide the following information to complete your order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {fields.map(field => (
              <FormField
                key={field.id}
                control={form.control}
                name={field.label}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                        {...formField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">
                    Save Customization
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
