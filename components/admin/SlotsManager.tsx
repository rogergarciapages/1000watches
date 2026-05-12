'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { clearSlot, assignToSlot } from '@/app/admin/actions'

interface Slot {
  id: number
  uuid: string | null
  brand: string | null
  model: string | null
  year: number | null
  material: string | null
  movement_type: string | null
  reference: string | null
  image_url: string | null
  status: 'empty' | 'filled'
}

interface Props {
  filledSlots: Slot[]
  slotPhotos?: Record<string, { image_url: string; count: number }>
}

function AssignModal({
  slotId,
  existingData,
  onClose,
  onAssign,
}: {
  slotId: number
  existingData?: Slot
  onClose: () => void
  onAssign: (brand: string, model: string, year: number, material: string | null, movement_type: string | null, reference: string | null) => void
}) {
  const [form, setForm] = useState({
    brand: existingData?.brand || '',
    model: existingData?.model || '',
    year: existingData?.year?.toString() || '',
    material: existingData?.material || '',
    movement_type: existingData?.movement_type || '',
    reference: existingData?.reference || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAssign(
      form.brand,
      form.model,
      parseInt(form.year),
      form.material || null,
      form.movement_type || null,
      form.reference || null
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md p-7 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl">
        <h3 className="text-sm font-medium text-white mb-1">Assign to Slot #{String(slotId).padStart(4, '0')}</h3>
        <p className="text-xs text-white/30 mb-6">Manually fill this slot with a specific watch.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Brand', field: 'brand', placeholder: 'e.g. Rolex' },
              { label: 'Model', field: 'model', placeholder: 'e.g. Daytona 6239' },
              { label: 'Year', field: 'year', placeholder: 'e.g. 1963', type: 'number' },
              { label: 'Reference', field: 'reference', placeholder: 'e.g. 6239' },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
                <input
                  required={field !== 'reference'}
                  type={type || 'text'}
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                    placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Material</label>
              <input
                type="text"
                placeholder="e.g. Steel, Gold"
                value={form.material}
                onChange={e => setForm(prev => ({ ...prev, material: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                  placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Movement</label>
              <select
                value={form.movement_type}
                onChange={e => setForm(prev => ({ ...prev, movement_type: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                  focus:outline-none focus:border-amber-500/50 transition-all"
              >
                <option value="" className="bg-[#1a1a1a]">Select</option>
                <option value="automatic" className="bg-[#1a1a1a]">Automatic</option>
                <option value="quartz" className="bg-[#1a1a1a]">Quartz</option>
                <option value="manual" className="bg-[#1a1a1a]">Manual</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all"
            >
              Assign
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 hover:text-white text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SlotsManager({ filledSlots, slotPhotos }: Props) {
  const [pending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<number | null>(null)
  const [assignSlotId, setAssignSlotId] = useState<number | null>(null)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleClear = (slotId: number) => {
    if (!confirm(`Clear slot #${String(slotId).padStart(4, '0')}? This cannot be undone.`)) return
    setActionId(slotId)
    startTransition(async () => {
      const result = await clearSlot(slotId)
      if (result.ok) {
        showToast(`Slot #${slotId} cleared`, 'success')
        router.refresh()
      } else {
        showToast(result.error || 'Failed', 'error')
      }
      setActionId(null)
    })
  }

  const handleAssign = (
    slotId: number,
    brand: string,
    model: string,
    year: number,
    material: string | null,
    movement_type: string | null,
    reference: string | null
  ) => {
    setAssignSlotId(null)
    setEditingSlot(null)
    setActionId(slotId)
    startTransition(async () => {
      const result = await assignToSlot(slotId, brand, model, year, material, movement_type, reference)
      if (result.ok) {
        showToast(`Slot #${slotId} assigned to ${brand} ${model}`, 'success')
        router.refresh()
      } else {
        showToast(result.error || 'Failed', 'error')
      }
      setActionId(null)
    })
  }

  if (filledSlots.length === 0) {
    return (
      <div className="text-center py-16 text-white/20 text-sm">
        No slots have been filled yet.
      </div>
    )
  }

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-medium shadow-2xl border animate-fade-in
          ${toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {assignSlotId !== null && (
        <AssignModal
          slotId={assignSlotId}
          existingData={editingSlot || undefined}
          onClose={() => { setAssignSlotId(null); setEditingSlot(null) }}
          onAssign={(brand, model, year, material, movement_type, reference) =>
            handleAssign(assignSlotId, brand, model, year, material, movement_type, reference)
          }
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Slot</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Brand</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Model</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3 pr-6">Year</th>
              <th className="text-right text-[10px] uppercase tracking-widest text-white/30 font-normal pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filledSlots.map(slot => {
              const isActive = actionId === slot.id && pending
              return (
                <tr key={slot.id} className={`transition-opacity ${isActive ? 'opacity-40' : ''}`}>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      {slotPhotos?.[slot.uuid ?? '']?.image_url && (
                        <img
                          src={slotPhotos[slot.uuid!].image_url}
                          alt={slot.brand ?? ''}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <span className="font-mono text-xs text-amber-500/70">
                        #{String(slot.id).padStart(4, '0')}
                        {slotPhotos?.[slot.uuid ?? '']?.count ? (
                          <span className="text-white/20 ml-1">({slotPhotos[slot.uuid!].count})</span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-6 font-medium text-white/80">{slot.brand}</td>
                  <td className="py-3.5 pr-6 text-white/60">{slot.model}</td>
                  <td className="py-3.5 pr-6 text-white/40 font-mono text-xs">{slot.year}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setAssignSlotId(slot.id); setEditingSlot(slot) }}
                        disabled={pending}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.07] text-white/40
                          text-[10px] uppercase tracking-wider font-bold hover:border-white/20 hover:text-white/70
                          transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleClear(slot.id)}
                        disabled={pending}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.07] text-white/30
                          text-[10px] uppercase tracking-wider font-bold hover:border-red-500/30 hover:text-red-400
                          transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Clear
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