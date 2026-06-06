import { redirect } from 'next/navigation';
import {
  redirectPathForMode,
  resolveActiveModeFromCookies,
} from '@/lib/resolveActiveMode';

/**
 * Server-side guard for provider app routes (dashboard, documents, etc.).
 */
export async function guardProviderRoute(): Promise<void> {
  const activeMode = await resolveActiveModeFromCookies();

  if (activeMode !== 'PROVIDER') {
    redirect(activeMode ? redirectPathForMode(activeMode) : '/login');
  }
}
