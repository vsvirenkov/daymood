import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth', 'https://daymood.fun'))
  }

  if (code) {
    const cookieStore = cookies()
    const response = NextResponse.redirect(new URL('/entry', 'https://daymood.fun'))

    const supabase = createServerClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: Record<string, unknown>) => {
            response.cookies.set({ name, value, ...options } as never)
          },
          remove: (name: string, options: Record<string, unknown>) => {
            response.cookies.set({ name, value: '', ...options } as never)
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
    return response
  }

  return NextResponse.redirect(new URL('/', 'https://daymood.fun'))
}
