'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/30 mb-4">
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          </div>
          <h1 className="text-sm uppercase tracking-[0.3em] text-white/40 font-light">
            1,000 Watches
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-white/20 mt-1">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white
                placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
              {error}
            </p>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold
              text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/15 mt-8 uppercase tracking-widest">
          Restricted Access
        </p>
      </div>
    </div>
  )
}
