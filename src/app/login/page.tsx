
import { LoginForm } from './LoginForm';
import { getSettings } from '@/services/settingsService';

export default async function LoginPage() {
  const { siteTitle, logoUrl } = await getSettings(['siteTitle', 'logoUrl']);

  return <LoginForm siteTitle={siteTitle} logoUrl={logoUrl} />;
}
