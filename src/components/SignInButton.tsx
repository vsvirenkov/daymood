'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignInClientButton() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://daymood.fun/auth/callback' },
    })
    setLoading(false)
    if (!error) setSent(true)
  }

  if (sent) {
    return (
      <div style={{ maxWidth: '360px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Check your email — we sent a magic link to <strong>{email}</strong>.
          Click it to sign in.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '360px' }}>
      <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '14px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <button
        onClick={() => supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: 'https://daymood.fun/auth/callback' },
        })}
        style={{
          width: '100%',
          padding: '14px',
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Continue with Google
      </button>
    </div>
  )
}