import React from 'react';

export default function PhasePreview() {
  return (
    <div className="relative overflow-hidden p-12 rounded-3xl border border-amber-500/10 bg-amber-500/[0.02] text-center group">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-6">
          Phase 2 — The Selection
        </span>
        
        <h2 className="text-3xl md:text-4xl font-display font-light text-white mb-6 tracking-tight">
          Curated <span className="text-amber-500 italic">Releases</span>
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-4 text-white/50 text-sm leading-relaxed">
          <p>
            Once the gallery is primed, the community will transition to active curation. 
            Every cycle, three exceptional timepieces will be presented as candidates.
          </p>
          <p>
            The global community of enthusiasts will cast their votes. Only one winner 
            will ascend to a permanent position within the 1,000.
          </p>
        </div>

        <div className="mt-10 flex justify-center items-center gap-8 opacity-40">
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 border border-white/20 rounded-md mb-2" />
            <span className="text-[10px] uppercase">Candidate A</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 border border-white/20 rounded-md mb-2 bg-white/5 scale-110" />
            <span className="text-[10px] uppercase text-amber-500">Winner</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 border border-white/20 rounded-md mb-2" />
            <span className="text-[10px] uppercase">Candidate B</span>
          </div>
        </div>
        
        <p className="mt-12 text-[11px] font-mono text-amber-500/40 uppercase tracking-[0.3em]">
          Initialization Sequence: TBD
        </p>
      </div>
    </div>
  );
}
