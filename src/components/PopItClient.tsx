'use client'

import { useState, useEffect } from 'react'

const ROWS = 8
const COLS = 10
const TOTAL = ROWS * COLS
const MIN_USERS_FOR_LEADERBOARD = 10

interface Leader {
  user_id: string
  total_pops: number
}

interface Props {
  userToken: string | null
  userEmail: string | null
}

export default function PopItClient({ userToken, userEmail }: Props) {
  const [popped, setPopped] = useState<boolean[]>(() => Array(TOTAL).fill(false))
  const [count, setCount] = useState(0)
  const [totalPops, setTotalPops] = useState(0)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const allPopped = count === TOTAL

  // Загружаем топ при старте
  useEffect(() => {
    fetch('/api/popit')
      .then((r) => r.json())
      .then((d) => setLeaders(d.data ?? []))
      .catch(() => {})
  }, [])

  async function pop(i: number) {
  if (popped[i]) return
  const next = [...popped]
  next[i] = true
  setPopped(next)
  const newCount = count + 1
  setCount(newCount)

  // Отправляем на сервер только когда все поппнуты
  if (newCount === TOTAL && userToken) {
    try {
      const res = await fetch('/api/popit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ pops: TOTAL }),
      })
      const data = await res.json()
      setTotalPops(data.data?.total_pops ?? totalPops + TOTAL)
    } catch (_e) {}
  }
}

  function reset() {
    setPopped(Array(TOTAL).fill(false))
    setCount(0)
  }

  return (
    <div>
      {/* Счётчик */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {count} / {TOTAL} popped
          {userToken && totalPops > 0 && (
            <span style={{ marginLeft: '12px', color: 'var(--text-faint)' }}>
              · {totalPops.toLocaleString()} total
            </span>
          )}
        </span>
        <button
          onClick={reset}
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      {/* Мотивация авторизоваться */}
      {!userToken && (
        <div style={{
          marginBottom: '1rem',
          padding: '12px 16px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            🏆 Sign in to track your total pops and join the leaderboard
          </span>
          
          <a href="/"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Sign in →
          </a>
        </div>
      )}

      {/* Сетка */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', maxWidth: '480px' }}>
        {popped.map((isPopped, i) => (
          <button
            key={i}
            onClick={() => pop(i)}
            style={{
              aspectRatio: '1',
              borderRadius: '50%',
              border: 'none',
              cursor: isPopped ? 'default' : 'pointer',
              background: isPopped ? 'var(--border)' : `hsl(${(i * 37) % 360}, 60%, 75%)`,
              transform: isPopped ? 'scale(0.85)' : 'scale(1)',
              boxShadow: isPopped ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.1s ease',
            }}
            aria-label={isPopped ? 'Popped' : 'Pop this bubble'}
            aria-pressed={isPopped}
          />
        ))}
      </div>

      {/* Сообщение когда все поппнуты */}
      {allPopped && (
        <div style={{ marginTop: '1.5rem', padding: '20px', background: 'var(--accent-bg)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 500 }}>All {TOTAL} bubbles popped!</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{ padding: '10px 20px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
            >
              Pop again
            </button>
            
            <a href="/entry"
              style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}
            >
              Log your mood →
            </a>
          </div>
        </div>
      )}

      {/* Топ-5 — показываем только когда достаточно пользователей */}
      {leaders.length >= MIN_USERS_FOR_LEADERBOARD && (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Top poppers
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaders.map((leader, idx) => (
              <div key={leader.user_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  {' '}
                  {leader.user_id === userEmail ? 'You' : `Player ${idx + 1}`}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                  {leader.total_pops.toLocaleString()} pops
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}