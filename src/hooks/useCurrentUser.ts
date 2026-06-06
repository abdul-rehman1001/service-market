'use client';

import { useCallback, useEffect, useState } from 'react';
import { AUTH_UPDATED_EVENT } from '@/lib/authEvents';
import { authenticatedFetch, refreshAccessToken } from '@/lib/authenticatedFetch';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountRole?: string;
  profileImage?: string | null;
  hasProviderProfile?: boolean;
  canSwitchMode?: boolean;
  providerVerificationStatus?: string | null;
}

function parseUserFromApi(data: {
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
    accountRole?: string;
    profileImage?: string | null;
    hasProviderProfile?: boolean;
    canSwitchMode?: boolean;
    providerVerificationStatus?: string | null;
  };
}): CurrentUser | null {
  const apiUser = data.user;
  if (!apiUser?.id) return null;

  const nameParts = (apiUser.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  return {
    id: apiUser.id,
    firstName,
    lastName,
    email: apiUser.email,
    role: apiUser.role,
    accountRole: apiUser.accountRole,
    profileImage: apiUser.profileImage,
    hasProviderProfile: apiUser.hasProviderProfile,
    canSwitchMode: apiUser.canSwitchMode,
    providerVerificationStatus: apiUser.providerVerificationStatus,
  };
}

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function useCurrentUser() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/user', { cache: 'no-store' });

      if (!response.ok) {
        setUser(null);
        setStatus('guest');
        return;
      }

      const data = await response.json();
      const parsedUser = parseUserFromApi(data);

      if (parsedUser) {
        setUser(parsedUser);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('guest');
      }
    } catch {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await fetchCurrentUser();
      if (cancelled) return;
    };

    load();

    const handleAuthUpdated = () => {
      fetchCurrentUser();
    };

    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    };
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = window.setInterval(() => {
      void refreshAccessToken();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [status]);

  return {
    status,
    user,
    isLoading: status === 'loading',
    isGuest: status === 'guest',
    isAuthenticated: status === 'authenticated',
    refresh: fetchCurrentUser,
  };
}
