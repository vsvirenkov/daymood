import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { ApiError, BlogComment } from '@/types'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json<ApiError>({ error: 'Missing slug' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: comments, error } = await supabase
    .from('blog_comments')
    .select('id, post_slug, user_id, author_name, body, created_at')
    .eq('post_slug', slug)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[api/comments] fetch error:', error)
    return NextResponse.json<ApiError>({ error: 'Failed to load comments' }, { status: 500 })
  }

  let isSuperuser = false
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      const { data } = await supabase
        .from('superusers')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      isSuperuser = !!data
    }
  }

  return NextResponse.json({ comments: comments as BlogComment[], isSuperuser })
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json() as { post_slug?: string; body?: string }
    const postSlug = body.post_slug?.trim()
    const commentBody = body.body?.trim()

    if (!postSlug) {
      return NextResponse.json<ApiError>({ error: 'Missing post_slug' }, { status: 400 })
    }
    if (!commentBody) {
      return NextResponse.json<ApiError>({ error: 'Comment cannot be empty' }, { status: 400 })
    }
    if (commentBody.length > 1000) {
      return NextResponse.json<ApiError>({ error: 'Comment too long (max 1000 characters)' }, { status: 400 })
    }

    const authorName =
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email!.split('@')[0]

    const { data: comment, error: insertError } = await supabase
      .from('blog_comments')
      .insert({ post_slug: postSlug, user_id: user.id, author_name: authorName, body: commentBody })
      .select()
      .single()

    if (insertError) {
      console.error('[api/comments] insert error:', insertError)
      return NextResponse.json<ApiError>({ error: 'Failed to save comment' }, { status: 500 })
    }

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (err) {
    console.error('[api/comments] unexpected error:', err)
    return NextResponse.json<ApiError>({ error: 'Internal server error' }, { status: 500 })
  }
}
