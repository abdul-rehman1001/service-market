'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, MessageCircle, User, LogOut, Settings } from 'lucide-react';
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

export const ProviderDashboardHeader: React.FC = () => {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetchProviderData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Dashboard Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Provider Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {provider?.businessName || (provider?.user ? `${provider.user.firstName} ${provider.user.lastName}` : 'Loading...')}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
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
          <Link
            href="/messages"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5 text-slate-600" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && provider?.user && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="font-semibold text-slate-800">
                    {provider.user.firstName} {provider.user.lastName}
                  </p>
                  {provider.businessName && (
                    <p className="text-xs text-slate-500 mt-1">{provider.businessName}</p>
                  )}
                </div>
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
