import {
  AsciiRippleField,
  type AsciiBackground,
} from './ascii-ripple-field'
import { ShadowGradient } from './shadow-gradient'

type ArticleRouteHeroProps = {
  asciiBackground?: AsciiBackground
  author: string
  publishedAt: string
  publishedLabel: string
  seed: string
  title: string
}

export function ArticleRouteHero({
  asciiBackground = 'terrain',
  author,
  publishedAt,
  publishedLabel,
  seed,
  title,
}: ArticleRouteHeroProps) {
  return (
    <header
      className="relative isolate min-h-[calc(100lvh-72px)] overflow-hidden max-[767px]:min-h-[calc(100lvh-64px)]"
      data-ascii-interaction-surface
    >
      <AsciiRippleField
        background={asciiBackground}
        className="h-[100lvh]"
        seed={seed}
        variant="workflow-route"
      />
      <div className="article-hero-bottom-scrim pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[58%]" />
      <div className="absolute inset-x-0 bottom-[clamp(44px,7lvh,84px)] z-20 mx-auto w-full max-w-[1560px] px-[clamp(24px,3vw,48px)] max-[767px]:bottom-10 max-[767px]:px-5">
        <div className="relative isolate max-w-[1040px]">
          <ShadowGradient
            className="-inset-y-12 -left-12 right-[18%] max-[767px]:-inset-y-8 max-[767px]:-left-5 max-[767px]:right-0"
            direction="to-right"
          />
          <h1 className="relative z-20 m-0 max-w-[23ch] text-[clamp(38px,4.2vw,64px)] leading-[1.04] font-semibold tracking-[-0.065em] text-[var(--text-primary)] [font-family:var(--font-jetbrains-mono)] max-[767px]:max-w-[18ch] max-[767px]:text-[clamp(28px,8vw,38px)] max-[767px]:leading-[1.08]">
            {title}
          </h1>
          <div className="relative z-20 mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(12px,1vw,14px)] text-[var(--text-secondary)] [font-family:var(--font-jetbrains-mono)] max-[767px]:mt-4">
            <p>By {author}</p>
            <span aria-hidden="true">·</span>
            <time dateTime={publishedAt}>{publishedLabel}</time>
          </div>
          <span
            className="relative z-20 mt-7 block h-[3px] w-16 bg-[var(--accent)] max-[767px]:mt-5 max-[767px]:w-[52px]"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  )
}
