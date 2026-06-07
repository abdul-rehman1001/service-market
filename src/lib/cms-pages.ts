export const CMS_STATIC_PAGE_KEYS = ["about-us", "terms", "privacy"] as const;

export type CmsStaticPageKey = (typeof CMS_STATIC_PAGE_KEYS)[number];

export interface CmsStaticPageConfig {
  slug: CmsStaticPageKey;
  title: string;
  emptyMessage: string;
}

export const CMS_STATIC_PAGES: Record<CmsStaticPageKey, CmsStaticPageConfig> = {
  "about-us": {
    slug: "about-us",
    title: "About Us",
    emptyMessage: "About information is being updated. Please check back later.",
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    emptyMessage: "Privacy Policy content is being updated. Please check back later.",
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    emptyMessage: "Terms & Conditions content is being updated. Please check back later.",
  },
};

export const CMS_FAQ_CONFIG = {
  title: "Frequently Asked Questions",
  description: "Find answers to the most commonly asked questions.",
  emptyMessage: "No FAQs are available at the moment.",
};

export function isValidCmsStaticSlug(slug: string): slug is CmsStaticPageKey {
  return CMS_STATIC_PAGE_KEYS.includes(slug as CmsStaticPageKey);
}

export function getCmsStaticPageConfig(pageKey: CmsStaticPageKey): CmsStaticPageConfig {
  return CMS_STATIC_PAGES[pageKey];
}
