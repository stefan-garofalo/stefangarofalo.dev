Give this to the next agent

You are continuing a `hi scaffold` run.

Read first:
  • `.devpunks/scaffold-manifest.json`
  • `.devpunks/AGENT-HANDOFF.md`
  • `.devpunks/settings.json`

Tool bootstrap status:
  • `agent-browser`: already present
  • `clawpatch`: already present
  • `debug-agent`: already present
  • `opensrc`: already present
  • `portless`: already present
  • `skills`: already present
  • `stack`: already present

What was scaffolded:
  • final scoped/root prompt files were not written yet
  • .agents/AGENTS.md
  • .devpunks/specs/lint/README.md
  • .devpunks/specs/lint/assets.json
  • .devpunks/specs/lint/selection.json
  • opensrc/README.md
  • opensrc/nextjs.md
  • opensrc/react.md
  • .agents/skills/agent-browser
  • .agents/skills/async-react-patterns
  • .agents/skills/autoreview
  • .agents/skills/bug-discovery-phase
  • .agents/skills/bug-resolution-phase
  • .agents/skills/codebase-design
  • .agents/skills/create-plan
  • .agents/skills/create-spec
  • .agents/skills/debug-agent
  • .agents/skills/debugging-phase
  • .agents/skills/delivery-phase
  • .agents/skills/design-phase
  • .agents/skills/design-taste-frontend
  • .agents/skills/docs-ingest-phase
  • .agents/skills/docs-onboarding
  • .agents/skills/finder-phase
  • .agents/skills/frontend-domain-structure
  • .agents/skills/goalify
  • .agents/skills/grilling
  • .agents/skills/handoff
  • .agents/skills/imagegen-frontend-mobile
  • .agents/skills/imagegen-frontend-web
  • .agents/skills/implement-spec
  • .agents/skills/improve-codebase-architecture
  • .agents/skills/next-best-practices
  • .agents/skills/next-cache-components
  • .agents/skills/parallel-research
  • .agents/skills/prototype
  • .agents/skills/quality-types
  • .agents/skills/react-doctor
  • .agents/skills/repo-asset-management
  • .agents/skills/requirements-grill
  • .agents/skills/requirements-phase
  • .agents/skills/resolve-debt-phase
  • .agents/skills/review
  • .agents/skills/review-phase
  • .agents/skills/simplify
  • .agents/skills/stack
  • .agents/skills/swarm-planner
  • .agents/skills/tdd
  • .agents/skills/vercel-composition-patterns
  • .agents/skills/vercel-react-best-practices
  • .agents/skills/wayfinder
  • .agents/skills/write-backlog
  • .agents/skills/writing-beats
  • .agents/skills/writing-fragments
  • .agents/skills/writing-great-skills
  • .agents/skills/writing-shape
  • .devpunks/specs/prompts/root.md
  • .devpunks/specs/prompts/shared-agents.md
  • .devpunks/specs/prompts/wiki/prompt.md
  • .agents/subagents/manifest.mjs
  • .agents/subagents/manifest.prompt.md
  • .devpunks/specs/subagents/manifest-spec.json
  • .agents/scripts/harness-projection/adapters/claude.mjs
  • .agents/scripts/harness-projection/adapters/codex.mjs
  • .agents/scripts/harness-projection/adapters/cursor.mjs
  • .agents/scripts/harness-projection/adapters/opencode.mjs
  • .agents/scripts/harness-projection/apply.mjs
  • .agents/scripts/harness-projection/core.mjs
  • .agents/scripts/sync-subagents.mjs
  • .agents/hooks/format-edited-file.mjs
  • .agents/hooks/scaffold-update-check.mjs
  • .claude/CLAUDE.md
  • .claude/agents/backlog-shaper.md
  • .claude/agents/code-review.md
  • .claude/agents/plan-reviewer.md
  • .claude/agents/planning-discovery.md
  • .claude/agents/requirements-synthesizer.md
  • .claude/agents/spec-reviewer.md
  • .claude/agents/wiki.md
  • .claude/hooks/format-edited-file.mjs
  • .claude/hooks/scaffold-update-check.mjs
  • .claude/settings.json
  • .claude/skills
  • .codex/AGENTS.md
  • .codex/agents/backlog-shaper.toml
  • .codex/agents/code-review.toml
  • .codex/agents/plan-reviewer.toml
  • .codex/agents/planning-discovery.toml
  • .codex/agents/requirements-synthesizer.toml
  • .codex/agents/spec-reviewer.toml
  • .codex/agents/wiki.toml
  • .codex/config.toml
  • .codex/hooks/format-edited-file.mjs
  • .codex/hooks/scaffold-update-check.mjs
  • .cursor/agents/backlog-shaper.md
  • .cursor/agents/code-review.md
  • .cursor/agents/plan-reviewer.md
  • .cursor/agents/planning-discovery.md
  • .cursor/agents/requirements-synthesizer.md
  • .cursor/agents/spec-reviewer.md
  • .cursor/agents/wiki.md
  • .cursor/hooks.json
  • .cursor/hooks/format-edited-file.mjs
  • .cursor/hooks/scaffold-update-check.mjs
  • .opencode/AGENTS.md
  • .opencode/agents/backlog-shaper.md
  • .opencode/agents/code-review.md
  • .opencode/agents/plan-reviewer.md
  • .opencode/agents/planning-discovery.md
  • .opencode/agents/requirements-synthesizer.md
  • .opencode/agents/spec-reviewer.md
  • .opencode/agents/wiki.md
  • .opencode/plugins/format-edited-file.mjs
  • .opencode/plugins/scaffold-update-check.mjs
  • CLAUDE.md
  • opencode.json
  • wiki/CLAUDE.md

What you must do:
  1. Treat the prompt spec markdown files as instructions, not final prompt bodies.
  2. Repo is in monorepo mode. Generate final prompt files for root, docs, and each relevant app/package scope.
  3. Read `.devpunks/settings.json` and verify listed required tools such as `skills`, `portless`, `opensrc`, and `agent-browser` are actually available. If any are missing, install/fix that first.
  4. Use the root prompt spec criteria to author root `AGENTS.md` from real repo evidence: surface map, workflow routing, cross-surface contract rules, validation routing, then short source/URL/docs rules. Do not add a root `Primary skills here` line.
  4a. Author scoped `AGENTS.md` files with `Primary skills here` lines for local defaults only. Never put phase skills in scoped primary-skill lines; keep them as global orchestration entrypoints.
  5. Treat every authored root/docs/workspace `AGENTS.md` file as the neutral scoped prompt source and create a sibling `CLAUDE.md` symlink mirror beside each one.
  6. Keep `.agents/AGENTS.md` as the shared global prompt source behind the scoped prompt tree; `.claude/CLAUDE.md` should mirror that neutral file.
  7. Before relying on subagents, verify the active harness global/project settings enable subagent execution, then verify `.agents/subagents/manifest.mjs` and selected specialist path/guidance/skill coverage. Repair settings/setup or execute locally if the guard fails.
  8. Keep `.agents/hooks/` as the neutral hook source, `.agents/skills/` as the main skill directory, and `.agents/scripts/sync-subagents.mjs` as the harness sync entrypoint. Only `.claude/skills` should mirror `.agents/skills`.
  9. Reconcile `.agents/subagents/manifest.mjs` with both `.agents/subagents/manifest.prompt.md` and `.devpunks/specs/subagents/manifest-spec.json`.
  10. Update owned paths / guidance file references in the subagent manifest to match the real repo shape.
  11. Use `portless` as the local-dev URL baseline. Prefer stable subdomains over raw `localhost:<port>` values in env examples, endpoint defaults, callback URLs, allowed origins, CORS, and app-to-app proxies.
  12. If adopting Oxlint or Oxfmt, replace existing lint/format setup deliberately: package scripts, task pipelines, CI, editor/docs references, and hooks should agree on the new tools.
  13. Before authoring final prompts or implementation plans, identify the core detected libraries whose source behavior matters.
  14. If an `opensrc/<package>.md` guide exists for a package, read that card first, then run its `opensrc path --cwd . <package>` command or fallback repository lookup.
  15. Inspect the returned checkout paths. Clone the major framework/runtime libraries you will reason about; do not clone every dependency mechanically.
