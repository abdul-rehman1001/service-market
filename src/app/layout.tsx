// src/app/layout.tsx
import "./globals.css";
import NotificationProvider from "@/components/layout/NotificationProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Servizo - Service Marketplace',
  description: 'Find verified service providers and book services near you',
  icons: {
    icon: '/images/Servizo.jpeg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-[#f5f7f8] text-gray-800"
        suppressHydrationWarning
      >
        <NotificationProvider>
          <main className="flex-1">
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
