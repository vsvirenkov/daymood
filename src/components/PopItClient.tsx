'use client'

import { useState } from 'react'

const ROWS = 8
const COLS = 10
const TOTAL = ROWS * COLS

export default function PopItClient() {
  const [popped, setPopped] = useState<boolean[]>(() => Array(TOTAL).fill(false))
  const [count, setCount] = useState(0)
  const allPopped = count === TOTAL

  function pop(i: number) {
    if (popped[i]) return
    const next = [...popped]
    next[i] = true
    setPopped(next)
    setCount((c) => c + 1)
  }

  function reset() {
    setPopped(Array(TOTAL).fill(false))
    setCount(0)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {count} / {TOTAL} popped
        </span>
        <button
          onClick={reset}
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

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
            
              href="/entry"
              style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}
            >
              Log your mood
            </a>
          </div>
        </div>
      )}
    </div>
  )
}