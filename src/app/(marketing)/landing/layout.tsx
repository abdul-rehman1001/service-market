// src/app/(marketing)/landing/layout.tsx

import LandingHeader from "@/components/layout/landing/Header";
import LandingFooter from "@/components/layout/landing/Footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7F8] text-[#111827] antialiased">
      <LandingHeader />
      <div className="flex-1">{children}</div>
      <LandingFooter />
    </div>
  );
}
