'use client';

import { useEffect, useState } from 'react';

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

function parseUserFromApi(data: {
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
    profileImage?: string | null;
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
    profileImage: apiUser.profileImage,
  };
}

export function useCurrentUser() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user', { cache: 'no-store' });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
            setStatus('guest');
          }
          return;
        }

        const data = await response.json();
        const parsedUser = parseUserFromApi(data);

        if (!cancelled) {
          if (parsedUser) {
            setUser(parsedUser);
            setStatus('authenticated');
          } else {
            setUser(null);
            setStatus('guest');
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus('guest');
        }
      }
    };

    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    status,
    user,
    isLoading: status === 'loading',
    isGuest: status === 'guest',
    isAuthenticated: status === 'authenticated',
  };
}
