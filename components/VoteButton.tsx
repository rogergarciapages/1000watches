'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface VoteButtonProps {
  submissionId: string
  initialVotes: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  table?: 'slots' | 'submissions'
}

export default function VoteButton({ 
  submissionId, 
  initialVotes, 
  size = 'md',
  showCount = true,
  table = 'slots'
}: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVoteId, setUserVoteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const supabase = createClient()

  const sizes = {
    sm: { button: 'px-3 py-1.5', icon: 16, text: 'text-xs' },
    md: { button: 'px-4 py-2', icon: 20, text: 'text-sm' },
    lg: { button: 'px-6 py-3', icon: 24, text: 'text-base' }
  }

  const fetchVoteStatus = useCallback(async () => {
    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not logged in - just get total count
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('submission_id', submissionId)
        setVotes(count || 0)
        setLoading(false)
        return
      }

      // Get total vote count using UUID
      if (!submissionId) {
        setLoading(false)
        return
      }

      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('submission_id', submissionId)

      setVotes(count || 0)

      // Also update the submissions table votes count if applicable
      if (table === 'submissions' && count !== null) {
        await supabase
          .from('submissions')
          .update({ votes: count })
          .eq('uuid', submissionId)
      }

      // Check if THIS user has voted
      const { data: voteData } = await supabase
        .from('votes')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .limit(1)

      if (voteData && voteData.length > 0) {
        setHasVoted(true)
        setUserVoteId(voteData[0].id)
      }
    } catch (err) {
      console.error('Error fetching vote status:', err)
    } finally {
      setLoading(false)
    }
  }, [submissionId, supabase, table])

  useEffect(() => {
    fetchVoteStatus()
  }, [fetchVoteStatus])

  const handleVote = async () => {
    if (voting || loading) return

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setVoting(true)
    setAnimating(true)

    try {
      if (hasVoted && userVoteId) {
        // Remove vote (toggle off)
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', userVoteId)
        
        if (deleteError) {
          console.error('Failed to delete vote:', deleteError)
        }
        
        setDirection('down')
        setVotes(prev => Math.max(0, prev - 1))
        setHasVoted(false)
        setUserVoteId(null)
      } else {
        // Add vote (toggle on)
        const { data: voteData, error: insertError } = await supabase
          .from('votes')
          .insert({
            submission_id: submissionId,
            user_id: user.id
          })
          .select('id')
          .maybeSingle()

        if (insertError) {
          console.error('Failed to insert vote:', insertError)
        }
        
        if (voteData) {
          setUserVoteId(voteData.id)
        }
        
        setDirection('up')
        setVotes(prev => prev + 1)
        setHasVoted(true)
      }

      setTimeout(() => setAnimating(false), 300)
      setTimeout(() => setDirection(null), 300)

    } catch (err) {
      console.error('Vote error:', err)
      await fetchVoteStatus()
    } finally {
      setVoting(false)
    }
  }

  const iconSize = sizes[size].icon
  const buttonClass = sizes[size].button

  return (
    <>
      <div className="inline-flex items-center gap-2 font-sans">
        <button
          onClick={handleVote}
          disabled={voting || loading}
          className={`
            group relative flex items-center gap-2 rounded-xl border transition-all duration-200
            ${buttonClass}
            ${hasVoted 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
              : 'bg-[var(--bg-card)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="relative">
            <span className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-200
              ${animating && direction === 'up' ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}
            `}>
              <svg className="w-full h-full text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </span>
            
            <svg
              className={`transition-all duration-200 ${hasVoted ? 'text-amber-500' : 'text-current'} group-hover:scale-110`}
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill={hasVoted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </span>

          <span className={`font-medium tracking-wide ${hasVoted ? 'text-amber-500 font-bold' : 'text-[var(--text-secondary)]'}`}>
            {hasVoted ? 'Voted' : 'Vote'}
          </span>

          {voting && (
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <span className="absolute inset-0 bg-amber-500/20 animate-ping" />
            </span>
          )}
        </button>

        {showCount && (
          <div className={`flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] ${animating ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
            <span className={`font-bold tabular-nums ${hasVoted ? 'text-amber-500' : 'text-[var(--text-primary)]'} ${animating ? 'scale-125' : 'scale-100'} transition-transform duration-200`}>
              {votes}
            </span>
          </div>
        )}
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-light text-[var(--text-primary)] mb-2">Sign in to Vote</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6 font-sans">You need an account to vote for your favorite watches.</p>
            <div className="flex flex-col gap-3 font-sans">
              <Link href="/profile" className="px-6 py-3 rounded-xl bg-amber-600 text-black font-bold text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/10">
                Sign In
              </Link>
              <button onClick={() => setShowLoginPrompt(false)} className="text-[var(--text-muted)] text-sm hover:text-[var(--text-primary)] transition-colors">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}