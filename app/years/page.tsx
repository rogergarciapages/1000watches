import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getTaxonomyAggregates } from '@/lib/watch-queries';

export const metadata: Metadata = {
  title: 'Watch Release Years Timeline | 1,000 Watches Archive',
  description: 'Chronological archive of iconic timepieces cataloged by release year from vintage eras to modern horology.',
  alternates: {
    canonical: 'https://1000watches.com/years',
  },
};

export default async function YearsDirectoryPage() {
  const { years, totalWatches } = await getTaxonomyAggregates();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Years</span>
          </nav>

          {/* Header */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Chronological Timeline</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-[var(--text-primary)]">
              Horological <span className="text-amber-500 italic">Timeline</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-xl font-sans">
              Explore timepieces by year of original introduction across {years.length} distinct years in watchmaking history.
            </p>
          </div>

          {/* Grid of Years */}
          {years.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--border-medium)] rounded-2xl">
              <p className="text-[var(--text-muted)] font-sans">No release years cataloged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {years.map((y) => (
                <Link
                  key={y.year}
                  href={`/years/${y.year}`}
                  className="group p-4 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] hover:border-amber-500/50 transition-all duration-300 shadow-sm flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xl font-serif font-light text-[var(--text-primary)] group-hover:text-amber-500 transition-colors font-mono">
                    {y.year}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono mt-1">
                    {y.count} {y.count === 1 ? 'piece' : 'pieces'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
