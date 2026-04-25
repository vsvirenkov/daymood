import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EntryForm } from '@/components/EntryForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New entry — DayMood',
  description: 'How are you feeling today?',
}

async function getSessionAndCount() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { session: null, entryCount: 0 }

  const { count } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  return { session, entryCount: count ?? 0 }
}

export default async function EntryPage() {
  const { session, entryCount } = await getSessionAndCount()
  if (!session) redirect('/')

  return (
    <main className="page">
      <header className="page-header">
        <h1>How was your day?</h1>
        <p className="subtitle">Takes 2 minutes. AI finds patterns over time.</p>
      </header>
      <EntryForm userToken={session.access_token} entryCount={entryCount} />
    </main>
  )
}