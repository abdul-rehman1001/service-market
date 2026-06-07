"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import CmsPageLoader from "@/components/cms/CmsPageLoader";
import CmsPageShell from "@/components/cms/CmsPageShell";
import { fetchCmsFaqs, type CmsFaqItem } from "@/lib/cms-content";
import { CMS_FAQ_CONFIG } from "@/lib/cms-pages";

export default function CmsFaqPage() {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<CmsFaqItem[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFaqs = async () => {
      const items = await fetchCmsFaqs();

      if (!isMounted) {
        return;
      }

      setFaqs(items);
      setLoading(false);
    };

    void loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <CmsPageLoader />;
  }

  return (
    <CmsPageShell
      icon={HelpCircle}
      title={CMS_FAQ_CONFIG.title}
      description={CMS_FAQ_CONFIG.description}
    >
      {faqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-10 text-center">
          <p className="text-sm leading-relaxed text-[#6B7280]">{CMS_FAQ_CONFIG.emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <article
                key={faq.id}
                className={`overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "border-[#10B981]/30 shadow-[0_4px_16px_rgba(16,185,129,0.08)]"
                    : "border-[#E5E7EB] hover:border-[#10B981]/20 hover:shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F9FAFB] sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-sm font-semibold text-[#111827] sm:text-base">{faq.question}</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isOpen ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#F9FAFB] text-[#6B7280]"
                    }`}
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm leading-7 whitespace-pre-wrap text-[#374151] sm:px-6">
                    {faq.answer}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </CmsPageShell>
  );
}
