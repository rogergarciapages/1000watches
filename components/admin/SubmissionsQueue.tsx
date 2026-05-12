'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { fillNextSlot, dismissSubmission } from '@/app/admin/actions'

interface Submission {
  id: string
  brand: string
  model: string
  year: number
  material: string | null
  movement_type: string | null
  image_url: string | null
  created_at: string
}

interface Props {
  submissions: Submission[]
}

export default function SubmissionsQueue({ submissions }: Props) {
  const [pending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleFill = (s: Submission) => {
    setActionId(s.id)
    startTransition(async () => {
      const result = await fillNextSlot(s.id, {
        brand: s.brand,
        model: s.model,
        year: s.year,
        material: s.material || undefined,
        movement_type: s.movement_type || undefined,
        image_url: s.image_url || undefined,
      })
      if (result.ok) {
        showToast(`Slot #${result.slotId} filled with ${s.brand} ${s.model}`, 'success')
        router.refresh()
      } else {
        showToast(result.error || 'Failed', 'error')
      }
      setActionId(null)
    })
  }

  const handleDismiss = (id: string) => {
    setActionId(id)
    startTransition(async () => {
      const result = await dismissSubmission(id)
      if (result.ok) showToast('Submission dismissed', 'success')
      else showToast(result.error || 'Failed', 'error')
      setActionId(null)
    })
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 text-white/20 text-sm">
        No pending submissions.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-medium shadow-2xl border animate-fade-in
          ${toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Brand</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Model</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Year</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Details</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Submitted</th>
              <th className="text-right text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {submissions.map(s => {
              const isActive = actionId === s.id && pending
              return (
                <tr key={s.id} className={`transition-opacity ${isActive ? 'opacity-40' : ''}`}>
                  <td className="py-3.5 pr-6 font-medium text-white/80">{s.brand}</td>
                  <td className="py-3.5 pr-6 text-white/60">{s.model}</td>
                  <td className="py-3.5 pr-6 text-white/40 font-mono text-xs">{s.year}</td>
                  <td className="py-3.5 pr-6">
                    <div className="flex gap-2 flex-wrap">
                      {s.material && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50">{s.material}</span>
                      )}
                      {s.movement_type && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500/70">{s.movement_type}</span>
                      )}
                      {s.image_url && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-500/70">📷</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 pr-6 text-white/25 text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleFill(s)}
                        disabled={pending}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500
                          text-[10px] uppercase tracking-wider font-bold hover:bg-amber-500/20 transition-all
                          disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Fill Next Slot
                      </button>
                      <button
                        onClick={() => handleDismiss(s.id)}
                        disabled={pending}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.07] text-white/30
                          text-[10px] uppercase tracking-wider font-bold hover:border-red-500/30 hover:text-red-400
                          transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
