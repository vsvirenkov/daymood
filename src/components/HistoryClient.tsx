'use client'

import { useRouter } from 'next/navigation'
import { MOOD_EMOJI, MOOD_LABELS } from '@/types'
import type { Entry, MoodScore } from '@/types'

const MOOD_COLORS: Record<MoodScore, string> = {
  1: '#FCEBEB', 2: '#FAEEDA', 3: '#F1EFE8', 4: '#E1F5EE', 5: '#EEEDFE',
}

export function HistoryClient({ entries }: { entries: Entry[] }) {
  const router = useRouter()

  const last7 = [...entries].reverse().slice(-7)
  const maxMood = 5

  return (
    <main className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Your history</h1>
          <p className="subtitle">{entries.length} entries total</p>
        </div>
        <button
          onClick={() => router.push('/entry')}
          style={{
            padding: '10px 18px',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + New entry
        </button>
      </header>

      {/* График последних 7 дней */}
      {last7.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Last 7 days
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '60px' }}>
            {last7.map((entry) => {
              const height = `${(entry.mood / maxMood) * 100}%`
              const date = new Date(entry.created_at).toLocaleDateString('en', { weekday: 'short' })
              return (
                <div key={entry.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={MOOD_LABELS[entry.mood as MoodScore]}
                    style={{
                      width: '100%',
                      height,
                      background: MOOD_COLORS[entry.mood as MoodScore],
                      borderRadius: '4px 4px 0 0',
                      border: '1px solid var(--border)',
                      minHeight: '8px',
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{date}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Список записей */}
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <p>No entries yet.</p>
          <button onClick={() => router.push('/entry')} style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
            Write your first entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: MOOD_COLORS[entry.mood as MoodScore],
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{MOOD_EMOJI[entry.mood as MoodScore]}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {MOOD_LABELS[entry.mood as MoodScore]}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                  {new Date(entry.created_at).toLocaleDateString('en', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}