import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { highlight } from 'sugar-high'
import React from 'react'

function MarkdownTable({
  className = '',
  ...props
}: React.ComponentProps<'table'>) {
  return (
    <div className="my-8 w-full overflow-x-auto">
      <table
        className={`w-full min-w-[680px] border-collapse text-left text-sm leading-6 ${className}`.trim()}
        {...props}
      />
    </div>
  )
}

function MarkdownTableHead(props: React.ComponentProps<'thead'>) {
  return <thead className="border-b border-[var(--border)]" {...props} />
}

function MarkdownTableHeader(props: React.ComponentProps<'th'>) {
  return (
    <th
      className="px-4 py-3 font-semibold text-[var(--text-primary)] first:pl-0"
      {...props}
    />
  )
}

function MarkdownTableBody(props: React.ComponentProps<'tbody'>) {
  return (
    <tbody className="divide-y divide-[var(--border)]" {...props} />
  )
}

function MarkdownTableRow(props: React.ComponentProps<'tr'>) {
  return <tr className="align-top" {...props} />
}

function MarkdownTableCell(props: React.ComponentProps<'td'>) {
  return (
    <td
      className="px-4 py-3 text-[var(--text-secondary)] first:pl-0"
      {...props}
    />
  )
}

function MarkdownPre(props: React.ComponentProps<'pre'>) {
  return (
    <pre
      className="my-6 overflow-x-auto border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm leading-6"
      {...props}
    />
  )
}

function MarkdownBlockquote(props: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className="my-8 border-l-2 border-[var(--accent)] pl-5 text-[var(--text-secondary)] italic"
      {...props}
    />
  )
}

function MarkdownUnorderedList(props: React.ComponentProps<'ul'>) {
  return <ul className="my-6 list-disc space-y-2 pl-6" {...props} />
}

function MarkdownOrderedList(props: React.ComponentProps<'ol'>) {
  return <ol className="my-6 list-decimal space-y-2 pl-6" {...props} />
}

function MarkdownRule(props: React.ComponentProps<'hr'>) {
  return (
    <hr
      className="my-10 border-0 border-t border-[var(--border)]"
      {...props}
    />
  )
}

function MarkdownImage(props: React.ComponentProps<'img'>) {
  return (
    <img
      className="my-8 h-auto w-full border border-[var(--border)]"
      {...props}
    />
  )
}

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function Code({ children, className = '', ...props }) {
  let codeHTML = highlight(children)
  return (
    <code
      className={`font-mono ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: codeHTML }}
      {...props}
    />
  )
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  table: MarkdownTable,
  thead: MarkdownTableHead,
  th: MarkdownTableHeader,
  tbody: MarkdownTableBody,
  tr: MarkdownTableRow,
  td: MarkdownTableCell,
  pre: MarkdownPre,
  blockquote: MarkdownBlockquote,
  ul: MarkdownUnorderedList,
  ol: MarkdownOrderedList,
  hr: MarkdownRule,
  img: MarkdownImage,
  Table,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
