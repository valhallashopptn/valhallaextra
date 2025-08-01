

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { Logo } from '@/components/icons/Logo';
import { updateProfile } from 'firebase/auth';
import { getAvatarList } from '@/services/avatarService';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20, { message: 'Username must be 20 characters or less.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string(),
  ref: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface SignUpFormProps {
  siteTitle?: string;
  logoUrl?: string | null;
}

export function SignUpForm({ siteTitle = 'ApexTop', logoUrl }: SignUpFormProps) {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      ref: '',
    },
  });

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      form.setValue('ref', refCode);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await signUp(values.email, values.password, values.username, values.ref);
      
      const avatarList = await getAvatarList();
      const randomAvatarUrl = avatarList.length > 0 ? avatarList[Math.floor(Math.random() * avatarList.length)] : '';

      await updateProfile(userCredential.user, {
        displayName: values.username,
        photoURL: randomAvatarUrl,
      });

      await auth.currentUser?.reload();

      router.push('/account');
      toast({
        title: 'Account Created',
        description: `Welcome to ${siteTitle}!`,
      });
    } catch (error: any) {
       console.error('Sign up failed:', error);
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo imageUrl={logoUrl} altText={`${siteTitle} Logo`} className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Join {siteTitle} to manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your_username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Affiliate code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
