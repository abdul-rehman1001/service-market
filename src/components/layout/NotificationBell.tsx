'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { getNotificationDetails } from '@/lib/fcm';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const details = getNotificationDetails(notification.type, {
      bookingId: notification.bookingId || '',
    });
    setOpen(false);
    router.push(details.url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return '📋';
      case 'BOOKING_CONFIRMED':
        return '✅';
      case 'BOOKING_CANCELLED':
        return '❌';
      case 'BOOKING_RESCHEDULED':
        return '🔄';
      case 'EN_ROUTE':
        return '🚗';
      case 'IN_PROGRESS':
        return '🔧';
      case 'COMPLETED':
        return '🎉';
      case 'REVIEW_RECEIVED':
        return '⭐';
      case 'VERIFICATION_STATUS_CHANGED':
        return '🛡️';
      case 'SYSTEM_UPDATE':
        return 'ℹ️';
      case 'REMINDER_24H':
      case 'REMINDER_2H':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const getTitle = (type: string) => {
    const details = getNotificationDetails(type);
    return details.title;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none ${
                    !notification.isRead ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  {/* Icon */}
                  <span className="text-lg mt-0.5 shrink-0">{getIcon(notification.type)}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${
                          !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}
                      >
                        {getTitle(notification.type)}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Read Indicator */}
                  {notification.isRead && (
                    <Check className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/notifications');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium w-full text-center py-1"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
