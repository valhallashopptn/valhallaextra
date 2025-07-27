
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSetting } from '@/services/settingsService';
import Image from 'next/image';
import { themes, type Theme } from '@/lib/themes';
import { Check, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AboutPageContent, ContactPageContent, SocialLink, AnnouncementSettings } from '@/lib/types';
import { Switch } from '@/components/ui/switch';


const appearanceFormSchema = z.object({
  heroImageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});
const identityFormSchema = z.object({
  siteTitle: z.string().min(2, { message: 'Site title must be at least 2 characters.' }),
  logoUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});
const notificationFormSchema = z.object({
  orderWebhookUrl: z.string().url({ message: 'Please enter a valid webhook URL.' }).or(z.literal('')),
});

const musicFormSchema = z.object({
    enableBackgroundMusic: z.boolean().default(false),
    backgroundMusicUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
});

const socialLinkSchema = z.object({
  id: z.string().default(() => `social_${crypto.randomUUID()}`),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  iconUrl: z.string().url('Must be a valid icon URL'),
});

const socialLinksFormSchema = z.object({
  socialLinks: z.array(socialLinkSchema).optional(),
});

const announcementFormSchema = z.object({
    enabled: z.boolean().default(false),
    text: z.string().max(200),
    countdownDate: z.string().optional(),
    linkText: z.string().max(30).optional(),
    linkUrl: z.string().url().or(z.literal('')).optional(),
});

const aboutPageFormSchema = z.object({
    mainTitle: z.string().min(1, 'Required'),
    subtitle: z.string().min(1, 'Required'),
    storyTitle: z.string().min(1, 'Required'),
    storyParagraph1: z.string().min(1, 'Required'),
    storyParagraph2: z.string().min(1, 'Required'),
    missionTitle: z.string().min(1, 'Required'),
    missionText: z.string().min(1, 'Required'),
    valuesTitle: z.string().min(1, 'Required'),
    valuesSubtitle: z.string().min(1, 'Required'),
    chooseUsTitle: z.string().min(1, 'Required'),
    chooseUsSubtitle: z.string().min(1, 'Required'),
});

const contactPageFormSchema = z.object({
    mainTitle: z.string().min(1, 'Required'),
    subtitle: z.string().min(1, 'Required'),
    infoTitle: z.string().min(1, 'Required'),
    infoSubtitle: z.string().min(1, 'Required'),
    email: z.string().email('Must be a valid email'),
    phone: z.string().min(1, 'Required'),
    address: z.string().min(1, 'Required'),
});

type AppearanceFormData = z.infer<typeof appearanceFormSchema>;
type IdentityFormData = z.infer<typeof identityFormSchema>;
type NotificationFormData = z.infer<typeof notificationFormSchema>;
type MusicFormData = z.infer<typeof musicFormSchema>;
type SocialLinksFormData = z.infer<typeof socialLinksFormSchema>;
type AboutPageFormData = z.infer<typeof aboutPageFormSchema>;
type ContactPageFormData = z.infer<typeof contactPageFormSchema>;
type AnnouncementFormData = z.infer<typeof announcementFormSchema>;

export default function AppearancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('Night Runner');

  const appearanceForm = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: { heroImageUrl: '' },
  });

  const identityForm = useForm<IdentityFormData>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: { siteTitle: 'TopUp Hub', logoUrl: '' },
  });
  
  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      enabled: false,
      text: '',
      countdownDate: '',
      linkText: '',
      linkUrl: '',
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: { orderWebhookUrl: '' },
  });
  
  const musicForm = useForm<MusicFormData>({
      resolver: zodResolver(musicFormSchema),
      defaultValues: { enableBackgroundMusic: false, backgroundMusicUrl: '' },
  });
  
  const socialLinksForm = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksFormSchema),
    defaultValues: { socialLinks: [] },
  });

  const aboutPageForm = useForm<AboutPageFormData>({
    resolver: zodResolver(aboutPageFormSchema),
  });

  const contactPageForm = useForm<ContactPageFormData>({
      resolver: zodResolver(contactPageFormSchema),
  });

  const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink } = useFieldArray({
    control: socialLinksForm.control,
    name: "socialLinks",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingKeys = [
            'heroImageUrl', 'theme', 'siteTitle', 'logoUrl', 'orderWebhookUrl',
            'socialLinks', 'aboutPageContent', 'contactPageContent', 'announcement',
            'enableBackgroundMusic', 'backgroundMusicUrl'
        ];
        const settings = await getSettings(settingKeys);
        
        appearanceForm.setValue('heroImageUrl', settings.heroImageUrl || 'https://placehold.co/1920x1080.png');
        identityForm.setValue('siteTitle', settings.siteTitle || 'TopUp Hub');
        identityForm.setValue('logoUrl', settings.logoUrl || '');
        notificationForm.setValue('orderWebhookUrl', settings.orderWebhookUrl || '');
        musicForm.setValue('enableBackgroundMusic', settings.enableBackgroundMusic || false);
        musicForm.setValue('backgroundMusicUrl', settings.backgroundMusicUrl || '');
        setActiveTheme(settings.theme || 'Night Runner');
        socialLinksForm.reset({ socialLinks: settings.socialLinks || [] });
        announcementForm.reset(settings.announcement || { enabled: false, text: '', countdownDate: '', linkText: '', linkUrl: '' });
        
        aboutPageForm.reset(settings.aboutPageContent || {
            mainTitle: 'About ApexTop',
            subtitle: "We're a passionate team dedicated to making digital content accessible for everyone, instantly and securely.",
            storyTitle: 'Our Story',
            storyParagraph1: "Founded in 2023 by a group of avid gamers and tech enthusiasts, ApexTop was born from a simple observation: getting digital credits should be fast, easy, and completely secure. We were tired of slow delivery times and risky websites. So, we decided to build the platform we always wanted—one that puts the customer first and delivers on its promises every single time.",
            storyParagraph2: "Today, we're proud to serve a growing community of users who trust us for their digital top-up needs. Our journey is just beginning, and we're constantly innovating to bring you the best experience possible.",
            missionTitle: 'Our Mission & Vision',
            missionText: "Our mission is to provide the fastest, most secure, and most reliable platform for all digital top-up needs. Our vision is to build a global community where every digital transaction is seamless, trustworthy, and instant.",
            valuesTitle: 'Our Core Values',
            valuesSubtitle: 'The principles that guide every decision we make.',
            chooseUsTitle: 'Why Choose Us?',
            chooseUsSubtitle: 'The advantages of using ApexTop for your digital needs.',
        });

        contactPageForm.reset(settings.contactPageContent || {
            mainTitle: 'Get In Touch',
            subtitle: "We'd love to hear from you! Reach out with any questions, feedback, or inquiries.",
            infoTitle: 'Contact Information',
            infoSubtitle: 'Find us through any of the channels below. Our team is ready to assist you.',
            email: 'support@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Gaming Lane\nDigital City, 98765',
        });

      } catch (error) {
        toast({ title: 'Error', description: 'Could not load current settings.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [appearanceForm, identityForm, notificationForm, musicForm, socialLinksForm, aboutPageForm, contactPageForm, announcementForm, toast]);

  const handleGenericSubmit = async (key: string, data: any, formName: string) => {
    try {
      await updateSetting(key, data);
      toast({ title: 'Success', description: `${formName} updated successfully.` });
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update ${formName}.`, variant: 'destructive' });
      console.error(`Failed to update ${formName}`, error);
    }
  }
  
  const watchedHeroUrl = appearanceForm.watch('heroImageUrl');

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

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your storefront.</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Store Identity</CardTitle>
                <CardDescription>Update your website's name and logo.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...identityForm}>
                    <form onSubmit={identityForm.handleSubmit((data) => handleGenericSubmit('siteTitle', data.siteTitle, 'Website Name').then(() => handleGenericSubmit('logoUrl', data.logoUrl, 'Logo URL')))} className="space-y-4">
                    <FormField
                        control={identityForm.control}
                        name="siteTitle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website Name</FormLabel>
                            <FormControl><Input placeholder="e.g., TopUp Hub" {...field} /></FormControl>
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
                            <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
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
                    <CardTitle>Announcement Bar</CardTitle>
                    <CardDescription>Display a site-wide message for events, sales, or giveaways.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...announcementForm}>
                        <form onSubmit={announcementForm.handleSubmit((data) => handleGenericSubmit('announcement', data, 'Announcement Bar'))} className="space-y-4">
                            <FormField
                                control={announcementForm.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Enable Announcement Bar</FormLabel>
                                        <FormDescription>Show the bar at the top of your site.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={announcementForm.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Announcement Text</FormLabel>
                                    <FormControl><Input placeholder="e.g., Summer Sale ends soon!" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={announcementForm.control}
                                name="countdownDate"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Countdown End Date (Optional)</FormLabel>
                                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                    <FormDescription>Show a live countdown timer until this date.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={announcementForm.control}
                                    name="linkText"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Button Text (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Shop Now" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={announcementForm.control}
                                    name="linkUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Button URL (Optional)</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={announcementForm.formState.isSubmitting}>
                                {announcementForm.formState.isSubmitting ? 'Saving...' : 'Save Announcement'}
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
        </TabsContent>
        
        <TabsContent value="pages" className="mt-6 space-y-8">
          <Card>
              <CardHeader>
                <CardTitle>Homepage Hero</CardTitle>
                <CardDescription>Update the main background image on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit((data) => handleGenericSubmit('heroImageUrl', data.heroImageUrl, 'Hero Image'))} className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="heroImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Background Image URL</FormLabel>
                          <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
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
                          <Image src={watchedHeroUrl || 'https://placehold.co/1920x1080.png'} alt="Hero background preview" fill className="object-cover" data-ai-hint="dark abstract background" key={watchedHeroUrl} />
                      </div>
                  )}
                </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>About Us Page</CardTitle><CardDescription>Edit the content of your About Us page.</CardDescription></CardHeader>
              <CardContent>
                  <Form {...aboutPageForm}>
                  <form onSubmit={aboutPageForm.handleSubmit((data) => handleGenericSubmit('aboutPageContent', data, 'About Page'))} className="space-y-4">
                      <FormField name="mainTitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Main Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="subtitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="storyTitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Story Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="storyParagraph1" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Story Paragraph 1</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="storyParagraph2" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Story Paragraph 2</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="missionTitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Mission Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="missionText" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Mission & Vision Text</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="valuesTitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Values Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="valuesSubtitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Values Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="chooseUsTitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Why Choose Us Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField name="chooseUsSubtitle" control={aboutPageForm.control} render={({ field }) => (<FormItem><FormLabel>Why Choose Us Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="submit" disabled={aboutPageForm.formState.isSubmitting}>{aboutPageForm.formState.isSubmitting ? 'Saving...' : 'Save About Page'}</Button>
                  </form>
                  </Form>
              </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>Contact Us Page</CardTitle><CardDescription>Edit the contact information and text on your Contact Us page.</CardDescription></CardHeader>
              <CardContent>
                  <Form {...contactPageForm}>
                  <form onSubmit={contactPageForm.handleSubmit((data) => handleGenericSubmit('contactPageContent', data, 'Contact Page'))} className="space-y-4">
                       <FormField name="mainTitle" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Main Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="subtitle" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="infoTitle" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Info Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="infoSubtitle" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Info Section Subtitle</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="email" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="phone" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField name="address" control={contactPageForm.control} render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="submit" disabled={contactPageForm.formState.isSubmitting}>{contactPageForm.formState.isSubmitting ? 'Saving...' : 'Save Contact Page'}</Button>
                  </form>
                  </Form>
              </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="mt-6 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Manage the social media links displayed in your footer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...socialLinksForm}>
                    <form onSubmit={socialLinksForm.handleSubmit((data) => handleGenericSubmit('socialLinks', data.socialLinks, 'Social Links'))} className="space-y-4">
                        <div className="space-y-4">
                        {socialLinkFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 p-3 border rounded-md relative">
                                <FormField control={socialLinksForm.control} name={`socialLinks.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Twitter" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={socialLinksForm.control} name={`socialLinks.${index}.url`} render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={socialLinksForm.control} name={`socialLinks.${index}.iconUrl`} render={({ field }) => (<FormItem><FormLabel>Icon URL</FormLabel><FormControl><Input placeholder="https://example.com/icon.png" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeSocialLink(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSocialLink({ id: `social_${crypto.randomUUID()}`, name: '', url: '', iconUrl: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                        </Button>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={socialLinksForm.formState.isSubmitting}>{socialLinksForm.formState.isSubmitting ? 'Saving...' : 'Save Social Links'}</Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Background Music</CardTitle>
                    <CardDescription>Add ambient background music to your site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...musicForm}>
                        <form onSubmit={musicForm.handleSubmit((data) => handleGenericSubmit('enableBackgroundMusic', data.enableBackgroundMusic, 'Music Setting').then(() => handleGenericSubmit('backgroundMusicUrl', data.backgroundMusicUrl, 'Music URL')))} className="space-y-4">
                             <FormField
                                control={musicForm.control}
                                name="enableBackgroundMusic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Enable Background Music</FormLabel>
                                        <FormDescription>Play music on your site. A controller will appear in the corner.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={musicForm.control}
                                name="backgroundMusicUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Music File URL (.mp3)</FormLabel>
                                    <FormControl><Input placeholder="https://example.com/music.mp3" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={musicForm.formState.isSubmitting}>
                                {musicForm.formState.isSubmitting ? 'Saving...' : 'Save Music Settings'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Get notified when new orders are placed.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit((data) => handleGenericSubmit('orderWebhookUrl', data.orderWebhookUrl, 'Webhook'))} className="space-y-4">
                    <FormField
                        control={notificationForm.control}
                        name="orderWebhookUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order Notification Webhook URL</FormLabel>
                            <FormControl><Input placeholder="https://hook.make.com/..." {...field} /></FormControl>
                            <FormDescription>Sends order details to this URL for services like Make.com or Zapier. Leave blank to disable.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={notificationForm.formState.isSubmitting}>
                        {notificationForm.formState.isSubmitting ? 'Saving...' : 'Save Webhook'}
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    