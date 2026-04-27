'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  url?: string
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const shareUrl = url ?? window.location.href

    // Если браузер поддерживает Web Share API (мобильные)
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch (_e) {}
    }

    // Иначе копируем в буфер
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_e) {}
  }

  return (
    <button
      onClick={share}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {copied ? '✓ Copied!' : '↗ Share'}
    </button>
  )
}