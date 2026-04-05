// ===========================================
// E2E ТЕСТЫ — Playwright
//
// Запускает реальный браузер против реального сервера.
// Тестирует полный пользовательский путь.
//
// Запуск: npm run test:e2e
// С UI:   npm run test:e2e:ui
//
// Перед запуском нужен: npm run dev (или test окружение)
// ===========================================

import { test, expect } from '@playwright/test'

test.describe('Mood entry flow', () => {
  // Для e2e нужна авторизация.
  // В реальном проекте: либо test-аккаунт в Supabase,
  // либо mock auth через environment variable.
  test.beforeEach(async ({ page }) => {
    // Подставляем тестовую сессию через localStorage или cookie
    await page.goto('/')
  })

  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/DayMood/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('form validates before submit', async ({ page }) => {
    await page.goto('/entry')
    await page.getByRole('button', { name: /save entry/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText(/please select a mood/i)).toBeVisible()
  })

  test('full happy path — select mood, write text, submit', async ({ page }) => {
    // Этот тест нужен реальный test-юзер в Supabase staging
    // Пока пропускаем если нет CI_TEST_TOKEN
    test.skip(!process.env['CI_TEST_TOKEN'], 'Requires test user session')

    await page.goto('/entry')
    await page.getByLabel('Good').click()
    await page.getByLabel(/what happened today/i).fill(
      'A great day building my startup. Made real progress!'
    )
    await page.getByRole('button', { name: /save entry/i }).click()
    await expect(page.getByText(/entry saved/i)).toBeVisible({ timeout: 10000 })
  })

  test('is accessible', async ({ page }) => {
    await page.goto('/entry')
    // Проверяем что все поля доступны через keyboard
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})
