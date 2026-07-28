import { getBlogPosts } from 'app/blog/utils'

export const baseUrl = 'https://stefangarofalo.dev'

export default function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    lastModified: post.metadata.publishedAt,
    url: `${baseUrl}/blog/${post.slug}`,
  }))

  const routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
  }))

  return [...routes, ...blogs]
}
