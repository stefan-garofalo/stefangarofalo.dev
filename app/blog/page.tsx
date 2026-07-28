import { BlogPosts } from 'app/components/posts'
import type { Metadata } from 'next'
import { baseUrl } from 'app/sitemap'

const blogUrl = `${baseUrl}/blog`
const description = 'Technical articles by Stefan Garofalo.'

export const metadata: Metadata = {
  alternates: {
    canonical: blogUrl,
    types: {
      'application/rss+xml': `${baseUrl}/rss`,
    },
  },
  description,
  openGraph: {
    description,
    locale: 'en_US',
    siteName: 'Stefan Garofalo',
    title: 'Technical Articles by Stefan Garofalo',
    type: 'website',
    url: blogUrl,
  },
  title: 'Articles',
  twitter: {
    card: 'summary',
    creator: '@stefangarofalo',
    description,
    title: 'Technical Articles by Stefan Garofalo',
  },
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Articles</h1>
      <BlogPosts />
    </section>
  )
}
