# Agent Handoff

You are continuing a `hi scaffold` run.

## What was scaffolded

- Final root/docs/workspace prompt files were not written yet.
- Shared global prompt scaffolding under `.agents/`.
- Prompt specs under `.devpunks/specs/prompts/`.
- Selected lint asset specs under `.devpunks/specs/lint/`.
- Source guide cards under `opensrc/` when detected packages need `opensrc` context.
- Subagent manifest scaffolding/specs under `.agents/subagents/` and `.devpunks/specs/subagents/`.
- Scaffold manifest at `.devpunks/scaffold-manifest.json`.
- Required tools source at `.devpunks/settings.json`.
- Tool bootstrap: `agent-browser` was already present.
- Tool bootstrap: `clawpatch` was already present.
- Tool bootstrap: `debug-agent` was already present.
- Tool bootstrap: `opensrc` was already present.
- Tool bootstrap: `portless` was already present.
- Tool bootstrap: `skills` was already present.
- Tool bootstrap: `stack` was already present.

## Repo shape

- Repo shape mode: `auto`
- Effective monorepo: `yes`
- Detected technologies: `nextjs`, `react`
- Final packs: `debug`, `docs`, `frontend`, `nextjs`, `planning`, `quality`, `react`, `requirements`, `research`, `subagents`, `typescript`

## Pre-existing skills

- Scaffold commands do not detect overlapping skills; the follow-up agent owns reconciliation.
- Inspect `.agents/skills`, `.claude/skills`, `.codex/skills`, `.cursor/skills`, and `.opencode/skills`.
- If `.devpunks/pre-existing-skills` exists, inspect it as blind pre-command evidence.
- Exact canonical directory id/name overlap keeps the HI baseline skill active. Archive local evidence under `.devpunks/replaced-skills/<skill-id>/...`, then remove active local copies or mirrors.
- Preserve non-overlapping local skills and expose them through harness mirrors or symlinks.
- Use `hi report` when archived local knowledge should be proposed for HI baseline integration. Semantic overlap belongs there, not command runtime.

## Required next actions

1. Read `.devpunks/scaffold-manifest.json` first for the full pack/spec metadata.
2. Use the prompt spec files to author final prompt files. Do not treat the spec files as final prompt bodies.
3. Use the root prompt spec criteria to author root `AGENTS.md` from real repo evidence: surface map, workflow routing, cross-surface contract rules, validation routing, then short source/URL/docs rules. Do not add a root `Primary skills here` line.
3a. Read `.devpunks/settings.json` and confirm listed required tools such as `skills`, `portless`, `opensrc`, and `agent-browser` are actually available before deeper repo work.
3b. Author scoped `AGENTS.md` files with `Primary skills here` lines for local defaults only. Never put phase skills in scoped primary-skill lines; keep them as workflow entrypoints invoked from the parent goal/handoff flow.
4. Because this repo is in monorepo mode, create scoped prompt files for the root, docs scope when present, and each relevant app/package scope.
5. Author every root/docs/workspace `AGENTS.md` file as the neutral prompt source of truth and create a sibling `CLAUDE.md` symlink mirror beside each one instead of maintaining duplicated prompt bodies.
6. Keep `.agents/AGENTS.md` as the shared global guidance source behind the scoped prompt tree; `.claude/CLAUDE.md` should stay a symlink mirror of that neutral file.
7. Keep portless as the repo-wide local URL baseline: prefer stable local subdomains over raw localhost ports where env examples, endpoint constants, callback URLs, allowed origins, CORS, or app-to-app proxy targets are configured.
8. Inspect the applied Oxlint configs and lint asset specs. Scaffold creates or patches nearest package/app configs and adds missing lint dev dependencies; preserve local policy when making follow-up edits.
9. Keep `.agents/hooks/` as the neutral hook source of truth; harness hook mirrors should point back to it.
10. Before relying on subagents, verify the active harness global/project settings enable subagent execution, then verify `.agents/subagents/manifest.mjs` and the selected specialist's owned paths, guidance files, and skills. Repair settings/setup or execute locally when the guard fails.
11. Use `.agents/scripts/sync-subagents.mjs` to regenerate harness-native agents, hook mirrors, shared prompt mirrors, and the `.claude/skills` compatibility mirror when the neutral manifest changes.
12. Populate or reconcile `.agents/subagents/manifest.mjs` using both the manifest spec JSON and the manifest prompt markdown.
13. Adjust owned paths and guidance file references in the subagent manifest to match the real repo layout. Monorepo vs single-repo shape affects these paths.
14. Before authoring final prompts or implementation plans, identify the core detected libraries whose source behavior matters. If an `opensrc/<package>.md` guide exists for a package, read that card first, then run its `opensrc path --cwd . <package>` command or fallback repository lookup.
15. Inspect the returned checkout paths. Clone the major framework/runtime libraries you will reason about; do not clone every dependency mechanically.

## Shared core files

- `.agents/AGENTS.md`

## Skill files

- `.agents/skills/agent-browser`
- `.agents/skills/async-react-patterns`
- `.agents/skills/autoreview`
- `.agents/skills/bug-discovery-phase`
- `.agents/skills/bug-resolution-phase`
- `.agents/skills/codebase-design`
- `.agents/skills/create-plan`
- `.agents/skills/create-spec`
- `.agents/skills/debug-agent`
- `.agents/skills/debugging-phase`
- `.agents/skills/delivery-phase`
- `.agents/skills/design-phase`
- `.agents/skills/design-taste-frontend`
- `.agents/skills/docs-ingest-phase`
- `.agents/skills/docs-onboarding`
- `.agents/skills/finder-phase`
- `.agents/skills/frontend-domain-structure`
- `.agents/skills/goalify`
- `.agents/skills/grilling`
- `.agents/skills/handoff`
- `.agents/skills/imagegen-frontend-mobile`
- `.agents/skills/imagegen-frontend-web`
- `.agents/skills/implement-spec`
- `.agents/skills/improve-codebase-architecture`
- `.agents/skills/next-best-practices`
- `.agents/skills/next-cache-components`
- `.agents/skills/parallel-research`
- `.agents/skills/prototype`
- `.agents/skills/quality-types`
- `.agents/skills/react-doctor`
- `.agents/skills/repo-asset-management`
- `.agents/skills/requirements-grill`
- `.agents/skills/requirements-phase`
- `.agents/skills/resolve-debt-phase`
- `.agents/skills/review`
- `.agents/skills/review-phase`
- `.agents/skills/simplify`
- `.agents/skills/stack`
- `.agents/skills/swarm-planner`
- `.agents/skills/tdd`
- `.agents/skills/vercel-composition-patterns`
- `.agents/skills/vercel-react-best-practices`
- `.agents/skills/wayfinder`
- `.agents/skills/write-backlog`
- `.agents/skills/writing-beats`
- `.agents/skills/writing-fragments`
- `.agents/skills/writing-great-skills`
- `.agents/skills/writing-shape`

## Prompt spec files

- `.devpunks/specs/prompts/root.md`
- `.devpunks/specs/prompts/shared-agents.md`
- `.devpunks/specs/prompts/wiki/prompt.md`

## Lint spec files

- `.devpunks/specs/lint/README.md`
- `.devpunks/specs/lint/assets.json`
- `.devpunks/specs/lint/selection.json`

## Source guide files

- `opensrc/README.md`
- `opensrc/nextjs.md`
- `opensrc/react.md`

## Subagent files

- `.agents/subagents/manifest.mjs`
- `.agents/subagents/manifest.prompt.md`
- `.devpunks/specs/subagents/manifest-spec.json`

## Script files

- `.agents/scripts/harness-projection/adapters/claude.mjs`
- `.agents/scripts/harness-projection/adapters/codex.mjs`
- `.agents/scripts/harness-projection/adapters/cursor.mjs`
- `.agents/scripts/harness-projection/adapters/opencode.mjs`
- `.agents/scripts/harness-projection/apply.mjs`
- `.agents/scripts/harness-projection/core.mjs`
- `.agents/scripts/sync-subagents.mjs`

## Hook files

- `.agents/hooks/format-edited-file.mjs`
- `.agents/hooks/scaffold-update-check.mjs`

## Harness files

- `.claude/CLAUDE.md`
- `.claude/agents/backlog-shaper.md`
- `.claude/agents/code-review.md`
- `.claude/agents/plan-reviewer.md`
- `.claude/agents/planning-discovery.md`
- `.claude/agents/requirements-synthesizer.md`
- `.claude/agents/spec-reviewer.md`
- `.claude/agents/wiki.md`
- `.claude/hooks/format-edited-file.mjs`
- `.claude/hooks/scaffold-update-check.mjs`
- `.claude/settings.json`
- `.claude/skills`
- `.codex/AGENTS.md`
- `.codex/agents/backlog-shaper.toml`
- `.codex/agents/code-review.toml`
- `.codex/agents/plan-reviewer.toml`
- `.codex/agents/planning-discovery.toml`
- `.codex/agents/requirements-synthesizer.toml`
- `.codex/agents/spec-reviewer.toml`
- `.codex/agents/wiki.toml`
- `.codex/config.toml`
- `.codex/hooks/format-edited-file.mjs`
- `.codex/hooks/scaffold-update-check.mjs`
- `.cursor/agents/backlog-shaper.md`
- `.cursor/agents/code-review.md`
- `.cursor/agents/plan-reviewer.md`
- `.cursor/agents/planning-discovery.md`
- `.cursor/agents/requirements-synthesizer.md`
- `.cursor/agents/spec-reviewer.md`
- `.cursor/agents/wiki.md`
- `.cursor/hooks.json`
- `.cursor/hooks/format-edited-file.mjs`
- `.cursor/hooks/scaffold-update-check.mjs`
- `.opencode/AGENTS.md`
- `.opencode/agents/backlog-shaper.md`
- `.opencode/agents/code-review.md`
- `.opencode/agents/plan-reviewer.md`
- `.opencode/agents/planning-discovery.md`
- `.opencode/agents/requirements-synthesizer.md`
- `.opencode/agents/spec-reviewer.md`
- `.opencode/agents/wiki.md`
- `.opencode/plugins/format-edited-file.mjs`
- `.opencode/plugins/scaffold-update-check.mjs`
- `CLAUDE.md`
- `opencode.json`
- `wiki/CLAUDE.md`

All paths above are rooted at `/Users/stefan/Desktop/personale/stefangarofalo.dev`.