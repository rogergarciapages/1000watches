import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getTaxonomyAggregates } from '@/lib/watch-queries';

export const metadata: Metadata = {
  title: 'All Watch Brands | 1,000 Watches Archive',
  description: 'Explore timepieces categorized by manufacturer and brand in the definitive horological museum.',
  alternates: {
    canonical: 'https://1000watches.com/brands',
  },
};

export default async function BrandsDirectoryPage() {
  const { brands, totalWatches } = await getTaxonomyAggregates();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Brands</span>
          </nav>

          {/* Header */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Manufacturer Directory</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-[var(--text-primary)]">
              Watch <span className="text-amber-500 italic">Brands</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-xl font-sans">
              Discover timepieces from {brands.length} iconic watchmakers spanning centuries of horological mastery across {totalWatches} indexed watches.
            </p>
          </div>

          {/* Grid of Brands */}
          {brands.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--border-medium)] rounded-2xl">
              <p className="text-[var(--text-muted)] font-sans">No watch brands cataloged yet.</p>
              <Link href="/#nominate" className="text-amber-500 text-xs font-bold uppercase tracking-wider mt-4 inline-block hover:underline font-sans">
                Nominate a Watch →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="group p-5 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] hover:border-amber-500/50 transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <h2 className="text-lg font-serif font-light text-[var(--text-primary)] group-hover:text-amber-500 transition-colors truncate">
                    {b.name}
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono mt-3">
                    {b.count} {b.count === 1 ? 'piece' : 'pieces'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
