import { MetadataRoute } from 'next';
import { getAllWatches, getTaxonomyAggregates } from '@/lib/watch-queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://1000watches.com';
  const now = new Date();

  // Static root routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/years`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lines`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nicknames`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submissions`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  try {
    const [watches, taxonomy] = await Promise.all([
      getAllWatches(),
      getTaxonomyAggregates(),
    ]);

    // 1. Every Individual Watch Slug
    for (const watch of watches) {
      if (watch.slug) {
        routes.push({
          url: `${baseUrl}/timepieces/${watch.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: watch.isFilledSlot ? 0.85 : 0.7,
        });
      }
    }

    // 2. Every Brand Hub
    for (const b of taxonomy.brands) {
      routes.push({
        url: `${baseUrl}/brands/${b.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // 3. Every Year Hub
    for (const y of taxonomy.years) {
      routes.push({
        url: `${baseUrl}/years/${y.year}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // 4. Every Line Hub
    for (const l of taxonomy.lines) {
      routes.push({
        url: `${baseUrl}/lines/${l.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // 5. Every Nickname Hub
    for (const n of taxonomy.nicknames) {
      routes.push({
        url: `${baseUrl}/nicknames/${n.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Error building sitemap:', err);
  }

  return routes;
}
