'use client'

import { useState } from 'react'
import { validateEntry } from '@/lib/entries'
import { MOOD_EMOJI, MOOD_LABELS } from '@/types'
import type { MoodScore, CreateEntryInput } from '@/types'

interface EntryFormProps {
  onSuccess?: (insight: string | null) => void
  userToken: string
  entryCount?: number
}

const MOODS: MoodScore[] = [1, 2, 3, 4, 5]

export function EntryForm({ onSuccess, userToken, entryCount = 0 }: EntryFormProps) {
  const [mood, setMood] = useState<MoodScore | null>(null)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const input: Partial<CreateEntryInput> = { mood: mood ?? undefined, text }
    const validation = validateEntry(input)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors([])
    setStatus('saving')

    try {
      const entryRes = await fetch('/api/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ mood, text }),
      })

      if (!entryRes.ok) {
        const err = await entryRes.json()
        throw new Error(err.error ?? 'Failed to save')
      }

      const insightRes = await fetch('/api/insights', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      })

      const insightData = insightRes.ok ? await insightRes.json() : null
      const insight = insightData?.data?.insight ?? null

      setStatus('done')
      onSuccess?.(insight)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrors([err instanceof Error ? err.message : 'Something went wrong'])
    }
  }

  if (status === 'done') {
    return (
      <div className="success-state">
        <span className="success-icon">✓</span>
        <p>Entry saved for today.</p>
        <button onClick={() => { setStatus('idle'); setMood(null); setText(''); window.location.href = '/history' }}>
          View history
        </button>
      </div>
    )
  }

  return (
    <div>
      {entryCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          
            href="/history"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            View history ({entryCount}) →
          </a>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate aria-label="Daily mood entry">
        <fieldset>
          <legend>How are you feeling?</legend>
          <div className="mood-grid" role="radiogroup" aria-label="Mood score">
            {MOODS.map((score) => (
              <label key={score} className={`mood-option ${mood === score ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="mood"
                  value={score}
                  checked={mood === score}
                  onChange={() => setMood(score)}
                  aria-label={MOOD_LABELS[score]}
                />
                <span className="mood-emoji" aria-hidden="true">{MOOD_EMOJI[score]}</span>
                <span className="mood-label">{MOOD_LABELS[score]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="entry-text">What happened today?</label>
          <textarea
            id="entry-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A few sentences about your day..."
            rows={4}
            maxLength={1000}
            aria-describedby={errors.length ? 'form-errors' : undefined}
          />
          <span className="char-count" aria-live="polite">
            {text.length}/1000
          </span>
        </div>

        {errors.length > 0 && (
          <ul id="form-errors" className="errors" role="alert" aria-live="assertive">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}

        <button
          type="submit"
          disabled={status === 'saving'}
          aria-busy={status === 'saving'}
        >
          {status === 'saving' ? 'Saving…' : 'Save entry'}
        </button>
      </form>
    </div>
  )
}