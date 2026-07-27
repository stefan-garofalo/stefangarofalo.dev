import Link from 'next/link'
import { ShadowGradient } from './shadow-gradient'

const navItems = {
  '/': {
    name: 'home',
  },
  '/#articles': {
    name: 'blog',
  },
}

export function Navbar() {
  return (
    <nav
      className="relative z-30 isolate flex min-h-[72px] items-center justify-between gap-8 border-b border-[var(--border)] text-[13px] text-[var(--text-secondary)] max-[767px]:min-h-16"
      id="nav"
      aria-label="Primary navigation"
    >
      <ShadowGradient
        className="top-0 left-1/2 h-44 w-screen -translate-x-1/2 max-[767px]:h-36"
        direction="to-bottom"
      />
      <Link
        className="relative z-20 font-medium tracking-[-0.025em] text-[var(--text-primary)] no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
        href="/"
      >
        Stefan Garofalo
      </Link>
      <div className="relative z-20 flex items-center gap-7 max-[767px]:gap-5">
        {Object.entries(navItems).map(([path, { name }]) => (
          <Link
            className="no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
            key={path}
            href={path}
          >
            {name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
