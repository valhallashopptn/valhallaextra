
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons/Logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { getSettings } from '@/services/settingsService';

const passwordResetSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm({ actionCode, logoUrl }: { actionCode: string, logoUrl?: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof passwordResetSchema>) {
    try {
      await confirmPasswordReset(auth, actionCode, values.password);
      toast({
        title: 'Success',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password. The link may have expired.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo imageUrl={logoUrl} altText="Site Logo" className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">Reset Your Password</CardTitle>
        <CardDescription>Enter a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AuthActionHandler({ logoUrl }: { logoUrl?: string | null }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode === 'resetPassword' && actionCode) {
      verifyPasswordResetCode(auth, actionCode)
        .then(() => {
          setStatus('valid');
        })
        .catch((error) => {
          console.error('Invalid reset code:', error);
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setStatus('invalid');
        });
    } else {
        setError('Invalid action. Please check the link or try again.');
        setStatus('invalid');
    }
  }, [mode, actionCode]);

  return (
      <div className="flex items-center justify-center">
        {status === 'loading' && <p>Verifying link...</p>}
        {status === 'valid' && mode === 'resetPassword' && <ResetPasswordForm actionCode={actionCode!} logoUrl={logoUrl} />}
        {status === 'invalid' && (
           <Alert variant="destructive" className="max-w-lg">
                <ShieldX className="h-4 w-4" />
                <AlertTitle>Action Failed</AlertTitle>
                <AlertDescription>
                    <p>{error}</p>
                    <Button asChild variant="link" className="p-0 h-auto mt-2">
                        <Link href="/forgot-password">Request a new link</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </div>
  );
}


export default function AuthActionPage() {
  const [settings, setSettings] = useState<{ logoUrl?: string | null }>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { logoUrl } = await getSettings(['logoUrl']);
      setSettings({ logoUrl });
    };
    fetchSettings();
  }, []);

  return (
    <PageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthActionHandler logoUrl={settings.logoUrl} />
      </Suspense>
    </PageWrapper>
  );
}
