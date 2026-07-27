import './global.css'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Stefan Garofalo',
    template: '%s | Stefan Garofalo',
  },
  description:
    'Practical technical articles about software engineering and AI-assisted development.',
  openGraph: {
    title: 'Stefan Garofalo',
    description:
      'Practical technical articles about software engineering and AI-assisted development.',
    url: baseUrl,
    siteName: 'Stefan Garofalo',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <main className="mx-auto flex min-h-dvh w-full max-w-[1560px] flex-col px-[clamp(24px,3vw,48px)] max-[767px]:px-5">
          <Navbar />
          <div className="flex min-w-0 flex-1 flex-col [&>section:not(.home-page)]:mx-auto [&>section:not(.home-page)]:mt-14 [&>section:not(.home-page)]:mb-20 [&>section:not(.home-page)]:w-full [&>section:not(.home-page)]:max-w-[800px] max-[767px]:[&>section:not(.home-page)]:mt-10 max-[767px]:[&>section:not(.home-page)]:mb-[72px]">
            {children}
          </div>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  )
}
