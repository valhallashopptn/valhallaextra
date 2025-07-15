
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSetting, updateSetting } from '@/services/settingsService';
import Image from 'next/image';

const formSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

type AppearanceFormData = z.infer<typeof formSchema>;

export default function AppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const form = useForm<AppearanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroImageUrl: '',
    },
  });

  useEffect(() => {
    const fetchHeroImage = async () => {
      setLoading(true);
      try {
        const url = await getSetting('heroImageUrl', 'https://placehold.co/1920x1080.png');
        setCurrentImageUrl(url);
        form.setValue('heroImageUrl', url);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not load current settings.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchHeroImage();
  }, [form, toast]);

  const handleFormSubmit = async (data: AppearanceFormData) => {
    try {
      await updateSetting('heroImageUrl', data.heroImageUrl);
      setCurrentImageUrl(data.heroImageUrl);
      toast({ title: 'Success', description: 'Appearance settings updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update settings.', variant: 'destructive' });
      console.error("Failed to update settings", error);
    }
  };
  
  const watchedUrl = form.watch('heroImageUrl');

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your storefront.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero</CardTitle>
          <CardDescription>Update the main background image on your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Background Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>

          <div>
            <h3 className="text-lg font-medium mb-4">Current Image Preview</h3>
            {loading ? (
                <div className="aspect-video w-full bg-muted rounded-lg animate-pulse"></div>
            ) : (
                <div className="aspect-video w-full relative rounded-lg overflow-hidden border">
                    <Image
                        src={watchedUrl || 'https://placehold.co/1920x1080.png'}
                        alt="Hero background preview"
                        fill
                        className="object-cover"
                        data-ai-hint="dark abstract background"
                        key={watchedUrl} // Re-renders image on URL change
                    />
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
