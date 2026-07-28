import fs from 'fs'
import path from 'path'

type Metadata = {
  asciiBackground?: 'terrain' | 'topography'
  slug: string
  title: string
  publishedAt: string
  summary: string
  author?: string
  image?: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    const metadataKey = key.trim() as keyof Metadata

    if (metadataKey === 'asciiBackground') {
      if (value === 'terrain' || value === 'topography') {
        metadata.asciiBackground = value
      }
      return
    }

    metadata[metadataKey] = value
  })

  return { metadata: metadata as Metadata, content }
}

function getArticleFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name, 'article-v2.md'))
    .filter((file) => fs.existsSync(file))
}

function readArticleFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getArticleData(dir: string) {
  return getArticleFiles(dir).map((file) => {
    let { metadata, content } = readArticleFile(file)

    return {
      metadata,
      slug: metadata.slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getArticleData(path.join(process.cwd(), 'articles'))
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
