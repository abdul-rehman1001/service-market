'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, ArrowLeft, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNotificationDetails } from '@/lib/fcm';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/layout/Header';

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  bookingId?: string | null;
  createdAt: string;
  booking?: {
    id: string;
    bookingNumber: string;
    status: string;
    service: { name: string };
  } | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const details = getNotificationDetails(notification.type, {
      bookingId: notification.bookingId || '',
    });
    router.push(details.url);
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      BOOKING_REQUEST: '📋',
      BOOKING_CONFIRMED: '✅',
      BOOKING_CANCELLED: '❌',
      BOOKING_RESCHEDULED: '🔄',
      EN_ROUTE: '🚗',
      IN_PROGRESS: '🔧',
      COMPLETED: '🎉',
      REVIEW_RECEIVED: '⭐',
      VERIFICATION_STATUS_CHANGED: '🛡️',
      SYSTEM_UPDATE: 'ℹ️',
      REMINDER_24H: '⏰',
      REMINDER_2H: '⏰',
    };
    return map[type] || '🔔';
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading notifications…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              filtered.map((notification) => {
                const details = getNotificationDetails(notification.type, {
                  bookingId: notification.bookingId || '',
                  bookingNumber: notification.booking?.bookingNumber || '',
                });

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none ${
                      !notification.isRead ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <span className="text-xl mt-0.5 shrink-0">{getIcon(notification.type)}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm ${
                            !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          }`}
                        >
                          {details.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{details.body}</p>
                      {notification.booking && (
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.booking.service.name} — #{notification.booking.bookingNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {notification.isRead && (
                      <Check className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
