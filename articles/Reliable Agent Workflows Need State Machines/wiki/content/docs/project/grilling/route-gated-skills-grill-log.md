---
title: "Route-Gated Skills Grill Log"
surface: project
permission: project
---

# Route-Gated Skills Grill Log

This log reconstructs accepted decisions from the article handoff, its source
fragments, the delivery stress run, prior delivery-phase grill artifacts, and
the current requirements-grill conversation. Later entries explicitly record
clarifications instead of rewriting earlier language.

## Branch A: Terminology And Conceptual Boundary

### Glossary Q1

Question:
What should the general pattern be called?

Accepted answer:

- Canonical term: **Route-gated skill** — a skill in which the route controls which bounded instruction surface may load next.
- Avoid: **skill router** when it means only selecting a skill from user intent.
- Axiom: The route is the gate.

### Q2

Question:
How does route gating differ from progressive disclosure?

Accepted answer:

- Progressive disclosure controls context loading.
- Route gating controls runtime workflow.
- Route gating reuses progressive disclosure, but adds evidence-based control flow and durable state transitions.

### Q3

Question:
Is this a new workflow framework?

Accepted answer:

- No. Treat it as a tiny Markdown-local state machine for agents that already read files and follow instructions.
- The pattern standardizes a small protocol; it does not require a graph runtime.

### Glossary Q4

Question:
How does **Route-gated skill** relate to the earlier Harness term **Resumable phase router**?

Accepted answer:

- Canonical general term: **Route-gated skill**.
- Related narrower term: **Resumable phase router** — the delivery-specific implementation that routes among lifecycle phases.
- Relationship: A **Resumable phase router** is one instance of a **Route-gated skill**.
- Resolution: preserve the earlier term in its delivery context; do not use it as the name of the general model.

## Branch B: State And Persistence

### Glossary Q5

Question:
Does a handoff make the model remember the workflow?

Accepted answer:

- Superseded wording: the boundary makes the model "always remember."
- Canonical term: **Stateful workflow** — a workflow made stateful because every gate serializes its exit state as a durable handoff snapshot.
- Axiom: Statefulness comes from durable handoff serialization, not from stronger model memory.

### Q6

Question:
Where must a handoff snapshot live?

Accepted answer:

- It may live in whatever durable artifact the specific workflow already creates.
- The route-gated model provides a small explicit handoff contract, not one universal storage location.

### Q7

Question:
When a previous handoff recommends one route but present artifacts support another, which is authoritative?

Accepted answer:

- Present artifact state is authoritative.
- The handoff's next-route recommendation is evidence and a hint, not a binding program counter.
- The router recomputes the next valid gate from current evidence.

### Q8

Question:
Which gate exits must produce a durable handoff snapshot?

Accepted answer:

- Every exit: `complete`, `blocked`, `skipped` or no-op, and human-checkpoint exits.
- Durability does not depend on successful completion.

## Branch C: Routing And Control Flow

### Q9

Question:
Is route gating limited to a canonical linear phase sequence?

Accepted answer:

- No. Linear progression, branches, skips, repair loops, human checkpoints, and arbitrary resume points are all valid flow shapes.
- Multi-step delivery is one capability and example, not the definition of the model.

### Q10

Question:
Does router re-entry guarantee a fresh model context?

Accepted answer:

- Superseded wording: every entry comes in as "fresh" because the model rereads the skills.
- Clarification: re-entry forces a fresh routing decision from current evidence and reloads only the selected instruction surface.
- It does not guarantee a new model or context window.

### Q11

Question:
Does an artifact's existence make it valid routing evidence?

Accepted answer:

- No. Freshness and scope match are part of routing.
- Existing artifacts are evidence, not automatically valid artifacts.

### Q12

Question:
How many sibling instruction surfaces may a single routing decision load?

Accepted answer:

- Exactly one selected instruction surface loads at the route layer.
- Sibling gate files are not read speculatively.
- Work inside the selected gate may still use its own safe execution strategy.

### Q13

Question:
Must route selection and gate completion be auditable?

Accepted answer:

- Yes. The model requires explicit route and handoff contracts.
- A transition must identify the selected gate, the evidence that selected it, and the state left at exit.

## Branch D: Gate Composition

### Q14

Question:
Are the steps inside a route-gated workflow necessarily nested skills?

Accepted answer:

- Superseded wording: multi-step stages are inner skills.
- Clarification: a gate can be any bounded instruction surface.
- A gate will often, but need not, invoke a nested skill.

## Branch E: Evidence And Publication Boundary

### Q15

Question:
Are spec, plan, implementation, and review canonical route-gated stages?

Accepted answer:

- No. They are stages in the delivery-phase example only.
- A route-gated skill may route by lifecycle phase, artifact type, failure mode, domain, review severity, or another evidence-based distinction.

### Q16

Question:
How strongly should novelty be claimed?

Accepted answer:

- The ingredients are established and adjacent work exists.
- The distinct packaging is worth naming, but the article must not claim invention or comprehensive prior-art coverage.

### Q17

Question:
How should the delivery stress run be used as evidence?

Accepted answer:

- Use it as observed evidence that routing, freshness checks, repair loops, and durable artifacts supported a complex delivery and survived context compaction.
- Preserve the weakness: review, docs, and closeout behavior did not always follow an explicit router re-entry trace.
- Treat explicit transition traces as a protocol requirement motivated by the run, not as behavior the run executed perfectly.

## Branch F: Round 1 Closure

### Q18

Question:
What identifies the workflow instance to which a handoff belongs?

Accepted answer:

- A bounded scope anchored to the native artifact or stable goal ID defines workflow identity.
- No global route state is required.

### Q19

Question:
What should be included in handoff snapshots across gates?

Accepted answer:

- Use the smaller set of fields needed for phase-domain context.
- Keep the handoff minimal and lean.
- Include: current gate, terminal status, bounded scope, durable artifact pointers, blockers if any, and suggested next route.
- Exclude: validation transcripts, full file lists, UI evidence, and implementation detail that can be retrieved from existing artifacts or current context.

### Q20

Question:
How should transition history be represented?

Accepted answer:

- Keep logical transition history append-only.
- Keep latest projection optional.

### Q21

Question:
What is the required router behavior at stage transitions?

Accepted answer:

- Router re-entry is mandatory between gates.
- This is the model's main checking mechanism.
- Same-turn selection is allowed.
- Direct sibling gate entry is not allowed.

### Q22

Question:
What must the router explicitly define?

Accepted answer:

- Evidence inputs.
- Freshness and validity tests.
- Deterministic precedence.
- Exactly one possible outcome each decision: advance to a gate or safe stop.

### Q23

Question:
Can nested skills bypass routing boundaries?

Accepted answer:

- A nested skill returns to the selected gate.
- The selected gate validates and writes handoff.
- A child skill cannot route directly to a sibling gate.

### Q24

Question:
Can a phase transition complete without a durable handoff artifact?

Accepted answer:

- No. Transition completion requires creating the durable handoff artifact.
- Failed handoff writes leave previous state authoritative.
- Routing stops until handoff durability is established.

### Q25

Question:
When should revalidation occur and how should stale transitions be handled?

Accepted answer:

- Revalidate at exit and/or re-entry when relevant artifacts changed.
- If evidence is stale or blocked, reroute based on current truth.
- Do not overwrite newer truth.

### Q26

Question:
Should route-gating be universally enforced for all flows?

Accepted answer:

- No. This is a flow-design choice.
- The owning skill/user defines the flow, including whether to use route gating.

### Q27

Question:
Is stateful, resumable, auditable operation guaranteed whenever routes exist?

Accepted answer:

- It is the core argument in support of route-gating when gates and handoffs are implemented correctly.
- It is accepted that route-gating enables stateful, resumable, auditable workflows under the durable handoff and re-entry contracts.
- This does not claim universal correctness or reliability by itself.

## Branch G: Round 2 Closure

### Q28

Question:
What is the canonical route-gated definition for stateful progression?

Accepted answer:

- A route-gated skill makes a workflow stateful by selecting one gate from current evidence, loading only that gate's instructions, persisting a lean handoff snapshot at exit, and re-entering router before any next gate.

### Q29

Question:
How much route reasoning should be preserved in handoff snapshots?

Accepted answer:

- Accept one compact route reason/evidence pointer in snapshot; detailed evidence stays native.

### Q30

Question:
Should snapshots include a universal sequence/version field for all workflows?

Accepted answer:

- Order should be reconstructible within workflow scope. No universal sequence/version field.
- Add sequence/previous refs only when native storage lacks order.

### Q31

Question:
What is route authority if all evidence sources conflict?

Accepted answer:

- Current direct evidence > current native artifacts > latest committed handoff > suggested next gate.
- Explicit rationale: next gate is last because it may have hallucinated; rerouting from current evidence enables recovery.

### Q32

Question:
How should resume handle already-finished gates?

Accepted answer:

- Reselect the same gate, validate/reconcile existing work, write missing handoff, then route from router.
- No blind rerun or advance without reconciliation.

### Q33

Question:
Who owns gate and gate contract definitions?

Accepted answer:

- Gates and gate contracts are defined by the route-gated skill itself.
- Router only follows/evaluates the existing gate contract and never invents/reconfigures gates.

### Q34

Question:
Who is the primary reader of this route-gated pattern?

Accepted answer:

- Engineer or skill author with multi-step agent workflow who needs stateful/resumable behavior while designing a skill, not live run.

## Branch H: Round 3 Closure

### Q35

Question:
What responsibilities does the router own versus the gate?

Accepted answer:

- Router owns cross-gate evidence inputs, freshness tests, precedence, gate selection, and safe stop conditions.
- Each gate owns bounded work, completion/blocked conditions, handoff production, and returning control to router.
- A selected gate does not choose sibling gates.

### Q36

Question:
Should suggested_next_gate be mandatory or advisory?

Accepted answer:

- Optional and advisory.
- If provided, router revalidates against current evidence and always routes only to gates defined by the route-gated skill.
- The suggestion never triggers a transition itself.

### Q37

Question:
What should readers be assumed to know and what should this article explain?

Accepted answer:

- Reader assumptions: familiarity with agent skills, Markdown instruction files, and multi-step flow concepts.
- The article explains progressive disclosure, statefulness, route gates, handoff snapshots, and state-machine analogies.

## Branch I: Round 4 Closure

### Q38

Question:
What terminal statuses are valid for gates and what should HITL mean?

Accepted answer:

- Terminal statuses are only `complete`, `blocked`, and `skipped`.
- A no-op should be represented as `skipped` with a clear reason.
- Human-in-the-loop is a stop/checkpoint disposition, not a terminal status.
- HITL handoffs still produce an emitted snapshot for resume.

### Q39

Question:
How strict should document/field naming be across router and gates?

Accepted answer:

- Route instructions are separated into invariants versus conventions.
- Only high-level invariants are required; exact file/field names are illustrative.
- Startup only exposes the entrypoint and routing contract; each gate is separately loadable.
- Handoff contract and snapshot expectations are explicit.
- Route state is stored in workflow-native artifacts; names like `router.md`, `gates/`, and `references/` are not mandatory.

### Q40

Question:
What is the article's single unanswered reader confusion?

Accepted answer:

- "How can a multi-step agent workflow preserve enough state to choose its next valid step after every handoff or resume?"
- Keep this confusion unanswered in the reader contract; the article resolves it later.

## Branch J: Round 5 Closure

### Q41

Question:
What is the lean handoff shape for the next gate selection contract?

Accepted answer:

- Canonical lean keys:
  - `gate`
  - `status: complete|blocked|skipped`
  - `scope`
  - `artifacts` (durable pointers)
  - `route_evidence` (compact reason or pointer)
  - `next` (`reenter` or `stop`)
  - `blockers` (optional)
  - `suggested_next_gate` (optional advisory)
- `next: stop` is the HITL form; it is a stop disposition, not a status.

### Q42

Question:
What is an accepted illustrative filesystem layout for route-gated files?

Accepted answer:

- Illustrative layout:
  - `SKILL.md`: skill entry point + startup route contract
  - `router.md`: route decision logic and gate map
  - `gates/<gate>.md`: bounded gate instructions/work surface
  - `references/handoff.md`: lean handoff contract
- `SKILL.md`, `router.md`, and `gates/<gate>.md` are role-focused and illustrative.
- Durable snapshots remain in workflow-native artifacts.
- No universal `state.md` requirement.

### Q43

Question:
What concrete reader action closes this gap?

Accepted answer:

- Refactor one existing multi-step skill design into a route-gated skill.
- On resume/re-entry, derive the next gate from current evidence, not from stale handoff direction.

### Q44

Question:
What should the article promise the reader?

Accepted answer:

- "By the end, you will be able to make a multi-step agent workflow resume and choose its next valid step without relying on model memory or adopting a workflow framework."

## Branch K: Round 6 Closure

### Q45

Question:
What contestable, testable position should the article take?

Accepted answer:

- For skill authors designing multi-step agent workflows that must preserve state across transitions, progressive disclosure solves instruction loading but not workflow state; route gating adds durable handoffs and mandatory router re-entry so the next valid gate is re-derived from current evidence.
- Who: skill authors designing multi-step agent workflows
- When: the flow must preserve state across transitions
- Decision payoff: Refactor one existing multi-step skill design into a route-gated skill.

## Branch L: Round 7 Scope Correction

### Q46

Question:
Should this concepts/knowledge/theory grill choose the article title?

Accepted answer:

- No.
- Title selection is outside this grill and deferred to the later writing stage.
- This grill pins concepts, knowledge, theory, boundaries, and evidence policy.

## Branch M: Round 7 Closure

### Q47

Question:
What is the final evidence policy for this concepts/knowledge/theory grill?

Accepted answer:

- Public evidence policy: use the existing stress run as a bounded observational case study. No A/B comparison is required or planned for this article.
- Internal dissenter path: hypothesis uses representative current-model/harness evidence to confirm whether native continuity can preserve state, resume, re-route from current evidence, and recover from stale suggestions without explicit durable handoffs/router re-entry; if it can, narrow the recommendation to contexts that require explicit durability/auditability. This dissenter test need not be run or written into the article.
- Explicit exclusions: no comparative superiority, model-incapacity, causal, or cross-model generalization claim; report observed behavior and known limitations.

## Branch N: Writing Reframe

### Q48

Question:
How should the graph reframe change the reader contract and the article's main solution language?

Accepted answer:

- The reader's confusion is: "How do you construct a reliable, long-running agent workflow?"
- **Durable Workflow Graph** names the architecture. Skills are the medium used to encode and compose it.
- The reader should finish able to design a long-running workflow that resumes after interruption and reliably completes every required step.
- State machines provide the main language for explicit state, evidence guards, transition selection, and resumption.
- The actor model provides the main language for bounded ownership, local autonomy, and message-like handoff.
- Graph vocabulary describes workflow topology: possible paths, branches, cycles, and checkpoints.
- The actor comparison remains structural. Actor concurrency, mailboxes, persistent actor identity, and formal state-machine runtime guarantees remain outside the article's claim.
- This framing governs the revised Stage 2 Claim Card and title, followed by Stage 4 and Stage 5 revalidation.

## Branch O: Revised Claim Selection

### Q49

Question:
Which revised Stage 2 claim and title should govern the article?

Accepted answer:

- Select the theory-explicit B claim: a **Durable Workflow Graph** combines guarded state transitions with actor-style gates that own bounded work and return durable evidence before progression.
- Title: "Reliable Agent Workflows Need State Machines"
- Keep actor terminology central to the article's explanation and mechanism.
- Keep actor terminology out of the title.
- Stage 2 passes with this selection. The unchanged Stage 3 problem frame remains valid, and Stage 4 spine revalidation becomes current.

## Branch P: Revised Spine Selection

### Q50

Question:
Which Stage 4 spine should carry the revised claim into the mechanism?

Accepted answer:

- Start with A's reasonable greedy composition of every required skill in one continuous run.
- Use that implicit control flow to ground explicit state and guarded transitions.
- Keep C's tension: the missing-step failure came from transitions that were never made explicit or durably committed.
- Preserve C's state-machine and actor-model explanation, expressed through skills as a **Durable Workflow Graph**.
- Carry durable return, router re-entry, structural boundaries, and the requirement to account for every declared step into the remaining spine jobs.
- Stage 4 passes with this hybrid. Stage 5 mechanism becomes current.

## Branch Q: Model-Runtime Implementation

### Q51

Question:
Where does the **Durable Workflow Graph** execute, and how does it compose subagents?

Accepted answer:

- Skills encode the workflow states, transitions, router, and gate contracts.
- The model interprets and traverses those contracts inside its ordinary runtime loop.
- The router reads durable evidence and selects one eligible gate.
- While executing that gate, the model may invoke another skill or spawn and manage subagents.
- Subagent results return through the selected gate, which owns validation and durable return before router re-entry.
- Explain this implementation positively as a recipe for plain skill flows.
- The selected B mechanism incorporates this runtime model and passes Stage 5 at 244 words.

## Branch R: First Progressive Example

### Q52

Question:
Which worked trace should open Stage 6 and connect durable return to observable route selection?

Accepted answer:

- Use a research, draft, and review flow.
- Keep `draft.md` and the route contract unchanged.
- Change one variable: add a committed durable-return record for the draft gate.
- Predict that router re-entry will select review, then apply the same route contract and record that selection.
- Explain the result through transition authority: the committed return supplies the guard evidence required to advance.
- Stage 6 Example 1 passes. Example 2 becomes current.

## Branch S: Resumption And Actor Continuity

### Q53

Question:
Which worked trace should demonstrate resumption, and how should the article preserve the actor-model concepts?

Accepted answer:

- Select the context-replacement trace for Stage 6 Example 2.
- Keep the committed draft return, `draft.md`, the route contract, and the runtime unchanged.
- Change one variable: start the router in a new context window.
- Predict and observe the same review selection from the same durable evidence.
- Attribute continuity to durability: the handoff keeps the workflow stateful across the context reset.
- Preserve the actor-model explanation through bounded gate ownership and the durable return's role as a message-like handoff.
- Make actor-style execution concrete again in the neutral-domain transfer example.
- Stage 6 Example 2 passes. Example 3 becomes current.

## Branch T: Subagent Scope

### Q54

Question:
How prominently should subagents appear in the article's explanation of actor-style gates?

Accepted answer:

- Subagents are an optional execution technique, not part of the article's conceptual spine.
- Explain the actor comparison through bounded gate ownership, local autonomy, gate-owned validation, and message-like durable return.
- Remove explicit subagent management from the accepted mechanism prose.
- Keep nested execution subordinate to the gate contract: any invoked work returns to the selected gate before workflow progression.
- The neutral transfer example does not require a subagent.

## Branch U: Neutral Transfer Through Nested Execution

### Q55

Question:
Which neutral transfer should complete Stage 6 without introducing another workflow domain or centering subagents?

Accepted answer:

- Keep the research, draft, and review graph.
- Use the draft gate's internal execution path as the neutral variable.
- Baseline direct execution against nested writing-skill execution while every router input remains fixed.
- Require nested work to return to the draft gate, which owns final validation and durable return.
- Predict and observe the router selecting review from the same committed evidence.
- Record the transfer result explicitly: transfer holds.
- Explain the result through actor-style bounded ownership and the stable message-like return.
- Stage 6 passes with exactly three examples. Stage 7 tradeoffs become current.

## Branch V: Recovery-Based Adoption Rule

### Q56

Question:
Which tradeoff recommendation should govern adoption of a Durable Workflow Graph?

Accepted answer:

- Trigger on the need to preserve independently verifiable progress or prove that every required gate ran.
- Benefit: completed work remains inspectable and router re-entry can resume from current evidence.
- Cost: authors define explicit gate guards and durable handoffs; runtime adds router passes and evidence reads.
- Exception: a disposable flow with one meaningful final deliverable may remain a continuous composition when partial work would be discarded and the final result is easy to verify.
- One-minute rule: list the intermediate results that must remain trustworthy after context loss; each listed result needs a durable gate boundary, while an empty list favors direct composition.
- Stage 7 passes with this bounded recommendation. Stage 8 clarity becomes current.

## Branch W: Stable Agency And Terminology

### Q57

Question:
Which subjects should own each operation during the Stage 8 terminology pass?

Accepted answer:

- The graph records possible paths and allowed topology.
- The router reads current evidence and selects the next eligible gate.
- A gate owns bounded work, validates its exit, writes the handoff, and returns control to the router.
- The handoff is the durable artifact that persists workflow state and supplies transition evidence.
- Durable return names the operation that validates, writes the handoff, and re-enters the router.
- Committed exit names the gate state recorded by a valid handoff.
- Remove phrasing in which the workflow or route contract appears to select a gate.
- Stage 8 terminology passes; section-job, evidence-confidence, example-attachment, and deletion checks remain current.

## Branch X: Stage 8 Closure

### Q58

Question:
How should the remaining Stage 8 clarity work follow the terminology pass?

Accepted answer:

- Use the sequence A → B only.
- Keep state-machine and actor terminology explicit throughout the clarity pass.
- Absorb the required confidence check into B as an internal editing operation rather than presenting it as a separate reader-facing choice.
- Assign one job to the problem frame, mechanism, each of the three examples, and the tradeoff section.
- Mark the observed failure, protocol explanation, illustrative contract traces, recommendation, and boundary internally during confidence review; remove every temporary label afterward.
- Replace the first example's generic setup with wording that identifies all three examples as route-contract traces changing one variable at a time.
- Delete the repeated statement that `draft.md` remains unchanged because the preceding one-change field already establishes that control.
- Preserve the Markdown control-flow sentence because it carries unique meaning.
- Stage 8 passes. Stage 9 publish packet becomes current.

## Branch Y: Publish Pitch

### Q59

Question:
Which one-line pitch should represent the article in the Stage 9 publish packet?

Accepted answer:

- "A Durable Workflow Graph combines state-machine transitions with actor-style gates so long-running skill workflows can resume from durable evidence and account for every required step."
- Store the pitch in `publish-packet.md` rather than placing it inside the Stage 3 no-solution problem frame.
- Keep the title "Reliable Agent Workflows Need State Machines."
- The final compress-and-transfer paragraph and publication checklist remain current.

## Branch Z: Skill-Native Hierarchy And Publish Completion

### Q60

Question:
How should the sidechat hierarchy govern the completed article and publish packet?

Accepted answer:

- The subject is a skill-native model for reliable long-running agent workflows.
- **Durable Workflow Graph** names the architecture; skills encode its router, gates, and transition contracts.
- The model traverses the graph inside its ordinary skill loop.
- State-machine language explains explicit state, guarded transitions, and resumption.
- Actor-model language explains bounded gate ownership, local autonomy, gate-owned validation, and message-like return.
- Graph language explains branches, cycles, checkpoints, and all possible paths.
- Every gate commits a durable handoff before router re-entry.
- The article contributes a practical skill-native recipe; `route-gated` remains historical shorthand.
- Subagents remain an optional implementation detail with no weight in the article spine.
- Final transfer A is accepted and mirrored into `beats.md` and `publish-packet.md`.
- Stage 9 and the publication checklist pass.
