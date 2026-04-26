import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Relax — DayMood',
  description: 'Take a breath. Pop some bubbles.',
}

export default function RelaxPage() {
  return (
    <main className="page" style={{ paddingTop: '2rem' }}>
      <header className="page-header">
        <h1>Take a breath</h1>
        <p className="subtitle">Pop all the bubbles. It helps.</p>
      </header>
      <PopIt />
    </main>
  )
}

function PopIt() {
  return <PopItClient />
}