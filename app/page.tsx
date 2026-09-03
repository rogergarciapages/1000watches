import Navbar from '@/components/Navbar';
import Grid from '@/components/Grid';
import SubmissionForm from '@/components/SubmissionForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
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
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-500 font-sans">The Museum Project</span>
          </div>

          {/* Headline (Serif Font) */}
          <div className="space-y-4 animate-fade-in [animation-delay:150ms]">
            <h1 className="text-7xl md:text-9xl font-serif font-normal tracking-tight leading-none text-[var(--text-primary)]">
              1,000
            </h1>
            <h1 className="text-7xl md:text-9xl font-serif font-light tracking-tight leading-none text-amber-500 italic">
              Watches
            </h1>
          </div>

          {/* Subheadline */}
          <p className="max-w-xl mx-auto text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed animate-fade-in [animation-delay:300ms]">
            The definitive digital archive of the most iconic timepieces ever crafted.
            One thousand slots. A century of horology.
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center gap-10 pt-6 animate-fade-in [animation-delay:450ms]">
            <Stat value="1,000" label="Total Slots" />
            <Divider />
            <Stat value="Open" label="Nominations" accent />
            <Divider />
            <Stat value="∞" label="Horology" />
          </div>

          {/* CTA row */}
          <div className="flex justify-center gap-4 pt-6 animate-fade-in [animation-delay:600ms]">
            <a
              href="#archive"
              className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-600/10 font-sans"
            >
              Explore Archive
            </a>
            <a
              href="#nominate"
              className="px-8 py-3.5 rounded-xl border border-[var(--border-medium)] hover:border-amber-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs uppercase tracking-[0.2em] transition-all bg-[var(--bg-card)]/50 backdrop-blur-sm font-sans"
            >
              Submit a Watch
            </a>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />
      </div>

      {/* Grid / Archive Section */}
      <section id="archive" className="px-4 py-24 max-w-[1700px] mx-auto scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 px-2 gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-sans font-bold">Community Submissions</p>
            <h2 className="text-4xl font-serif font-light tracking-tight text-[var(--text-primary)]">The Archive</h2>
            <p className="text-sm text-[var(--text-muted)] font-sans">Every slot represents an iconic watch selected for horological history.</p>
          </div>
          <div className="flex gap-2 text-[10px] uppercase tracking-widest text-[var(--text-dim)] items-center font-sans">
            <span className="w-2 h-2 rounded-full border border-[var(--border-medium)]" />
            Empty
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-4" />
            Filled
          </div>
        </div>

        <Grid />
      </section>

      {/* Decorative divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />
      </div>

      {/* Submission Section */}
      <section id="nominate" className="py-32 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Left copy */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-3 font-sans font-bold">Open Nominations</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight leading-tight text-[var(--text-primary)]">
                Shape the <br /><span className="text-amber-500 italic">History</span>
              </h2>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm font-sans">
              We are accepting nominations for the 1,000 digital museum. 
              If you believe a specific reference or model defines an era, 
              a technological milestone, or a design language — submit it for review.
            </p>
            <ul className="space-y-3 font-sans">
              {[
                ['Historical Significance', 'Timepieces that shaped the industry'],
                ['Technical Innovation', 'Groundbreaking movements and complications'],
                ['Cultural Impact', 'Watches that transcended horology'],
                ['Design Excellence', 'Masterclasses in form and function'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <SubmissionForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-light tracking-[0.15em] uppercase text-[var(--text-primary)] font-sans">
              1,000 <span className="text-amber-500 font-serif lowercase italic">Watches</span>
            </p>
            <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.4em] font-sans">Horological Archive</p>
          </div>

          <nav className="flex gap-8 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-sans">
            <a href="#archive" className="hover:text-amber-500 transition-colors">Archive</a>
            <a href="#nominate" className="hover:text-amber-500 transition-colors">Nominate</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Contact</a>
          </nav>

          <p className="text-[10px] text-[var(--text-dim)] font-sans">
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
      <p className={`text-2xl md:text-3xl font-serif font-light ${accent ? 'text-amber-500 font-bold' : 'text-[var(--text-primary)]'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-sans">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-[var(--border-medium)]" />;
}
