
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
import { getSettings, updateSetting } from '@/services/settingsService';
import Image from 'next/image';
import { themes, type Theme } from '@/lib/themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const appearanceFormSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});
const identityFormSchema = z.object({
  siteTitle: z.string().min(2, { message: 'Site title must be at least 2 characters.' }),
  logoUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

type AppearanceFormData = z.infer<typeof appearanceFormSchema>;
type IdentityFormData = z.infer<typeof identityFormSchema>;

export default function AppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('Night Runner');

  const appearanceForm = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      heroImageUrl: '',
    },
  });

  const identityForm = useForm<IdentityFormData>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: {
      siteTitle: 'TopUp Hub',
      logoUrl: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await getSettings(['heroImageUrl', 'theme', 'siteTitle', 'logoUrl']);
        
        appearanceForm.setValue('heroImageUrl', settings.heroImageUrl || 'https://placehold.co/1920x1080.png');
        identityForm.setValue('siteTitle', settings.siteTitle || 'TopUp Hub');
        identityForm.setValue('logoUrl', settings.logoUrl || '');
        setActiveTheme(settings.theme || 'Night Runner');

      } catch (error) {
        toast({ title: 'Error', description: 'Could not load current settings.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [appearanceForm, identityForm, toast]);

  const handleAppearanceSubmit = async (data: AppearanceFormData) => {
    try {
      await updateSetting('heroImageUrl', data.heroImageUrl);
      toast({ title: 'Success', description: 'Hero image updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update hero image.', variant: 'destructive' });
      console.error("Failed to update hero image", error);
    }
  };

  const handleIdentitySubmit = async (data: IdentityFormData) => {
    try {
      await Promise.all([
        updateSetting('siteTitle', data.siteTitle),
        updateSetting('logoUrl', data.logoUrl),
      ]);
      toast({ title: 'Success', description: 'Store identity updated successfully.' });
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to update store identity.', variant: 'destructive' });
       console.error("Failed to update store identity", error);
    }
  }

  const handleThemeSelect = async (themeName: string) => {
    try {
        setActiveTheme(themeName);
        await updateSetting('theme', themeName);
        window.location.reload();

    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update theme.', variant: 'destructive' });
        console.error("Failed to update theme", error);
    }
  }
  
  const watchedHeroUrl = appearanceForm.watch('heroImageUrl');

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your storefront.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Store Identity</CardTitle>
          <CardDescription>Update your website's name and logo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...identityForm}>
            <form onSubmit={identityForm.handleSubmit(handleIdentitySubmit)} className="space-y-4">
              <FormField
                control={identityForm.control}
                name="siteTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TopUp Hub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={identityForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={identityForm.formState.isSubmitting}>
                {identityForm.formState.isSubmitting ? 'Saving...' : 'Save Identity'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
          <Form {...appearanceForm}>
            <form onSubmit={appearanceForm.handleSubmit(handleAppearanceSubmit)} className="space-y-4">
              <FormField
                control={appearanceForm.control}
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
              <Button type="submit" disabled={appearanceForm.formState.isSubmitting}>
                {appearanceForm.formState.isSubmitting ? 'Saving...' : 'Save Hero Image'}
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
                        src={watchedHeroUrl || 'https://placehold.co/1920x1080.png'}
                        alt="Hero background preview"
                        fill
                        className="object-cover"
                        data-ai-hint="dark abstract background"
                        key={watchedHeroUrl} // Re-renders image on URL change
                    />
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
