# Repository Guidance

Read the nearest `AGENTS.md` from the repository root through every touched scope. Keep changes surgical and preserve the public site's writing-first purpose.

## Surface Map

- `app/` is the production Next.js App Router site. It owns public pages, navigation, blog rendering, RSS, sitemap, robots, metadata, Open Graph output, analytics, and visual design. Use `next-best-practices`, `next-cache-components`, `async-react-patterns`, `quality-types`, `frontend-domain-structure`, and `design-taste-frontend` when their concerns are touched.
- `app/blog/posts/*.mdx` is the canonical article source. Filename slugs and frontmatter feed the blog index, article routes, RSS, sitemap, JSON-LD, and social metadata. Do not create a parallel content source.
- `wiki/` is the dedicated internal Next.js/Fumadocs workspace for project specs, decisions, runbooks, and routed knowledge. Follow `wiki/AGENTS.md`; do not mix wiki content into the public blog.
- `.agents/` is the neutral source for shared guidance, skills, hooks, and the subagent manifest. `.devpunks/` records scaffold authority, settings, handoffs, and generated specs. Edit final repo guidance rather than generated spec bodies.
- `.claude/`, `.codex/`, `.cursor/`, and `.opencode/` are harness projections. Regenerate them from `.agents/scripts/sync-subagents.mjs` instead of maintaining divergent copies.
- `opensrc/` contains source-inspection index cards only. Upstream checkouts stay in the global opensrc cache.

## Workflow Routing

- Route oversized or foggy work through `finder-phase`, then `requirements-phase` when product decisions remain unresolved.
- Route evidence-backed product design through `design-phase`.
- Route scoped implementation from an accepted issue, spec, or plan through `delivery-phase`.
- Route runtime failures and broken local or production-like flows through `debugging-phase`.
- Route branch, pull request, and code review through `review-phase`; report findings first with precise file and line references.
- Route proven setup, workflow, contract, architecture, or operational knowledge through `docs-ingest-phase`.
- Route readonly investigations that split across independent surfaces or hypotheses through `parallel-research`.
- Before implementation delegation, verify project agent settings and `.agents/subagents/manifest.mjs`. Sequential implementation uses one bounded worker plus parent validation; parallel work needs explicit disjoint waves.

## Cross-Surface Contracts

- Keep the MDX article source, route generation, RSS, sitemap, metadata, JSON-LD, and Open Graph output aligned.
- Keep public-site behavior in `app/` and internal operational knowledge in `wiki/`.
- Keep scaffold settings, neutral prompts, subagent ownership, hooks, and harness projections synchronized.
- Preserve production URLs and deployment assumptions when changing metadata, callbacks, origins, feeds, or local development configuration.

## Validation Routing

- Run the narrowest check for the touched surface first.
- For the public site, use `pnpm build`; add browser validation for user-facing behavior.
- For the wiki, use its `check`, `check-types`, and `build` scripts as applicable.
- After prompt, hook, skill, or subagent changes, run `node .agents/scripts/sync-subagents.mjs`, then `hi check --json`.
- Record blockers when an expected validation cannot run.

## Source, URLs, and Documentation

- Prefer official documentation. Read the matching `opensrc/<package>.md` card and inspect source only when framework or runtime behavior remains material and unclear.
- Use Portless stable local subdomains in examples and configuration instead of hard-coded `localhost:<port>` URLs.
- When work changes setup, workflow, contracts, architecture, deployment behavior, or other non-obvious behavior, update the relevant wiki page or runbook through `docs-ingest-phase`.
