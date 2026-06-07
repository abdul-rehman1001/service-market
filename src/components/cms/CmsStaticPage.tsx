"use client";

import { useEffect, useState } from "react";
import { FileText, Info, Shield } from "lucide-react";
import CmsPageLoader from "@/components/cms/CmsPageLoader";
import CmsPageShell from "@/components/cms/CmsPageShell";
import { fetchCmsStaticContent } from "@/lib/cms-content";
import { getCmsStaticPageConfig, type CmsStaticPageKey } from "@/lib/cms-pages";

const PAGE_ICONS = {
  "about-us": Info,
  privacy: Shield,
  terms: FileText,
} as const;

const CMS_PROSE_CLASS =
  "prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#1E3A5F] prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-p:text-[#374151] prose-li:text-[#374151] prose-strong:text-[#111827] prose-a:text-[#10B981] prose-a:no-underline hover:prose-a:text-[#059669] prose-a:font-medium";

interface CmsStaticPageProps {
  pageKey: CmsStaticPageKey;
}

export default function CmsStaticPage({ pageKey }: CmsStaticPageProps) {
  const config = getCmsStaticPageConfig(pageKey);
  const Icon = PAGE_ICONS[pageKey];
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      const content = await fetchCmsStaticContent(pageKey);

      if (!isMounted) {
        return;
      }

      setBody(content);
      setLoading(false);
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [pageKey]);

  if (loading) {
    return <CmsPageLoader />;
  }

  return (
    <CmsPageShell icon={Icon} title={config.title}>
      {body ? (
        <div className={CMS_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-10 text-center">
          <p className="text-sm leading-relaxed text-[#6B7280]">{config.emptyMessage}</p>
        </div>
      )}
    </CmsPageShell>
  );
}
