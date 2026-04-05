// ===========================================
// DOMAIN TYPES
// Все типы проекта в одном месте.
// Если меняешь — меняй здесь, TypeScript
// подсветит все места где нужно обновить.
// ===========================================

export type MoodScore = 1 | 2 | 3 | 4 | 5

export const MOOD_LABELS: Record<MoodScore, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Amazing',
}

export const MOOD_EMOJI: Record<MoodScore, string> = {
  1: '😔',
  2: '😕',
  3: '🙂',
  4: '😊',
  5: '🌟',
}

export interface Entry {
  id: string
  user_id: string
  mood: MoodScore
  text: string
  created_at: string // ISO 8601
}

// Данные для создания записи (без серверных полей)
export type CreateEntryInput = Pick<Entry, 'mood' | 'text'>

export interface AiInsight {
  id: string
  user_id: string
  entry_ids: string[]
  content: string
  created_at: string
}

export interface ApiError {
  error: string
  code?: string
}

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError }
