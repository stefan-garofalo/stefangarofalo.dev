const capabilityPacks = {
  "workflow-planning": {
    "description": "Default workflow planning pack for spec discovery, spec review, and plan review.",
    "skills": [
      "create-spec",
      "create-plan",
      "parallel-research",
      "swarm-planner",
      "tdd",
      "simplify",
      "stack"
    ]
  },
  "workflow-requirements": {
    "description": "Default workflow requirements pack for grill synthesis and backlog shaping.",
    "skills": [
      "requirements-phase",
      "requirements-grill",
      "write-backlog"
    ]
  },
  "workflow-review": {
    "description": "Default workflow review pack for readonly artifact checks.",
    "skills": [
      "review-phase",
      "simplify"
    ]
  },
  "research": {
    "description": "Default research pack: parallel research, prototypes, structured review, and architecture inspection.",
    "skills": [
      "parallel-research",
      "prototype",
      "review-phase",
      "review",
      "autoreview",
      "improve-codebase-architecture"
    ]
  },
  "docs": {
    "description": "Default docs pack: docs ingest plus public-doc and skill-writing primitives.",
    "skills": [
      "docs-ingest-phase",
      "docs-onboarding",
      "writing-fragments",
      "writing-beats",
      "writing-shape",
      "writing-great-skills"
    ]
  },
  "quality": {
    "description": "Default quality pack: tdd, codebase design, simplify.",
    "skills": [
      "tdd",
      "codebase-design",
      "simplify"
    ]
  }
};
const agents = [
  {
    "name": "planning-discovery",
    "description": "Use for bounded readonly orientation before spec or plan writing: gather evidence, contradictions, overlapping work, and open questions without solution design.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "workflow-planning"
    ],
    "skills": [
      "parallel-research",
      "create-spec"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "requirements-synthesizer",
    "description": "Use for readonly compression of grill/status/log artifacts into accepted, rejected, superseded, parked, and unresolved decisions.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "workflow-requirements"
    ],
    "skills": [
      "requirements-phase",
      "requirements-grill",
      "write-backlog"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "backlog-shaper",
    "description": "Use for draft-only module, epic, and story shaping from closed requirements; provider sync and final backlog decisions stay with the parent.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "workflow-requirements"
    ],
    "skills": [
      "requirements-phase",
      "write-backlog"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "spec-reviewer",
    "description": "Use for readonly review of drafted specs before user review, checking invented requirements, contradictions, missing constraints, and vague acceptance criteria.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "workflow-planning",
      "workflow-review"
    ],
    "skills": [
      "create-spec",
      "review-phase",
      "simplify"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "plan-reviewer",
    "description": "Use for readonly review of plans before yielding, checking dependencies, ordering, invalid parallelism, unsafe write overlap, RED targets, validation, and assigned skills.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "workflow-planning",
      "workflow-review"
    ],
    "skills": [
      "create-plan",
      "swarm-planner",
      "tdd",
      "simplify"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "code-review",
    "description": "Use for findings-first review across changed code, simplification opportunities, and grounded architecture-friction findings.",
    "ownedPaths": [
      "**/*"
    ],
    "guidanceFiles": [
      "AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "research"
    ],
    "skills": [
      "simplify",
      "improve-codebase-architecture"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  },
  {
    "name": "wiki",
    "description": "Own changes under wiki and defer cross-workspace orchestration to the root agent.",
    "ownedPaths": [
      "wiki",
      "wiki/**"
    ],
    "guidanceFiles": [
      "wiki/AGENTS.md"
    ],
    "activationInstructions": [
      "Before planning or editing, read every file in `guidanceFiles` for this role.",
      "In those scoped AGENTS.md files, find the `Primary skills here` list and treat each named skill as mandatory for matching work.",
      "Activate a skill by opening its SKILL.md, reading the workflow/checklist needed for the assigned task, and applying it before edits.",
      "If the task touches multiple owned or related scopes, inspect each scope's nearest AGENTS.md and activate the union of relevant skills."
    ],
    "packs": [
      "docs",
      "quality",
      "research"
    ],
    "skills": [
      "autoreview",
      "codebase-design",
      "docs-onboarding",
      "improve-codebase-architecture",
      "parallel-research",
      "prototype",
      "review",
      "simplify",
      "tdd",
      "writing-beats",
      "writing-fragments",
      "writing-great-skills",
      "writing-shape"
    ],
    "boundaries": [
      "Operate only inside the assigned owned paths unless the parent explicitly expands scope.",
      "If the task clearly belongs to another specialist, say so explicitly instead of improvising outside your scope.",
      "If the task changes architecture, setup, contracts, decisions, or operator workflow, update the relevant docs or runbook in the same task."
    ]
  }
];
export { agents, capabilityPacks };
