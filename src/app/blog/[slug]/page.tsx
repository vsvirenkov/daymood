import { getPostBySlug, getAllPosts, getAdjacentPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ShareButton from '@/components/ShareButton'
import CommentsSection from '@/components/CommentsSection'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — DayMood`,
    description: post.description,
  }
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()
  const { previous, next } = getAdjacentPosts(params.slug)

  return (
    <main className="page">
      <Link href="/blog" style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        display: 'inline-block',
        marginBottom: '2rem',
      }}>
        ← Back to blog
      </Link>

      <article>
        <header style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: '0 0 12px' }}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })} · {post.readTime}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 400,
            lineHeight: 1.2,
            margin: '0 0 12px',
          }}>
            {post.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
            {post.description}
          </p>
          <ShareButton title={post.title} />
        </header>

        <div style={{
          fontSize: '1rem',
          lineHeight: 1.8,
          color: 'var(--text)',
        }}>
          <MDXRemote source={post.content} />
        </div>

        <div style={{
          marginTop: '3rem',
          padding: '24px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 12px', fontWeight: 500 }}>
            Start tracking your mood today
          </p>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--text)',
            color: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
          }}>
            Try DayMood free →
          </a>
        </div>

        {(previous || next) && (
          <nav
            aria-label="Post navigation"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              {previous && (
                <Link
                  href={`/blog/${previous.slug}`}
                  style={{
                    display: 'block',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                    ← Previous
                  </span>
                  <span style={{ display: 'block', marginTop: 6, fontWeight: 500 }}>
                    {previous.title}
                  </span>
                </Link>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  style={{
                    display: 'block',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                    Next →
                  </span>
                  <span style={{ display: 'block', marginTop: 6, fontWeight: 500 }}>
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}

        <CommentsSection slug={params.slug} />
      </article>
    </main>
  )
}