import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — DayMood',
  description: 'Articles about mood tracking, emotional patterns, and mental wellness.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="page">
      <header className="page-header">
        <h1>Blog</h1>
        <p className="subtitle">Mood tracking, emotional patterns, and mental wellness.</p>
      </header>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No posts yet. Check back soon!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: '0 0 8px' }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })} · {post.readTime}
                </p>
                <h2 style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  color: 'var(--text)',
                  margin: '0 0 8px',
                }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}