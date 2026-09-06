export interface WatchSlugInput {
  year?: number | string | null;
  brand?: string | null;
  line?: string | null;
  model?: string | null;
  nickname?: string | null;
  modelNumber?: string | null;
  model_number?: string | null;
  reference?: string | null;
}

/**
 * Normalizes text for URL slugs:
 * - strips accents/diacritics (e.g. Söhne -> Sohne)
 * - converts spaces, slashes, periods, underscores to hyphens
 * - strips non-alphanumeric/hyphen characters
 * - collapses consecutive hyphens
 * - lowercases everything for Google indexing consistency
 */
export function cleanSlugPart(val: string): string {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[/_.\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates an SEO-optimized, Google-indexable slug for any watch following:
 * [year]-[brand]-[line]-[model]-[nickname]-[modelNumber]
 * 
 * If any detail is unknown or not provided, it is gracefully omitted.
 * Example: 1998-citizen-promaster-dive-fugu-ny0136-52l
 */
export function buildWatchSlug(watch: WatchSlugInput): string {
  const parts: string[] = [];

  // 1. Year
  if (watch.year) {
    const yr = String(watch.year).trim();
    if (/^\d{4}$/.test(yr)) {
      parts.push(yr);
    }
  }

  // 2. Brand
  if (watch.brand) {
    const cleaned = cleanSlugPart(watch.brand);
    if (cleaned) parts.push(cleaned);
  }

  // 3. Line / Collection (e.g. Promaster, Speedmaster, Submariner)
  if (watch.line) {
    const cleaned = cleanSlugPart(watch.line);
    if (cleaned) parts.push(cleaned);
  }

  // 4. Model (e.g. Dive, Professional, Chrono)
  if (watch.model) {
    const cleaned = cleanSlugPart(watch.model);
    if (cleaned) parts.push(cleaned);
  }

  // 5. Nickname (e.g. Fugu, Pepsi, Batman, Panda, Hulk)
  if (watch.nickname) {
    const cleaned = cleanSlugPart(watch.nickname);
    if (cleaned) parts.push(cleaned);
  }

  // 6. Model / Reference Number (e.g. NY0136-52L, 5711-1A, 116610LN)
  const ref = watch.modelNumber || watch.model_number || watch.reference;
  if (ref) {
    const cleaned = cleanSlugPart(ref);
    if (cleaned) parts.push(cleaned);
  }

  return parts.join('-');
}

/**
 * General taxonomy slugifier (e.g. for brand, line, or nickname URLs)
 */
export function slugify(text: string): string {
  return cleanSlugPart(text);
}

/**
 * Capitalizes words for human-readable display from a slug
 */
export function unslugify(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
