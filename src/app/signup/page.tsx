
import { SignUpForm } from './SignUpForm';
import { getSettings } from '@/services/settingsService';

export default async function SignUpPage() {
  const { siteTitle, logoUrl } = await getSettings(['siteTitle', 'logoUrl']);

  return <SignUpForm siteTitle={siteTitle} logoUrl={logoUrl} />;
}
