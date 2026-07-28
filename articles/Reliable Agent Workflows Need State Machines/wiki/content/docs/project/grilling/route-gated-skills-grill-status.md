---
title: "Durable Workflow Graph Grill Status"
surface: project
permission: project
---

# Durable Workflow Graph Grill Status

## Branch Dashboard

| Branch | Completion | Locked direction | Still-open items |
| --- | ---: | --- | --- |
| Terminology and conceptual boundary | 100% | **Durable Workflow Graph** names the architecture; skills encode its runtime contracts; `route-gated` remains historical shorthand. | None. |
| State and persistence | 100% | Workflow identity is scope-bound; every exit writes a lean snapshot; statuses are `complete`, `blocked`, or `skipped`; history remains reconstructible. | None. |
| Routing and authority | 100% | The router owns cross-gate evidence, freshness, precedence, selection, and safe stopping; current truth always outranks suggestions. | None. |
| Gate and composition | 100% | Each gate owns its bounded work, completion/block conditions, handoff, and return to router; nested skills cannot bypass it. | None. |
| Failure and concurrency | 100% | Uncommitted work returns through the same gate for reconciliation; changed or contradictory evidence never silently advances. | None. |
| Applicability and limits | 100% | The workflow owner defines the graph; the active router follows its existing states and transitions. | None. |
| Reliability and evidence | 100% | Durable state transitions and router re-entry make long-running workflows stateful, resumable, and auditable. | Stronger runtime guarantees require future evidence. |
| Packaging and examples | 100% | Lean handoff schema and illustrative filesystem are accepted; snapshots remain workflow-native. | None. |
| Article reader contract | 100% | The reader wants to construct a reliable long-running flow that resumes and completes every required step. | None. |
| Article claim and evidence (grill scope) | 100% | Reliable long-running execution comes from guarded state transitions and actor-style gates inside a **Durable Workflow Graph**. | None. |
| Article production | 100% | Stages 1–9 pass; the title, pitch, final transfer, and publication checklist are locked in `publish-packet.md`. | None. |

## Current Frontier: Round 7

Frontier is closed. Q46 was parked during grilling and resolved during writing; Q47 is accepted and closed.

### Q46: Claim-And-Tension Title (resolved after terminology change)

Decision:
What should this concepts/knowledge/theory grill decide about title selection?

Prerequisites settled:
This grill pins concepts/knowledge/theory only.

Status:
Parked during grilling. Resolved during writing.

Current writing-stage resolution:
"Reliable Agent Workflows Need State Machines"

Rationale:
The title leads with the reliability claim and its state-machine explanation. Actor terminology remains central to the article's mechanism while staying out of the title.

### Q47: Dissenter Evidence (accepted)

Decision:
How should article evidence be separated from the internal dissenter-path evidence in this grill?

Prerequisites settled:
The conceptual claim and boundaries are accepted.

Recommended answer:

1. Article evidence
   - Use the existing stress run as a bounded observational case study.
   - No A/B comparison is required or planned for publication in this article.

2. Internal dissenter path (editorial discipline)
   - Use hypothetical evidence review of representative current-model/harness runs showing that native continuity can preserve state, resume, re-route from current evidence, and recover from stale suggestions.
   - If that evidence shows durable handoffs/router re-entry are not needed for those contexts, narrow or reject the recommendation to contexts requiring explicit durability/auditability.
   - This dissenter track is a planning test only; it does not need to be executed or written into this article.

Why:
No comparative superiority claim, no model-incapacity claim, no causal claim, and no cross-model generalization claim.
Report observed behavior and known limitations only.

Decision status:
Accepted.

## Deferred Dependent Decisions

- Stage 2 passed again after adopting **Durable Workflow Graph**, state-machine progression, and actor-style gates.
- Q47 is accepted; requirements-grill is complete.
- Stage 3 problem-frame gate passed with four moves in order and a 125-word body.
- Stage 3 editorial decision: omit the named term `vanishing steps` and use completion-evidence wording.
- Stage 4 spine revalidation passed with the selected A+C hybrid; the selected B mechanism passes Stage 5 at 244 words.

## Parked Branches

- The Stage 9 publish packet is complete.
- Wiki synthesis beyond these grill artifacts is parked until decisions become stable publication knowledge.

## Reader Contract

- **Reader clause:** For an engineer or skill author designing an already-conceived multi-step agent workflow before its live run.
- **Prior actions:** The reader knows agent skills and Markdown instruction files and already has a multi-step flow in mind.
- **One confusion:** How do you construct a reliable, long-running agent workflow?
- **Changed action:** Refactor one existing multi-step skill design into a **Durable Workflow Graph** with explicit states, guarded transitions, and bounded execution.
- **Promise:** By the end, you will be able to design a long-running workflow that resumes after interruption and reliably completes every required step.

Stage 1 gate: passed.

### Grounding Plan

- **Grounded on entry:** Agent skills, Markdown instruction files, and multi-step workflows.
- **Grounded inside the article:** Progressive disclosure, workflow graphs, state-machine execution, actor-style boundaries, durable state, gates, routing, handoff snapshots, durable return, and router re-entry.

### Grounding Progress

- **Grounded through Stage 9:** Greedy skill composition, missing-step failure, explicit state, guarded transitions, workflow graph topology, branches, cycles, checkpoints, gate ownership, router selection, workflow-native artifacts, handoff snapshots, durable return, transition authority, router re-entry, context-reset resumption, message-like handoff, skill-native model-runtime traversal, nested skills, neutral transfer across internal execution paths, recovery-based applicability, authoring and runtime costs, concrete exceptions, the one-minute decision rule, stable graph/router/gate/handoff agency, illustrative contract traces, bounded evidence language, and the final transfer recipe.
- **Remaining article-stage grounding:** None.

## Governing Article Framing

- **Subject:** A skill-native model for reliable long-running agent workflows.
- **Architecture:** **Durable Workflow Graph**.
- **Medium:** Skills encode the router, gates, and transition contracts.
- **Runtime:** The model traverses the graph inside its ordinary skill loop.
- **State-machine language:** Explicit state, evidence guards, transition selection, and resumption explain reliable progression.
- **Actor-model language:** Bounded ownership, local autonomy, gate-owned validation, and message-like return explain execution across gate boundaries.
- **Graph language:** Possible paths, branches, cycles, and checkpoints explain workflow topology.
- **Durability mechanism:** Every gate commits a handoff before router re-entry.
- **Practical contribution:** A recipe for implementing these patterns through plain skill flows.
- **Boundary:** Actor concurrency, mailboxes, persistent actor identity, formal state-machine runtime guarantees, and external graph orchestration lie beyond the current contract.

## Claim Card

- **Topic:** Reliable long-running agent workflows encoded as **Durable Workflow Graphs** through skills.
- **Claim:** A **Durable Workflow Graph** makes long-running execution reliable by combining guarded state transitions with actor-style gates that own one bounded unit of work and return durable evidence before the next transition.
- **Boundary:** Who: engineers and skill authors designing multi-step agent workflows. When: the workflow must survive interruption and reliably complete every declared step.
- **Decision payoff:** Refactor one existing flow into explicit states, guarded transitions, and actor-style gates encoded through skills.
- **Title:** "Reliable Agent Workflows Need State Machines"
- **Dissenter path:** Narrow the recommendation if a representative implicit flow repeatedly survives interruption, reconstructs its transition state, completes every declared step, and leaves an auditable route.

Stage 2 gate: passed.

## Glossary

### Terms

- **Durable Workflow Graph**: A skill-encoded long-running workflow that the model traverses inside its ordinary runtime loop; explicit states and guarded transitions persist through durable gate exits, allowing router re-entry to resume from current evidence.
- **Route-gated skill (legacy term)**: The historical name for a skill-native encoding of a **Durable Workflow Graph**. Current prose names the architecture directly.
  Avoid: **skill router** when referring only to intent-based skill selection.
- **Gate**: A bounded instruction surface selected by the router; it may execute directly or invoke a nested skill.
- **State-machine execution**: Progress through explicit workflow states by evaluating evidence guards and selecting an allowed transition.
- **Actor-style gate**: A bounded execution surface that owns its local work and returns a message-like handoff to the router.
- **Handoff snapshot**: A lean, durable record of a gate's domain context, terminal state, artifact pointers, blockers, and compact route evidence; a suggested next route is optional and advisory.
- **Stateful workflow**: A workflow whose gate transitions persist through durable handoff snapshots outside model memory.
- **Route trace**: The auditable sequence of route selections, their evidence, and their resulting handoff snapshots.
- **Resumable phase router**: A delivery-specific **Durable Workflow Graph** implementation that selects among lifecycle phases.

### Relationships

- A **Durable Workflow Graph** uses state-machine semantics for progression and actor-style gates for bounded execution.
- Skills are the medium used to encode and compose the graph.
- The model interprets the router and gate contracts inside its runtime loop; the selected gate owns execution and validation until its durable return.
- The skill-native implementation applies **Progressive Disclosure** to instruction loading and evidence-based control flow.
- A **Gate** may delegate work to a nested skill. The selected gate retains ownership of validation and durable return.
- A **Handoff snapshot** contributes one durable transition to a **Route trace**.
- A **Resumable phase router** is one domain-specific **Durable Workflow Graph**.
- The user or skill author chooses to set up the flow; its skill contracts define the gates and transitions; the router evaluates current evidence and follows them.
- The router contract compares gates; each gate contract owns the selected gate's execution and durable return.
- Filesystem names are illustrative; separately loadable router and gate instruction surfaces are invariant.

### Axioms

- A workflow is stateful because every gate exit serializes a durable handoff snapshot.
- Every exit writes state, including blocked, skipped, no-op, and human-checkpoint exits.
- Present artifact state outranks a previous next-route recommendation.
- Re-entry means a fresh routing decision, not necessarily a fresh context window.
- Logical router re-entry is mandatory between gates and is the model's main checking mechanism.
- A nested skill returns control to its selected gate; the gate owns validation and handoff.
- A transition is uncommitted until its durable handoff artifact exists.
- Transition history is logically append-only; a latest-state projection is optional.
- Transition order must be reconstructible within workflow scope, but no universal sequence field is required.
- Authority descends from current direct evidence, to current native artifacts, to the latest committed handoff, to its suggested next gate.
- A suggested next gate is never transition authority; rerouting recovers when that suggestion is stale or hallucinated.
- A suggested next gate is optional; if present, it cannot trigger a transition.
- Universal gate statuses are `complete`, `blocked`, and `skipped`; no-op is `skipped` with a reason.
- HITL is a stop/checkpoint disposition, not a fourth terminal status.
- Artifact existence does not imply artifact validity.
- The route graph is domain-specific; delivery phases are not canonical.
- Gates and their contracts are defined by the skill-native workflow contract; the router cannot invent or reconfigure them.
- Adoption of this architecture is a flow-design decision made by its owner, with no universal runtime threshold.
- One route decision selects one sibling instruction surface.
- Observed stress-run behavior and proposed protocol requirements must remain distinguishable.

### Flagged Ambiguities

- "Remember" initially referred to model memory. Resolution: durability makes the workflow stateful; it does not strengthen model memory.
- "Fresh entry" initially implied a context reset. Resolution: freshness applies to routing and selected instructions.
- "Inner skills" initially described all stages. Resolution: a gate may, but need not, invoke a nested skill.
- "Spec, plan, implementation, review" initially sounded canonical. Resolution: they belong only to the delivery example.
- "Minimum handoff" initially included implementation-level validation and evidence detail. Resolution: the universal snapshot carries lean domain context and durable pointers; retrievable implementation detail stays native.
- "When to route-gate" initially implied a universal complexity threshold. Resolution: the skill or user owns that flow-design choice.
- "Flow owner" initially blurred authoring and runtime ownership. Resolution: the user or author chooses the flow, its skill contracts define the gates and transitions, and the router follows them.
- "Contract ownership" initially blurred routing and execution. Resolution: the router owns cross-gate choice; each gate owns its bounded work and handoff.
- "HITL status" initially mixed outcome and orchestration. Resolution: HITL means stop after a snapshot; the gate still has an ordinary terminal status.
- "Canonical filesystem" initially risked turning example names into law. Resolution: instruction separation is required; filenames and folders are illustrative.
- **Resumable phase router** previously named the delivery implementation. Resolution: retain it as a narrower domain-specific **Durable Workflow Graph**.
- **Route-gated skill** previously named the overall model. Resolution: retain it only in historical artifacts; **Durable Workflow Graph** names the architecture and skills are its medium.

## Current Handoff

- Active stage: complete. Stages 1–9 and the publication checklist pass; the selected title, pitch, and final transfer are recorded in `publish-packet.md`.
- Governing explanation: state machines explain reliable progression; the actor model explains bounded execution and handoff; graphs describe workflow topology.
- Stage 3 remains passed with four moves in order and a 125-word body under the revised title.
- Stage 4 starts from greedy skill composition, grounds explicit state and guarded transitions, connects the missing step to an uncommitted transition, then explains actor-style gates, durable return, and router re-entry.
- Stage 3 editorial decision: omit the named term `vanishing steps` and use completion-evidence wording.
- Stage 5 mechanism: skills encode the router, gates, and transition contracts; the model traverses that graph inside its runtime loop; the selected gate owns local work through validation, commits durable return, and re-enters the router.
- Parked branch: none.
- Remaining non-design validation: comparative testing becomes relevant only if a future revision adds superiority or cross-model claims.
- Recommended next direction: final human copyedit or publication-surface selection.
