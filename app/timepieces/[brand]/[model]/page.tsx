'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VoteButton from '@/components/VoteButton'
import PhotoGallery from '@/components/PhotoGallery'
import PhotoUploader from '@/components/PhotoUploader'
import { specFields } from '@/lib/schemas'

function SpecRow({ label, value, suffix, prefix, isBoolean }: { 
  label: string; 
  value: string | number | boolean | null | undefined;
  suffix?: string;
  prefix?: string;
  isBoolean?: boolean;
}) {
  let displayValue: string | number | boolean | null | undefined = value
  
  if (isBoolean) {
    displayValue = value === true ? 'Yes' : value === false ? 'No' : null
  } else if (suffix && typeof value === 'number') {
    displayValue = `${value}${suffix}`
  } else if (prefix && typeof value === 'number') {
    displayValue = `${prefix}${value.toLocaleString()}`
  }
  
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">{label}</p>
      <p className={displayValue ? 'text-white/80' : 'text-white/15'}>{displayValue || '—'}</p>
    </div>
  )
}

function SpecSection({ 
  title, 
  category, 
  specs 
}: { 
  title: string; 
  category: string; 
  specs: any 
}) {
  const fields = specFields[category]
  const hasFields = fields.some((field: { key: string }) => {
    const value = specs[field.key]
    return value !== null && value !== undefined && value !== ''
  })
  
  if (!hasFields) return null
  
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-amber-500/60 mb-3 border-b border-white/5 pb-2">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
        {fields.map((field: { key: string; label: string; suffix?: string; prefix?: string; isBoolean?: boolean }) => {
          const value = specs[field.key]
          if (value === null || value === undefined || value === '') return null
          return (
            <SpecRow 
              key={field.key} 
              label={field.label} 
              value={value}
              suffix={field.suffix}
              prefix={field.prefix}
              isBoolean={field.isBoolean}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function WatchPage() {
  const params = useParams()
  const brandSlug = params.brand as string
  const modelSlug = params.model as string
  
  const [watch, setWatch] = useState<any>(null)
  const [specs, setSpecs] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [photoCount, setPhotoCount] = useState(0)
  
  const supabase = createClient()

  const searchBrand = brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const searchModel = modelSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      fetchWatch()
    }
    init()
  }, [])

  const fetchWatch = async () => {
    const { data } = await supabase
      .from('slots')
      .select('*')
      .ilike('brand', searchBrand)
      .ilike('model', searchModel)
      .eq('status', 'filled')
      .single()
    
    if (data) {
      const submissionId = data.uuid || data.id
      
      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('submission_id', submissionId)
      
      data.votes = count || 0

      // Fetch watch specs
      const { data: specsData } = await supabase
        .from('watch_specs')
        .select('*')
        .eq('watch_id', data.uuid)
        .maybeSingle()
      
      setSpecs(specsData)
    }
    
    setWatch(data)
    setLoading(false)
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
            {/* Photo Gallery */}
            <div className="space-y-4">
              <PhotoGallery watchId={watch.uuid} userId={user?.id} onPhotoCountChange={setPhotoCount} />
              
              {user && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-amber-500 mb-3">Add Your Photo</p>
                  <PhotoUploader watchId={watch.uuid} onUploadComplete={() => {}} />
                </div>
              )}
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
                <VoteButton
                  submissionId={watch.uuid}
                  initialVotes={watch.votes || 0}
                  size="lg"
                />
                {user && (
                  <Link
                    href={`/timepieces/${brandSlug}/${modelSlug}/edit`}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-amber-400 hover:border-amber-500/30 text-sm"
                  >
                    Edit Specs
                  </Link>
                )}
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

              {/* Detailed Specifications */}
              <div className="pt-8">
                <div className="h-px bg-white/10 mb-8" />
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-amber-500">Specifications</h3>
                  {user && (
                    <Link
                      href={`/timepieces/${brandSlug}/${modelSlug}/edit`}
                      className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10"
                    >
                      {specs ? 'Edit Specifications' : 'Add Specifications'}
                    </Link>
                  )}
                </div>

                {specs ? (
                  <div className="space-y-8">
                    <SpecSection title="Core Identification" category="core" specs={specs} />
                    <SpecSection title="Watch Type & Usage" category="type" specs={specs} />
                    <SpecSection title="Case" category="case" specs={specs} />
                    <SpecSection title="Dial & Hands" category="dial" specs={specs} />
                    <SpecSection title="Movement" category="movement" specs={specs} />
                    <SpecSection title="Strap & Bracelet" category="strap" specs={specs} />
                    <SpecSection title="Market & Pricing" category="market" specs={specs} />
                    
                    {/* Additional/Extra fields - show any specs not in the main categories */}
                    {(() => {
                      const knownFields = new Set(
                        [...specFields.core, ...specFields.type, ...specFields.case, ...specFields.dial, ...specFields.movement, ...specFields.strap, ...specFields.market].map(f => f.key)
                      )
                      const extraFields = Object.entries(specs).filter(([k, v]) => 
                        !['id', 'watch_id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(k) &&
                        !knownFields.has(k) &&
                        v !== null && v !== undefined && v !== ''
                      )
                      if (extraFields.length === 0) return null
                      return (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-amber-500/60 mb-3 border-b border-white/5 pb-2">Additional Information</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                            {extraFields.map(([key, value]) => (
                              <SpecRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={value as string | number | boolean} />
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/30 mb-4">No specifications have been added yet.</p>
                    <p className="text-white/20 text-sm">Be the first to contribute detailed specifications for this timepiece.</p>
                  </div>
                )}
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