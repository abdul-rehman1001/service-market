'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, MessageCircle, User, LogOut, LocateFixed, Navigation, House } from 'lucide-react';
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
}

export const ProviderDashboardHeader: React.FC<ProviderDashboardHeaderProps> = ({
  onOpenMessages,
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

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between gap-5 px-6 py-4">
        {/* Left: Dashboard Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Provider Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {provider?.businessName || (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : 'Loading...')}
          </p>
        </div>

        {/* Middle: Location Mode Controls */}
        <div className="hidden md:flex flex-1 max-w-3xl items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={handleCurrentMode}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                locationMode === 'current'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
              title="Use live location while dashboard is active"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              Use My Current Location
            </button>

            <button
              onClick={handleDefaultMode}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                locationMode === 'default'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
              title={
                hasDefaultLocation
                  ? 'Use saved default location'
                  : 'Set your current position as default location'
              }
            >
              <Navigation className="w-3.5 h-3.5" />
              {hasDefaultLocation ? 'Use Default Location' : 'Set Default Location'}
            </button>
          </div>

          <div className="min-w-[280px] rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-semibold text-slate-700">
              {locationSyncing ? 'Syncing location...' : locationMessage}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{getLastKnownTimeLabel()}</p>
            {!hasDefaultLocation && (
              <p className="mt-0.5 text-[11px] text-slate-500">
                Set default location only when you are at your regular service base.
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors sm:px-3"
            title="Open marketplace home"
          >
            <House className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  <Link
                    href="/notifications"
                    className="text-xs text-emerald-600 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                          !notification.isRead ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {getNotificationMessage(notification)}
                        </p>
                        {notification.booking && (
                          <p className="text-xs text-slate-500 mt-1">
                            Booking #{notification.booking.bookingNumber}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
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
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Messages"
            type="button"
          >
            <MessageCircle className="w-5 h-5 text-slate-600" />
          </button>

          {/* Profile Button */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="View Profile"
          >
            {provider?.user?.profileImage ? (
              <img
                src={provider.user.profileImage}
                alt={`${provider.user.firstName} ${provider.user.lastName}`}
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
              />
            ) : provider?.user ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-200">
                {provider.user.firstName[0]}{provider.user.lastName[0]}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
