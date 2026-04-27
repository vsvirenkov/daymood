import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { ApiError } from '@/types'

// POST — добавляем попы
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

    const { pops } = await req.json() as { pops: number }

    // Получаем текущий счёт
    const { data: existing } = await supabase
      .from('popit_scores')
      .select('total_pops')
      .eq('user_id', user.id)
      .single()

    const newTotal = (existing?.total_pops ?? 0) + pops

    await supabase.from('popit_scores').upsert({
      user_id: user.id,
      total_pops: newTotal,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ data: { total_pops: newTotal } })
  } catch (err) {
    console.error('[api/popit] error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — топ-5 лидеров
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('popit_scores')
      .select('user_id, total_pops')
      .order('total_pops', { ascending: false })
      .limit(5)

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[api/popit] error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}