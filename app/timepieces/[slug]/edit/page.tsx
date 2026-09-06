'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { watchSpecsSchema } from '@/lib/schemas'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

type FormErrors = Partial<Record<string, string>>

function toInputValue(val: any): string {
  if (val === null || val === undefined) return ''
  return String(val)
}

interface WatchSpecs {
  [key: string]: any
}

const initialSpecs: WatchSpecs = {
  watch_id: '',
  brand: '',
  collection: '',
  model_name: '',
  reference_number: '',
  nickname: '',
  country_of_origin: '',
  release_year: null,
  limited_edition: false,
  limited_quantity: null,
  watch_type: '',
  gender_target: '',
  style: '',
  intended_use: '',
  case_material: '',
  case_diameter_mm: null,
  case_thickness_mm: null,
  lug_width_mm: null,
  weight_grams: '',
  case_shape: '',
  case_finish: '',
  crown_type: '',
  water_resistance_meters: '',
  crystal_material: '',
  bezel_type: '',
  dial_color: '',
  dial_finish: '',
  indices_type: '',
  lume_type: '',
  hands_style: '',
  movement_brand: '',
  movement_model: '',
  movement_type: '',
  jewels_count: '',
  power_reserve_hours: '',
  beat_rate_vph: '',
  cosc_certified: false,
  hand_winding: false,
  strap_type: '',
  strap_material: '',
  clasp_type: '',
  cover_image_url: '',
  marketing_description: '',
  editorial_review: '',
  tags: '',
}

export default function EditWatchPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [watch, setWatch] = useState<any>(null)
  const [specs, setSpecs] = useState<WatchSpecs>(initialSpecs)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/profile?error=login_required')
        return
      }
      setUser(user)
      fetchWatchAndSpecs()
    }
    checkUser()
  }, [slug])

  const fetchWatchAndSpecs = async () => {
    // 1. Check slots by slug
    let { data: watchData } = await supabase
      .from('slots')
      .select('*')
      .ilike('slug', slug)
      .maybeSingle()

    // 2. If not found in slots, check submissions
    if (!watchData) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .ilike('slug', slug)
        .maybeSingle()
      watchData = subData
    }

    if (watchData) {
      setWatch(watchData)
      const watchUuid = watchData.uuid || watchData.id

      const { data: existingSpecs } = await supabase
        .from('watch_specs')
        .select('*')
        .eq('watch_id', watchUuid)
        .maybeSingle()

      if (existingSpecs) {
        const cleanedSpecs: WatchSpecs = { ...initialSpecs, watch_id: watchUuid }
        Object.keys(existingSpecs).forEach((key) => {
          if (existingSpecs[key] !== null && existingSpecs[key] !== undefined) {
            cleanedSpecs[key] = existingSpecs[key]
          }
        })
        setSpecs(cleanedSpecs)
      } else {
        setSpecs({
          ...initialSpecs,
          watch_id: watchUuid,
          brand: watchData.brand || '',
          collection: watchData.line || '',
          model_name: watchData.model || '',
          reference_number: watchData.model_number || watchData.reference || '',
          nickname: watchData.nickname || '',
          release_year: watchData.year || null,
          case_material: watchData.material || '',
          movement_type: watchData.movement_type || '',
        })
      }
    }
    setLoading(false)
  }

  const handleChange = (field: string, value: any) => {
    setSpecs(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setErrors({})

    const watchUuid = watch?.uuid || watch?.id
    if (!watchUuid) {
      setMessage('Error: Watch identifier missing')
      setSaving(false)
      return
    }

    try {
      const cleanedSpecs = { ...specs, watch_id: watchUuid }

      const { data: existing } = await supabase
        .from('watch_specs')
        .select('id')
        .eq('watch_id', watchUuid)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('watch_specs')
          .update({
            ...cleanedSpecs,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('watch_id', watchUuid)
      } else {
        await supabase
          .from('watch_specs')
          .insert({
            ...cleanedSpecs,
            created_by: user.id,
            created_at: new Date().toISOString()
          })
      }

      setMessage('Specifications saved successfully!')
      setTimeout(() => router.push(`/timepieces/${slug}`), 1500)
    } catch (err) {
      console.error('Save error:', err)
      setMessage('Error saving specifications')
    } finally {
      setSaving(false)
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-light text-[var(--text-primary)]">Edit Specifications</h1>
              <p className="text-[var(--text-muted)] mt-1 font-sans text-sm">
                {watch?.brand} {watch?.model} {watch?.nickname ? `"${watch.nickname}"` : ''}
              </p>
            </div>
            <Link 
              href={`/timepieces/${slug}`}
              className="px-4 py-2 rounded-lg border border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs uppercase tracking-wider font-sans transition-colors"
            >
              Cancel
            </Link>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-sans ${message.includes('success') ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Identification */}
            <div className="p-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] space-y-4">
              <h2 className="text-lg font-serif font-light text-amber-500 border-b border-[var(--border-subtle)] pb-2">
                Identification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Brand</label>
                  <input
                    type="text"
                    value={toInputValue(specs.brand)}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Collection / Line</label>
                  <input
                    type="text"
                    value={toInputValue(specs.collection)}
                    onChange={(e) => handleChange('collection', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Model Name</label>
                  <input
                    type="text"
                    value={toInputValue(specs.model_name)}
                    onChange={(e) => handleChange('model_name', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Reference / Model #</label>
                  <input
                    type="text"
                    value={toInputValue(specs.reference_number)}
                    onChange={(e) => handleChange('reference_number', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Iconic Nickname</label>
                  <input
                    type="text"
                    value={toInputValue(specs.nickname)}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Release Year</label>
                  <input
                    type="number"
                    value={toInputValue(specs.release_year)}
                    onChange={(e) => handleChange('release_year', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Case & Dimensions */}
            <div className="p-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] space-y-4">
              <h2 className="text-lg font-serif font-light text-amber-500 border-b border-[var(--border-subtle)] pb-2">
                Case & Dimensions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Case Material</label>
                  <input
                    type="text"
                    value={toInputValue(specs.case_material)}
                    onChange={(e) => handleChange('case_material', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Diameter (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={toInputValue(specs.case_diameter_mm)}
                    onChange={(e) => handleChange('case_diameter_mm', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Thickness (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={toInputValue(specs.case_thickness_mm)}
                    onChange={(e) => handleChange('case_thickness_mm', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Movement */}
            <div className="p-6 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] space-y-4">
              <h2 className="text-lg font-serif font-light text-amber-500 border-b border-[var(--border-subtle)] pb-2">
                Movement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Movement Type</label>
                  <input
                    type="text"
                    value={toInputValue(specs.movement_type)}
                    onChange={(e) => handleChange('movement_type', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Movement Model</label>
                  <input
                    type="text"
                    value={toInputValue(specs.movement_model)}
                    onChange={(e) => handleChange('movement_model', e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-mono">Power Reserve (Hours)</label>
                  <input
                    type="number"
                    value={toInputValue(specs.power_reserve_hours)}
                    onChange={(e) => handleChange('power_reserve_hours', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Link
                href={`/timepieces/${slug}`}
                className="px-6 py-3 rounded-xl border border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-sans text-xs uppercase tracking-wider"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-[0.2em] font-sans shadow-lg shadow-amber-600/10 disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save Specifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
