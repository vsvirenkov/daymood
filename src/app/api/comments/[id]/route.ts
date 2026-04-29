import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { ApiError } from '@/types'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: su } = await supabase
    .from('superusers')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!su) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', params.id)

  if (deleteError) {
    console.error('[api/comments/[id]] delete error:', deleteError)
    return NextResponse.json<ApiError>({ error: 'Failed to delete comment' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
