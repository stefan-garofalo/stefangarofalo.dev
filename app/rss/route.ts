import { baseUrl } from 'app/sitemap'
import { getBlogPosts } from 'app/blog/utils'

const escapeXml = (value: string) =>
  value.replaceAll(
    /[&"'<>]/gu,
    (character) =>
      ({
        '"': '&quot;',
        '&': '&amp;',
        "'": '&apos;',
        '<': '&lt;',
        '>': '&gt;',
      })[character] ?? character
  )

export const GET = async () => {
  const allBlogs = await getBlogPosts()

  const itemsXml = allBlogs
    .toSorted((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1
      }
      return 1
    })
    .map((post) => {
      const articleUrl = `${baseUrl}/blog/${post.slug}`

      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${articleUrl}</link>
          <guid isPermaLink="true">${articleUrl}</guid>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    })
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Stefan Garofalo — Practical Technical Articles</title>
        <link>${baseUrl}</link>
        <description>Practical technical articles by Stefan Garofalo about software architecture, AI agents, and engineering workflows.</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
