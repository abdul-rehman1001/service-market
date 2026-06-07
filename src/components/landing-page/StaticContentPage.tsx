"use client";

import CmsStaticPage from "@/components/cms/CmsStaticPage";
import { isValidCmsStaticSlug, type CmsStaticPageKey } from "@/lib/cms-pages";

interface StaticContentPageProps {
  title: string;
  endpoint: string;
  emptyMessage: string;
}

function resolvePageKey(endpoint: string): CmsStaticPageKey | null {
  const match = endpoint.match(/\/api\/content\/([^/?#]+)$/);
  const slug = match?.[1];

  if (slug && isValidCmsStaticSlug(slug)) {
    return slug;
  }

  return null;
}

/** @deprecated Use `CmsStaticPage` from `@/components/cms/CmsStaticPage` */
export default function StaticContentPage({ endpoint }: StaticContentPageProps) {
  const pageKey = resolvePageKey(endpoint);

  if (!pageKey) {
    return null;
  }

  return <CmsStaticPage pageKey={pageKey} />;
}
