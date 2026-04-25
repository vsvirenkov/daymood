import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DayMood — AI mood journal',
  description: 'Track your mood daily. AI finds patterns you miss.',
  openGraph: {
    title: 'DayMood',
    description: 'AI-powered mood journal',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          background: 'var(--bg)',
        }}>
          <a href="/" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            color: 'var(--text)',
            textDecoration: 'none',
          }}>
            DayMood
          </a>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/blog" style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}>
              Blog
            </a>
            <a href="/entry" style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}>
              My journal
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}