// src/app/layout.tsx
import "./globals.css";
import NotificationProvider from "@/components/layout/NotificationProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#f5f7f8] text-gray-800">
        <NotificationProvider>
          <main className="flex-1">
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
