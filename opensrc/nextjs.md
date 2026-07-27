# Next.js Source Guide

This is an index card for the global `opensrc` cache. Do not commit cloned source here.

## Resolve Source

```bash
opensrc path --cwd . next
```

Fallback repository lookup:

```bash
opensrc path vercel/next.js
```

## Use When

- App Router, cache, middleware, route-handler, or build behavior affects implementation.
- Framework behavior differs across installed Next.js versions.

## Inspect First

- `packages/next/src`
- `test/e2e`
- `test/integration`

## Rules

- Prefer official docs first when they answer the question.
- Use `opensrc path --cwd .` so npm package resolution can use this repo's lockfile.
- Keep the cloned source in the global `~/.opensrc` cache unless the user explicitly asks for a different cache root.
- Do not copy upstream source into this directory.
