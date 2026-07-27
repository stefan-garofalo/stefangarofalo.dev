# Subagent Manifest Prompt

Populate `.agents/subagents/manifest.mjs` from the detected repo shape and selected packs.

## Detected Workspaces

- `wiki`

## Selected Packs

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

## Requirements

- Keep capability packs narrow and reusable.
- Include default workflow archetypes for planning and requirements inner steps: `planning-discovery`, `requirements-synthesizer`, `backlog-shaper`, `spec-reviewer`, and `plan-reviewer`.
- Keep specialist agents scoped by owned paths and guidance files.
- Include `simplify` in every implementation-focused specialist.
- Keep docs ownership in a dedicated docs specialist when `docs/` exists.
- Use explicit skill lists when runtime inheritance differs across harnesses.