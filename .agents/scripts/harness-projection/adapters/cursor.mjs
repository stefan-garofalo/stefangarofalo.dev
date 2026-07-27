export const cursorCapabilityMatrix = {
  matrixVersion: "2026.07.17-v1",
  adapter: { id: "cursor", version: "1.0.0" },
  capabilities: [
    { family: "skill", support: "supported" },
    { family: "scoped-prompt", support: "supported" },
    {
      family: "lifecycle-hook",
      support: "degraded",
      reason: "Only session-start and file-edit command hooks have native Cursor projections",
    },
    {
      family: "tool-configuration",
      support: "unsupported",
      reason: "Harness tool configuration is not projected into Cursor settings",
    },
    { family: "subagent-template", support: "supported" },
  ],
};

const hookConfig = new Map([
  [
    "scaffold-update-check",
    {
      event: "sessionStart",
      command: "node .cursor/hooks/scaffold-update-check.mjs cursor",
      timeout: 60000,
    },
  ],
  [
    "format-edited-file",
    {
      event: "afterFileEdit",
      command: "node .cursor/hooks/format-edited-file.mjs cursor",
    },
  ],
]);

const cursorProject = ({ scopeId, contribution }) => {
  const contributionId = contribution.identity.id;

  switch (contribution.kind) {
    case "skill":
      return [
        {
          id: `cursor:skill:${scopeId}:${contributionId}`,
          operation: "native",
          source: `.agents/skills/${contributionId}/SKILL.md`,
          contributionId,
        },
      ];
    case "scoped-prompt": {
      const target =
        scopeId === ".agents" || scopeId === "shared"
          ? ".agents/AGENTS.md"
          : scopeId === "root"
            ? "AGENTS.md"
            : `${scopeId}/AGENTS.md`;
      return [
        {
          id: `cursor:scoped-prompt:${scopeId}:${contributionId}`,
          operation: "native",
          source: target,
          target,
          contributionId,
        },
      ];
    }
    case "lifecycle-hook": {
      const config = hookConfig.get(contributionId);
      if (config === undefined) {
        throw new Error(`Cursor lifecycle hook ${contributionId} has no projection`);
      }
      return [
        {
          id: `cursor:lifecycle-hook:${scopeId}:${contributionId}`,
          operation: "mirror",
          source: `.agents/hooks/${contributionId}.mjs`,
          target: `.cursor/hooks/${contributionId}.mjs`,
          config: { path: ".cursor/hooks.json", ...config },
          contributionId,
        },
      ];
    }
    case "subagent-template":
      return [
        {
          id: `cursor:subagent-template:${scopeId}:${contributionId}`,
          operation: "render",
          target: `.cursor/agents/${contributionId}.md`,
          format: "cursor-subagent-v1",
          contributionId,
        },
      ];
    default:
      throw new Error(`Cursor received non-projectable ${contribution.kind} contribution`);
  }
};

export const cursorAdapter = {
  matrix: cursorCapabilityMatrix,
  project: cursorProject,
};
