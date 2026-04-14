'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getStoredUserCoordinates,
  saveUserCoordinates,
  type UserCoordinates,
} from '@/lib/location/clientLocation';

export type UserLocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

type UseUserLocationOptions = {
  requestOnMount?: boolean;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  cacheMaxAgeMs?: number;
};

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const {
    requestOnMount = true,
    enableHighAccuracy = false,
    maximumAge = 60_000,
    timeout = 10_000,
    cacheMaxAgeMs = 30 * 60_000,
  } = options;

  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        setLocation(coords);
        setStatus('granted');
        saveUserCoordinates(coords);
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location access denied. You can continue without location.');
          return;
        }

        setStatus('error');
        setError('Unable to fetch your current location.');
      },
      {
        enableHighAccuracy,
        maximumAge,
        timeout,
      }
    );
  }, [enableHighAccuracy, maximumAge, timeout]);

  useEffect(() => {
    const cached = getStoredUserCoordinates(cacheMaxAgeMs);
    if (cached) {
      setLocation(cached);
      setStatus('granted');
    }

    if (!requestOnMount) return;

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          if (permission.state === 'denied') {
            setStatus('denied');
            setError('Location access denied. You can enable it from browser settings.');
            return;
          }
          requestLocation();
        })
        .catch(() => {
          requestLocation();
        });
      return;
    }

    requestLocation();
  }, [cacheMaxAgeMs, requestOnMount, requestLocation]);

  return {
    location,
    status,
    error,
    requestLocation,
  };
}
