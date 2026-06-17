export const MAX_CATEGORY_ICON_EMOJIS = 2;

export function splitEmojiGraphemes(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...segmenter.segment(trimmed)].map((part) => part.segment);
  }

  return trimmed.split(/[\s\n]+/).filter(Boolean);
}

export function normalizeCategoryIconInput(value: string): string {
  return splitEmojiGraphemes(value)
    .slice(0, MAX_CATEGORY_ICON_EMOJIS)
    .join('');
}

export function validateCategoryIcon(
  icon: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (icon === undefined || icon === null || icon === '') {
    return { ok: true, value: null };
  }

  if (typeof icon !== 'string') {
    return { ok: false, error: 'Icon must be text' };
  }

  const trimmed = icon.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const segments = splitEmojiGraphemes(trimmed);
  if (segments.length > MAX_CATEGORY_ICON_EMOJIS) {
    return {
      ok: false,
      error: `Icon can include at most ${MAX_CATEGORY_ICON_EMOJIS} emojis`,
    };
  }

  return { ok: true, value: segments.join('') };
}
