import type { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import PopItClient from '@/components/PopItClient'

export const metadata: Metadata = {
  title: 'Relax — DayMood',
  description: 'Take a breath. Pop some bubbles.',
}

async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export default async function RelaxPage() {
  const session = await getSession()

  return (
    <main className="page" style={{ paddingTop: '2rem' }}>
      <header className="page-header">
        <h1>Take a breath</h1>
        <p className="subtitle">Pop all the bubbles. It helps.</p>
        <div style={{ marginTop: '12px' }}>
          <ShareButton title="Pop-it relaxation game — DayMood" url="https://daymood.fun/relax" />
        </div>
      </header>
      <PopItClient
        userToken={session?.access_token ?? null}
        userEmail={session?.user?.email ?? null}
      />
    </main>
  )
}