'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageCircle,
  User,
  LogOut,
  LocateFixed,
  Navigation,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

interface ProviderData {
  id: string;
  businessName?: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

type LocationMode = 'current' | 'default';

interface LocationState {
  lat: number;
  lng: number;
  updatedAt?: string;
}

const LOCATION_MODE_STORAGE_KEY = 'provider-location-mode';
const LOCATION_SYNC_INTERVAL_MS = 15000;

interface ProviderDashboardHeaderProps {
  onOpenMessages?: () => void;
  onMenuClick?: () => void;
  activeTabLabel?: string;
}

export const ProviderDashboardHeader: React.FC<ProviderDashboardHeaderProps> = ({
  onOpenMessages,
  onMenuClick,
  activeTabLabel,
}) => {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>('current');
  const [locationModeHydrated, setLocationModeHydrated] = useState(false);
  const [hasDefaultLocation, setHasDefaultLocation] = useState(false);
  const [lastKnownLocation, setLastKnownLocation] = useState<LocationState | null>(null);
  const [locationMessage, setLocationMessage] = useState('Location sync idle');
  const [locationSyncing, setLocationSyncing] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSyncRef = useRef<number>(0);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetchProviderData();
    fetchLocationState();

    if (typeof window !== 'undefined') {
      const savedMode = window.localStorage.getItem(LOCATION_MODE_STORAGE_KEY);
      if (savedMode === 'current' || savedMode === 'default') {
        setLocationMode(savedMode);
      }
    }

    setLocationModeHydrated(true);
  }, []);

  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    if (!locationModeHydrated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLocationTracking();
        setLocationMessage('App inactive. Keeping last known location.');
        return;
      }

      if (locationMode === 'current') {
        startCurrentLocationTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [locationMode, locationModeHydrated]);

  useEffect(() => {
    if (!locationModeHydrated) return;

    if (locationMode === 'current') {
      startCurrentLocationTracking();
      return;
    }

    stopLocationTracking();
  }, [locationMode, locationModeHydrated]);

  useEffect(() => {
    if (!locationModeHydrated) return;
    if (locationMode !== 'default') return;
    if (!hasDefaultLocation) return;

    void applyDefaultLocation();
  }, [locationMode, hasDefaultLocation, locationModeHydrated]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistMode = (mode: LocationMode) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCATION_MODE_STORAGE_KEY, mode);
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const fetchLocationState = async () => {
    try {
      const response = await fetch('/api/provider/location');
      if (!response.ok) return;

      const data = await response.json();
      setHasDefaultLocation(Boolean(data.hasDefaultLocation));

      if (data.lastKnownLocation) {
        setLastKnownLocation({
          lat: Number(data.lastKnownLocation.lat),
          lng: Number(data.lastKnownLocation.lng),
          updatedAt: data.lastKnownLocation.updatedAt,
        });
      }
    } catch (error) {
      console.error('Failed to fetch provider location state:', error);
    }
  };

  const syncCurrentLocation = async (lat: number, lng: number) => {
    const now = Date.now();
    if (now - lastSyncRef.current < LOCATION_SYNC_INTERVAL_MS) {
      return;
    }

    try {
      setLocationSyncing(true);

      const response = await fetch('/api/provider/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-current', lat, lng }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync current location');
      }

      const data = await response.json();
      lastSyncRef.current = now;

      if (data.lastKnownLocation) {
        setLastKnownLocation({
          lat: Number(data.lastKnownLocation.lat),
          lng: Number(data.lastKnownLocation.lng),
          updatedAt: data.lastKnownLocation.updatedAt,
        });
      }

      setLocationMessage('Live location syncing while dashboard is active.');
    } catch (error) {
      setLocationMessage('Unable to sync live location. Keeping last known location.');
    } finally {
      setLocationSyncing(false);
    }
  };

  const startCurrentLocationTracking = () => {
    if (document.hidden) return;

    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    stopLocationTracking();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void syncCurrentLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. Using last known location.');
          return;
        }
        setLocationMessage('Unable to get current location. Using last known location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000,
      }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        void syncCurrentLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. Using last known location.');
          stopLocationTracking();
          return;
        }
        setLocationMessage('Live tracking interrupted. Using last known location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000,
      }
    );
  };

  const applyDefaultLocation = async () => {
    try {
      setLocationSyncing(true);
      const response = await fetch('/api/provider/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'use-default' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Default location is not configured');
      }

      if (data.lastKnownLocation) {
        setLastKnownLocation({
          lat: Number(data.lastKnownLocation.lat),
          lng: Number(data.lastKnownLocation.lng),
          updatedAt: data.lastKnownLocation.updatedAt,
        });
      }

      setLocationMessage('Using default location.');
    } catch (error: any) {
      setLocationMessage(error.message || 'Failed to switch to default location.');
    } finally {
      setLocationSyncing(false);
    }
  };

  const handleSetDefaultLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationSyncing(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const response = await fetch('/api/provider/location', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set-default', lat, lng }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to save default location');
          }

          setHasDefaultLocation(true);
          setLocationMessage('Default location saved. Switched to default mode.');
          setLocationMode('default');
          persistMode('default');
        } catch (error: any) {
          setLocationMessage(error.message || 'Failed to save default location.');
        } finally {
          setLocationSyncing(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Permission denied. Cannot set default location.');
        } else {
          setLocationMessage('Unable to get location for default setup.');
        }
        setLocationSyncing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      }
    );
  };

  const handleCurrentMode = () => {
    setLocationMode('current');
    persistMode('current');
  };

  const handleDefaultMode = () => {
    if (!hasDefaultLocation) {
      handleSetDefaultLocation();
      return;
    }

    setLocationMode('default');
    persistMode('default');
  };

  const fetchProviderData = async () => {
    try {
      const response = await fetch('/api/provider/dashboard');
      if (response.ok) {
        const data = await response.json();
        console.log('Provider data fetched:', data);
        setProvider(data.provider);
      } else {
        console.error('Failed to fetch provider data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch provider data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setShowNotifications(false);
    router.push('/notifications');
  };

  const handleMessagesClick = () => {
    if (onOpenMessages) {
      onOpenMessages();
      return;
    }

    router.push('/messages');
  };

  const getNotificationMessage = (notification: any) => {
    const type = notification.type;
    const booking = notification.booking;

    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'Your booking has been confirmed';
      case 'BOOKING_CANCELLED':
        return 'A booking was cancelled';
      case 'BOOKING_COMPLETED':
        return 'Booking completed successfully';
      case 'NEW_BOOKING':
        return booking?.service?.name 
          ? `New booking for ${booking.service.name}`
          : 'New booking request received';
      case 'PAYMENT_RECEIVED':
        return 'Payment received for a booking';
      case 'REVIEW_RECEIVED':
        return 'You received a new review';
      default:
        return 'You have a new notification';
    }
  };

  const getLastKnownTimeLabel = () => {
    if (!lastKnownLocation?.updatedAt) return 'Last known location unavailable';
    return `Last known updated ${new Date(lastKnownLocation.updatedAt).toLocaleTimeString()}`;
  };

  const displayName =
    provider?.businessName ||
    (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : 'Loading...');

  const locationBar = (
    <div className="inline-flex w-full max-w-full flex-col gap-2 rounded-xl border border-[#6FCF97]/45 bg-white/90 p-2 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-2.5 lg:w-auto lg:max-w-2xl">
      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#EEEEEE] p-1">
        <button
          type="button"
          onClick={handleCurrentMode}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
            locationMode === 'current'
              ? 'bg-[#2FA084] text-white shadow-sm'
              : 'text-[#1F6F5F] hover:bg-white'
          }`}
          title="Use live location while dashboard is active"
        >
          <LocateFixed className="h-3.5 w-3.5 shrink-0" />
          Current
        </button>
        <button
          type="button"
          onClick={handleDefaultMode}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
            locationMode === 'default'
              ? 'bg-[#1F6F5F] text-white shadow-sm'
              : 'text-[#1F6F5F] hover:bg-white'
          }`}
          title={
            hasDefaultLocation
              ? 'Use saved default location'
              : 'Set your current position as default location'
          }
        >
          <Navigation className="h-3.5 w-3.5 shrink-0" />
          {hasDefaultLocation ? 'Default' : 'Set default'}
        </button>
      </div>

      <div className="hidden h-8 w-px shrink-0 bg-[#6FCF97]/35 sm:block" aria-hidden />

      <div className="flex min-w-0 items-start gap-2 sm:items-center">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full sm:mt-0 ${
            locationSyncing
              ? 'animate-pulse bg-[#2FA084]'
              : locationMode === 'current'
                ? 'bg-[#2FA084]'
                : 'bg-[#6FCF97]'
          }`}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-snug text-[#1F6F5F] sm:max-w-[280px] sm:truncate lg:max-w-[320px]">
            {locationSyncing ? 'Syncing location…' : locationMessage}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-[#1F6F5F]/65 sm:max-w-[280px] sm:truncate lg:max-w-[320px]">
            {getLastKnownTimeLabel()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 w-full max-w-full overflow-hidden border-b border-[#6FCF97]/40 bg-gradient-to-r from-[#EEEEEE] via-white to-[#EEEEEE] shadow-[0_8px_28px_-22px_rgba(31,111,95,0.65)] backdrop-blur-sm">
      <div className="w-full max-w-full px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6FCF97]/50 bg-white text-[#1F6F5F] shadow-sm transition hover:border-[#2FA084] hover:bg-[#6FCF97]/15 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-[#1F6F5F] sm:text-xl lg:text-2xl">
                Provider Dashboard
              </h1>
              <p className="mt-0.5 truncate text-xs text-[#1F6F5F]/70 sm:text-sm">{displayName}</p>
              {activeTabLabel && (
                <p className="mt-1 hidden text-[11px] font-medium text-[#2FA084] sm:block lg:hidden">
                  {activeTabLabel}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 transition-colors hover:bg-[#6FCF97]/20"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-[#1F6F5F]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-xl border border-[#6FCF97]/40 bg-white shadow-xl sm:w-80">
                <div className="flex items-center justify-between border-b border-[#6FCF97]/40 bg-[#EEEEEE] px-4 py-3">
                  <h3 className="font-semibold text-[#1F6F5F]">Notifications</h3>
                  <Link
                    href="/notifications"
                    className="text-xs text-[#2FA084] hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto mb-3 h-10 w-10 text-[#6FCF97]" />
                      <p className="text-sm text-[#1F6F5F]/70">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`cursor-pointer border-b border-[#EEEEEE] px-4 py-3 transition-colors hover:bg-[#EEEEEE]/80 ${
                          !notification.isRead ? 'bg-[#6FCF97]/15' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-[#1F6F5F]">
                          {getNotificationMessage(notification)}
                        </p>
                        {notification.booking && (
                          <p className="mt-1 text-xs text-[#1F6F5F]/70">
                            Booking #{notification.booking.bookingNumber}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-[#1F6F5F]/60">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages/Chat */}
          <button
            onClick={handleMessagesClick}
            className="rounded-lg p-2 transition-colors hover:bg-[#6FCF97]/20"
            title="Messages"
            type="button"
          >
            <MessageCircle className="h-5 w-5 text-[#1F6F5F]" />
          </button>

          {/* Profile Button */}
          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-lg p-2 transition-colors hover:bg-[#6FCF97]/20 sm:flex"
            title="View Profile"
          >
            {provider?.user?.profileImage ? (
              <img
                src={provider.user.profileImage}
                alt={`${provider.user.firstName} ${provider.user.lastName}`}
                className="h-8 w-8 rounded-full border-2 border-[#6FCF97]/70 object-cover"
              />
            ) : provider?.user ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#6FCF97]/70 bg-gradient-to-br from-[#2FA084] to-[#1F6F5F] text-sm font-semibold text-white">
                {provider.user.firstName[0]}{provider.user.lastName[0]}
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#6FCF97]/70 bg-[#1F6F5F] text-sm font-semibold text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2FA084] px-2.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1F6F5F] sm:gap-2 sm:px-3"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
          </div>
        </div>

        {/* Location controls + status */}
        <div className="mt-3 flex justify-start">{locationBar}</div>
      </div>
    </header>
  );
};
