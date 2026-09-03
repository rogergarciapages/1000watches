'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import VoteButton from '@/components/VoteButton'
import Navbar from '@/components/Navbar'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('votes', { ascending: false })
      .limit(50)

    if (!error && data) {
      setSubmissions(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-amber-500/30 transition-colors duration-300">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-4 text-[var(--text-primary)]">
              Community <span className="text-amber-500 italic">Nominations</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto font-sans text-sm">
              Vote for your favorite watches. The most popular nominations will be added to the archive.
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)] mb-6 font-sans">No nominations yet. Be the first to submit!</p>
              <Link 
                href="/#nominate"
                className="px-8 py-3.5 rounded-xl bg-amber-600 text-black font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-600/10"
              >
                Submit a Watch
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {submissions.map((sub, index) => (
                <div 
                  key={sub.id}
                  className="group relative rounded-xl overflow-hidden border border-[var(--border-medium)] bg-[var(--bg-card)] hover:border-amber-500/40 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {/* Rank badge */}
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-amber-500/20 backdrop-blur-sm border border-amber-500/40 text-[10px] font-bold text-amber-500">
                    #{index + 1}
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-[var(--bg-secondary)]">
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.model} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-[var(--border-medium)] flex items-center justify-center">
                          <span className="text-2xl text-[var(--text-muted)] font-serif">{sub.brand?.[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate font-sans">{sub.brand}</h3>
                    <p className="text-xs text-[var(--text-muted)] truncate font-serif italic">{sub.model}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <VoteButton
                        submissionId={sub.uuid}
                        initialVotes={sub.votes || 0}
                        size="sm"
                        table="submissions"
                      />
                      <span className="text-[10px] text-[var(--text-dim)] font-mono">{sub.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}