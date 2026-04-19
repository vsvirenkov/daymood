import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entries } = await supabase
      .from('entries')
      .select('mood, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7)

    if (!entries || entries.length < 3) {
      return NextResponse.json({ data: null, message: 'Need more entries' })
    }

    // AI insights coming soon
    const insight = `You've logged ${entries.length} entries recently. Keep going — AI insights unlock after a week of tracking. 🌱`

    return NextResponse.json({ data: { insight } })
  } catch (err) {
    console.error('[api/insights] error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}