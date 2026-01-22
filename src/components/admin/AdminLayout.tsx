"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader  from "./AdminHeader";


export default function AdminLayout({ children }: { children: ReactNode }) {
const [open, setOpen] = useState(false);


return (
<div className="flex min-h-screen bg-emerald-50">
<AdminSidebar open={open} setOpen={setOpen} />


<div className="flex-1 lg:ml-64">
<AdminHeader onMenuClick={() => setOpen(!open)} />
<main className="p-6">{children}</main>
</div>
</div>
);
}