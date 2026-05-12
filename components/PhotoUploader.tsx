'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface PhotoUploaderProps {
  watchId: string
  onUploadComplete: () => void
  currentPhotoCount?: number
}

export default function PhotoUploader({ watchId, onUploadComplete, currentPhotoCount = 0 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [userPhotoCount, setUserPhotoCount] = useState(0)
  const [username, setUsername] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const MAX_PHOTOS_PER_USER = 5

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
        setUsername(name)
      }
    })
  }, [])

  useEffect(() => {
    const countUserPhotos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('watch_photos')
        .select('*', { count: 'exact', head: true })
        .eq('watch_id', watchId)
        .eq('user_id', user.id)

      setUserPhotoCount(count || 0)
    }

    countUserPhotos()
  }, [watchId, currentPhotoCount])

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas context unavailable')); return }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(webpBlob => {
          URL.revokeObjectURL(url)
          if (webpBlob) {
            resolve(webpBlob)
          } else {
            reject(new Error('WebP conversion failed'))
          }
        }, 'image/webp', 0.85)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
      img.src = url
    })
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    if (userPhotoCount >= MAX_PHOTOS_PER_USER) {
      setError(`You can only upload up to ${MAX_PHOTOS_PER_USER} photos per watch`)
      return
    }

    setUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please sign in to upload photos')
        setUploading(false)
        return
      }

      const webpBlob = await convertToWebP(file)
      const fileName = `${watchId}/${user.id}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from('watch-photos')
        .upload(fileName, webpBlob, { contentType: 'image/webp' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('watch-photos')
        .getPublicUrl(fileName)

      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'

      const { error: insertError } = await supabase
        .from('watch_photos')
        .insert({
          watch_id: watchId,
          user_id: user.id,
          uploader_username: displayName,
          image_url: publicUrl,
          caption: caption || null,
          votes: 0,
          is_default: false,
        })

      if (insertError) throw insertError

      setCaption('')
      onUploadComplete()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const isUserMaxReached = userPhotoCount >= MAX_PHOTOS_PER_USER

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !isUserMaxReached && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : isUserMaxReached
              ? 'border-white/5 cursor-not-allowed opacity-40'
              : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUserMaxReached}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Converting & uploading...</p>
          </div>
        ) : isUserMaxReached ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/30 text-sm">You&apos;ve reached your limit of {MAX_PHOTOS_PER_USER} photos</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-white/60 text-sm">Drag & drop a photo here</p>
              <p className="text-white/30 text-xs mt-1">or click to browse</p>
            </div>
            <p className="text-white/20 text-xs">JPG, PNG, WebP → auto-converted to WebP • Max 10MB</p>
          </div>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Add a caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 text-sm focus:border-amber-500/50 focus:outline-none"
          disabled={isUserMaxReached}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <p className="text-white/20 text-xs text-center">
        {userPhotoCount} / {MAX_PHOTOS_PER_USER} photos uploaded by you
      </p>
    </div>
  )
}