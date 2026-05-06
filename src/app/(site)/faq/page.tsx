"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Loader2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const fallbackFaqs: FAQ[] = [
    {
      id: "bookings",
      question: "How do bookings work on Servizo?",
      answer:
        "Browse a service, open a provider profile, review pricing and availability, then book the time slot that fits your schedule. You can follow the booking flow from your account and use messages to clarify details.",
    },
    {
      id: "providers",
      question: "How can I become a provider?",
      answer:
        "Create an account, choose the provider registration flow, add your service details, set your availability, and complete the verification steps shown in your dashboard. Once approved, your profile can start receiving booking requests.",
    },
    {
      id: "verification",
      question: "Why does verification matter?",
      answer:
        "Verification helps customers trust the people they book with. It also gives providers stronger profile credibility by showing that contact information and identity checks have been completed where required.",
    },
   
    {
      id: "support",
      question: "What should I do if something goes wrong?",
      answer:
        "If you need help, contact the support team through the contact details shown in the footer.",
    },
  ];

  useEffect(() => {
    fetch("/api/content/faq")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || []);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

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
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium uppercase tracking-[0.2em]">FAQ</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">Frequently Asked Questions</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Answers for seekers and providers using Servizo to discover services, manage bookings, and stay connected.
        </p>
      </div>

      {(faqs.length > 0 ? faqs : fallbackFaqs).length === 0 ? (
        <p className="mt-8 text-slate-500">No FAQs are available at the moment.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {(faqs.length > 0 ? faqs : fallbackFaqs).map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <span className="pr-4 font-medium text-slate-800">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={18} className="flex-shrink-0 text-emerald-600" />
                  ) : (
                    <ChevronDown size={18} className="flex-shrink-0 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t bg-slate-50 px-5 pb-4 text-sm whitespace-pre-wrap text-slate-600">
                    <div className="pt-3">{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
