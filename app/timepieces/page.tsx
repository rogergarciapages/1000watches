import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'All Brands | 1,000 Watches',
  description: 'Browse the complete collection of iconic watch brands in our digital horological archive.',
};

export default async function BrandsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: watches } = await supabase
    .from('slots')
    .select('brand')
    .eq('status', 'filled')
    .not('brand', 'is', null);

  const brands = [...new Set(watches?.map(w => w.brand) || [])].sort();

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <a href="/" className="hover:text-amber-500 transition-colors">Home</a>
            <span>/</span>
            <span className="text-white/50">All Brands</span>
          </nav>

          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-3">The Collection</p>
            <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight">
              Watch Brands
            </h1>
            <p className="text-white/40 mt-3 max-w-lg">
              Explore {brands.length} brands featured in our curated archive of the world's most iconic timepieces.
            </p>
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30">No watches in the archive yet.</p>
              <a href="/#nominate" className="text-amber-500 text-sm mt-4 inline-block hover:underline">
                Nominate a watch →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map((brand) => {
                const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                const count = watches?.filter(w => w.brand === brand).length || 0;
                
                return (
                  <Link
                    key={brand}
                    href={`/timepieces/${slug}`}
                    className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-500/30 transition-all"
                  >
                    <h2 className="text-lg font-display font-light text-white group-hover:text-amber-400 transition-colors">
                      {brand}
                    </h2>
                    <p className="text-[10px] text-white/30 mt-2 uppercase tracking-wider">
                      {count} {count === 1 ? 'model' : 'models'}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}