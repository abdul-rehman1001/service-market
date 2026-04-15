"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface StaticContentPageProps {
  title: string;
  endpoint: string;
  emptyMessage: string;
}

export default function StaticContentPage({ title, endpoint, emptyMessage }: StaticContentPageProps) {
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!isMounted) return;
        const nextBody = typeof data?.content?.body === "string" ? data.content.body : null;
        setBody(nextBody && nextBody.trim().length > 0 ? nextBody : null);
      } catch {
        if (isMounted) {
          setBody(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">{title}</h1>
      {body ? (
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <p className="text-slate-500">{emptyMessage}</p>
      )}
    </section>
  );
}