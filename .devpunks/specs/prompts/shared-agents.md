# Prompt Spec

Target file: `.agents/AGENTS.md`
Scope: `shared`
Workspace: `.agents`
Seed mode: `copied`

## House structure

- Start with one `## <Scope> Guidance` heading.
- Put one `Primary skills here: ...` line near the top.
- Never put phase skills in scoped `AGENTS.md` primary-skill lines. Keep `finder-phase`, `requirements-phase`, `design-phase`, `delivery-phase`, `debugging-phase`, `review-phase`, `resolve-debt-phase`, and `docs-ingest-phase` as global orchestration entrypoints only.
- Follow with one short paragraph defining the scope boundary: what belongs here vs elsewhere.
- Treat every authored `AGENTS.md` file as the neutral source of truth and create a sibling `CLAUDE.md` symlink mirror that points to it.
- Add `opensrc` / source-inspection guidance only when this scope actually needs it.
- Add portless guidance only to the root/handoff, or to a scoped prompt that directly owns local URL, origin, callback, CORS, or proxy configuration.
- End with the docs-update rule when work in this scope changes setup, workflow, contracts, or non-obvious behavior.
- Add extra focused sections only when the detected scope truly needs them.

## Selected packs

- `docs`
- `quality`
- `research`
- `subagents`

## Primary skills

- `autoreview`
- `codebase-design`
- `docs-ingest-phase`
- `docs-onboarding`
- `improve-codebase-architecture`
- `parallel-research`
- `prototype`
- `review`
- `review-phase`
- `simplify`
- `swarm-planner`
- `tdd`
- `writing-beats`
- `writing-fragments`
- `writing-great-skills`
- `writing-shape`

## Source inspection

- No arbitrary concrete `opensrc` repositories are invented by scaffold.
- During post-scaffold setup, decide which detected core libraries materially affect prompt or lint authoring, then read any matching `opensrc/<package>.md` guide before running `opensrc path --cwd . <package>` or `opensrc path owner/repo`.

## Authoring guidance

- Keep the final prompt concise, imperative, and scope-first.
- For scoped prompts, preserve this order: heading, `Primary skills here`, scope boundary, optional `opensrc`, docs update rule.
- Keep phase skills out of every scoped `AGENTS.md`; invoke phases from the parent goal/handoff flow instead.
- Route broader monorepo concerns back to the root prompt instead of repeating them in every scope.
- If a seed prompt exists in the source repo, preserve repo-specific constraints while reconciling them with the detected pack set.
- Keep `$docs-ingest-phase` invocation in prompt files, not in generated docs pages.