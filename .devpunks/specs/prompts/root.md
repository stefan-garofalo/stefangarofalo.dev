# Prompt Spec

Target file: `AGENTS.md`
Scope: `root`
Workspace: `.`
Seed mode: `copied`

## Root Prompt Criteria

- Materialize the final root prompt from real repo evidence. Do not copy this spec as the final prompt body.
- Keep the final root prompt concise: surface map, workflow routing, cross-surface contract rules, validation routing, then only short repo-wide source/URL/docs rules.
- Do not add a root `Primary skills here` line. Root lifecycle skills are explicit workflow entrypoints, not always-on scoped defaults.

## Root Prompt Concepts

### Repo Surface Map

Purpose: Tell the agent where work belongs.

Invariants:
- Name the real apps, packages, services, infra folders, docs/wiki roots, generated-code homes, and shared contract owners detected in this repository.
- For each surface, say what belongs there and what should stay elsewhere.
- Route single-surface implementation to the nearest scoped prompt.
- For cross-surface work, name the owning surfaces before editing.

### Workflow Routing

Purpose: Tell the agent which lifecycle entrypoint applies.

Invariants:
- Foggy oversized work routes to `finder-phase` before `requirements-phase`.
- Unclear requirements or product decisions route to `requirements-phase`.
- Product design work with existing evidence routes to explicit `design-phase`.
- Scoped implementation from an accepted spec, issue, or plan routes to `delivery-phase`.
- Runtime failures, crashes, broken local flows, and production-like symptoms route to `debugging-phase`.
- Review requests, branch reviews, and PR reviews route to `review-phase`.
- Docs or knowledge updates after proven changes route to `docs-ingest-phase`.
- Readonly investigation that splits across independent surfaces or hypotheses routes to `parallel-research`.

### Cross-Surface Contract Rules

Purpose: Tell the agent which boundaries must stay aligned.

Invariants:
- API contracts, generated clients, schemas, env/config, infra wiring, deployment assumptions, and docs stay aligned across owning surfaces.
- Backend or service contract changes are reflected in generated clients and consumers.
- Infra or deployment changes that affect runtime config, callbacks, CORS, queues, storage, or secrets are reflected in the owning app/service scope and docs.
- Product logic does not move across surfaces just to finish a local task.

### Validation Routing

Purpose: Tell the agent how to prove cross-surface work.

Invariants:
- Run the narrowest validation that proves the touched surface first.
- Run contract generation or type checks when APIs or schemas change.
- Run browser, simulator, or manual UI checks when user-facing behavior changes.
- Run infra synth, plan, or dry-run checks when infrastructure changes.
- Record blockers when an expected validation cannot run.

## Root-Wide Invariants

- Author from real repo evidence: detected manifests, package/workspace names, docs/wiki roots, infra/config files, generated assets, existing prompts, and committed project conventions.
- Do not copy a static scaffold root body or invent product-specific prose from examples.
- Before working in any directory, inspect the nearest `AGENTS.md` files from the repo root down to each touched path.
- Nested `Primary skills here` lists are local default requirements: read those skill instructions, apply them with root guidance, prefer the most specific directory guidance, and activate every touched scope.
- For review requests, require findings-first review with precise file/line references, `autoreview` as the core runtime, and `simplify`, `improve-codebase-architecture`, plus scoped primary skills as review lenses.
- When routed learning artifacts exist, consult relevant learnings during discovery, planning, debugging, and review.
- Implementation work must be handed off to scoped workers; sequential implementation uses exactly one worker plus parent validation, and parallel implementation needs explicit independent waves with disjoint write scopes.
- Before relying on subagents, verify active global/project agent settings, then `.agents/subagents/manifest.mjs` and the selected specialist's owned paths, guidance files, and skills.

- Treat every authored `AGENTS.md` file as the neutral source of truth and create a sibling `CLAUDE.md` symlink mirror that points to it.
- Add `opensrc` / source-inspection guidance only when this repo actually needs it.
- Keep portless guidance repo-wide unless a scoped prompt directly owns local URL, origin, callback, CORS, or proxy configuration.
- End with the docs-update rule when work changes setup, workflow, contracts, architecture, deployment behavior, or non-obvious behavior.

## Selected packs

- `debug`
- `docs`
- `frontend`
- `nextjs`
- `planning`
- `quality`
- `react`
- `requirements`
- `research`
- `subagents`
- `typescript`

## Available workflow entrypoints

- `finder-phase`
- `requirements-phase`
- `design-phase`
- `delivery-phase`
- `debugging-phase`
- `review-phase`
- `docs-ingest-phase`
- `parallel-research`

## Source inspection

- No arbitrary concrete `opensrc` repositories are invented by scaffold.
- During post-scaffold setup, decide which detected core libraries materially affect prompt or lint authoring, then read any matching `opensrc/<package>.md` guide before running `opensrc path --cwd . <package>` or `opensrc path owner/repo`.

## Authoring guidance

- Keep the final prompt concise, imperative, and scope-first.
- For root, preserve the router shape: guidance, surface map, workflow routing, cross-surface contracts, validation routing, optional `opensrc`, docs update rule.
- Keep phase skills out of every scoped `AGENTS.md`; invoke phases from the parent goal/handoff flow instead.
- Route broader monorepo concerns back to the root prompt instead of repeating them in every scope.
- If a seed prompt exists in the source repo, preserve repo-specific constraints while reconciling them with the detected pack set.
- Keep `$docs-ingest-phase` invocation in prompt files, not in generated docs pages.