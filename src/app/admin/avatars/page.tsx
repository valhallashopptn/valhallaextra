
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { getAvatarListWithIds, addAvatar, deleteAvatar } from '@/services/avatarService';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const avatarFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type AvatarFormData = z.infer<typeof avatarFormSchema>;

export default function AvatarsPage() {
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<{ id: string, url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<AvatarFormData>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: { url: '' },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const avatarsFromDb = await getAvatarListWithIds();
      setAvatars(avatarsFromDb);
    } catch (error) {
      console.error("Failed to fetch avatars:", error);
      toast({ title: 'Error', description: 'Could not load avatars.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (data: AvatarFormData) => {
    try {
      await addAvatar(data.url);
      toast({ title: 'Success', description: 'Avatar added successfully.' });
      form.reset();
      fetchData();
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to add avatar.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteAvatar(id);
        toast({ title: 'Success', description: 'Avatar deleted successfully.' });
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete avatar.', variant: 'destructive' });
    }
  };

  return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Avatar Management</h1>
          <p className="text-muted-foreground">Manage the selectable avatars for user profiles.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-end gap-4">
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/avatar.png" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {form.formState.isSubmitting ? 'Adding...' : 'Add Avatar'}
                    </Button>
                </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Avatars</CardTitle>
            <CardDescription>This is the list of avatars users can choose from.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {Array.from({length: 12}).map((_, i) => <div key={i} className="aspect-square bg-muted rounded-full animate-pulse" />)}
                </div>
            ) : (
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {avatars.map(avatar => (
                        <div key={avatar.id} className="relative group">
                            <Image src={avatar.url} alt="User Avatar" width={100} height={100} className="rounded-full aspect-square object-cover border-2 border-border" />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-6 w-6 text-destructive" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the avatar.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(avatar.id)} className="bg-destructive hover:bg-destructive/90">
                                        Yes, delete it
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            )}
             {!loading && avatars.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No avatars found. Add one above to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
