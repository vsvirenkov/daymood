'use client'

import { useState, useCallback } from 'react'

const ROWS = 8
const COLS = 10
const TOTAL = ROWS * COLS

function createGrid() {
  return Array(TOTAL).fill(false)
}

export default function PopItClient() {
  const [popped, setPopped] = useState<boolean[]>(createGrid)
  const [count, setCount] = useState(0)
  const allPopped = count === TOTAL

  const pop = useCallback((i: number) => {
    if (popped[i]) return
    // Звук через Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as never)['webkitAudioContext'])()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(300 + Math.random() * 200, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch {}

    setPopped((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })
    setCount((c) => c + 1)
  }, [popped])

  function reset() {
    setPopped(createGrid())
    setCount(0)
  }

  return (
    <div>
      {/* Счётчик */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {count} / {TOTAL} popped
        </span>
        <button
          onClick={reset}
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Сетка */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: '8px',
        maxWidth: '480px',
      }}>
        {popped.map((isPopped, i) => (
          <button
            key={i}
            onClick={() => pop(i)}
            style={{
              aspectRatio: '1',
              borderRadius: '50%',
              border: 'none',
              cursor: isPopped ? 'default' : 'pointer',
              background: isPopped
                ? 'var(--border)'
                : `hsl(${(i * 37) % 360}, 60%, 75%)`,
              transform: isPopped ? 'scale(0.85)' : 'scale(1)',
              boxShadow: isPopped
                ? 'inset 0 2px 4px rgba(0,0,0,0.2)'
                : '0 4px 8px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.1s ease',
            }}
            aria-label={isPopped ? 'Popped' : 'Pop this bubble'}
            aria-pressed={isPopped}
          />
        ))}
      </div>

      {/* Сообщение когда все поппнуты */}
      {allPopped && (
        <div style={{
          marginTop: '1.5rem',
          padding: '20px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 12px', fontWeight: 500 }}>
            🎉 All {TOTAL} bubbles popped!
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              Pop again
            </button>
            
              href="/entry"
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              Log your mood →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}