# Article source and working material

Each article directory keeps its canonical published body alongside its supporting writing material, history, notes, diagrams, and publication packets.

The sole source of truth for a published article is its `article-v2.md` file. The site reads these files directly; do not maintain a second copy under `app/`.

Required frontmatter:

```yaml
---
slug: article-url-slug
title: Article title
publishedAt: YYYY-MM-DD
summary: Article summary
author: Author name
image: /images/article-url-slug/header.png
---
```

Public assets used by the site live under `public/`. Drafts such as `article.md` remain working history unless explicitly promoted into `article-v2.md`.
