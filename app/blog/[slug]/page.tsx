import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { ArticleRouteHero } from 'app/components/article-route-hero'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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

  return (
    <section className="article-page relative left-1/2 -ml-[50vw] w-screen [font-family:var(--font-geist-sans)]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: author,
            },
          }),
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
      <article className="prose relative z-20 mx-auto mt-16 w-full max-w-[800px] px-6 pb-[10vh] max-[767px]:mt-12 max-[767px]:px-5">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
