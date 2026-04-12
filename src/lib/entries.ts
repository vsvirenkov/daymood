// ===========================================
// БИЗНЕС-ЛОГИКА — чистые функции без сайд-эффектов
// Их легко тестировать: вход → выход, никаких зависимостей
// ===========================================

import type { MoodScore, CreateEntryInput } from '@/types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const MIN_TEXT_LENGTH = 10
const MAX_TEXT_LENGTH = 1000
const VALID_MOODS: MoodScore[] = [1, 2, 3, 4, 5]

export function validateEntry(input: { mood?: MoodScore | undefined; text?: string }): ValidationResult {
  const errors: string[] = []

  if (!input.mood || !VALID_MOODS.includes(input.mood as MoodScore)) {
    errors.push('Please select a mood')
  }

  if (!input.text || input.text.trim().length < MIN_TEXT_LENGTH) {
    errors.push(`Tell us a bit more (at least ${MIN_TEXT_LENGTH} characters)`)
  }

  if (input.text && input.text.length > MAX_TEXT_LENGTH) {
    errors.push(`Keep it under ${MAX_TEXT_LENGTH} characters`)
  }

  return { valid: errors.length === 0, errors }
}

// Можно ли пользователю создать новую запись сегодня?
export function canCreateEntryToday(entries: { created_at: string }[]): boolean {
  const today = new Date().toDateString()
  return !entries.some((e) => new Date(e.created_at).toDateString() === today)
}

// Средний mood за период
export function averageMood(moods: MoodScore[]): number {
  if (moods.length === 0) return 0
  const sum = moods.reduce((acc, m) => acc + m, 0)
  return Math.round((sum / moods.length) * 10) / 10
}

// Серия дней подряд (streak)
export function calculateStreak(entries: { created_at: string }[]): number {
  if (entries.length === 0) return 0

  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const entry of sorted) {
    const entryDate = new Date(entry.created_at)
    entryDate.setHours(0, 0, 0, 0)

    const diffDays = Math.round(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = entryDate
    } else {
      break
    }
  }

  return streak
}
