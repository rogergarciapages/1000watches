'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
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

  const handleVote = async (submissionId: string) => {
    setVoting(submissionId)
    
    try {
      // Get user (if logged in)
      const { data: { user } } = await supabase.auth.getUser()
      
      // Add vote record
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          submission_id: submissionId,
          user_id: user?.id || `anon-${Date.now()}`
        })

      if (voteError && voteError.code !== '23505') {
        console.error('Vote error:', voteError)
      }

      // Increment vote count
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ votes: supabase.raw('votes + 1') })
        .eq('id', submissionId)

      if (!updateError) {
        // Refresh submissions
        fetchSubmissions()
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setVoting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-6 h-6 rounded-full border border-amber-500/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500/60" />
            </div>
            <span className="text-sm font-light tracking-[0.15em] text-white/80 uppercase">
              1,000 <span className="text-amber-500">Watches</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#archive" className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white">Archive</Link>
            <Link href="/submissions" className="text-[11px] uppercase tracking-widest text-amber-500">Nominate</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight mb-4">
              Community <span className="text-amber-500">Nominations</span>
            </h1>
            <p className="text-white/40 max-w-lg mx-auto">
              Vote for your favorite watches. The most popular nominations will be added to the archive.
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 mb-6">No nominations yet. Be the first to submit!</p>
              <Link 
                href="/#nominate"
                className="px-8 py-3.5 rounded-xl bg-amber-600 text-black font-bold text-xs uppercase tracking-[0.2em]"
              >
                Submit a Watch
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {submissions.map((sub, index) => (
                <div 
                  key={sub.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-amber-500/30 transition-all"
                >
                  {/* Rank badge */}
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-[10px] font-bold text-amber-400">
                    #{index + 1}
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-white/[0.02]">
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.model} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                          <span className="text-2xl text-white/20">{sub.brand?.[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white truncate">{sub.brand}</h3>
                    <p className="text-xs text-white/50 truncate">{sub.model}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(sub.id)}
                          disabled={voting === sub.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-xs font-bold text-amber-400">{sub.votes || 0}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-white/30">{sub.year}</span>
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