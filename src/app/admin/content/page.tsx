"use client";

import ContentTabs from "@/components/admin/content/ContentTabs";

export default function ContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Content Management</h1>
        <p className="text-slate-600">
          Edit and publish platform pages &amp; FAQ content
        </p>
      </div>

      <ContentTabs />
    </div>
  );
}
