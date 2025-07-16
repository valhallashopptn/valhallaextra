
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CustomField } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomFieldsFormProps {
  fields: CustomField[];
  onDataChange: (data: Record<string, string>, isValid: boolean) => void;
}

export function CustomFieldsForm({ fields, onDataChange }: CustomFieldsFormProps) {
  
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
    mode: 'onChange',
    defaultValues: fields.reduce((acc, field) => {
      acc[field.label] = '';
      return acc;
    }, {} as Record<string, string>),
  });

  const { watch, formState } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange(value as Record<string, string>, formState.isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, formState.isValid, onDataChange]);


  return (
    <Card className="bg-muted/30">
        <CardHeader>
            <CardTitle>Required Information</CardTitle>
            <CardDescription>Please provide the following details to complete your order.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form className="space-y-4">
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
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
