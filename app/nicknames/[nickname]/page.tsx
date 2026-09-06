import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WatchCard from '@/components/WatchCard';
import { getWatchesByNickname, getAllWatches } from '@/lib/watch-queries';
import { slugify } from '@/utils/slug';

interface Props {
  params: Promise<{ nickname: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname: nickParam } = await params;
  const { nickname, watches } = await getWatchesByNickname(nickParam);

  const title = `"${nickname}" Watches Archive | 1,000 Watches`;
  const description = `Browse all ${watches.length} iconic timepieces known by the nickname "${nickname}" in the 1,000 Watches digital archive.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://1000watches.com/nicknames/${slugify(nickParam)}`,
    },
    openGraph: {
      title,
      description,
      images: watches[0]?.image_url ? [{ url: watches[0].image_url }] : [],
    },
  };
}

export default async function NicknameArchivePage({ params }: Props) {
  const { nickname: nickParam } = await params;
  const { nickname, watches } = await getWatchesByNickname(nickParam);

  if (!watches || watches.length === 0) {
    notFound();
  }

  // Get global ranks for all watches
  const allWatches = await getAllWatches();
  const rankMap = new Map<string, number>();
  allWatches.forEach((w, idx) => {
    rankMap.set(w.slug, idx + 1);
  });

  // Schema.org ItemList for Google indexing
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Watches Nicknamed "${nickname}"`,
    description: `All timepieces carrying the legendary "${nickname}" nickname in the horological archive.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: watches.map((w, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://1000watches.com/timepieces/${w.slug}`,
        name: `${w.year} ${w.brand} ${w.model}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/nicknames" className="hover:text-amber-500 transition-colors">Nicknames</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)] italic">"{nickname}"</span>
          </nav>

          {/* Header */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Iconic Monikers</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-[var(--text-primary)]">
              Watches Nicknamed <span className="text-amber-500 italic">"{nickname}"</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-xl font-sans">
              All {watches.length} {watches.length === 1 ? 'timepiece' : 'timepieces'} celebrated under the "{nickname}" moniker, gathered in one place regardless of leaderboard position.
            </p>
          </div>

          {/* Watch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watches.map((w) => (
              <WatchCard key={w.slug} watch={w} rank={rankMap.get(w.slug)} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
