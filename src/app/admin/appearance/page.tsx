
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
import { themes, type Theme } from '@/lib/themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

type AppearanceFormData = z.infer<typeof formSchema>;

export default function AppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [activeTheme, setActiveTheme] = useState('Night Runner');

  const form = useForm<AppearanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroImageUrl: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const heroUrl = await getSetting('heroImageUrl', 'https://placehold.co/1920x1080.png');
        const currentTheme = await getSetting('theme', 'Night Runner');
        
        setCurrentImageUrl(heroUrl);
        form.setValue('heroImageUrl', heroUrl);
        setActiveTheme(currentTheme);

      } catch (error) {
        toast({ title: 'Error', description: 'Could not load current settings.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const handleFormSubmit = async (data: AppearanceFormData) => {
    try {
      await updateSetting('heroImageUrl', data.heroImageUrl);
      setCurrentImageUrl(data.heroImageUrl);
      toast({ title: 'Success', description: 'Hero image updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update hero image.', variant: 'destructive' });
      console.error("Failed to update hero image", error);
    }
  };

  const handleThemeSelect = async (themeName: string) => {
    try {
        setActiveTheme(themeName);
        await updateSetting('theme', themeName);
        
        // This is a bit of a hack to force a re-render of the layout with the new theme
        window.location.reload();

    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update theme.', variant: 'destructive' });
        console.error("Failed to update theme", error);
    }
  }
  
  const watchedUrl = form.watch('heroImageUrl');

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your storefront.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Theme</CardTitle>
          <CardDescription>Select a theme to change the color scheme of your website.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themes.map((theme) => (
                    <div key={theme.name} className="space-y-2">
                        <button 
                            onClick={() => handleThemeSelect(theme.name)}
                            className={cn(
                                "relative block w-full aspect-video rounded-lg border-2 transition-all",
                                activeTheme === theme.name ? 'border-primary ring-2 ring-primary' : 'border-border'
                            )}
                        >
                            <div className="h-full w-full flex flex-col items-center justify-center" style={{ backgroundColor: `hsl(${theme.colors.background})` }}>
                               <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }}></div>
                                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}></div>
                                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.accent})` }}></div>
                               </div>
                            </div>
                             {activeTheme === theme.name && (
                                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </button>
                        <p className="text-center text-sm font-medium">{theme.name}</p>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

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
