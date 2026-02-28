"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, ShieldCheck, Layers, Calendar, Star, FileText, HelpCircle, Menu } from "lucide-react";


const nav = [
{ label: "Dashboard", href: "/admin", icon: BarChart3 },
{ label: "User Management", href: "/admin/users", icon: Users },
{ label: "Provider Verification", href: "/admin/verification", icon: ShieldCheck },
{ label: "Categories", href: "/admin/categories", icon: Layers },
{ label: "Services", href: "/admin/services", icon: Layers },
{ label: "Bookings", href: "/admin/bookings", icon: Calendar },
{ label: "Reviews", href: "/admin/reviews", icon: Star },
{ label: "Content", href: "/admin/content", icon: FileText },
{ label: "Queries", href: "/admin/queries", icon: HelpCircle }
];


export default function AdminSidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
const pathname = usePathname();

return (
<aside
className={`fixed inset-y-0 left-0 z-40 w-64 bg-emerald-700 text-white transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
>
<div className="flex items-center justify-between px-6 py-4 border-b border-emerald-600">
<span className="font-semibold text-lg">Admin Panel</span>
<button className="lg:hidden" onClick={() => setOpen(false)}>
<Menu size={20} />
</button>
</div>


<nav className="px-4 py-4 space-y-1 text-sm">
{nav.map((item) => {
  const isActive = item.href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(item.href);

  return (
  <Link
key={item.href}
href={item.href}
className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
  isActive ? "bg-emerald-800 font-medium" : "hover:bg-emerald-600"
}`}
>
<item.icon size={18} />
{item.label}
</Link>
  );
})}
</nav>
</aside>
);
}