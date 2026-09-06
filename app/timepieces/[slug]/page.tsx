import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VoteButton from '@/components/VoteButton';
import PhotoGallery from '@/components/PhotoGallery';
import PhotoUploader from '@/components/PhotoUploader';
import { getWatchBySlug } from '@/lib/watch-queries';
import { slugify } from '@/utils/slug';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { specFields } from '@/lib/schemas';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const watch = await getWatchBySlug(slug);

  if (!watch) {
    return {
      title: 'Watch Not Found | 1,000 Watches',
      description: 'The requested timepiece could not be found in the 1,000 Watches archive.',
    };
  }

  const titleParts = [
    watch.year,
    watch.brand,
    watch.line,
    watch.model,
    watch.nickname ? `"${watch.nickname}"` : '',
    watch.model_number ? `(Ref. ${watch.model_number})` : '',
  ].filter(Boolean).join(' ');

  const title = `${titleParts} | 1,000 Watches`;
  const description = `Explore the ${watch.year} ${watch.brand} ${watch.model}${watch.nickname ? ` (${watch.nickname})` : ''}. Complete specifications, gallery, and community ranking in the 1,000 Watches horological archive.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://1000watches.com/timepieces/${watch.slug}`,
    },
    openGraph: {
      title,
      description,
      images: watch.image_url ? [{ url: watch.image_url }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: watch.image_url ? [watch.image_url] : [],
    },
  };
}

export default async function WatchDetailPage({ params }: Props) {
  const { slug } = await params;
  const watch = await getWatchBySlug(slug);

  if (!watch) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch watch specs if uuid exists
  let specs: any = null;
  if (watch.uuid) {
    const { data: specsData } = await supabase
      .from('watch_specs')
      .select('*')
      .eq('watch_id', watch.uuid)
      .maybeSingle();
    specs = specsData;
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Schema.org structured data for Google Search rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${watch.brand} ${watch.model}${watch.nickname ? ` "${watch.nickname}"` : ''}`,
    image: watch.image_url || undefined,
    description: `Iconic ${watch.year} timepiece by ${watch.brand}${watch.line ? ` (${watch.line} collection)` : ''}.`,
    brand: {
      '@type': 'Brand',
      name: watch.brand,
    },
    model: watch.model,
    productionDate: String(watch.year),
    category: 'Timepieces',
    mpn: watch.model_number || undefined,
  };

  const brandSlug = slugify(watch.brand);
  const lineSlug = watch.line ? slugify(watch.line) : null;
  const nicknameSlug = watch.nickname ? slugify(watch.nickname) : null;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      {/* Structured data injection for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] font-sans">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-amber-500 transition-colors">Brands</Link>
            <span>/</span>
            <Link href={`/brands/${brandSlug}`} className="hover:text-amber-500 transition-colors">{watch.brand}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)] truncate max-w-xs">{watch.model}</span>
          </nav>

          {/* Top Header & Interactive Taxonomy Tags */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Year Hub Tag */}
              <Link
                href={`/years/${watch.year}`}
                className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                title={`Browse all watches from ${watch.year}`}
              >
                Year {watch.year}
              </Link>

              {/* Brand Hub Tag */}
              <Link
                href={`/brands/${brandSlug}`}
                className="px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/40 text-xs font-sans transition-colors"
                title={`Browse all ${watch.brand} watches`}
              >
                {watch.brand}
              </Link>

              {/* Line Hub Tag */}
              {watch.line && lineSlug && (
                <Link
                  href={`/lines/${lineSlug}`}
                  className="px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/40 text-xs font-sans transition-colors"
                  title={`Browse all ${watch.line} models`}
                >
                  Line: {watch.line}
                </Link>
              )}

              {/* Nickname Hub Tag */}
              {watch.nickname && nicknameSlug && (
                <Link
                  href={`/nicknames/${nicknameSlug}`}
                  className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 font-serif italic text-xs hover:bg-amber-500/15 transition-colors"
                  title={`Browse all watches nicknamed "${watch.nickname}"`}
                >
                  "{watch.nickname}"
                </Link>
              )}

              {/* Reference number badge */}
              {watch.model_number && (
                <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-dim)] font-mono text-xs">
                  Ref: {watch.model_number}
                </span>
              )}
            </div>

            {/* Main Title Heading (H1 for SEO) */}
            <div>
              <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[var(--text-primary)]">
                {watch.brand} <span className="text-amber-500 italic">{watch.model}</span>
              </h1>
              {watch.nickname && (
                <p className="text-xl md:text-2xl font-serif italic text-[var(--text-secondary)] mt-1">
                  The "{watch.nickname}"
                </p>
              )}
            </div>
          </div>

          {/* Main Visual & Key Stats Section */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border-medium)] bg-[var(--bg-card)] aspect-square shadow-xl">
                {watch.image_url ? (
                  <img
                    src={watch.image_url}
                    alt={`${watch.brand} ${watch.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-secondary)]">
                    <span className="text-4xl font-serif text-[var(--text-muted)] mb-2">{watch.brand.charAt(0)}</span>
                    <p className="text-xs uppercase tracking-widest text-[var(--text-dim)] font-mono">Archive Specimen</p>
                  </div>
                )}
              </div>

              {watch.uuid && (
                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <PhotoGallery watchId={watch.uuid} userId={user?.id || null} />
                  {user && (
                    <div className="mt-4">
                      <PhotoUploader watchId={watch.uuid} onUploadComplete={() => {}} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Details & Specs Summary */}
            <div className="space-y-8">
              {/* Ranking & Community Status */}
              <div className="p-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Community Standing</span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {watch.isFilledSlot ? `Slot #${watch.slotNumber}` : 'Contender Status'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-2xl font-serif font-light text-[var(--text-primary)]">
                      {watch.votes.toLocaleString()} <span className="text-sm font-sans text-[var(--text-muted)]">votes</span>
                    </p>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5 font-sans">
                      Help elevate this timepiece in the archive.
                    </p>
                  </div>
                  {watch.uuid && (
                    <VoteButton
                      submissionId={watch.uuid}
                      initialVotes={watch.votes}
                      size="lg"
                      table={watch.isFilledSlot ? 'slots' : 'submissions'}
                    />
                  )}
                </div>
              </div>

              {/* Core Horological Attributes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">Manufacturer</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{watch.brand}</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">Release Year</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{watch.year}</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">Movement</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1 capitalize">{watch.movement_type || '—'}</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">Material</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{watch.material || '—'}</p>
                </div>
              </div>

              {/* URL Slug Information Bar */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-sans">Indexed Slug</p>
                <p className="font-mono text-[var(--text-dim)] break-all">
                  https://1000watches.com/timepieces/{watch.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Full Specifications if available */}
          {specs && (
            <div className="pt-8 border-t border-[var(--border-subtle)] space-y-8">
              <h2 className="text-2xl font-serif font-light text-[var(--text-primary)]">Technical Specifications</h2>
              <div className="space-y-6">
                {Object.entries(specFields).map(([category, fields]: [string, any]) => {
                  const hasFields = fields.some((field: { key: string }) => {
                    const value = specs[field.key];
                    return value !== null && value !== undefined && value !== '';
                  });
                  if (!hasFields) return null;

                  return (
                    <div key={category} className="p-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)]">
                      <p className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-4 font-sans border-b border-[var(--border-subtle)] pb-2 capitalize">
                        {category.replace(/_/g, ' ')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fields.map((field: any) => {
                          const val = specs[field.key];
                          if (val === null || val === undefined || val === '') return null;
                          return (
                            <div key={field.key} className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-sans">{field.label}</p>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
