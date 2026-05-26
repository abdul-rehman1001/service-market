'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/fcm';
import toast from 'react-hot-toast';

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
    service: {
      name: string;
    };
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const authBlocked = useRef(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (authBlocked.current) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) {
        authBlocked.current = true;
        setLoading(false);
        return;
      }

      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Register FCM token on server
  const registerToken = useCallback(async (token: string) => {
    if (authBlocked.current) return;

    try {
      const res = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.status === 401) {
        authBlocked.current = true;
      }
    } catch {
      // silently fail
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (authBlocked.current) return;

    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (res.status === 401) {
        authBlocked.current = true;
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (authBlocked.current) return;

    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (res.status === 401) {
        authBlocked.current = true;
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  // Initialize FCM and listeners
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchNotifications();

    // Request permission and register token
    requestNotificationPermission().then((token) => {
      if (token) {
        registerToken(token);
      }
    });

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body || '';

      // Show toast for foreground notifications
      toast(
        (t) => {
          // We need to return JSX but this file doesn't use JSX syntax
          // So we'll render a simple text notification
          return `${title}: ${body}`;
        },
        {
          duration: 5000,
          position: 'top-right',
          icon: '🔔',
        }
      );

      // Refresh notifications list
      fetchNotifications();
    });

    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(fetchNotifications, 30000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [fetchNotifications, registerToken]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}
