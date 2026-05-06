"use client";

import { useState, useEffect } from "react";
import { Clock3, FileCheck2, Loader2, Scale, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackSections = [
    {
      title: "Using the platform",
      description:
        "Servizo is intended to help users discover providers, communicate about services, and complete bookings in a respectful and lawful way.",
    },
    {
      title: "Accounts and accuracy",
      description:
        "You agree to provide accurate information, keep your account details current, and only represent services you can actually deliver or request.",
    },
    {
      title: "Bookings and cancellations",
      description:
        "Service availability, pricing, and booking terms may vary by provider. Cancellations, rescheduling, and service-specific conditions should be reviewed before confirming.",
    },
    {
      title: "Acceptable behavior",
      description:
        "Do not misuse the platform, interfere with other users, attempt unauthorized access, or post misleading, abusive, or harmful content.",
    },
  ];

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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-emerald-700">
          <Scale className="h-4 w-4" />
          <span className="font-medium uppercase tracking-[0.2em]">Terms &amp; Conditions</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">Rules for using Servizo</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          These terms define how seekers and providers use Servizo, what we expect from users, and how bookings, accounts, and content should be handled.
        </p>
      </div>

      {body ? (
        <div className="prose prose-slate mt-8 max-w-none rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {fallbackSections.map((section, index) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                {index === 0 ? <FileCheck2 className="h-5 w-5" /> : index === 1 ? <ShieldAlert className="h-5 w-5" /> : index === 2 ? <Clock3 className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
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
