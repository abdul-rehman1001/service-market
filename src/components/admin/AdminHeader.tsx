"use client";


import { Menu } from "lucide-react";


export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
return (
<header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
<button className="lg:hidden" onClick={onMenuClick}>
<Menu />
</button>
<h1 className="font-semibold">Service Market – Admin</h1>
<span className="text-sm text-slate-600">admin@servicemarket.com</span>
</header>
);
}