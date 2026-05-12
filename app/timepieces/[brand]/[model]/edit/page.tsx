'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { watchSpecsSchema } from '@/lib/schemas'
import Navbar from '@/components/Navbar'

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
  strap_color: '',
  clasp_type: '',
  bracelet: false,
  msrp: null,
  currency: 'USD',
  availability: '',
  discontinued: false
}

export default function EditWatchPage() {
  const params = useParams()
  const router = useRouter()
  const brandSlug = params.brand as string
  const modelSlug = params.model as string
  
  const [specs, setSpecs] = useState<WatchSpecs>(initialSpecs)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  
  const supabase = createClient()

  const searchBrand = brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const searchModel = modelSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

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
  }, [])

  const fetchWatchAndSpecs = async () => {
    const { data: watch } = await supabase
      .from('slots')
      .select('*')
      .ilike('brand', searchBrand)
      .ilike('model', searchModel)
      .eq('status', 'filled')
      .single()

    if (watch) {
      const { data: existingSpecs } = await supabase
        .from('watch_specs')
        .select('*')
        .eq('watch_id', watch.uuid)
        .maybeSingle()

      if (existingSpecs) {
        const cleanedSpecs: WatchSpecs = { ...initialSpecs, watch_id: watch.uuid }
        Object.keys(existingSpecs).forEach((key) => {
          const value = existingSpecs[key as keyof typeof existingSpecs]
          if (value === null) {
            cleanedSpecs[key] = ''
          } else {
            cleanedSpecs[key] = value as any
          }
        })
        setSpecs(cleanedSpecs)
      } else {
        setSpecs(prev => ({ ...prev, watch_id: watch.uuid }))
      }
    }
    setLoading(false)
  }

  const handleChange = (field: keyof WatchSpecs, value: any) => {
    setSpecs(prev => ({ ...prev, [field]: value === '' ? null : value }))
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCheckbox = (field: keyof WatchSpecs) => {
    setSpecs(prev => ({ ...prev, [field]: prev[field] ? false : true }))
  }

  const getValue = (key: string): string => {
    return toInputValue(specs[key])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')
    setErrors({})

    // Clean up empty strings to undefined for Zod
    const cleanedSpecs = Object.fromEntries(
      Object.entries(specs).map(([k, v]) => [k, v === '' ? undefined : v])
    )
    
    // Validate with Zod
    const result = watchSpecsSchema.safeParse(cleanedSpecs)
    
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof specs
        if (field) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      setSaving(false)
      return
    }

    try {
      const { data: existing } = await supabase
        .from('watch_specs')
        .select('id')
        .eq('watch_id', specs.watch_id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('watch_specs')
          .update({
            ...cleanedSpecs,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('watch_id', specs.watch_id)
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
      setTimeout(() => router.push(`/timepieces/${brandSlug}/${modelSlug}`), 1500)
    } catch (err) {
      console.error('Save error:', err)
      setMessage('Error saving specifications')
    } finally {
      setSaving(false)
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
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-light">Edit Specifications</h1>
              <p className="text-white/40 mt-1">{searchBrand} {searchModel}</p>
            </div>
            <a 
              href={`/timepieces/${brandSlug}/${modelSlug}`}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white"
            >
              Cancel
            </a>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Core Identification */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Core Identification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Collection</label>
                  <input
                    type="text"
                    value={getValue('collection')}
                    onChange={(e) => handleChange('collection', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={getValue('reference_number')}
                    onChange={(e) => handleChange('reference_number', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Nickname</label>
                  <input
                    type="text"
                    value={getValue('nickname')}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Country of Origin</label>
                  <input
                    type="text"
                    value={getValue('country_of_origin')}
                    onChange={(e) => handleChange('country_of_origin', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Release Year</label>
                  <input
                    type="number"
                    value={getValue('release_year')}
                    onChange={(e) => handleChange('release_year', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specs.limited_edition}
                      onChange={() => handleCheckbox('limited_edition')}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-white/60">Limited Edition</span>
                  </label>
                  {specs.limited_edition && (
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={getValue('limited_quantity')}
                      onChange={(e) => handleChange('limited_quantity', e.target.value ? parseInt(e.target.value) : '')}
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Watch Type */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Watch Type & Usage</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Watch Type</label>
                  <select
                    value={getValue('watch_type')}
                    onChange={(e) => handleChange('watch_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Dress">Dress</option>
                    <option value="Sport">Sport</option>
                    <option value="Casual">Casual</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Pilot">Pilot</option>
                    <option value="Diver">Diver</option>
                    <option value="Field">Field</option>
                    <option value="Racing">Racing</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Gender Target</label>
                  <select
                    value={getValue('gender_target')}
                    onChange={(e) => handleChange('gender_target', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Style</label>
                  <select
                    value={getValue('style')}
                    onChange={(e) => handleChange('style', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Classic">Classic</option>
                    <option value="Modern">Modern</option>
                    <option value="Vintage">Vintage</option>
                    <option value="Avant-garde">Avant-garde</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Intended Use</label>
                  <select
                    value={getValue('intended_use')}
                    onChange={(e) => handleChange('intended_use', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Daily Wear">Daily Wear</option>
                    <option value="Business">Business</option>
                    <option value="Formal">Formal</option>
                    <option value="Sports">Sports</option>
                    <option value="Diving">Diving</option>
                    <option value="Aviation">Aviation</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Case Specifications */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Case Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Case Material</label>
                  <input
                    type="text"
                    value={getValue('case_material')}
                    onChange={(e) => handleChange('case_material', e.target.value)}
                    placeholder="e.g., Stainless Steel, Titanium"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Case Diameter (mm)</label>
                  <input
                    type="number"
                    value={getValue('case_diameter_mm')}
                    onChange={(e) => handleChange('case_diameter_mm', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Case Thickness (mm)</label>
                  <input
                    type="number"
                    value={getValue('case_thickness_mm')}
                    onChange={(e) => handleChange('case_thickness_mm', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Lug Width (mm)</label>
                  <input
                    type="number"
                    value={getValue('lug_width_mm')}
                    onChange={(e) => handleChange('lug_width_mm', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Case Shape</label>
                  <select
                    value={getValue('case_shape')}
                    onChange={(e) => handleChange('case_shape', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Round">Round</option>
                    <option value="Square">Square</option>
                    <option value="Cushion">Cushion</option>
                    <option value="Tonneau">Tonneau</option>
                    <option value="Rectangular">Rectangular</option>
                    <option value="Octagonal">Octagonal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Crown Type</label>
                  <select
                    value={getValue('crown_type')}
                    onChange={(e) => handleChange('crown_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Screw-down">Screw-down</option>
                    <option value="Push-pull">Push-pull</option>
                    <option value="Twist-lock">Twist-lock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Water Resistance (m)</label>
                  <input
                    type="number"
                    value={getValue('water_resistance_meters')}
                    onChange={(e) => handleChange('water_resistance_meters', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Crystal Material</label>
                  <select
                    value={getValue('crystal_material')}
                    onChange={(e) => handleChange('crystal_material', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Sapphire">Sapphire</option>
                    <option value="Mineral">Mineral</option>
                    <option value="Acrylic">Acrylic/Hesalite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Bezel Type</label>
                  <select
                    value={getValue('bezel_type')}
                    onChange={(e) => handleChange('bezel_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Unidirectional">Unidirectional</option>
                    <option value="Bidirectional">Bidirectional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Case Finish</label>
                  <select
                    value={getValue('case_finish')}
                    onChange={(e) => handleChange('case_finish', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Polished">Polished</option>
                    <option value="Brushed">Brushed</option>
                    <option value="Satin">Satin</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Sandblasted">Sandblasted</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Dial */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Dial & Hands</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Dial Color</label>
                  <input
                    type="text"
                    value={getValue('dial_color')}
                    onChange={(e) => handleChange('dial_color', e.target.value)}
                    placeholder="e.g., Black, Blue, Silver"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Dial Finish</label>
                  <select
                    value={getValue('dial_finish')}
                    onChange={(e) => handleChange('dial_finish', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Sunburst">Sunburst</option>
                    <option value="Matte">Matte</option>
                    <option value="Gloss">Gloss</option>
                    <option value="Textured">Textured</option>
                    <option value="Fumé">Fumé</option>
                    <option value="Enamel">Enamel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Indices Type</label>
                  <select
                    value={getValue('indices_type')}
                    onChange={(e) => handleChange('indices_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Applied">Applied</option>
                    <option value="Printed">Printed</option>
                    <option value="Roman">Roman</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Baton">Baton</option>
                    <option value="Dots">Dots</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Lume Type</label>
                  <select
                    value={getValue('lume_type')}
                    onChange={(e) => handleChange('lume_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Super-LumiNova">Super-LumiNova</option>
                    <option value="Chromalight">Chromalight</option>
                    <option value="Tritium">Tritium</option>
                    <option value="Radioactive">Radioactive</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Hands Style</label>
                  <select
                    value={getValue('hands_style')}
                    onChange={(e) => handleChange('hands_style', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Dauphine">Dauphine</option>
                    <option value="Baton">Baton</option>
                    <option value="Mercedes">Mercedes</option>
                    <option value="Alpha">Alpha</option>
                    <option value="Snowflake">Snowflake</option>
                    <option value="Leaf">Leaf</option>
                    <option value="Lancette">Lancette</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Movement */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Movement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Movement Brand</label>
                  <input
                    type="text"
                    value={getValue('movement_brand')}
                    onChange={(e) => handleChange('movement_brand', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Caliber/Model</label>
                  <input
                    type="text"
                    value={getValue('movement_model')}
                    onChange={(e) => handleChange('movement_model', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Movement Type</label>
                  <select
                    value={getValue('movement_type')}
                    onChange={(e) => handleChange('movement_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Solar">Solar</option>
                    <option value="Spring Drive">Spring Drive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Jewels</label>
                  <input
                    type="number"
                    value={getValue('jewels_count')}
                    onChange={(e) => handleChange('jewels_count', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Power Reserve (hours)</label>
                  <input
                    type="number"
                    value={getValue('power_reserve_hours')}
                    onChange={(e) => handleChange('power_reserve_hours', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Beat Rate (vph)</label>
                  <input
                    type="number"
                    value={getValue('beat_rate_vph')}
                    onChange={(e) => handleChange('beat_rate_vph', e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="e.g., 28800"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specs.cosc_certified}
                      onChange={() => handleCheckbox('cosc_certified')}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500"
                    />
                    <span className="text-sm text-white/60">COSC Chronometer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specs.hand_winding}
                      onChange={() => handleCheckbox('hand_winding')}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500"
                    />
                    <span className="text-sm text-white/60">Hand Winding</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Strap */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Strap / Bracelet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Strap Type</label>
                  <select
                    value={getValue('strap_type')}
                    onChange={(e) => handleChange('strap_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Leather">Leather</option>
                    <option value="Rubber">Rubber</option>
                    <option value="Fabric">Fabric/NATO</option>
                    <option value="Silicone">Silicone</option>
                    <option value="Metal">Metal Bracelet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Strap Material</label>
                  <input
                    type="text"
                    value={getValue('strap_material')}
                    onChange={(e) => handleChange('strap_material', e.target.value)}
                    placeholder="e.g., Calf Leather, Alligator"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Strap Color</label>
                  <input
                    type="text"
                    value={getValue('strap_color')}
                    onChange={(e) => handleChange('strap_color', e.target.value)}
                    placeholder="e.g., Black, Brown, Blue"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Clasp Type</label>
                  <select
                    value={getValue('clasp_type')}
                    onChange={(e) => handleChange('clasp_type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Pin Buckle">Pin Buckle</option>
                    <option value="Deployant">Deployant</option>
                    <option value="Butterfly">Butterfly</option>
                    <option value="Folding Clasp">Folding Clasp</option>
                    <option value="Tang Buckle">Tang Buckle</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specs.bracelet}
                      onChange={() => handleCheckbox('bracelet')}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500"
                    />
                    <span className="text-sm text-white/60">Metal Bracelet Included</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="space-y-6">
              <h2 className="text-lg font-medium text-amber-500 border-b border-white/10 pb-2">Market & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">MSRP</label>
                  <input
                    type="number"
                    value={getValue('msrp')}
                    onChange={(e) => handleChange('msrp', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Currency</label>
                  <select
                    value={getValue('currency')}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Availability</label>
                  <select
                    value={getValue('availability')}
                    onChange={(e) => handleChange('availability', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="In Production">In Production</option>
                    <option value="Limited Availability">Limited Availability</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Rare">Rare</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specs.discontinued}
                      onChange={() => handleCheckbox('discontinued')}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500"
                    />
                    <span className="text-sm text-white/60">Discontinued</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-6">
              <a 
                href={`/timepieces/${brandSlug}/${modelSlug}`}
                className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50"
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