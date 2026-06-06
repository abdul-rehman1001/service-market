export const AUTH_UPDATED_EVENT = 'auth-updated';

export function notifyAuthUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
  }
}

import { authenticatedFetch } from '@/lib/authenticatedFetch';

export async function switchAccountMode(mode: 'SEEKER' | 'PROVIDER') {
  const response = await authenticatedFetch('/api/auth/switch-mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to switch mode');
  }

  notifyAuthUpdated();
  return data as {
    redirectTo?: string;
    user?: {
      role: string;
      hasProviderProfile?: boolean;
      canSwitchMode?: boolean;
    };
  };
}
