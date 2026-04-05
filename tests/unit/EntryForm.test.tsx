// ===========================================
// ИНТЕГРАЦИОННЫЙ ТЕСТ КОМПОНЕНТА
//
// Тестируем как пользователь: рендерим компонент,
// кликаем, заполняем форму, проверяем результат.
//
// MSW (Mock Service Worker) перехватывает fetch-запросы
// — тестируем без реального сервера и БД.
// ===========================================

import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { EntryForm } from '@/components/EntryForm'

// Моки API — имитируют реальный сервер
const server = setupServer(
  http.post('/api/entry', () =>
    HttpResponse.json({ data: { id: '1', mood: 4, text: 'Great day!' } }, { status: 201 })
  ),
  http.post('/api/insights', () =>
    HttpResponse.json({ data: { insight: 'You seem happier on days you exercise.' } })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const defaultProps = { userToken: 'test-token' }

describe('EntryForm', () => {
  it('renders mood options and textarea', () => {
    render(<EntryForm {...defaultProps} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByLabelText(/what happened today/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<EntryForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/please select a mood/i)).toBeInTheDocument()
  })

  it('shows error when text is too short', async () => {
    const user = userEvent.setup()
    render(<EntryForm {...defaultProps} />)

    await user.click(screen.getByLabelText('Good'))
    await user.type(screen.getByLabelText(/what happened today/i), 'hi')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument()
  })

  it('submits successfully and shows done state', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<EntryForm {...defaultProps} onSuccess={onSuccess} />)

    await user.click(screen.getByLabelText('Good'))
    await user.type(
      screen.getByLabelText(/what happened today/i),
      'Had a really productive day working on my project!'
    )
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() => {
      expect(screen.getByText(/entry saved/i)).toBeInTheDocument()
    })
    expect(onSuccess).toHaveBeenCalledWith('You seem happier on days you exercise.')
  })

  it('shows error message when API fails', async () => {
    server.use(
      http.post('/api/entry', () =>
        HttpResponse.json({ error: 'Database error' }, { status: 500 })
      )
    )

    const user = userEvent.setup()
    render(<EntryForm {...defaultProps} />)

    await user.click(screen.getByLabelText('Good'))
    await user.type(screen.getByLabelText(/what happened today/i), 'Valid entry text here!')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(await screen.findByText(/database error/i)).toBeInTheDocument()
  })

  it('disables button while saving', async () => {
    const user = userEvent.setup()
    render(<EntryForm {...defaultProps} />)

    await user.click(screen.getByLabelText('Amazing'))
    await user.type(
      screen.getByLabelText(/what happened today/i),
      'A wonderful day with my family.'
    )

    const btn = screen.getByRole('button', { name: /save entry/i })
    await user.click(btn)

    // Кнопка становится disabled во время запроса
    expect(btn).toBeDisabled()
  })
})
