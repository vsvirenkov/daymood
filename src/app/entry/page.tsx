// ===========================================
// ГЛАВНАЯ СТРАНИЦА /entry
//
// Server Component — рендерится на сервере.
// Получает сессию, передаёт токен в клиентский компонент.
//
// Разделение ответственности:
//   Server Component → данные, авторизация, SEO
//   Client Component → интерактивность, state
// ===========================================

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EntryForm } from '@/components/EntryForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New entry — DayMood',
  description: 'How are you feeling today?',
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

export default async function EntryPage() {
  const session = await getSession()

  // Не авторизован → на главную
  if (!session) redirect('/')

  return (
    <main className="page">
      <header className="page-header">
        <h1>How was your day?</h1>
        <p className="subtitle">Takes 2 minutes. AI finds patterns over time.</p>
      </header>
      <EntryForm userToken={session.access_token} />
    </main>
  )
}
