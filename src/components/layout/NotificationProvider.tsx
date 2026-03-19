'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Toaster } from 'react-hot-toast';


export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Hook initializes FCM, registers token, and sets up foreground listener
  useNotifications();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
      {children}
    </>
  );
}
