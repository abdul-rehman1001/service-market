// src/app/layout.tsx
import "./globals.css";

import LandingHeader from "@/components/layout/landing/Header";
import LandingFooter from "@/components/layout/landing/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f5f7f8] text-gray-800">
        <LandingHeader />
        <main className="flex-1">
          {children}
        </main>
        <LandingFooter />
      </body>
    </html>
  );
}
