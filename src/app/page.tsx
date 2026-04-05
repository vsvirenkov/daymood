import SignInClientButton from '@/components/SignInButton'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'DayMood — AI mood journal',
}

async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/entry')

  return (
    <main className="page" style={{ paddingTop: '5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400 }}>
        Your mood,<br />understood.
      </h1>
      <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2.5rem', maxWidth: '360px' }}>
        Write 2–3 sentences about your day. AI finds patterns in your emotions over time.
      </p>
      <SignInButton />
    </main>
  )
}

function SignInButton() {
  return <SignInClientButton />
}