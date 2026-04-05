// ===========================================
// ЮНИТ-ТЕСТЫ — тестируем бизнес-логику изолированно
// Запуск: npm test
// Watch mode: npm run test:watch
// ===========================================

import { describe, it, expect } from 'vitest'
import { validateEntry, canCreateEntryToday, averageMood, calculateStreak } from '@/lib/entries'

describe('validateEntry', () => {
  it('passes with valid input', () => {
    const result = validateEntry({ mood: 4, text: 'Had a great day at work!' })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when mood is missing', () => {
    const result = validateEntry({ text: 'Some valid text here' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Please select a mood')
  })

  it('fails when text is too short', () => {
    const result = validateEntry({ mood: 3, text: 'hi' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/at least 10 characters/)
  })

  it('fails when text exceeds max length', () => {
    const result = validateEntry({ mood: 3, text: 'a'.repeat(1001) })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/under 1000 characters/)
  })

  it('trims whitespace before checking length', () => {
    const result = validateEntry({ mood: 3, text: '   hi   ' })
    expect(result.valid).toBe(false)
  })

  it('rejects invalid mood values', () => {
    const result = validateEntry({ mood: 6 as never, text: 'Valid text here!' })
    expect(result.valid).toBe(false)
  })
})

describe('canCreateEntryToday', () => {
  it('returns true when no entries exist', () => {
    expect(canCreateEntryToday([])).toBe(true)
  })

  it('returns false when entry exists for today', () => {
    const entries = [{ created_at: new Date().toISOString() }]
    expect(canCreateEntryToday(entries)).toBe(false)
  })

  it('returns true when last entry was yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const entries = [{ created_at: yesterday.toISOString() }]
    expect(canCreateEntryToday(entries)).toBe(true)
  })
})

describe('averageMood', () => {
  it('returns 0 for empty array', () => {
    expect(averageMood([])).toBe(0)
  })

  it('calculates average correctly', () => {
    expect(averageMood([2, 4])).toBe(3)
    expect(averageMood([1, 2, 3, 4, 5])).toBe(3)
    expect(averageMood([5, 5, 5])).toBe(5)
  })

  it('rounds to 1 decimal place', () => {
    expect(averageMood([1, 2])).toBe(1.5)
  })
})

describe('calculateStreak', () => {
  it('returns 0 for empty entries', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 for single entry today', () => {
    const entries = [{ created_at: new Date().toISOString() }]
    expect(calculateStreak(entries)).toBe(1)
  })

  it('counts consecutive days', () => {
    const dates = [0, 1, 2].map((daysAgo) => {
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      return { created_at: d.toISOString() }
    })
    expect(calculateStreak(dates)).toBe(3)
  })

  it('stops at gap in days', () => {
    const dates = [0, 1, 3].map((daysAgo) => {  // gap at day 2
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      return { created_at: d.toISOString() }
    })
    expect(calculateStreak(dates)).toBe(2)
  })
})
