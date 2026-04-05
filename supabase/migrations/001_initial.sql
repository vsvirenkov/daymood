-- ===========================================
-- МИГРАЦИИ БАЗЫ ДАННЫХ
--
-- Запускать в Supabase Dashboard → SQL Editor
-- ИЛИ через Supabase CLI: supabase db push
--
-- Версионируй каждое изменение как новый файл:
-- 001_initial.sql, 002_add_insights.sql, и т.д.
-- НИКОГДА не редактируй старые миграции — только добавляй новые.
-- ===========================================

-- 001: Таблица записей
CREATE TABLE IF NOT EXISTS entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood        SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  text        TEXT NOT NULL CHECK (char_length(text) BETWEEN 10 AND 1000),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Индекс для быстрой выборки по пользователю + дате
CREATE INDEX IF NOT EXISTS entries_user_created ON entries (user_id, created_at DESC);

-- 002: Таблица AI-инсайтов
CREATE TABLE IF NOT EXISTS insights (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  entry_ids   UUID[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS insights_user_created ON insights (user_id, created_at DESC);

-- ===========================================
-- RLS (Row Level Security) — КРИТИЧЕСКИ ВАЖНО
-- Без этого любой пользователь видит чужие данные!
-- ===========================================

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои записи
CREATE POLICY "entries: own rows only" ON entries
  FOR ALL USING (auth.uid() = user_id);

-- Пользователь видит только свои инсайты
CREATE POLICY "insights: own rows only" ON insights
  FOR ALL USING (auth.uid() = user_id);
