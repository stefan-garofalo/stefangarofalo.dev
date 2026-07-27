import { ShadowGradient } from './shadow-gradient'

export default function Footer() {
  return (
    <footer className="relative z-20 isolate flex items-center justify-between gap-6 border-t border-[var(--border)] pt-[30px] pb-10 text-xs text-[var(--text-secondary)] max-[767px]:flex-col max-[767px]:items-start">
      <ShadowGradient
        className="right-1/2 bottom-0 h-[220px] w-screen translate-x-1/2 max-[767px]:h-[184px]"
        direction="to-top"
      />
      <ul className="relative z-20 m-0 flex list-none gap-[22px] p-0 max-[767px]:flex-wrap max-[767px]:gap-x-5 max-[767px]:gap-y-3">
        <li>
          <a
            className="no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            href="https://x.com/stefangarofalo"
          >
            x
          </a>
        </li>
        <li>
          <a
            className="no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/stefan-garofalo"
          >
            github
          </a>
        </li>
        <li>
          <a
            className="no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/stefan-garofalo/"
          >
            linkedin
          </a>
        </li>
        <li>
          <a
            className="no-underline transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[5px] focus-visible:outline-[var(--text-secondary)] motion-reduce:transition-none"
            href="/rss"
          >
            rss
          </a>
        </li>
      </ul>
      <p className="relative z-20 m-0">
        © {new Date().getFullYear()} Stefan Garofalo
      </p>
    </footer>
  )
}
