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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="text-center mb-10 font-sans">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/40 mb-4 bg-amber-500/5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
          </div>
          <h1 className="text-2xl font-serif font-light tracking-tight text-[var(--text-primary)]">
            1,000 <span className="text-amber-500 italic">Watches</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1 font-sans">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-medium">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-primary)]
                placeholder:text-[var(--text-dim)] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {error}
            </p>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold
              text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-600/10"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>

        <p className="text-center text-[10px] text-[var(--text-dim)] mt-8 uppercase tracking-widest font-sans">
          Restricted Access
        </p>
      </div>
    </div>
  )
}
