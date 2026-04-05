import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DayMood — AI mood journal',
  description: 'Track your mood daily. AI finds patterns you miss.',
  openGraph: {
    title: 'DayMood',
    description: 'AI-powered mood journal',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
