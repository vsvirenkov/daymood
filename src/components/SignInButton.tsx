'use client'

import { supabase } from '@/lib/supabase'

export default function SignInClientButton() {
  return (
    <button
      onClick={() => supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })}
      style={{
        padding: '14px 28px',
        background: 'var(--text)',
        color: 'var(--bg)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: '1rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      Continue with Google
    </button>
  )
}