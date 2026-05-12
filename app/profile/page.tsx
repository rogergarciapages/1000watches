'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'

const BADGES = [
  { icon: '⭐', label: 'Pioneer Submitter', desc: 'One of the first 100', amber: true },
  { icon: '📜', label: 'Horological Historian', desc: '500+ Verified Citations', amber: false },
  { icon: '📷', label: 'Lensman', desc: 'Gallery Quality Shots', amber: true },
  { icon: '✅', label: 'Master Voter', desc: 'Top 1% Accuracy', amber: false },
]

const SETTINGS_LINKS = [
  'Profile Identity',
  'Security & Access',
  'Privacy Controls',
  'Email Preferences',
]

const TABS = ['Submissions', 'Photos', 'Votes'] as const
type Tab = typeof TABS[number]

function ActivityItem({ title, subtitle, date, tag }: { title: string; subtitle: string; date: string; tag: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="flex gap-6 items-center p-5 border border-white/[0.06] bg-white/[0.015]
        transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
        <div className="w-28 aspect-square bg-white/[0.04] border border-white/[0.06] flex-shrink-0 flex items-center justify-center overflow-hidden">
          <div className="w-8 h-8 rounded-full border border-amber-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
          </div>
        </div>
        <div className="flex-grow space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">{tag}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/25 whitespace-nowrap flex-shrink-0">{date}</span>
          </div>
          <h3 className="text-base font-medium text-white/90 group-hover:text-amber-500 transition-colors leading-snug truncate">
            {title}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

const MOCK_ACTIVITY: Record<string, { title: string; subtitle: string; date: string; tag: string }[]> = {
  Submissions: [
    { title: 'Patek Philippe Calatrava Ref. 5227G', subtitle: 'Added comprehensive technical specs and historical context.', date: '2 Days Ago', tag: 'New Submission' },
    { title: 'Vacheron Constantin Patrimony', subtitle: 'Identified a rare variation of the 1950s movement calibre.', date: '1 Week Ago', tag: 'New Submission' },
  ],
  Photos: [
    { title: 'Rolex Submariner 5513 Dial Study', subtitle: 'Close-up series of the gilt "SWISS MADE" dial variations.', date: '5 Days Ago', tag: 'Photo Upload' },
  ],
  Votes: [
    { title: 'IWC Portugieser vs Jaeger-LeCoultre Reverso', subtitle: 'Cast deciding vote — IWC Portugieser won by 3%.', date: 'Yesterday', tag: 'Vote Cast' },
  ],
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Submissions')
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setProfileImage(user?.user_metadata?.avatar_url || null)
      setDisplayName(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
      setLoading(false)
    })
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      // Try to use avatars bucket, fallback to watch-images
      const bucketName = 'avatars'
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) {
        // If avatars bucket doesn't exist, show message
        console.error('Upload error:', uploadError)
        alert('Avatar upload not configured. Please contact the administrator.')
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      setProfileImage(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    
    await supabase.auth.updateUser({
      data: { full_name: displayName }
    })
    
    setShowSettings(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/20">
        <Navbar />
        <main className="pt-36 pb-32 px-6 md:px-12 max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-light tracking-tight mb-6">Welcome Back</h1>
          <p className="text-white/40 mb-10">Sign in to track your nominations, votes, and contributions to the archive.</p>
          <button
            onClick={handleSignIn}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-[0.2em] hover:bg-amber-500 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </main>
      </div>
    )
  }

  const userMeta = user.user_metadata
  const name = userMeta?.full_name || userMeta?.name || 'Curator'
  const avatar = userMeta?.avatar_url

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/20">
      <Navbar />

      <main className="pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <header className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end mb-24">
          <div className="md:col-span-4 relative group">
            <div className="aspect-square bg-white/[0.03] border border-white/[0.06] overflow-hidden flex items-center justify-center relative">
              {profileImage ? (
                <img src={profileImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <span className="text-3xl font-light text-white/30">{name.charAt(0)}</span>
                </div>
              )}
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.76-.9l.814-1.05A2 2 0 0111.07 3H13a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-wider text-white">Change Photo</span>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-amber-500/10 border border-amber-500/20 px-5 py-3 hidden md:block">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500">Google Member</span>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">Curator</span>
              <h1 className="text-6xl md:text-8xl tracking-tighter leading-none font-light text-white">{name}</h1>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">Member Since</span>
                <span className="text-lg font-medium tracking-tight text-white/80">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">Email</span>
                <span className="text-lg font-medium tracking-tight text-white/80">{user.email}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 mb-28 border border-white/[0.06]">
          {[
            { label: 'Total Submissions', value: '0' },
            { label: 'Votes Cast', value: '0' },
            { label: 'Photos Contributed', value: '0' },
            { label: 'Comments', value: '0' },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className={`p-8 flex flex-col gap-4 bg-white/[0.015] ${i < arr.length - 1 ? 'border-r border-white/[0.06]' : ''}`}>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
              <span className="text-5xl font-light text-white">{value}</span>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-28">
            <section>
              <div className="flex items-baseline justify-between mb-10">
                <h2 className="text-3xl font-light tracking-tight">Recent Activity</h2>
                <div className="flex gap-6 border-b border-white/[0.07] pb-2">
                  {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`text-[10px] uppercase tracking-widest font-bold pb-2 -mb-[10px] transition-colors
                        ${activeTab === tab ? 'border-b-2 border-amber-500 text-amber-500' : 'text-white/30 hover:text-white/60'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {MOCK_ACTIVITY[activeTab].map(item => (
                  <ActivityItem key={item.title} {...item} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-3xl font-light tracking-tight whitespace-nowrap">Cabinet of Curiosities</h2>
                <div className="h-px bg-white/[0.07] w-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {BADGES.map(({ icon, label, desc, amber }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-4 group">
                    <div className={`w-20 h-20 rounded-full p-[3px] transition-transform duration-500 group-hover:rotate-12 border ${amber ? 'border-amber-500/30' : 'border-white/10'}`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl transition-colors bg-white/[0.03] ${amber ? 'group-hover:bg-amber-500/10 text-amber-500/60 group-hover:text-amber-500' : 'group-hover:bg-white/[0.08] text-white/30 group-hover:text-white'}`}>
                        {icon}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase tracking-widest font-bold text-white/70">{label}</span>
                      <span className="block text-[10px] text-white/25 italic">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="border border-white/[0.06] bg-white/[0.015] p-8 space-y-8">
              <h2 className="text-2xl font-light tracking-tight">Curator Settings</h2>
              <div className="space-y-6">
                {SETTINGS_LINKS.map((label, index) => (
                  <div key={label} className="flex flex-col gap-3 group cursor-pointer">
                    <button 
                      onClick={() => index === 0 && setShowSettings(true)}
                      className="flex justify-between items-center group-hover:text-amber-500 transition-colors w-full text-left"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 group-hover:text-amber-500 transition-colors">
                        {label}
                      </span>
                      <svg className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <div className="h-px bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-amber-500/10 bg-amber-500/[0.03] p-8 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 font-bold">Archive Contribution</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-light text-amber-500">0</span>
                <span className="text-xs text-white/30 mb-1 uppercase tracking-widest">nominations</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#080808] border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center px-12 py-14 gap-8">
        <div className="text-sm font-light tracking-[0.15em] uppercase text-white/60">
          1,000 <span className="text-amber-500">Watches</span>
        </div>
        <div className="text-[10px] tracking-widest uppercase text-white/20">
          © {new Date().getFullYear()} 1,000 Watches. The Curated Chronology.
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-7 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-1">Profile Identity</h3>
            <p className="text-xs text-white/30 mb-6">Update your curator profile details.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                  placeholder="Your display name"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Email</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/40"
                />
                <p className="text-[10px] text-white/20 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/40 hover:text-white text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
