'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 rounded-full border border-amber-500/40 flex items-center justify-center group-hover:border-amber-500 transition-colors">
            <div className="w-2 h-2 rounded-full bg-amber-500/60 group-hover:bg-amber-500 transition-colors" />
          </div>
          <span className="text-sm font-light tracking-[0.15em] text-[var(--text-primary)] group-hover:text-amber-500 transition-colors uppercase">
            1,000 <span className="text-amber-500 font-serif lowercase italic">Watches</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/#archive"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Archive
          </Link>
          <Link 
            href="/brands"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Brands
          </Link>
          <Link 
            href="/years"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Years
          </Link>
          <Link 
            href="/lines"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Collections
          </Link>
          <Link 
            href="/nicknames"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Nicknames
          </Link>
          <Link 
            href="/submissions"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Vote
          </Link>
          <Link 
            href="/#nominate"
            className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            Submit
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {loading ? (
            <div className="w-6 h-6 border border-[var(--border-subtle)] rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 group">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-7 h-7 rounded-full border border-[var(--border-medium)] group-hover:border-amber-500/50 transition-colors"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-[var(--border-medium)] flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                )}
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/profile" 
                className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/profile"
                className="px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.05] text-amber-500 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-500/10 hover:border-amber-500/60 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}