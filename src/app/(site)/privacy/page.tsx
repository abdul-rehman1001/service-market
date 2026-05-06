"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Lock, Database, Bell } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackSections = [
    {
      title: "Information we collect",
      description:
        "We collect account details, profile information, booking activity, service preferences, messages, and technical data needed to operate the marketplace securely.",
    },
    {
      title: "How we use it",
      description:
        "Data is used to match seekers with providers, enable bookings and messaging, improve search, send notifications, prevent fraud, and support customer service.",
    },
    {
      title: "Sharing and access",
      description:
        "We only share information when necessary to fulfill a booking, operate the platform, comply with legal obligations, or support trusted service integrations.",
    },
    {
      title: "Your choices",
      description:
        "You can update your profile, manage communication preferences, and request account changes through the app or by contacting support.",
    },
  ];

  useEffect(() => {
    fetch("/api/content/privacy")
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
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium uppercase tracking-[0.2em]">Privacy Policy</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">How Servizo handles your information</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          This policy explains how we collect, use, store, and protect data when you use Servizo to discover services, communicate, and book appointments.
        </p>
      </div>

      {body ? (
        <div className="prose prose-slate mt-8 max-w-none rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {fallbackSections.map((section, index) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                {index === 0 ? <Database className="h-5 w-5" /> : index === 1 ? <Lock className="h-5 w-5" /> : index === 2 ? <Bell className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
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
