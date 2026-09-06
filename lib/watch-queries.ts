import { createClient } from '@/utils/supabase/server';
import { buildWatchSlug, cleanSlugPart, slugify } from '@/utils/slug';

export interface WatchItem {
  id: string | number;
  uuid?: string;
  brand: string;
  line?: string | null;
  model: string;
  nickname?: string | null;
  model_number?: string | null;
  year: number;
  material?: string | null;
  movement_type?: string | null;
  image_url?: string | null;
  slug: string;
  votes: number;
  isFilledSlot: boolean;
  slotNumber?: number | null;
  status?: string;
}

/**
 * Normalizes and merges watches from slots and submissions
 */
export async function getAllWatches(): Promise<WatchItem[]> {
  const supabase = createClient();

  // 1. Fetch slots that have a watch
  const { data: slots } = await supabase
    .from('slots')
    .select('*')
    .eq('status', 'filled');

  // 2. Fetch all submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*');

  const watches: WatchItem[] = [];
  const seenSlugs = new Set<string>();

  // Process slots first
  if (slots) {
    for (const slot of slots) {
      const slug = slot.slug || buildWatchSlug({
        year: slot.year,
        brand: slot.brand,
        line: slot.line,
        model: slot.model,
        nickname: slot.nickname,
        modelNumber: slot.model_number || slot.reference,
      });

      if (slug) seenSlugs.add(slug);

      watches.push({
        id: slot.id,
        uuid: slot.uuid || undefined,
        brand: slot.brand,
        line: slot.line || null,
        model: slot.model,
        nickname: slot.nickname || null,
        model_number: slot.model_number || slot.reference || null,
        year: slot.year,
        material: slot.material,
        movement_type: slot.movement_type,
        image_url: slot.image_url,
        slug,
        votes: 0,
        isFilledSlot: true,
        slotNumber: slot.id,
        status: slot.status,
      });
    }
  }

  // Process submissions
  if (submissions) {
    for (const sub of submissions) {
      const slug = sub.slug || buildWatchSlug({
        year: sub.year,
        brand: sub.brand,
        line: sub.line,
        model: sub.model,
        nickname: sub.nickname,
        modelNumber: sub.model_number,
      });

      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        watches.push({
          id: sub.id,
          uuid: sub.id,
          brand: sub.brand,
          line: sub.line || null,
          model: sub.model,
          nickname: sub.nickname || null,
          model_number: sub.model_number || null,
          year: sub.year,
          material: sub.material,
          movement_type: sub.movement_type,
          image_url: sub.image_url,
          slug,
          votes: sub.votes || 0,
          isFilledSlot: false,
          slotNumber: null,
          status: 'submission',
        });
      }
    }
  }

  // Sort by votes DESC, then year DESC
  return watches.sort((a, b) => (b.votes || 0) - (a.votes || 0));
}

/**
 * Look up a single watch by its canonical slug
 */
export async function getWatchBySlug(slug: string): Promise<WatchItem | null> {
  const normalized = cleanSlugPart(slug);
  const all = await getAllWatches();
  return all.find(w => cleanSlugPart(w.slug) === normalized) || null;
}

/**
 * Filter all watches by brand (slug or string)
 */
export async function getWatchesByBrand(brandParam: string): Promise<{ brandName: string; watches: WatchItem[] }> {
  const normalized = cleanSlugPart(brandParam);
  const all = await getAllWatches();
  const matched = all.filter(w => cleanSlugPart(w.brand) === normalized);
  const brandName = matched[0]?.brand || brandParam;
  return { brandName, watches: matched };
}

/**
 * Filter all watches by release year
 */
export async function getWatchesByYear(yearParam: string | number): Promise<WatchItem[]> {
  const yr = parseInt(String(yearParam), 10);
  if (isNaN(yr)) return [];
  const all = await getAllWatches();
  return all.filter(w => w.year === yr);
}

/**
 * Filter all watches by line/collection
 */
export async function getWatchesByLine(lineParam: string): Promise<{ lineName: string; watches: WatchItem[] }> {
  const normalized = cleanSlugPart(lineParam);
  const all = await getAllWatches();
  const matched = all.filter(w => w.line && cleanSlugPart(w.line) === normalized);
  const lineName = matched[0]?.line || lineParam;
  return { lineName, watches: matched };
}

/**
 * Filter all watches by nickname
 */
export async function getWatchesByNickname(nicknameParam: string): Promise<{ nickname: string; watches: WatchItem[] }> {
  const normalized = cleanSlugPart(nicknameParam);
  const all = await getAllWatches();
  const matched = all.filter(w => w.nickname && cleanSlugPart(w.nickname) === normalized);
  const nickname = matched[0]?.nickname || nicknameParam;
  return { nickname, watches: matched };
}

/**
 * Get distinct taxonomy counts for directory pages and sitemap
 */
export async function getTaxonomyAggregates() {
  const all = await getAllWatches();

  const brandsMap = new Map<string, { name: string; count: number; slug: string }>();
  const yearsMap = new Map<number, number>();
  const linesMap = new Map<string, { name: string; count: number; slug: string }>();
  const nicknamesMap = new Map<string, { name: string; count: number; slug: string }>();

  for (const w of all) {
    // Brand
    if (w.brand) {
      const bSlug = slugify(w.brand);
      const existing = brandsMap.get(bSlug);
      if (existing) existing.count++;
      else brandsMap.set(bSlug, { name: w.brand, count: 1, slug: bSlug });
    }

    // Year
    if (w.year) {
      yearsMap.set(w.year, (yearsMap.get(w.year) || 0) + 1);
    }

    // Line
    if (w.line) {
      const lSlug = slugify(w.line);
      const existing = linesMap.get(lSlug);
      if (existing) existing.count++;
      else linesMap.set(lSlug, { name: w.line, count: 1, slug: lSlug });
    }

    // Nickname
    if (w.nickname) {
      const nSlug = slugify(w.nickname);
      const existing = nicknamesMap.get(nSlug);
      if (existing) existing.count++;
      else nicknamesMap.set(nSlug, { name: w.nickname, count: 1, slug: nSlug });
    }
  }

  const brands = Array.from(brandsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const years = Array.from(yearsMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
  const lines = Array.from(linesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const nicknames = Array.from(nicknamesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return { brands, years, lines, nicknames, totalWatches: all.length };
}
