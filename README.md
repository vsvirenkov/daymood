# DayMood

AI-powered mood journal. Write 2–3 sentences daily, AI finds patterns over time.

## Архитектура

```
daymood/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/
│   │   │   ├── entry/        # POST — сохранить запись
│   │   │   └── insights/     # POST — AI-анализ
│   │   ├── entry/            # Страница с формой
│   │   ├── layout.tsx
│   │   └── page.tsx          # Landing / login
│   ├── components/
│   │   └── EntryForm.tsx     # Главный компонент
│   ├── lib/
│   │   ├── entries.ts        # Бизнес-логика (чистые функции)
│   │   └── supabase.ts       # Клиенты БД
│   └── types/
│       └── index.ts          # Все типы проекта
├── tests/
│   ├── unit/                 # Vitest — быстрые тесты
│   ├── integration/          # Тесты компонентов + MSW
│   ├── e2e/                  # Playwright — браузерные тесты
│   └── setup.ts
├── supabase/
│   └── migrations/           # SQL миграции
└── .github/workflows/ci.yml  # CI/CD pipeline
```

## Три окружения

| Окружение | Когда создаётся | База данных | URL |
|-----------|-----------------|-------------|-----|
| **Local** | `npm run dev` | Supabase local или dev-проект | localhost:3000 |
| **Staging** | Push в `main` | Отдельный Supabase проект | staging.daymood.app |
| **Production** | Тег `v*.*.*` + approve | Prod Supabase | daymood.app |

## Быстрый старт

### 1. Клонируй и установи зависимости
```bash
git clone https://github.com/you/daymood.git
cd daymood
npm install
```

### 2. Настрой Supabase
```bash
# Создай проект на supabase.com
# Запусти миграции в SQL Editor:
cat supabase/migrations/001_initial.sql
```

### 3. Настрой переменные окружения
```bash
cp .env.example .env.local
# Заполни значения из Supabase Dashboard → Settings → API
```

### 4. Запусти
```bash
npm run dev
# http://localhost:3000
```

## Команды

```bash
npm run dev            # Локальный сервер
npm run build          # Сборка для продакшн
npm run typecheck      # Проверка TypeScript
npm run lint           # ESLint
npm run test           # Юнит-тесты (один раз)
npm run test:watch     # Юнит-тесты (следит за файлами)
npm run test:coverage  # Тесты + отчёт о покрытии
npm run test:e2e       # E2E тесты (нужен запущенный сервер)
npm run validate       # typecheck + lint + test (запускай перед PR)
```

## Деплой

### Staging (автоматически)
Любой push в `main` → GitHub Actions → деплой на Vercel staging.

### Production (вручную с approveом)
```bash
git tag v0.1.0
git push origin v0.1.0
# GitHub Actions запросит approve от тебя
# После approve → деплой на prod
```

## Версионность (Semantic Versioning)

- `v0.1.0` — первый MVP, форма + сохранение
- `v0.2.0` — AI инсайты
- `v0.3.0` — история и графики
- `v1.0.0` — платёжка (Stripe)

Формат: `vMAJOR.MINOR.PATCH`
- PATCH — баг-фикс (`v0.1.1`)
- MINOR — новая фича, обратно совместима (`v0.2.0`)
- MAJOR — breaking changes (`v1.0.0`)

## GitHub Secrets (нужно настроить)

Идёшь в: Settings → Secrets and variables → Actions

| Secret | Где взять |
|--------|-----------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `STAGING_SUPABASE_URL` | Supabase staging проект → Settings → API |
| `STAGING_SUPABASE_ANON_KEY` | то же |
| `PROD_SUPABASE_URL` | Supabase prod проект |
| `PROD_SUPABASE_ANON_KEY` | то же |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `STAGING_URL` | URL staging деплоя на Vercel |
| `CI_TEST_TOKEN` | JWT тестового юзера из staging Supabase |

## Правила работы с кодом

1. **Никогда не коммить `.env.local`** — только `.env.example`
2. **Типы меняй в `src/types/index.ts`** — TypeScript сам найдёт все места
3. **Бизнес-логика в `src/lib/entries.ts`** — чистые функции без сайд-эффектов, легко тестировать
4. **Тесты пишешь вместе с кодом**, не после
5. **`npm run validate` перед каждым PR**
6. **Новое изменение БД = новый файл миграции**, никогда не редактируй старые
