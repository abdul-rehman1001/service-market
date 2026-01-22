"use client";


import { ReactNode } from "react";


export default function StatCard({
title,
value,
icon,
}: {
title: string;
value: string | number;
icon: ReactNode;
}) {
return (
<div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
<div className="p-3 rounded-lg bg-emerald-100 text-emerald-700">
{icon}
</div>
<div>
<p className="text-sm text-slate-500">{title}</p>
<p className="text-2xl font-semibold">{value}</p>
</div>
</div>
);
}