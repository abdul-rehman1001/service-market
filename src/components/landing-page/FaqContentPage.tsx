"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqContentPage() {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFaqs = async () => {
      try {
        const response = await fetch("/api/content/faq");
        const data = await response.json();

        if (!isMounted) return;
        setFaqs(Array.isArray(data?.faqs) ? data.faqs : []);
      } catch {
        if (isMounted) {
          setFaqs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-800">Frequently Asked Questions</h1>
      <p className="mb-8 text-slate-500">Find answers to the most commonly asked questions.</p>

      {faqs.length === 0 ? (
        <p className="text-slate-500">No FAQs are available at the moment.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <article key={faq.id} className="overflow-hidden rounded-lg border bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <span className="pr-4 font-medium text-slate-800">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}