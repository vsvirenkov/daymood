// ===========================================
// API ROUTE: POST /api/entry
//
// Next.js App Router — всё в route.ts
// Этот код выполняется ТОЛЬКО на сервере.
// Anthropic key и service role никогда не попадут в браузер.
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { validateEntry } from '@/lib/entries'
import type { CreateEntryInput, ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    // 1. Парсим тело запроса
    const body = (await req.json()) as Partial<CreateEntryInput>

    // 2. Валидация бизнес-логики (те же правила что на фронте)
    const validation = validateEntry(body)
    if (!validation.valid) {
      return NextResponse.json<ApiError>(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // 3. Получаем пользователя из сессии
    const supabase = createAdminClient()
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Сохраняем запись
    const { data: entry, error: insertError } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        mood: body.mood,
        text: body.text!.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[api/entry] insert error:', insertError)
      return NextResponse.json<ApiError>(
        { error: 'Failed to save entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (err) {
    console.error('[api/entry] unexpected error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}
