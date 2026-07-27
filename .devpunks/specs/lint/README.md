# Lint Asset Handoff

Use these selected Oxlint assets to audit the config changes scaffold applied to the target repo.
Scaffold writes nearest package/app `oxlint.config.ts` files where selected assets apply. Ultracite presets provide the baseline, and asset-specific plugin/rule overlays stay explicit.
If you adopt Oxlint or Oxfmt, replace the repo's existing lint/format entrypoints deliberately: update package scripts, task pipelines, editor/docs references, and agent hooks together so old ESLint/Prettier commands do not remain as stale defaults.
If the repo already has lint/format tooling, preserve project-specific ignores, generated-file exclusions, and CI behavior while migrating; do not overwrite working config wholesale.

## Baseline

- The target repo already has a root Oxlint config. Package/app configs may still be created when that is the closest scoped home for selected pack rules.
- Preserve asset granularity: add or adjust rules asset-by-asset instead of collapsing everything into one opaque override.
- Keep JS plugin aliases stable when composing the final Oxlint config so future regen stays diff-friendly.
- Keep `ultracite/oxlint/core` first, then layer framework presets and local asset overlays.

## Selected assets

### next-core

- Description: Ultracite Next.js preset for the main web application.
- Source packs: `nextjs`
- Oxlint presets: `ultracite/oxlint/next`
- Recommended config file: `oxlint.config.ts`
- Recommended workspaces: `detected Next.js workspaces`
- Recommended files: `<detected-nextjs-workspace>/**/*.{js,jsx,ts,tsx}`
- Placement notes: Place this beside the React app override and set `settings.next.rootDir` to the repo's actual Next workspace roots if the final config needs that plugin setting.
- Required dev dependencies: `(none)`

### vitest-core

- Description: Ultracite Vitest preset for repo-owned test globs.
- Source packs: `quality`
- Oxlint presets: `ultracite/oxlint/vitest`
- Recommended config file: `oxlint.config.ts`
- Recommended workspaces: `detected JavaScript/TypeScript test workspaces`
- Recommended files: `<detected-test-workspace>/**/*.{test,spec}.{js,jsx,ts,tsx}`, `<detected-test-workspace>/src/test/**/*.{js,jsx,ts,tsx}`
- Placement notes: Attach this to test-only globs. Expand or narrow the file patterns to match the repo's actual Vitest test layout instead of treating it as a global default.
- Required dev dependencies: `(none)`

### react-core

- Description: Ultracite React preset for rendered app and shared UI code.
- Source packs: `react`
- Oxlint presets: `ultracite/oxlint/react`
- Recommended config file: `oxlint.config.ts`
- Recommended workspaces: `detected React workspaces`
- Recommended files: `<detected-react-workspace>/**/*.{js,jsx,ts,tsx}`
- Placement notes: Add as an override for detected React-rendered code. Keep backend packages outside this override unless they render React.
- Required dev dependencies: `(none)`

### react-you-might-not-need-an-effect

- Description: Guidance rules that push React code away from unnecessary effects.
- Source packs: `react`
- Oxlint presets: `(none)`
- Recommended config file: `oxlint.config.ts`
- Recommended workspaces: `detected React workspaces`
- Recommended files: `<detected-react-workspace>/**/*.{js,jsx,ts,tsx}`
- Placement notes: Add as an override for detected React-rendered code. Keep backend packages outside this override unless they render React.
- Required dev dependencies: `eslint-plugin-react-you-might-not-need-an-effect`
