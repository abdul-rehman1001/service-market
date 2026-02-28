// src/app/(marketing)/landing/layout.tsx

import LandingHeader from "@/components/layout/landing/Header";
import LandingFooter from "@/components/layout/landing/Footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <LandingHeader />
      <main className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
