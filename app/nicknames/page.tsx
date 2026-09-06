import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getTaxonomyAggregates } from '@/lib/watch-queries';

export const metadata: Metadata = {
  title: 'Iconic Watch Nicknames | 1,000 Watches Archive',
  description: 'Explore the world of legendary watch nicknames (e.g. Fugu, Pepsi, Batman, Hulk, Panda, Paul Newman) in the digital horological museum.',
  alternates: {
    canonical: 'https://1000watches.com/nicknames',
  },
};

export default async function NicknamesDirectoryPage() {
  const { nicknames } = await getTaxonomyAggregates();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Nicknames</span>
          </nav>

          {/* Header */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Community Horology Lore</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-[var(--text-primary)]">
              Iconic <span className="text-amber-500 italic">Nicknames</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-xl font-sans">
              Watches christened by collectors with beloved monikers ({nicknames.length} nicknames indexed).
            </p>
          </div>

          {/* Grid of Nicknames */}
          {nicknames.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--border-medium)] rounded-2xl">
              <p className="text-[var(--text-muted)] font-sans">No watch nicknames cataloged yet.</p>
              <Link href="/#nominate" className="text-amber-500 text-xs font-bold uppercase tracking-wider mt-4 inline-block hover:underline font-sans">
                Nominate a Watch with a Nickname →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {nicknames.map((n) => (
                <Link
                  key={n.slug}
                  href={`/nicknames/${n.slug}`}
                  className="group p-5 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] hover:border-amber-500/50 transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <h2 className="text-lg font-serif italic text-amber-400 group-hover:text-amber-300 transition-colors truncate">
                    "{n.name}"
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono mt-3">
                    {n.count} {n.count === 1 ? 'piece' : 'pieces'}
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
