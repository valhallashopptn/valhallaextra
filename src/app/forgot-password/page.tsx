
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { getSettings } from '@/services/settingsService';

export default async function ForgotPasswordPage() {
  const { logoUrl } = await getSettings(['logoUrl']);
  
  return <ForgotPasswordForm logoUrl={logoUrl} />;
}
