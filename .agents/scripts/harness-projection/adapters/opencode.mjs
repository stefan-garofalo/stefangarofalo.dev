export const openCodeCapabilityMatrix = {
  matrixVersion: "2026.07.17-v1",
  adapter: { id: "opencode", version: "1.0.0" },
  capabilities: [
    { family: "skill", support: "supported" },
    { family: "scoped-prompt", support: "supported" },
    {
      family: "lifecycle-hook",
      support: "degraded",
      reason: "Only the formatter hook has a native OpenCode lifecycle projection",
    },
    {
      family: "tool-configuration",
      support: "unsupported",
      reason: "Harness-required CLI tools are operator prerequisites, not OpenCode configuration",
    },
    { family: "subagent-template", support: "supported" },
  ],
};

const openCodeProject = ({ scopeId, contribution }) => {
  const contributionId = contribution.identity.id;

  switch (contribution.kind) {
    case "skill":
      return [
        {
          id: `opencode:skill:${scopeId}:${contributionId}`,
          operation: "native",
          source: `.agents/skills/${contributionId}/SKILL.md`,
          contributionId,
        },
      ];
    case "scoped-prompt": {
      const source =
        scopeId === ".agents" || scopeId === "shared"
          ? ".agents/AGENTS.md"
          : scopeId === "root"
            ? "AGENTS.md"
            : `${scopeId}/AGENTS.md`;
      return [
        {
          id: `opencode:scoped-prompt:${scopeId}:${contributionId}`,
          operation: scopeId === ".agents" || scopeId === "shared" ? "mirror" : "native",
          source,
          target: scopeId === ".agents" || scopeId === "shared" ? ".opencode/AGENTS.md" : source,
          contributionId,
        },
      ];
    }
    case "lifecycle-hook":
      if (contributionId !== "format-edited-file") {
        return [
          {
            id: `opencode:lifecycle-hook:${scopeId}:${contributionId}`,
            operation: "mirror",
            source: `.agents/hooks/${contributionId}.mjs`,
            target: `.opencode/plugins/${contributionId}.mjs`,
            contributionId,
          },
        ];
      }
      return [
        {
          id: `opencode:lifecycle-hook:${scopeId}:${contributionId}:mirror`,
          operation: "mirror",
          source: `.agents/hooks/${contributionId}.mjs`,
          target: `.opencode/plugins/${contributionId}.mjs`,
          contributionId,
        },
        {
          id: `opencode:lifecycle-hook:${scopeId}:${contributionId}:configure`,
          operation: "merge-json",
          target: "opencode.json",
          value: {
            $schema: "https://opencode.ai/config.json",
            formatter: {
              "harness-format-edited-file": {
                command: ["node", ".agents/hooks/format-edited-file.mjs", "files", "$FILE"],
                extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".py"],
              },
            },
          },
          contributionId,
        },
      ];
    case "subagent-template":
      return [
        {
          id: `opencode:subagent-template:${scopeId}:${contributionId}`,
          operation: "render",
          target: `.opencode/agents/${contributionId}.md`,
          format: "opencode-subagent-v1",
          contributionId,
        },
      ];
    default:
      throw new Error(`OpenCode received non-projectable ${contribution.kind} contribution`);
  }
};

export const openCodeAdapter = {
  matrix: openCodeCapabilityMatrix,
  project: openCodeProject,
};
