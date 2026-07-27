const promptPaths = (scopeId) =>
  scopeId === ".agents" || scopeId === "shared"
    ? { source: ".agents/AGENTS.md", target: ".claude/CLAUDE.md" }
    : scopeId === "root"
      ? { source: "AGENTS.md", target: "CLAUDE.md" }
      : { source: `${scopeId}/AGENTS.md`, target: `${scopeId}/CLAUDE.md` };

const hookConfiguration = (id) => {
  if (id === "format-edited-file") {
    return {
      path: ["hooks", "PostToolUse"],
      value: {
        matcher: "Edit|Write|MultiEdit",
        hooks: [
          {
            type: "command",
            command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/format-edited-file.mjs claude',
            timeout: 30,
          },
        ],
      },
    };
  }

  if (id === "scaffold-update-check") {
    return {
      path: ["hooks", "SessionStart"],
      value: {
        hooks: [
          {
            type: "command",
            command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/scaffold-update-check.mjs claude',
            timeout: 60,
          },
        ],
      },
    };
  }
};

const projectContribution = ({ scopeId, contribution }) => {
  const id = `claude:${contribution.kind}:${scopeId}:${contribution.identity.id}`;

  switch (contribution.kind) {
    case "skill":
      return [
        {
          id,
          operation: "use-native-mirror",
          canonicalPath: `.agents/skills/${contribution.identity.id}`,
          nativePath: `.claude/skills/${contribution.identity.id}`,
        },
      ];
    case "scoped-prompt":
      return [{ id, operation: "mirror", ...promptPaths(scopeId) }];
    case "lifecycle-hook": {
      const configuration = hookConfiguration(contribution.identity.id);
      return [
        {
          id: `${id}:mirror`,
          operation: "mirror",
          source: `.agents/hooks/${contribution.identity.id}.mjs`,
          target: `.claude/hooks/${contribution.identity.id}.mjs`,
        },
        ...(configuration === undefined
          ? []
          : [
              {
                id: `${id}:configure`,
                operation: "merge-json",
                target: `.claude/settings.json#${configuration.path.join(".")}:${contribution.identity.id}`,
                file: ".claude/settings.json",
                ...configuration,
              },
            ]),
      ];
    }
    case "subagent-template":
      return [
        {
          id,
          operation: "render-template",
          templateId: contribution.identity.id,
          source: `.agents/subagents/manifest.mjs#${contribution.identity.id}`,
          filename: `${contribution.identity.id}.md`,
          target: `.claude/agents/${contribution.identity.id}.md`,
          format: "claude-markdown",
          skills: contribution.references,
        },
      ];
    case "tool-configuration":
      return [];
  }
};

export const claudeAdapter = {
  matrix: {
    matrixVersion: "2026.07.17-v1",
    adapter: { id: "claude", version: "1.0.0" },
    capabilities: [
      {
        family: "skill",
        support: "degraded",
        reason:
          "Skills use the shared Claude compatibility mirror rather than per-scope registrations",
      },
      { family: "scoped-prompt", support: "supported" },
      {
        family: "lifecycle-hook",
        support: "degraded",
        reason: "Only SessionStart and file-edit command hooks have native Claude projections",
      },
      {
        family: "tool-configuration",
        support: "unsupported",
        reason: "Harness tool configuration is not projected into Claude settings",
      },
      { family: "subagent-template", support: "supported" },
    ],
  },
  project: projectContribution,
};
