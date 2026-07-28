'use client'

import { useEffect, useRef, useState } from 'react'

const THEME_STORAGE_KEY = 'theme'

type Theme = 'dark' | 'light'

type ViewTransition = {
  finished: Promise<unknown>
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const transitionActive = useRef(false)

  const cleanupTransition = () => {
    document.documentElement.classList.remove('theme-transitioning')
    transitionActive.current = false
  }

  useEffect(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: light)')
    setTheme(
      document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    )
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return
      } catch {
        // Keep following the system theme when storage is unavailable.
      }

      const systemTheme = event.matches ? 'light' : 'dark'
      applyTheme(systemTheme)
      setTheme(systemTheme)
    }

    colorScheme.addEventListener('change', syncSystemTheme)
    return () => {
      colorScheme.removeEventListener('change', syncSystemTheme)
      cleanupTransition()
    }
  }, [])

  const toggleTheme = () => {
    if (transitionActive.current) return

    const nextTheme =
      document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
    const commitTheme = () => {
      applyTheme(nextTheme)
      setTheme(nextTheme)
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } catch {
        // The theme still applies when storage is unavailable.
      }
    }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const viewTransitionDocument = document as ViewTransitionDocument

    if (reducedMotion || !viewTransitionDocument.startViewTransition) {
      commitTheme()
      return
    }

    transitionActive.current = true
    document.documentElement.classList.add('theme-transitioning')

    try {
      const transition =
        viewTransitionDocument.startViewTransition.call(
          document,
          commitTheme
        )
      transition.finished.then(cleanupTransition, cleanupTransition)
    } catch {
      commitTheme()
      cleanupTransition()
    }
  }

  const label =
    theme === null
      ? 'Toggle color theme'
      : `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`

  return (
    <button
      aria-label={label}
      className="inline-flex h-8 w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-base leading-none text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[4px] focus-visible:outline-[var(--text-secondary)] active:translate-y-px motion-reduce:transition-none"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <span aria-hidden="true" className="theme-glyph theme-glyph-dark">
        ☾
      </span>
      <span aria-hidden="true" className="theme-glyph theme-glyph-light">
        ☀
      </span>
    </button>
  )
}
