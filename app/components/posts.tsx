import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

type BlogPostsProps = {
  posts?: ReturnType<typeof getBlogPosts>
}

export function BlogPosts({ posts }: BlogPostsProps = {}) {
  const allBlogs = posts ?? getBlogPosts()

  return (
    <div className="relative z-20 w-full max-w-[720px]">
      {[...allBlogs]
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="group relative isolate mb-4 flex flex-col space-y-1 text-[var(--text-primary)] no-underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[6px] focus-visible:outline-[var(--text-secondary)]"
            href={`/blog/${post.slug}`}
          >
            <div className="relative z-20 flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <p className="w-auto whitespace-nowrap tabular-nums text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] group-focus-visible:text-[var(--text-primary)] motion-reduce:transition-none md:w-[100px] md:shrink-0">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="tracking-tight text-[var(--text-primary)]">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
