'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function WatchPage() {
  const params = useParams()
  const brandSlug = params.brand as string
  const modelSlug = params.model as string
  
  const [watch, setWatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVoteId, setUserVoteId] = useState<string | null>(null)
  
  const supabase = createClient()

  const searchBrand = brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const searchModel = modelSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  useEffect(() => {
    fetchWatch()
  }, [])

  const fetchWatch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const anonId = typeof window !== 'undefined' ? localStorage.getItem('anon_id') : null
    const userId = user?.id || anonId
    
    // If no anon id, create one
    if (!userId && typeof window !== 'undefined') {
      const newAnonId = `anon-${Date.now()}`
      localStorage.setItem('anon_id', newAnonId)
    }
    
    const { data } = await supabase
      .from('slots')
      .select('*')
      .ilike('brand', searchBrand)
      .ilike('model', searchModel)
      .eq('status', 'filled')
      .single()
    
    // Get vote count from votes table
    if (data) {
      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('submission_id', data.id)
      
      data.votes = count || 0
    }
    
    setWatch(data)
    
    // Check if user has voted
    if (data && userId) {
      const { data: voteData } = await supabase
        .from('votes')
        .select('id')
        .eq('submission_id', data.id)
        .eq('user_id', userId)
        .maybeSingle()
      
      if (voteData) {
        setHasVoted(true)
        setUserVoteId(voteData.id)
      }
    }
    
    setLoading(false)
  }

  const handleVote = async () => {
    if (voting) return
    
    setVoting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const anonId = typeof window !== 'undefined' ? localStorage.getItem('anon_id') : null
      
      // Create anon ID if needed
      let userId = user?.id || anonId
      if (!userId && typeof window !== 'undefined') {
        userId = `anon-${Date.now()}`
        localStorage.setItem('anon_id', userId)
      }
      
      if (hasVoted && userVoteId) {
        // Remove vote from votes table if it exists
        try {
          await supabase.from('votes').delete().eq('id', userVoteId)
        } catch (e) {}
        
        // Decrement slots votes
        await supabase
          .from('slots')
          .update({ votes: Math.max(0, (watch.votes || 0) - 1) })
          .eq('id', watch.id)
        
        setHasVoted(false)
        setUserVoteId(null)
      } else if (userId) {
        // Insert into votes table
        try {
          await supabase.from('votes').insert({
            submission_id: watch.id,
            user_id: userId
          })
        } catch (e) {}
        
        // Increment slots votes
        await supabase
          .from('slots')
          .update({ votes: (watch.votes || 0) + 1 })
          .eq('id', watch.id)
        
        // Get the vote ID
        const { data: voteData } = await supabase
          .from('votes')
          .select('id')
          .eq('submission_id', watch.id)
          .eq('user_id', userId)
          .maybeSingle()
        
        if (voteData) {
          setUserVoteId(voteData.id)
        }
        setHasVoted(true)
      }
      
      // Refresh to get new count
      fetchWatch()
    } catch (err) {
      console.error('Vote error:', err)
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!watch) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="text-2xl">Watch not found</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <a href="/" className="hover:text-amber-500 transition-colors">Home</a>
            <span>/</span>
            <a href="/#archive" className="hover:text-amber-500 transition-colors">Archive</a>
            <span>/</span>
            <span className="text-white/50">{watch.brand} {watch.model}</span>
          </nav>

          {/* Hero */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10">
              {watch.image_url ? (
                <img 
                  src={watch.image_url} 
                  alt={`${watch.brand} ${watch.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
                    <span className="text-4xl font-display text-white/20">{watch.id}</span>
                  </div>
                </div>
              )}
              
              {/* Slot number badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] uppercase tracking-widest text-white/60">
                Slot #{watch.id}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-2">Archive Slot #{watch.id}</p>
                <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight">
                  {watch.brand}
                </h1>
                <h2 className="text-2xl md:text-3xl font-display font-light text-white/60 mt-1">
                  {watch.model}
                </h2>
              </div>

              {/* Vote Button & Count */}
              <div className="flex items-center gap-6">
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all
                    ${hasVoted 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-red-500/20 hover:border-red-500/40' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                    } disabled:opacity-50`}
                >
                  <svg 
                    className={`w-5 h-5 ${hasVoted ? 'fill-amber-400' : 'fill-none stroke-amber-400'}`} 
                    viewBox="0 0 24 24" 
                    strokeWidth={2}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {hasVoted ? 'Voted' : 'Vote'}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-light text-amber-400">{watch.votes || 0}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    {watch.votes === 1 ? 'like' : 'likes'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Specs */}
              <div className="grid grid-cols-2 gap-6">
                {watch.year && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Year</p>
                    <p className="text-lg font-light">{watch.year}</p>
                  </div>
                )}
                {watch.material && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Material</p>
                    <p className="text-lg font-light">{watch.material}</p>
                  </div>
                )}
                {watch.movement_type && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Movement</p>
                    <p className="text-lg font-light capitalize">{watch.movement_type}</p>
                  </div>
                )}
                {watch.reference && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Reference</p>
                    <p className="text-lg font-light">{watch.reference}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-4">
                <p className="text-sm text-white/40 leading-relaxed">
                  Part of the 1,000 Watches digital archive — a curated collection of the most iconic timepieces in horological history.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <a 
                  href="/#archive"
                  className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs uppercase tracking-[0.15em] transition-all"
                >
                  ← Back to Archive
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}