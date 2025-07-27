
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UserProfile, AdminPermission } from '@/lib/types';
import { ALL_ADMIN_PERMISSIONS } from '@/lib/types';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  userId: z.string().min(1, { message: 'Please select a user.' }),
  role: z.enum(['user', 'admin']),
  permissions: z.array(z.string()).optional(),
});

type AdminFormData = z.infer<typeof formSchema>;

interface AdminFormProps {
  onSubmit: (data: AdminFormData) => void;
  onCancel: () => void;
  users: UserProfile[];
  editingAdmin: UserProfile | null;
}

export function AdminForm({ onSubmit, onCancel, users, editingAdmin }: AdminFormProps) {
  const form = useForm<AdminFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      role: 'user',
      permissions: [],
    },
  });

  useEffect(() => {
    if (editingAdmin) {
      form.reset({
        userId: editingAdmin.id,
        role: editingAdmin.role || 'user',
        permissions: editingAdmin.permissions || [],
      });
    } else {
        form.reset({
            userId: '',
            role: 'user',
            permissions: [],
        });
    }
  }, [editingAdmin, form]);

  const { formState, watch } = form;
  const selectedUserId = watch('userId');
  const role = watch('role');
  
  const handleFormSubmit = (data: AdminFormData) => {
    onSubmit({
        ...data,
        permissions: data.role === 'admin' ? data.permissions : [],
    });
  }
  
  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
        <ScrollArea className="pr-6 -mr-6 flex-grow">
          <div className="space-y-6 pr-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingAdmin}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to manage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Administrator Role</FormLabel>
                    <FormDescription>
                      Grant this user administrative privileges.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'admin'}
                      onCheckedChange={(checked) => field.onChange(checked ? 'admin' : 'user')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Manage Permissions</FormLabel>
                          <FormDescription>
                            Select the administrative tasks this user can perform.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {ALL_ADMIN_PERMISSIONS.map((permission) => (
                            <FormField
                              key={permission}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permission}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), permission])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== permission
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {formatPermissionName(permission)}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
            
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting || !selectedUserId}>
            {formState.isSubmitting ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
