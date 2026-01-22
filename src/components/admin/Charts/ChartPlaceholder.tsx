"use client";


export default function ChartPlaceholder({ title }: { title: string }) {
return (
<div className="bg-white rounded-xl shadow-sm p-6 h-72 flex flex-col">
<h3 className="font-semibold mb-4">{title}</h3>
<div className="flex-1 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400">
Chart will be rendered here
</div>
</div>
);
}