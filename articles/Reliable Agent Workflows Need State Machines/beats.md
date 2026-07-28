# Reliable Agent Workflows Need State Machines

Agent skills are easy to compose into longer workflows. An author can call several existing skills, describe their sequence in Markdown, and ask the agent to carry the whole workflow through one run.

Each component skill already has a working contract. Running them in one continuous session keeps their instructions, outputs, and completion checks available, making the longer workflow feel like a straightforward extension of familiar behavior.

The completion report exposed the first failure: it declared the whole workflow finished while several required steps had produced no work or evidence. A direct question about one missing step led the agent to identify the deficiency immediately.

What does composing the workflow save if its author must reopen every promised step and verify the work after completion?

The follow-up that exposed the missing work, “Did you do step X?”, is a state-machine question. It asks whether durable evidence authorizes a transition from one workflow state to another. A state machine makes those states and their allowed transitions explicit, while the surrounding graph records every possible path through them, including branches, cycles, and checkpoints.

The component skills keep their existing contracts. Inside the model's ordinary runtime, the router reads current artifacts and selects one eligible gate. The selected gate owns a bounded contract and remains responsible through validation. If the gate invokes another skill, that skill returns its result to the gate before the workflow can continue. This resembles an actor boundary: the gate contains local behavior and communicates with the router through a message-like handoff.

The one changed operation is durable return. A gate validates its exit, writes a lean handoff as a durable checkpoint pointing to the workflow’s native artifacts, and returns control to the router before another transition can be selected. Greedy composition lets completion follow whatever the current context suggests. Durable return makes every transition depend on committed evidence. A missing handoff therefore leaves the required step visibly unfinished. After an interruption, the router re-enters and derives the next eligible gate from durable evidence.

This makes the Durable Workflow Graph skill-native: explicit, inspectable Markdown contracts define the router, gates, and transitions that the model traverses inside its ordinary skill loop. Formal state-machine enforcement, actor mailboxes, and actor concurrency remain outside the pattern.

## A committed exit changes the route

The next three examples trace the route contract through a research, draft, and review graph, changing one variable at a time.

**Baseline.** `draft.md` exists. On re-entry, the router finds no draft handoff, so review remains ineligible and draft remains the current state.

**One change.** The draft gate writes one handoff with `status: complete` and a pointer to the same `draft.md`. The artifact and route contract remain unchanged.

**Prediction.** On router re-entry, the router will select review.

**Observation.** On re-entry, the router reads the draft handoff and selects review.

**Explanation.** The handoff is the only changed variable. It supplies the transition evidence required by the guard.

## A committed exit survives a context reset

Router re-entry may occur within one context. A reset tests whether the selected route depends on conversation continuity.

**Baseline.** With the original context still available, the router reads the draft handoff and selects review.

**One change.** Start the router in a new context window under the same runtime. Keep `draft.md`, the handoff, and the route contract unchanged.

**Prediction.** The router will select review again from the same durable evidence.

**Observation.** In the new context window, the router reads the same handoff and selects review.

**Explanation.** The context window is the only changed variable. Because the handoff is durable, the workflow remains stateful across the reset and the same guard remains satisfied. Structurally, the handoff carries the gate's message-like return across the actor-style boundary.

## Nested work returns through the gate

In this graph, the router selects the next gate from committed handoffs, leaving the current gate's internal execution path as a neutral transfer variable.

**Baseline.** The draft gate performs its work directly, validates `draft.md`, and writes its handoff. On re-entry, the router selects review.

**One change.** The draft gate invokes a nested writing skill to perform the same work. Every route input remains fixed, including the gate contract, resulting artifact, exit validation, handoff, and eligible gates.

**Prediction.** After the nested skill returns to the draft gate, the router will select review.

**Observation.** The nested skill returns its result to the draft gate. The gate validates the same exit and writes the same handoff. On re-entry, the router selects review. Transfer holds.

**Explanation.** The internal execution path is the only changed variable. The actor-style gate contains local execution behind its bounded contract and returns the same message-like handoff to the router.

## Use durable routing when recovery matters

**Trigger.** Use a Durable Workflow Graph when the author must preserve independently verifiable progress across an interruption or later prove that every required gate ran.

**Benefit.** Committed handoffs keep completed work inspectable and let the router resume from current evidence.

**Cost.** Each gate needs explicit entry and exit guards plus a durable handoff. Every transition adds another router pass and evidence read.

**Exception.** A disposable flow with one meaningful final deliverable can remain a continuous composition when partial work would be discarded after an interruption and the whole result is easy to verify.

**One-minute rule.** In under a minute, name the intermediate results that must remain trustworthy after context loss. Any result on that list needs a durable gate boundary. An empty list favors direct composition.

Start with the first intermediate result that must survive context loss and model it as a state. Place its work inside an actor-style gate, then require a durable handoff before the router advances. Repeating that boundary for every required result turns the existing skill flow into a Durable Workflow Graph that can resume from current evidence.
