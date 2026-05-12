'use client'

import React, { useState, useEffect, useRef } from 'react'
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

const supabase = createClient()

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-8 flex flex-col gap-4 bg-white/[0.015] border-r border-white/[0.06] last:border-r-0`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
      <span className={`text-5xl font-light ${accent ? 'text-amber-500' : 'text-white'}`}>{value}</span>
    </div>
  )
}

function SubmissionCard({ submission }: { submission: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="flex gap-6 items-center p-5 border border-white/[0.06] bg-white/[0.015]
        transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
        <div className="w-28 aspect-square bg-white/[0.04] border border-white/[0.06] flex-shrink-0 overflow-hidden flex items-center justify-center">
          {submission.image_url ? (
            <img src={submission.image_url} alt={submission.brand} className="w-full h-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full border border-amber-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
            </div>
          )}
        </div>
        <div className="flex-grow space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">Submission</span>
            <span className="text-[10px] uppercase tracking-widest text-white/25 whitespace-nowrap flex-shrink-0">{timeAgo(submission.created_at)}</span>
          </div>
          <h3 className="text-base font-medium text-white/90 group-hover:text-amber-500 transition-colors leading-snug truncate">
            {submission.brand} {submission.model}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
            {submission.year}{submission.material ? ` · ${submission.material}` : ''}{submission.movement_type ? ` · ${submission.movement_type}` : ''}
          </p>
          {submission.votes > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/60">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {submission.votes} votes
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PhotoCard({ photo }: { photo: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="flex gap-6 items-center p-5 border border-white/[0.06] bg-white/[0.015]
        transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
        <div className="w-28 aspect-square bg-white/[0.04] border border-white/[0.06] flex-shrink-0 overflow-hidden flex items-center justify-center">
          <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">Photo Upload</span>
            <span className="text-[10px] uppercase tracking-widest text-white/25 whitespace-nowrap flex-shrink-0">{timeAgo(photo.created_at)}</span>
          </div>
          {photo.caption && (
            <h3 className="text-base font-medium text-white/90 group-hover:text-amber-500 transition-colors leading-snug line-clamp-2">
              {photo.caption}
            </h3>
          )}
          {photo.uploader_username && (
            <p className="text-xs text-white/40">@{photo.uploader_username}</p>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/60">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            {photo.votes} votes
          </span>
        </div>
      </div>
    </div>
  )
}

function VoteCard({ vote }: { vote: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="flex gap-6 items-center p-5 border border-white/[0.06] bg-white/[0.015]
        transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
        <div className="w-28 aspect-square bg-white/[0.04] border border-white/[0.06] flex-shrink-0 overflow-hidden flex items-center justify-center">
          {vote.photo?.image_url ? (
            <img src={vote.photo.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-grow space-y-2 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">Vote Cast</span>
            <span className="text-[10px] uppercase tracking-widest text-white/25 whitespace-nowrap flex-shrink-0">{timeAgo(vote.created_at)}</span>
          </div>
          {vote.photo?.caption && (
            <h3 className="text-base font-medium text-white/90 group-hover:text-amber-500 transition-colors leading-snug line-clamp-2">
              {vote.photo.caption}
            </h3>
          )}
          {vote.photo && (
            <p className="text-xs text-white/40">
              {vote.photo.uploader_username ? `@${vote.photo.uploader_username}'s photo` : 'Community photo'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ tab, name }: { tab: Tab; name: string }) {
  const messages: Record<Tab, { title: string; desc: string }> = {
    Submissions: {
      title: `No nominations yet, ${name.split(' ')[0]}`,
      desc: 'Your submitted watches will appear here after approval.',
    },
    Photos: {
      title: 'No photos uploaded yet',
      desc: 'When you contribute photos to watch pages, they will appear here.',
    },
    Votes: {
      title: 'No votes cast yet',
      desc: 'Your votes on community photos will be tracked here.',
    },
  }
  const msg = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <div>
        <p className="text-white/50 text-sm">{msg.title}</p>
        <p className="text-white/25 text-xs mt-1">{msg.desc}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Submissions')
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const [submissions, setSubmissions] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [counts, setCounts] = useState({ submissions: 0, photos: 0, votes: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setProfileImage(user?.user_metadata?.avatar_url || null)
      setDisplayName(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const uid = user.id

    const fetchData = async () => {
      const [subData, photoData, voteData] = await Promise.all([
        supabase
          .from('submissions')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('watch_photos')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('photo_votes')
          .select('*, photo:watch_photos(id, image_url, caption, uploader_username)')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      setSubmissions(subData.data || [])
      setPhotos(photoData.data || [])
      setVotes(voteData.data || [])
      setCounts({
        submissions: subData.count ?? subData.data?.length ?? 0,
        photos: photoData.count ?? photoData.data?.length ?? 0,
        votes: voteData.count ?? voteData.data?.length ?? 0,
      })
    }

    fetchData()
  }, [user])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

      const bucketName = 'avatars'
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) {
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

  const activityData: Record<Tab, any[]> = {
    Submissions: submissions,
    Photos: photos,
    Votes: votes,
  }

  const activeItems = activityData[activeTab]

  const renderActivityItem = (item: any) => {
    switch (activeTab) {
      case 'Submissions':
        return <SubmissionCard key={item.id} submission={item} />
      case 'Photos':
        return <PhotoCard key={item.id} photo={item} />
      case 'Votes':
        return <VoteCard key={item.id} vote={item} />
    }
  }

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
          <StatCard label="Submissions" value={counts.submissions} accent />
          <StatCard label="Photos" value={counts.photos} />
          <StatCard label="Votes Cast" value={counts.votes} />
          <StatCard label="Archive Impact" value={counts.submissions + counts.photos} />
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
                {activeItems.length === 0 ? (
                  <EmptyState tab={activeTab} name={name} />
                ) : (
                  activeItems.map(renderActivityItem)
                )}
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light tracking-tight">Curator Settings</h2>
                <button
                  onClick={handleSignOut}
                  className="text-[10px] uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
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
                <span className="text-4xl font-light text-amber-500">{counts.submissions}</span>
                <span className="text-xs text-white/30 mb-1 uppercase tracking-widest">nominations</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-light text-amber-500">{counts.photos}</span>
                <span className="text-xs text-white/30 mb-1 uppercase tracking-widest">photos</span>
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
          &copy; {new Date().getFullYear()} 1,000 Watches. The Curated Chronology.
        </div>
      </footer>

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