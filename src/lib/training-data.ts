import aiCategoriesCatalog from '@/data/ai-categories.json';

export type AICategoryCatalogItem = {
  key: string;
  name: string;
  keywords: string[];
  examples: string[];
};

type AICategoriesCatalog = {
  categories: AICategoryCatalogItem[];
};

const catalog = aiCategoriesCatalog as AICategoriesCatalog;

/**
 * Source-of-truth category catalog.
 * Update src/data/ai-categories.json to add/remove categories and examples.
 */
export const aiCategories = catalog.categories;

/**
 * Keyword aliases used for fast category matching.
 */
export const categoryKeywords: Record<string, string[]> = Object.fromEntries(
  aiCategories.map((category) => [category.key, category.keywords])
);

/**
 * Training examples used for embedding similarity.
 */
export const trainingData: Record<string, string[]> = Object.fromEntries(
  aiCategories.map((category) => [category.key, category.examples])
);