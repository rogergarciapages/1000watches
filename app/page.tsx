import Navbar from '@/components/Navbar';
import Grid from '@/components/Grid';
import SubmissionForm from '@/components/SubmissionForm';
import PhasePreview from '@/components/PhasePreview';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-amber-500/[0.08] to-transparent rounded-full blur-[120px] -z-10" />
        <div className="absolute top-48 left-1/4 w-64 h-64 bg-amber-600/[0.04] rounded-full blur-[80px] -z-10" />
        <div className="absolute top-48 right-1/4 w-64 h-64 bg-amber-600/[0.04] rounded-full blur-[80px] -z-10" />

        <div className="max-w-7xl mx-auto text-center space-y-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-500">The Museum Project</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 animate-fade-in [animation-delay:150ms]">
            <h1 className="text-7xl md:text-9xl font-display font-extralight tracking-tighter leading-none">
              1,000
            </h1>
            <h1 className="text-7xl md:text-9xl font-display font-extralight tracking-tighter leading-none text-amber-500 italic">
              Watches
            </h1>
          </div>

          {/* Subheadline */}
          <p className="max-w-xl mx-auto text-base md:text-lg text-white/40 font-light leading-relaxed animate-fade-in [animation-delay:300ms]">
            The definitive digital archive of the most iconic timepieces ever crafted.
            One thousand slots. A century of horology.
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center gap-10 pt-6 animate-fade-in [animation-delay:450ms]">
            <Stat value="1,000" label="Total Slots" />
            <Divider />
            <Stat value="Phase 1" label="Active" accent />
            <Divider />
            <Stat value="∞" label="Horology" />
          </div>

          {/* CTA row */}
          <div className="flex justify-center gap-4 pt-6 animate-fade-in [animation-delay:600ms]">
            <a
              href="#archive"
              className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95"
            >
              Explore Archive
            </a>
            <a
              href="#nominate"
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all"
            >
              Submit a Watch
            </a>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Grid / Archive Section */}
      <section id="archive" className="px-4 py-24 max-w-[1700px] mx-auto scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 px-2 gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-amber-500">Phase 1 — Open Submissions</p>
            <h2 className="text-3xl font-display font-light tracking-tight text-white/90">The Archive</h2>
            <p className="text-sm text-white/30">Every slot begins empty. Every watch is earned.</p>
          </div>
          <div className="flex gap-2 text-[10px] uppercase tracking-widest text-white/20 items-center">
            <span className="w-2 h-2 rounded-full border border-white/20" />
            Empty
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-4" />
            Filled
          </div>
        </div>

        <Grid />
      </section>

      {/* Decorative divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Submission Section */}
      <section id="nominate" className="py-32 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Left copy */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-3">Open Nominations</p>
              <h2 className="text-4xl font-display font-light tracking-tight leading-tight">
                Shape the <br /><span className="text-amber-500">History</span>
              </h2>
            </div>
            <p className="text-white/40 leading-relaxed text-sm">
              We are currently accepting nominations for the inaugural 1,000. 
              If you believe a specific reference or model defines an era, 
              a technological milestone, or a design language — submit it for review.
            </p>
            <ul className="space-y-3">
              {[
                ['Historical Significance', 'Timepieces that shaped the industry'],
                ['Technical Innovation', 'Groundbreaking movements and complications'],
                ['Cultural Impact', 'Watches that transcended horology'],
                ['Design Excellence', 'Masterclasses in form and function'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/70">{title}</p>
                    <p className="text-xs text-white/30">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <SubmissionForm />
        </div>
      </section>

      {/* Decorative divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Phase 2 Preview */}
      <section id="phase-2" className="py-32 px-6 max-w-5xl mx-auto scroll-mt-20">
        <PhasePreview />
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-light tracking-[0.15em] uppercase">
              1,000 <span className="text-amber-500">Watches</span>
            </p>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em]">Horological Archive</p>
          </div>

          <nav className="flex gap-8 text-[10px] uppercase tracking-widest text-white/30">
            <a href="#archive" className="hover:text-amber-500 transition-colors">Archive</a>
            <a href="#nominate" className="hover:text-amber-500 transition-colors">Nominate</a>
            <a href="#phase-2" className="hover:text-amber-500 transition-colors">Phase 2</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Contact</a>
          </nav>

          <p className="text-[10px] text-white/20">
            &copy; {new Date().getFullYear()} 1,000 Watches. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-display font-light ${accent ? 'text-amber-500' : 'text-white'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-white/25 mt-1">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-white/10" />;
}
