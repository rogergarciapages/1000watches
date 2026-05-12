import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 rounded-full border border-amber-500/40 flex items-center justify-center group-hover:border-amber-500 transition-colors">
            <div className="w-2 h-2 rounded-full bg-amber-500/60 group-hover:bg-amber-500 transition-colors" />
          </div>
          <span className="text-sm font-light tracking-[0.15em] text-white/80 group-hover:text-white transition-colors uppercase">
            1,000 <span className="text-amber-500">Watches</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Archive', href: '#archive' },
            { label: 'Brands', href: '/timepieces' },
            { label: 'Vote', href: '/submissions' },
            { label: 'Submit', href: '#nominate' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] uppercase tracking-widest text-white/40 hover:text-amber-500 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-white/40 hover:text-white transition-colors p-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </Link>
          <a
            href="#nominate"
            className="px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.05] text-amber-500 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-500/10 hover:border-amber-500/60 transition-all"
          >
            Submit a Watch
          </a>
        </div>
      </div>
    </header>
  );
}
