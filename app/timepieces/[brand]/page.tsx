import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const brandName = brand.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    title: `${brandName} Watches | 1,000 Watches`,
    description: `Browse all ${brandName} timepieces in our digital horological archive.`,
  };
}

function createSlug(brand: string, model: string): string {
  const slugBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slugModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slugBrand}/${slugModel}`;
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brandName = brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: watches } = await supabase
    .from('slots')
    .select('id, brand, model, year, image_url')
    .eq('status', 'filled')
    .ilike('brand', brandName);

  if (!watches || watches.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <a href="/" className="hover:text-amber-500 transition-colors">Home</a>
            <span>/</span>
            <a href="/timepieces" className="hover:text-amber-500 transition-colors">Brands</a>
            <span>/</span>
            <span className="text-white/50">{brandName}</span>
          </nav>

          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-3">{brandName}</p>
            <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight">
              Collection
            </h1>
            <p className="text-white/40 mt-3 max-w-lg">
              {watches.length} {watches.length === 1 ? 'timepiece' : 'timepieces'} from {brandName} in our archive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watches.map((watch) => {
              const watchSlug = createSlug(watch.brand, watch.model);
              
              return (
                <Link
                  key={watch.id}
                  href={`/timepieces/${watchSlug}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] group-hover:border-amber-500/40 transition-all">
                    {watch.image_url ? (
                      <img 
                        src={watch.image_url} 
                        alt={`${watch.brand} ${watch.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                          <span className="text-2xl font-display text-white/20">{watch.id}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">View Details →</p>
                      </div>
                    </div>
                    
                    {/* Slot badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                      #{watch.id}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h2 className="text-base font-display font-light text-white group-hover:text-amber-400 transition-colors">
                      {watch.model}
                    </h2>
                    {watch.year && (
                      <p className="text-xs text-white/30 mt-1">{watch.year}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}