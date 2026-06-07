import {
  getCmsStaticPageConfig,
  type CmsStaticPageKey,
} from "@/lib/cms-pages";

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
  order?: number;
}

export function getCmsStaticContentUrl(pageKey: CmsStaticPageKey): string {
  return `/api/content/${getCmsStaticPageConfig(pageKey).slug}`;
}

export function getCmsFaqContentUrl(): string {
  return "/api/content/faq";
}

export async function fetchCmsStaticContent(pageKey: CmsStaticPageKey): Promise<string | null> {
  try {
    const response = await fetch(getCmsStaticContentUrl(pageKey));

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const body = typeof data?.content?.body === "string" ? data.content.body : null;
    return body && body.trim().length > 0 ? body : null;
  } catch {
    return null;
  }
}

export async function fetchCmsFaqs(): Promise<CmsFaqItem[]> {
  try {
    const response = await fetch(getCmsFaqContentUrl());

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data?.faqs) ? data.faqs : [];
  } catch {
    return [];
  }
}
