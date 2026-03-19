"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function TermsPage() {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content/terms")
      .then((res) => res.json())
      .then((data) => {
        setBody(data.content?.body || null);
      })
      .catch(() => setBody(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Terms &amp; Conditions</h1>
      {body ? (
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <p className="text-slate-500">Content is being updated. Please check back later.</p>
      )}
    </div>
  );
}
