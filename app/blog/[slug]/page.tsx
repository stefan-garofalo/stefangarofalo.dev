import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { ArticleRouteHero } from 'app/components/article-route-hero'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'
import type { Metadata } from 'next'
import type { BlogPosting, WithContext } from 'schema-dts'

type Props = {
  params: Promise<{ slug: string }>
}

const getAbsoluteImageUrl = (image: string | undefined, title: string) => {
  const imagePath = image ?? `/og?title=${encodeURIComponent(title)}`

  return new URL(imagePath, baseUrl).toString()
}

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return {}
  }

  let {
    author = 'Stefan Garofalo',
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  const articleUrl = `${baseUrl}/blog/${post.slug}`
  const imageAlt = `${title} article hero showing an ASCII workflow graph from start to completion`
  const ogImage = getAbsoluteImageUrl(image, title)

  return {
    title,
    description,
    authors: [
      {
        name: author,
        url: baseUrl,
      },
    ],
    alternates: {
      canonical: articleUrl,
      types: {
        'application/rss+xml': `${baseUrl}/rss`,
      },
    },
    openGraph: {
      authors: [baseUrl],
      title,
      description,
      locale: 'en_US',
      type: 'article',
      publishedTime,
      section: 'Software Engineering',
      siteName: 'Stefan Garofalo',
      url: articleUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@stefangarofalo',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
  }
}

export default async function Blog({ params }: Props) {
  const { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  const author = post.metadata.author ?? 'Stefan Garofalo'
  const articleUrl = `${baseUrl}/blog/${post.slug}`
  const imageUrl = getAbsoluteImageUrl(
    post.metadata.image,
    post.metadata.title
  )
  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${articleUrl}#article`,
    author: {
      '@type': 'Person',
      name: author,
      sameAs: [
        'https://x.com/stefangarofalo',
        'https://github.com/stefan-garofalo',
        'https://www.linkedin.com/in/stefan-garofalo/',
      ],
      url: baseUrl,
    },
    datePublished: post.metadata.publishedAt,
    description: post.metadata.summary,
    headline: post.metadata.title,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
    },
    inLanguage: 'en',
    isAccessibleForFree: true,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
  }

  return (
    <section className="article-page relative left-1/2 -ml-[50vw] w-screen [font-family:var(--font-geist-sans)]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c'),
        }}
      />
      <ArticleRouteHero
        asciiBackground={post.metadata.asciiBackground}
        author={author}
        publishedAt={post.metadata.publishedAt}
        publishedLabel={formatDate(post.metadata.publishedAt)}
        seed={post.slug}
        title={post.metadata.title}
      />
      <article className="prose relative z-20 mx-auto mt-16 w-full max-w-[740px] px-6 pb-[10lvh] text-[17px] leading-[1.75] max-[767px]:mt-12 max-[767px]:px-5 max-[767px]:text-[16px] max-[767px]:leading-[1.72]">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
