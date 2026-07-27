const promptIntent = ({ id, scopeId }) =>
  scopeId === ".agents" || scopeId === "shared"
    ? {
        id,
        operation: "mirror",
        source: ".agents/AGENTS.md",
        target: ".codex/AGENTS.md",
      }
    : {
        id,
        operation: "use-native-prompt",
        canonicalPath: scopeId === "root" ? "AGENTS.md" : `${scopeId}/AGENTS.md`,
      };

const hookEntries = (id) => {
  if (id === "format-edited-file") {
    return [
      {
        event: "SessionStart",
        matcher: "startup|resume",
        command:
          'node "$(git rev-parse --show-toplevel)/.codex/hooks/format-edited-file.mjs" session-start',
        statusMessage: "Capturing edited-file baseline",
        timeout: 30,
      },
      {
        event: "PostToolUse",
        matcher: "Bash|apply_patch|.*apply.?patch.*|edit|write|multiedit",
        command: 'node "$(git rev-parse --show-toplevel)/.codex/hooks/format-edited-file.mjs" post',
        statusMessage: "Auto-formatting edited files",
        timeout: 30,
      },
    ];
  }

  if (id === "scaffold-update-check") {
    return [
      {
        event: "SessionStart",
        matcher: "startup|resume",
        command:
          'node "$(git rev-parse --show-toplevel)/.codex/hooks/scaffold-update-check.mjs" codex',
        statusMessage: "Checking Harness scaffold",
        timeout: 60,
      },
    ];
  }

  return [];
};

const projectContribution = ({ scopeId, contribution }) => {
  const id = `codex:${contribution.kind}:${scopeId}:${contribution.identity.id}`;

  switch (contribution.kind) {
    case "skill":
      return [
        {
          id,
          operation: "use-native-skill",
          canonicalPath: `.agents/skills/${contribution.identity.id}`,
        },
      ];
    case "scoped-prompt":
      return [promptIntent({ id, scopeId })];
    case "lifecycle-hook": {
      const entries = hookEntries(contribution.identity.id);
      return [
        {
          id: `${id}:mirror`,
          operation: "mirror",
          source: `.agents/hooks/${contribution.identity.id}.mjs`,
          target: `.codex/hooks/${contribution.identity.id}.mjs`,
        },
        ...(entries.length === 0
          ? []
          : [
              {
                id: `${id}:configure`,
                operation: "merge-toml",
                target: `.codex/config.toml#hook:${contribution.identity.id}`,
                file: ".codex/config.toml",
                entries,
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
          filename: `${contribution.identity.id}.toml`,
          target: `.codex/agents/${contribution.identity.id}.toml`,
          format: "codex-toml",
          skills: contribution.references.map((skillId) => ({
            id: skillId,
            path: `../../.agents/skills/${skillId}`,
            enabled: true,
          })),
        },
      ];
    case "tool-configuration":
      return [];
  }
};

export const codexAdapter = {
  matrix: {
    matrixVersion: "2026.07.17-v1",
    adapter: { id: "codex", version: "1.0.0" },
    capabilities: [
      {
        family: "skill",
        support: "degraded",
        reason: "Skills are linked only from the Codex subagent templates that reference them",
      },
      { family: "scoped-prompt", support: "supported" },
      {
        family: "lifecycle-hook",
        support: "degraded",
        reason: "Only SessionStart and PostToolUse command hooks have native Codex projections",
      },
      {
        family: "tool-configuration",
        support: "unsupported",
        reason: "Harness tool configuration is not projected into Codex config",
      },
      { family: "subagent-template", support: "supported" },
    ],
  },
  project: projectContribution,
};
