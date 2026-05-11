'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLogout() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-[10px] uppercase tracking-widest text-white/25 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
