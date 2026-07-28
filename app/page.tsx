import { BlogPosts } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'
import { AsciiRippleField } from './components/ascii-ripple-field'
import { ShadowGradient } from './components/shadow-gradient'

export default function Page() {
  const posts = getBlogPosts()

  return (
    <section className="home-page relative left-1/2 -ml-[50vw] flex w-screen flex-1 flex-col">
      <div
        className="home-hero relative isolate min-h-[calc(112.5lvh-72px)] max-[767px]:min-h-[calc(112.5lvh-64px)]"
        data-ascii-interaction-surface
      >
        <AsciiRippleField background="forest" />
        <div className="relative z-20 mx-auto flex min-h-[calc(112.5lvh-72px)] w-full max-w-[1560px] items-start px-[clamp(24px,3vw,48px)] pt-[calc(28.125lvh_-_18px)] max-[767px]:min-h-[calc(112.5lvh-64px)] max-[767px]:px-5 max-[767px]:pt-[calc(28.125lvh_-_16px)]">
          <div className="relative isolate w-full max-w-[560px]">
            <ShadowGradient
              className="-inset-y-[72px] -left-12 -right-60 max-[960px]:-right-6 max-[960px]:-left-6 max-[767px]:-inset-y-12 max-[767px]:-right-5 max-[767px]:-left-5"
              direction="to-right"
            />
            <h1 className="relative z-20 m-0 whitespace-nowrap text-[clamp(30px,2.3vw,40px)] leading-[0.98] font-semibold tracking-[-0.065em] max-[767px]:whitespace-normal max-[767px]:text-[clamp(28px,8vw,36px)]">
              Stefan Garofalo
            </h1>
            <div className="relative z-20 mt-6 max-w-[46ch] space-y-3 text-[clamp(13px,1vw,15px)] leading-[1.7] text-[var(--text-secondary)] max-[767px]:max-w-[38ch] max-[767px]:text-[13px]">
              <p>
                I&apos;m a software engineer at{' '}
                <a
                  className="underline decoration-[var(--accent)] underline-offset-[0.2em] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                  href="https://devpunks.com"
                  style={{ color: 'var(--accent)' }}
                >
                  Devpunks
                </a>. I&apos;ve spent the past four years building full-stack
                products, and these days I focus on AI-driven development and
                agent engineering for real software teams.
              </p>
              <p>
                I write about what I learn along the way, from TypeScript and
                Effect to agentic coding. I&apos;m passionate about programming
                and science. Huge Effect fan. Football fan too.
              </p>
            </div>
            <span
              className="relative z-20 mt-7 block h-[3px] w-16 bg-[var(--accent)] max-[767px]:mt-6 max-[767px]:w-[52px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none relative isolate -mt-40 min-h-[70lvh] w-full pb-24 max-[767px]:-mt-28 max-[767px]:pb-[72px]">
        <ShadowGradient
          className="inset-x-0 top-0 h-40 max-[767px]:h-28"
          direction="to-top"
        />
        <div className="pointer-events-auto relative z-20 mx-auto w-full max-w-[1560px] px-[clamp(24px,3vw,48px)] pt-56 max-[767px]:px-5 max-[767px]:pt-40">
          <div className="mb-8 max-w-[720px]">
            <h2
              className="relative z-20 m-0 text-lg font-medium tracking-[-0.025em]"
              id="articles"
            >
              Articles
            </h2>
          </div>
          <BlogPosts posts={posts} />
        </div>
      </div>
    </section>
  )
}
