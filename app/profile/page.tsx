'use client'

import React, { useState } from 'react'
import Link from 'next/link'

// ─── Static mock data (replace with Supabase queries once auth is added) ──────
const USER = {
  name: 'Julian Vane',
  title: 'Senior Horologist',
  curatorLevel: 'Master Grade VII',
  joinedDate: 'Oct 12, 2021',
  location: 'Geneva, CH',
  stats: {
    submissions: 142,
    votes: '3.8k',
    photos: 89,
    comments: 512,
  },
}

const ACTIVITY: Record<string, { title: string; subtitle: string; date: string; tag: string }[]> = {
  Submissions: [
    {
      title: 'Patek Philippe Calatrava Ref. 5227G',
      subtitle: 'Added comprehensive technical specs and a 500-word historical context for the White Gold collection.',
      date: '2 Days Ago',
      tag: 'New Submission',
    },
    {
      title: 'Vacheron Constantin Patrimony',
      subtitle: 'Identified a rare variation of the 1950s movement calibre. Verification pending by archive team.',
      date: '1 Week Ago',
      tag: 'New Submission',
    },
    {
      title: 'A. Lange & Söhne Datograph Perpetual',
      subtitle: 'Documented the flyback chronograph complication with original movement photographs.',
      date: '3 Weeks Ago',
      tag: 'New Submission',
    },
  ],
  Photos: [
    {
      title: 'Rolex Submariner 5513 Dial Study',
      subtitle: 'Close-up series of the gilt "SWISS MADE" dial variations. 14 images uploaded.',
      date: '5 Days Ago',
      tag: 'Photo Upload',
    },
    {
      title: 'Omega Speedmaster Pre-Moon Collection',
      subtitle: 'Macro photography session covering all 1960s reference iterations.',
      date: '2 Weeks Ago',
      tag: 'Photo Upload',
    },
  ],
  Votes: [
    {
      title: 'IWC Portugieser vs Jaeger-LeCoultre Reverso',
      subtitle: 'Cast deciding vote in the Monthly Duel — IWC Portugieser won by 3%.',
      date: 'Yesterday',
      tag: 'Vote Cast',
    },
    {
      title: 'Greatest Sports Watch of the Decade',
      subtitle: 'Voted for the Audemars Piguet Royal Oak Offshore in the decade poll.',
      date: '4 Days Ago',
      tag: 'Vote Cast',
    },
  ],
}

const BADGES = [
  { icon: '⭐', label: 'Pioneer Submitter', desc: 'One of the first 100', amber: true },
  { icon: '📜', label: 'Horological Historian', desc: '500+ Verified Citations', amber: false },
  { icon: '📷', label: 'Lensman', desc: 'Gallery Quality Shots', amber: true },
  { icon: '✅', label: 'Master Voter', desc: 'Top 1% Accuracy', amber: false },
]

const SETTINGS_LINKS = [
  'Profile Identity',
  'Security & Access',
  'Privacy Controls',
  'Email Preferences',
]

const TABS = ['Submissions', 'Photos', 'Votes'] as const
type Tab = typeof TABS[number]

// ─── Sub-components ────────────────────────────────────────────────────────────

function ActivityItem({ title, subtitle, date, tag }: { title: string; subtitle: string; date: string; tag: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="flex gap-6 items-center p-5 border border-white/[0.06] bg-white/[0.015]
        transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
        {/* Placeholder image swatch */}
        <div className="w-28 aspect-square bg-white/[0.04] border border-white/[0.06] flex-shrink-0 flex items-center justify-center overflow-hidden">
          <div className="w-8 h-8 rounded-full border border-amber-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
          </div>
        </div>
        <div className="flex-grow space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">{tag}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/25 whitespace-nowrap flex-shrink-0">{date}</span>
          </div>
          <h3 className="text-base font-medium text-white/90 group-hover:text-amber-500 transition-colors leading-snug truncate">
            {title}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Submissions')

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/20">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
          <Link href="/" className="text-sm font-light tracking-[0.15em] text-white uppercase">
            1,000 <span className="text-amber-500">Watches</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {['Archive', 'Nominate', 'Phase 2'].map(l => (
              <a key={l} href={`/#${l.toLowerCase().replace(' ', '-')}`}
                className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Link href="/profile"
              className="text-amber-500 border-b border-amber-500/50 pb-0.5 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
            <button className="text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto">

        {/* ── Profile Header ── */}
        <header className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end mb-24">
          {/* Avatar */}
          <div className="md:col-span-4 relative group">
            <div className="aspect-square bg-white/[0.03] border border-white/[0.06] overflow-hidden flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
            </div>
            {/* Amber badge */}
            <div className="absolute -bottom-4 -right-4 bg-amber-500/10 border border-amber-500/20 px-5 py-3 hidden md:block">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500">Authentic Member</span>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
                {USER.title}
              </span>
              <h1 className="text-6xl md:text-8xl tracking-tighter leading-none font-light text-white">
                {USER.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              {[
                { label: 'Curator Level', value: USER.curatorLevel },
                { label: 'Date Joined', value: USER.joinedDate },
                { label: 'Location', value: USER.location },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">{label}</span>
                  <span className="text-lg font-medium tracking-tight text-white/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Stats Bar ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 mb-28 border border-white/[0.06]">
          {[
            { label: 'Total Submissions', value: USER.stats.submissions },
            { label: 'Votes Cast', value: USER.stats.votes },
            { label: 'Photos Contributed', value: USER.stats.photos },
            { label: 'Comments', value: USER.stats.comments },
          ].map(({ label, value }, i, arr) => (
            <div key={label}
              className={`p-8 flex flex-col gap-4 bg-white/[0.015]
                ${i < arr.length - 1 ? 'border-r border-white/[0.06]' : ''}`}>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
              <span className="text-5xl font-light text-white">{value}</span>
            </div>
          ))}
        </section>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* ── Main Content ── */}
          <div className="lg:col-span-8 space-y-28">

            {/* Activity Feed */}
            <section>
              <div className="flex items-baseline justify-between mb-10">
                <h2 className="text-3xl font-light tracking-tight">Recent Activity</h2>
                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/[0.07] pb-2">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] uppercase tracking-widest font-bold pb-2 -mb-[10px] transition-colors
                        ${activeTab === tab
                          ? 'border-b-2 border-amber-500 text-amber-500'
                          : 'text-white/30 hover:text-white/60'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {ACTIVITY[activeTab].map(item => (
                  <ActivityItem key={item.title} {...item} />
                ))}
              </div>

              <button className="w-full mt-8 py-5 border border-white/[0.08] text-[10px] uppercase tracking-[0.3em] text-white/30
                hover:border-amber-500/30 hover:text-amber-500 transition-all duration-300 font-bold">
                Load Archive History
              </button>
            </section>

            {/* Cabinet of Curiosities / Badges */}
            <section>
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-3xl font-light tracking-tight whitespace-nowrap">Cabinet of Curiosities</h2>
                <div className="h-px bg-white/[0.07] w-full" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {BADGES.map(({ icon, label, desc, amber }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-4 group">
                    <div className={`w-20 h-20 rounded-full p-[3px] transition-transform duration-500
                      group-hover:rotate-12 border
                      ${amber ? 'border-amber-500/30' : 'border-white/10'}`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl
                        transition-colors bg-white/[0.03]
                        ${amber
                          ? 'group-hover:bg-amber-500/10 text-amber-500/60 group-hover:text-amber-500'
                          : 'group-hover:bg-white/[0.08] text-white/30 group-hover:text-white'}`}>
                        {icon}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase tracking-widest font-bold text-white/70">{label}</span>
                      <span className="block text-[10px] text-white/25 italic">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Curator Settings */}
            <div className="border border-white/[0.06] bg-white/[0.015] p-8 space-y-8">
              <h2 className="text-2xl font-light tracking-tight">Curator Settings</h2>
              <div className="space-y-6">
                {SETTINGS_LINKS.map(label => (
                  <div key={label} className="flex flex-col gap-3 group cursor-pointer">
                    <div className="flex justify-between items-center group-hover:text-amber-500 transition-colors">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60
                        group-hover:text-amber-500 transition-colors">
                        {label}
                      </span>
                      <svg className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="h-px bg-white/[0.06]" />
                  </div>
                ))}
              </div>
              <button className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold
                hover:bg-amber-500 transition-colors duration-300">
                Update Curator Profile
              </button>
            </div>

            {/* Account Integrity */}
            <div className="border border-white/[0.06] p-8 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Account Integrity</span>
              <div className="space-y-4">
                {[
                  { label: 'Last Active', value: '4m ago', accent: false },
                  { label: 'Verification', value: 'Lvl 3 Vault', accent: true },
                  { label: 'Karma Rank', value: 'Top 400', accent: false },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-widest text-white/30">{label}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${accent ? 'text-amber-500' : 'text-white/70'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* My Submissions quick card */}
            <div className="border border-amber-500/10 bg-amber-500/[0.03] p-8 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 font-bold">Archive Contribution</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-light text-amber-500">142</span>
                <span className="text-xs text-white/30 mb-1 uppercase tracking-widest">nominations</span>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full w-[14.2%] bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
              </div>
              <p className="text-[10px] text-white/25">14.2% of the archive capacity</p>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#080808] border-t border-white/[0.05] flex flex-col md:flex-row
        justify-between items-center px-12 py-14 gap-8">
        <div className="text-sm font-light tracking-[0.15em] uppercase text-white/60">
          1,000 <span className="text-amber-500">Watches</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {['Terms of Service', 'Provenance Policy', 'Curator Access', 'Contact'].map(l => (
            <a key={l} href="#"
              className="text-[10px] tracking-widest uppercase text-white/30 hover:text-amber-500 transition-colors duration-300">
              {l}
            </a>
          ))}
        </div>
        <div className="text-[10px] tracking-widest uppercase text-white/20">
          © {new Date().getFullYear()} 1,000 Watches. The Curated Chronology.
        </div>
      </footer>
    </div>
  )
}
