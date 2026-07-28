# Route-Gated Skills

Route-gated skill feels like the right name.

Not "skill router" exactly. That phrase is already drifting toward generic skill selection: pick the right skill, route user intent, avoid manual invocation. Useful, but different.

Route-gated skill says the important thing: the route is the gate. The agent cannot just keep reading, keep improvising, or keep coding. It has to inspect evidence, choose the next gate, load one instruction surface, finish that phase, write state, then stop or re-enter the router.

---

Progressive disclosure solves context loading.

Route gates solve runtime discipline.

Progressive disclosure says: do not load the whole skill. Start tiny. Pull references only as needed.

Route gating says: do not just decide "as needed" from vibes. Use evidence. Pick exactly one next file. Make the transition auditable.

---

The pattern:

```text
SKILL.md
router.md
phases/
  spec.md
  plan.md
  implement.md
  review.md
  debug.md
  docs-ingest.md
  closeout.md
references/
  phase-handoff.md
```

`SKILL.md` is the entrypoint, not the brain dump.

`router.md` is the control surface.

`phases/*.md` are the loaded-on-demand execution contracts.

`references/*.md` are supporting material, not default context.

---

A normal skill says:

"Here is how to do this kind of work."

A route-gated skill says:

"Here is how to determine which kind of work this currently is."

That feels like the real jump.

---

The delivery run proved the pattern under stress.

The user asked for full delivery against a Linear milestone. The agent did not start from implementation. It inspected the repo/tracker state and found only requirements/backlog existed. That selected the spec gate.

Then:

```text
router -> spec
spec -> router -> plan
plan -> router -> implement
implement -> review behavior
review findings -> implement repair
implementation complete -> docs behavior
docs/tracker/validation -> closeout
```

This is the first time the "spec -> plan -> impl" chain felt less like a moral preference and more like executable control flow.

---

Important detail: a phase can delegate, but only after the router selects it.

The delivery skill should not activate `create-spec`, `create-plan`, `implement-spec`, `review-phase`, `debugging-phase`, and `docs-ingest-phase` at startup.

Startup loads only the router.

The router selects one phase.

The phase may load one child skill.

That preserves progressive disclosure and prevents the common failure mode where the agent has all the instructions in context and averages them into mush.

---

The shape that worked:

```md
1. Read router.md.
2. Inspect only enough state to choose the current gate.
3. Load exactly one phase file.
4. Complete that phase.
5. Write handoff state.
6. Stop or re-enter router.
```

Tiny. Runtime-oriented. Hard to misunderstand.

---

The missing contracts are probably the most important part.

Router output contract:

```md
selected_phase:
evidence:
next_file:
stop_or_reenter:
blockers:
```

Phase handoff contract:

```md
phase:
status:
artifacts:
validation:
open_questions:
next_recommended_route:
```

Without those, the pattern is only folder organization. With them, it becomes a runtime protocol.

---

Route invariants:

- load `router.md` first
- choose exactly one next phase
- do not read sibling phase files speculatively
- do not skip required artifacts
- do not continue after a human checkpoint stop
- after phase completion, re-enter router or stop

These are the laws.

---

Staleness rules are the secret weapon.

A router is only useful if it can say "this artifact exists, but it is not good enough."

Examples:

- spec older than requirements/backlog
- spec missing child-story scope
- plan missing owned paths
- plan missing validation gates
- implementation changed after review
- docs stale after operator workflow changes
- tracker state diverges from repo evidence

This is where a lot of agent workflows silently rot: they treat existence as validity.

Route-gated skills should treat artifacts as evidence, not trophies.

---

The pattern makes resume sane.

After compaction, interruption, or subagent handoff, the agent does not need to reconstruct the whole story from the transcript.

It reads the route artifacts, checks freshness, and asks:

"What gate am I actually at?"

That is much better than "continue" meaning "summon the ghost of the previous context."

---

Possible article claim:

Agent skills gave us progressive disclosure for instructions. Route-gated skills give us progressive disclosure for workflows.

---

Possible sharper claim:

Progressive disclosure without routing is a library. Progressive disclosure with routing is a runtime.

---

Possible objection:

"Isn't this just a state machine?"

Yes, but deliberately tiny.

Not LangGraph. Not a framework. Not a graph runtime.

A markdown-local state machine for agents that already know how to read files and follow instructions.

The trick is not inventing state machines. The trick is putting just enough state-machine behavior inside the skill filesystem convention.

---

Possible objection:

"Isn't this just chaining skills?"

Not quite.

Chaining says: do A, then B, then C.

Route gating says: inspect the actual current state, then decide which one of A/B/C is valid now.

That matters when work resumes halfway through, when review finds a blocker, when docs are already current, when implementation exists but no validation does, or when the user asks for a narrow checkpoint.

---

Prior-art positioning:

There are public examples of skill routers, skill graphs, phase-based agent workflows, state machines, and progressive disclosure.

The distinct packaging here is:

```text
tiny SKILL.md entrypoint
router.md as evidence-based control flow
phases/ as one-at-a-time instruction surfaces
handoff state after each phase
stop or re-enter router
```

That combination feels early and worth naming.

---

"Route-gated skill" might be stronger than "phase-router skill" because it generalizes beyond phases.

Some route-gated skills might route by lifecycle phase.

Others might route by artifact type, failure mode, domain, or review severity.

The key is not "phase". The key is a route that gates the next instruction load.

---

For complex work, `SKILL.md` should often become a router bootstrap, not the complete manual.

Maybe the rule:

Flat skill when the task is single-pass.

Route-gated skill when the task has lifecycle, resumability, review loops, or multiple possible next valid actions.

---

The agent failure this prevents:

It reads too much.

It sees spec guidance, plan guidance, implementation guidance, review guidance, and docs guidance all at once.

Then it synthesizes a reasonable-sounding hybrid and starts coding.

Route gating prevents this by making "what instruction am I allowed to load next?" the first-class question.

---

The delivery run had one weakness that became a design requirement:

After implementation, the agent performed review/docs/closeout behavior, but did not always explicitly say it had re-entered the router and selected those phases.

Therefore route-gated skills should require explicit route trace entries:

```text
router -> review: implementation complete, mandatory review missing
review -> implement: live DB boundary blocker found
implement -> docs-ingest: operator workflow changed
docs-ingest -> closeout: docs and validation complete
```

Auditable transitions are part of the product.

---

Possible slogan:

Stop writing giant skills. Write small skills with gates.

---

Possible slogan:

The entrypoint should not contain the answer. It should contain the map for finding the next valid question.

---

Possible slogan:

Make the agent prove what phase it is in before it is allowed to act like it is there.

---

The cool feeling in the stress test was not just that the agent did the right phases.

It was that the agent seemed to know why it was allowed to be in each phase.

That is the difference between a checklist and a route gate.
