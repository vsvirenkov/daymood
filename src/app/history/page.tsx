import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { HistoryClient } from '@/components/HistoryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'History — DayMood' }

async function getEntriesAndSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { session: null, entries: [] }

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return { session, entries: entries ?? [] }
}

export default async function HistoryPage() {
  const { session, entries } = await getEntriesAndSession()
  if (!session) redirect('/')
  return <HistoryClient entries={entries} />
}