// ===========================================
// API ROUTE: POST /api/insights
//
// Берёт последние 7 записей пользователя,
// отправляет в Anthropic, возвращает инсайт.
//
// Вызывается с фронта после сохранения записи
// или по расписанию (cron).
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase'
import { MOOD_LABELS } from '@/types'
import type { MoodScore, ApiError } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
})

export async function POST(req: NextRequest) {
  try {
    // Auth
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
    }

    // Последние 7 записей
    const { data: entries, error: fetchError } = await supabase
      .from('entries')
      .select('mood, text, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7)

    if (fetchError || !entries || entries.length < 3) {
      return NextResponse.json(
        { data: null, message: 'Need at least 3 entries for insights' },
        { status: 200 }
      )
    }

    // Формируем контекст для AI
    const entriesSummary = entries
      .map((e) => {
        const date = new Date(e.created_at as string).toLocaleDateString('en-US', {
          weekday: 'long', month: 'short', day: 'numeric'
        })
        const moodLabel = MOOD_LABELS[e.mood as MoodScore]
        return `${date}: ${moodLabel} (${e.mood}/5) — "${e.text}"`
      })
      .join('\n')

    // ===========================================
    // ПРОМПТ — сердце продукта
    // Меняй его, экспериментируй, это твой главный рычаг
    // ===========================================
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Быстро и дёшево для инсайтов
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are a warm, empathetic mood coach. Analyze these journal entries and provide ONE specific, actionable insight.

Journal entries (most recent first):
${entriesSummary}

Rules:
- Be specific, not generic. Reference what they actually wrote.
- Notice patterns: time of day, activities, people mentioned.
- One clear observation + one gentle suggestion.
- 2-3 sentences max. Warm but not saccharine.
- No bullet points, just natural prose.`,
        },
      ],
    })

    const insight = message.content[0]?.type === 'text' ? message.content[0].text : null

    if (!insight) {
      return NextResponse.json<ApiError>({ error: 'Failed to generate insight' }, { status: 500 })
    }

    // Сохраняем инсайт в БД
    const entryIds = entries.map((e) => (e as { id?: string }).id).filter(Boolean)
    await supabase.from('insights').insert({
      user_id: user.id,
      content: insight,
      entry_ids: entryIds,
    })

    return NextResponse.json({ data: { insight } })
  } catch (err) {
    console.error('[api/insights] error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}
