'use client'

import { useEffect, useRef, useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'failed'

function copyWithSelection(text: string) {
  const previouslyFocused = document.activeElement
  const textarea = document.createElement('textarea')

  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.inset = '0 auto auto -9999px'
  document.body.appendChild(textarea)
  textarea.select()

  let copied = false

  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  } finally {
    textarea.remove()

    if (previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus()
    }
  }

  return copied
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return copyWithSelection(text)
    }
  }

  return copyWithSelection(text)
}

export function CodeBlockCopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    const copied = await copyText(code)
    setStatus(copied ? 'copied' : 'failed')

    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
    }

    resetTimer.current = setTimeout(() => {
      setStatus('idle')
    }, 2000)
  }

  const label =
    status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy'

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={
        status === 'copied'
          ? 'Code copied to clipboard'
          : status === 'failed'
            ? 'Copy failed, try again'
            : 'Copy code to clipboard'
      }
      className="absolute right-2 top-2 border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-px"
    >
      <span aria-live="polite">{label}</span>
    </button>
  )
}
