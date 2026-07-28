# Durable Workflow Graphs

**Current canonical framing**

A **Durable Workflow Graph** is the architecture. Skills are the medium used to encode and compose it.

The model interprets the graph inside its ordinary skill runtime. A router instruction selects one eligible gate from durable evidence; while executing that gate, the model may invoke another skill or spawn and manage subagents. The gate validates their work, commits durable return, and hands control back to the router.

Use state machines as the main language for reliable progression: explicit state, evidence guards, allowed transitions, and resumption from durable evidence.

Use the actor model as the main language for bounded execution: each gate owns its local work and returns a message-like handoff before the router selects another transition.

Use graph vocabulary to describe topology: possible paths, branches, cycles, and checkpoints.

The graph becomes stateful because every gate exit commits durable evidence. Workflow-native artifacts remain authoritative, while the lean handoff records enough domain state for router re-entry.

The model can loop inside a gate. Repair can follow a graph cycle. The state machine governs movement between gates.

The structural actor comparison covers bounded ownership, local autonomy, and message-like return. Actor concurrency, mailboxes, persistent actor identity, and formal state-machine runtime guarantees lie beyond this contract.

## Earlier Route-Gating Fragments

The route is the gate.

---

Progressive disclosure controls which instructions enter context. Route gating controls what the workflow may do next.

---

A normal skill explains how to do a kind of work. A route-gated skill first determines what kind of work this is now.

---

Chaining says: A, then B, then C. Route gating asks which of A, B, or C is valid now.

---

The workflow is stateful because every gate exit serializes a durable handoff snapshot—not because the model remembers better.

---

Stronger models may make implicit control flow work more often. Route gating makes workflow state explicit, durable, inspectable, and resumable.

---

Resume should not mean summoning the ghost of a previous context. It should mean inspecting current evidence and routing again.

---

Fresh routing, not fresh context. Re-entry recomputes the next valid gate; it does not create a new model or context window.

---

A handoff is not a program counter. It is durable evidence the router must revalidate.

---

Authority descends: current direct evidence → current native artifacts → latest committed handoff → suggested next gate.

---

An artifact can exist and still be stale, out of scope, or invalid. Evidence is not a trophy.

---

The router owns the choice. The gate owns the work, validation, handoff, and durable return.

---

A nested skill may perform the work. It may not choose the sibling gate.

---

One route decision exposes one sibling instruction surface. Load every gate at once and distinct contracts can average into instruction mush.

---

**Instruction mush** — the loss of phase boundaries when several execution contracts are loaded and blended.

---

**Transition commit** — the durable handoff write that makes a gate exit authoritative. Until it exists, the transition is uncommitted.

---

Success is not the price of durability. Complete, blocked, skipped, no-op, and human-checkpoint exits all leave a snapshot.

---

**Artifact authority** — current evidence and native artifacts outrank snapshots and suggested next gates.

---

**Durable return** — a gate validates its result, persists its exit state, and returns control to the router.

---

“Isn’t this just a state machine?” Yes—deliberately tiny, Markdown-local, and usable without adopting a workflow runtime.

---

Linear progression, branches, skips, repair loops, human checkpoints, arbitrary resume points: the route graph is domain-specific.

---

Route gating is a flow-design choice made by the skill owner, not a universal complexity threshold.

---

**Workflow-native state** — route state lives in durable artifacts the workflow already owns, not in a mandatory universal `state.md`.

---

A lean handoff carries only what another gate cannot safely infer:

```yaml
gate:
status: complete | blocked | skipped
scope:
artifacts:
route_evidence:
next: reenter | stop
blockers: optional
suggested_next_gate: optional
```

The details stay in the artifacts. The snapshot carries the route.

---

A route is re-derived, not replayed. The router asks what gate current evidence allows now, regardless of what a previous sequence expected.

---

A gate is allowed to reject an artifact that exists. Existence proves only that something was produced; freshness, scope, and contract fit determine whether the workflow may advance.

---

Apparent completion is not route authority. If current evidence invalidates “done,” the router may return to an earlier gate instead of advancing.

---

Compaction is where durable state earns its name. A later context can inspect current evidence and derive where to resume instead of trusting transcript continuity.

---

Execution may churn inside a gate without changing the route. The gate still has to reconcile the work, validate its exit, and commit one durable return.

---

A workflow may accidentally do the right next work without explicitly re-entering the router. The work can succeed while the route becomes unauditable; missing transition traces are still protocol failures.

---

Observed runs can illustrate the mechanism and expose its weaknesses. Without comparison, they cannot establish superiority, causality, model incapacity, or cross-model generalization.

---

The ingredients are established. The packaging is what is worth naming.

---

Route gating became necessary for me during GPT-5.5’s pre-Sol dumbing-down. The difference appeared when I stopped asking for one or two epics and handed the model a full backlog.

---

With a small slice, the implicit workflow usually held. With the whole backlog, planning, review, or documentation updates could disappear entirely.

---

Longer flows did not just lower the quality of each step. They made the workflow inconsistent.

---

The omission was the cause; poor execution was the consequence. When planning, review, or documentation vanished, the workflow as a whole degraded.

---

**Vanishing steps** — the failure mode where greater scope erases inner workflow steps, and their absence degrades the execution of the whole flow.

---

Route gating turns an inner obligation from something the model is expected to remember into a gate the workflow must prove, enter, exit, and commit.

---

The model would claim the whole workflow was complete. Asked directly about planning, review, or documentation, it would immediately admit the deficiencies.

---

The missing work was not unknowable. The model could identify it after the fact; nothing had forced that inspection before it declared completion.

---

The completion claim was confident. The state behind it was unverified.

---

**Unverified completion** — a workflow-level “done” emitted before its inner obligations have been checked; a plain “Did you do step X?” reveals the gaps.

---

Route gating moves the plain question “Did you do step X?” from a user follow-up into the workflow’s transition logic.

---

> “Did you do step X?”

That was enough. A confident claim of total completion gave way to an admission of deficiencies.

---

The workflow did not need a sophisticated evaluator. It needed to ask the obvious question before declaring itself done.

---

Once the omission was explicit, the model did perform the missing step. Recovery itself was not the hard part.

---

In that test, I used Matt Pocock’s handoff skill and compacted before asking the agent to rerun the missing step. Those were test-specific recovery actions, not part of the route-gated model.

---

In the route-gated full-backlog run, it just worked. Every required gate ran.

---

Vanishing steps disappeared entirely. I did not have to ask “Did you do step X?” or manually audit for omissions.

---

The workflow completed all required steps without skipping or intervention to recover a missing step.
