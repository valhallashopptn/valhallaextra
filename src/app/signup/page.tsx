
'use client';
import { SignUpForm } from './SignUpForm';
import { getSettings } from '@/services/settingsService';
import { Suspense, useEffect, useState } from 'react';

function SignUpPageClient() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState('');

  useEffect(() => {
    getSettings(['siteTitle', 'logoUrl']).then(settings => {
      setSiteTitle(settings.siteTitle || 'TopUp Hub');
      setLogoUrl(settings.logoUrl);
    });
  }, []);

  return <SignUpForm siteTitle={siteTitle} logoUrl={logoUrl} />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPageClient />
    </Suspense>
  );
}
