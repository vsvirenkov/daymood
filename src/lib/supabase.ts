// ===========================================
// SUPABASE КЛИЕНТ
//
// Два клиента — важно понимать разницу:
//
// createBrowserClient() — для React компонентов
//   Использует anon key, работает в браузере
//   Права ограничены RLS политиками Supabase
//
// createServerClient() — для API routes (server-side)
//   Использует service role key — обходит RLS!
//   НИКОГДА не передавай service role key в браузер
// ===========================================

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check .env.local')
}

// Браузерный клиент — singleton
export const supabase = _createBrowserClient(supabaseUrl, supabaseAnonKey)

// Серверный клиент с полными правами — только в API routes!
export function createAdminClient() {
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
