"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--admin-cream)]">
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-[var(--admin-green-dark)]/40 backdrop-blur-sm lg:hidden animate-admin-fade-in-up"
          onClick={() => setOpen(false)}
        />
      )}

      <AdminSidebar open={open} setOpen={setOpen} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[17.5rem]">
        <AdminHeader onMenuClick={() => setOpen(!open)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
