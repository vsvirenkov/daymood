-- 002: Комментарии к блог-постам и список суперюзеров
--
-- Добавить суперюзера:
--   INSERT INTO superusers (user_id)
--   VALUES ('<uuid из auth.users>');

CREATE TABLE IF NOT EXISTS blog_comments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug    TEXT NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name  TEXT NOT NULL,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS blog_comments_slug_created
  ON blog_comments (post_slug, created_at ASC);

CREATE TABLE IF NOT EXISTS superusers (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE superusers ENABLE ROW LEVEL SECURITY;

-- Читать комментарии могут все (публичный блог)
CREATE POLICY "comments: public read" ON blog_comments
  FOR SELECT USING (true);

-- Писать комментарии могут только авторизованные (только свой user_id)
CREATE POLICY "comments: own insert" ON blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Удалять комментарии могут только суперюзеры
CREATE POLICY "comments: superuser delete" ON blog_comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM superusers WHERE superusers.user_id = auth.uid())
  );

-- Таблицу суперюзеров могут читать авторизованные (нужно для RLS выше)
CREATE POLICY "superusers: auth read" ON superusers
  FOR SELECT USING (auth.uid() IS NOT NULL);
