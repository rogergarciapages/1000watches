'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Photo {
  id: string
  image_url: string
  caption: string | null
  votes: number
  is_default: boolean
  created_at: string
  uploader_username: string | null
  user_id: string
}

interface PhotoGalleryProps {
  watchId: string
  userId: string | null
  onPhotoCountChange?: (count: number) => void
}

export default function PhotoGallery({ watchId, userId, onPhotoCountChange }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('watch_photos')
      .select('*')
      .eq('watch_id', watchId)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setPhotos(data)
      onPhotoCountChange?.(data.length)
    }
    setLoading(false)
  }

  const fetchVotedIds = async (photoIds: string[]) => {
    if (!userId) return
    const { data } = await supabase
      .from('photo_votes')
      .select('photo_id')
      .in('photo_id', photoIds)
      .eq('user_id', userId)

    if (data) setVotedIds(new Set(data.map(v => v.photo_id)))
  }

  useEffect(() => { fetchPhotos() }, [watchId])

  useEffect(() => {
    if (photos.length) fetchVotedIds(photos.map(p => p.id))
  }, [photos, userId])

  const toggleVote = async (photo: Photo) => {
    if (!userId || togglingId) return
    const isVoted = votedIds.has(photo.id)
    setTogglingId(photo.id)

    try {
      if (isVoted) {
        await supabase.from('photo_votes').delete().eq('photo_id', photo.id).eq('user_id', userId)
        setVotedIds(prev => { const n = new Set(prev); n.delete(photo.id); return n })
      } else {
        await supabase.from('photo_votes').insert({ photo_id: photo.id, user_id: userId })
        setVotedIds(prev => new Set(prev).add(photo.id))
      }
      await fetchPhotos()
    } finally {
      setTogglingId(null)
    }
  }

  const deletePhoto = async (photo: Photo) => {
    if (!userId || deletingId) return
    if (!confirm(`Delete your photo${photo.caption ? `: "${photo.caption}"` : ''}? This cannot be undone.`)) return

    setDeletingId(photo.id)

    try {
      const filePath = photo.image_url.split('/watch-photos/')[1]
      if (filePath) {
        await supabase.storage.from('watch-photos').remove([filePath])
      }

      await supabase.from('watch_photos').delete().eq('id', photo.id)

      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null)
      }

      await fetchPhotos()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (photos.length === 0) return (
    <div className="text-center py-8">
      <p className="text-white/30 mb-2">No photos yet</p>
      <p className="text-white/20 text-sm">Be the first to add a photo!</p>
    </div>
  )

  const displayed = selectedPhoto || photos[0]

  return (
    <div className="space-y-4">
      {/* Main photo display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/50">
        <img
          src={displayed.image_url}
          alt={displayed.caption || 'Watch photo'}
          className="w-full h-full object-contain"
        />

        {/* Uploader pill */}
        {displayed.uploader_username && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white/50 text-xs">
              by {displayed.uploader_username}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {displayed.is_default && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full bg-amber-500 text-black text-xs font-bold">
              Featured
            </span>
          </div>
        )}

        {/* Vote button */}
        {userId && (
          <PhotoVoteButton
            photo={displayed}
            hasVoted={votedIds.has(displayed.id)}
            isLoading={togglingId === displayed.id}
            onVote={() => toggleVote(displayed)}
          />
        )}
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              (selectedPhoto?.id || photos[0]?.id) === photo.id
                ? 'border-amber-500'
                : 'border-transparent hover:border-white/20'
            }`}
          >
            <img src={photo.image_url} alt={photo.caption || 'Thumbnail'} className="w-full h-full object-cover" />
            {photo.is_default && (
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
            <div className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/60 text-white text-[8px] flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
              {photo.votes}
            </div>
          </button>
        ))}
      </div>

      {/* Photo list with votes */}
      <div className="space-y-2 mt-4">
        {photos.map(photo => (
          <PhotoRow
            key={photo.id}
            photo={photo}
            hasVoted={votedIds.has(photo.id)}
            isLoading={togglingId === photo.id}
            isDeleting={deletingId === photo.id}
            canDelete={userId !== null && userId === photo.user_id}
            onVote={() => toggleVote(photo)}
            onDelete={() => deletePhoto(photo)}
          />
        ))}
      </div>
    </div>
  )
}

function PhotoRow({ photo, hasVoted, isLoading, isDeleting, canDelete, onVote, onDelete }: {
  photo: Photo
  hasVoted: boolean
  isLoading: boolean
  isDeleting: boolean
  canDelete: boolean
  onVote: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <button onClick={() => {}} className="shrink-0">
        {isDeleting ? (
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <img src={photo.image_url} alt={photo.caption || 'Photo'} className="w-16 h-16 rounded-lg object-cover" />
        )}
      </button>
      <div className="flex-grow min-w-0">
        <p className="text-sm text-white/80 truncate">{photo.caption || 'No caption'}</p>
        <p className="text-xs text-white/30 flex items-center gap-2">
          {photo.uploader_username && <span>by {photo.uploader_username}</span>}
          {photo.is_default && <span className="text-amber-500">Featured</span>}
          <span>{new Date(photo.created_at).toLocaleDateString()}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onVote}
          disabled={isLoading || isDeleting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-all ${
            hasVoted
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          )}
          {photo.votes}
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={isLoading || isDeleting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-white/30 hover:border-red-500/50 hover:text-red-400 text-sm transition-all"
            title="Delete photo"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function PhotoVoteButton({ photo, hasVoted, isLoading, onVote }: {
  photo: Photo
  hasVoted: boolean
  isLoading: boolean
  onVote: () => void
}) {
  return (
    <div className="absolute bottom-4 right-4">
      <button
        onClick={onVote}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
          hasVoted
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : 'bg-black/50 border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400'
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        ) : (
          <svg className={`w-5 h-5 ${hasVoted ? 'fill-amber-400' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        )}
        <span className="text-sm font-bold">{photo.votes}</span>
      </button>
    </div>
  )
}