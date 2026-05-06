"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Users } from "lucide-react";

export default function AboutUsPage() {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackSections = [
    {
      title: "Built for everyday service booking",
      description:
        "Servizo is a service marketplace that helps people discover, compare, and book professionals for home and personal services.",
    },
    {
      title: "Designed for seekers and providers",
      description:
        "Seekers can browse services, review provider profiles, chat after booking, and track appointments. Providers can manage services, availability, messages, and bookings from a single dashboard.",
    },
    {
      title: "A cleaner booking experience",
      description:
        "We focus on clear booking flows so the experience feels simple and reliable from search to completion.",
    },
  ];

  useEffect(() => {
    fetch("/api/content/about-us")
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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-700">
          
          <span className="font-medium uppercase tracking-[0.2em]">About Servizo</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">A marketplace for trusted services, built around clarity.</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Servizo connects people who need services with providers who want a clearer way to showcase their work, manage bookings, and grow with confidence.
        </p>
      </div>

      {body ? (
        <div className="prose prose-slate mt-8 max-w-none rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {fallbackSections.map((section, index) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                {index === 0 ? <Users className="h-5 w-5" /> : index === 1 ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
