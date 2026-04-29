'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BlogComment } from '@/types'

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, { headers })
      if (res.ok) {
        const json = await res.json()
        setComments(json.comments)
        setIsSuperuser(json.isSuperuser)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('You must be signed in to comment.')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ post_slug: slug, body: trimmed }),
    })

    const json = await res.json()
    if (res.ok) {
      setComments(prev => [...prev, json.data as BlogComment])
      setBody('')
    } else {
      setError(json.error || 'Failed to post comment.')
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })

    if (res.ok || res.status === 204) {
      setComments(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <section style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.4rem',
        fontWeight: 400,
        marginBottom: '1.5rem',
      }}>
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </h2>

      {loading ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>Loading...</p>
      ) : (
        <>
          {comments.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              No comments yet. Be the first!
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
            {comments.map(comment => (
              <div key={comment.id} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{comment.author_name}</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  {isSuperuser && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        color: 'var(--text-faint)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {comment.body}
                </p>
              </div>
            ))}
          </div>

          {isLoggedIn ? (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {error && (
                <p style={{ color: '#C0392B', fontSize: '0.875rem', margin: 0 }}>{error}</p>
              )}
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write a comment..."
                maxLength={1000}
                rows={4}
                style={{ minHeight: '80px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                  {body.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  style={{ padding: '10px 20px' }}
                >
                  {submitting ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</a>
              {' '}to leave a comment.
            </p>
          )}
        </>
      )}
    </section>
  )
}
