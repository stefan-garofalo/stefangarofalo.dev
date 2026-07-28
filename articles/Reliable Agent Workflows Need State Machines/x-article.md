# Reliable agent workflows need state machines

**This is a condensed adaptation of [the original article published on my blog](https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines).**

Consider a coding workflow that plans a change, implements it, and reviews the resulting diff. An ordered Markdown sequence can call those skills in the right order, but order alone does not create a persistent workflow run.

After implementation produces code and passing tests, its local contract is satisfied, so it may report `complete`; if the surrounding sequence has neither a stored obligation saying that review is pending nor a terminal guard that checks it, the model can accept local success as the end of the whole request.

When execution resumes, someone must reconstruct the intended route from the original instructions, diff, and remaining logs.

A persisted checklist can record progress through a fixed sequence, yet it cannot govern what happens when intermediate evidence changes the route. Once completion depends on obligations that must remain explicit between model invocations and be reevaluated when routing resumes, the workflow needs explicit routes, entry rules, and durable state.

## A Durable Workflow Graph governs when the sequence may advance

The skill architecture proposed here encodes a **Durable Workflow Graph**. This contract declares: gates, guarded edges, handoff requirements, and a terminal condition.

After a gate finishes, its handoff records the outcome and evidence the router needs to determine which routes are now available. The router inspects current evidence and chooses a permitted route from the workflow definition, while each gate must write a handoff before returning control.

If the workflow also needs guarantees that two agents cannot write at once, that one gate finishes before another begins, or that a handoff is saved atomically, those guarantees must come from the system running the skill.

Three ideas organize the architecture.

**Graph topology** defines the routes that exist, including branches and repair cycles.

**State-machine semantics** determine which transition is legal for the run’s current state.

An **actor-like gate boundary** assigns one owner to the work, its validation, and the domain outcome returned to the router. The architecture keeps graph topology, state-machine semantics, and gate ownership separate.

A gate may invoke narrower skills internally, yet it retains responsibility for accepting their output, validating the result, and returning one outcome. Internal execution can vary while validation and routing responsibility stay at this actor-like boundary, which does not imply an actor runtime.

## Guards determine which transition can run next

A small coding graph makes the distinction concrete:

- **Start → Planning:** Accepted task exists.
- **Planning → Implementation:** Plan outcome is `accepted` and plan evidence is current.
- **Implementation → Review:** Outcome is `implemented` and tests pass for the current revision.
- **Review → Implementation:** Outcome is `blockers_found` with at least one in-scope blocker.
- **Review → Complete:** Outcome is `approved`, every required domain condition holds with fresh evidence, and no obligation remains open.

These transitions define the available topology, including the review-to-implementation repair cycle, while their guards give it state-machine behavior.

The router evaluates freshness per artifact dependency: a new revision invalidates evidence only when its referenced artifact or dependency changed. After excluding stale evidence, the router evaluates the outgoing guards.

A suggested route can explain intent, but it cannot create an edge or satisfy a guard.

If no transition is eligible and the terminal guard is false, the router reports the missing or contradictory evidence.

If several are eligible, the definition must provide mutually exclusive guards, precedence, or an explicit policy that serializes independent gates; otherwise routing stops as ambiguous.

## Durable handoffs make one run stateful

At gate exit, the agent following the selected gate contract validates the outcome, persists a handoff, and then returns control to the router. The record can live in a repository file, task store, database, or another medium that survives the current model invocation.

The router accepts a handoff only when it satisfies the gate contract, includes any identity required for reliable resume, and points to retrievable validation evidence.

Routing authority comes from the definition and guards, while accepted handoffs provide the state they inspect and `suggested_route` remains metadata.

Only an accepted handoff is a resumable checkpoint; if interruption occurs during gate work or before persistence, partial artifacts remain uncommitted, so the router reselects that gate to reconcile and validate them before advancing.

Because accepted handoffs survive local execution, they make the skill workflow stateful without relying on conversation memory.

## One route through interruption, repair, and completion

Suppose `change-184` begins at revision `r1`: planning accepts a plan, implementation produces the first diff and passing tests, and its completed handoff records the implemented domain state.

The invocation ends before review begins. On resume, the router confirms that the accepted implementation evidence still matches `r1` and follows the implementation-to-review transition.

![An accepted handoff carries the run across an invocation boundary, so the router can recheck state and resume at review.](/images/reliable-agent-workflows-need-state-machines/resume-from-handoff.png)

The review gate completes, but its handoff records an in-scope blocker, so the guard routes the workflow back to implementation.

Implementation changes the code to address the blocker, creating revision `r2` within the same workflow run.

The new code invalidates code, test, and review evidence tied to `r1`; the plan carries forward only after its scope and dependencies are revalidated against `r2`. Implementation reruns validation and records a new handoff, then the router sends `r2` through review.

When review approves `r2`, its handoff closes the review obligation for that revision.

The terminal guard then verifies that the plan remains accepted, implementation and test evidence match `r2`, review evidence approves `r2`, and no blocker remains before the workflow enters `Complete`.

![A blocker routes review back through implementation, while the terminal guard keeps completion unreachable until every obligation is current.](/images/reliable-agent-workflows-need-state-machines/repair-to-terminal-guard.png)

## Make the minimum graph contract the multi-step default

The minimum graph contract is small: named obligations, one evidence-derived router, bounded actor-like gate boundaries, guarded edges, durable handoffs, and a terminal guard.

It should be the default for almost every multi-step skill because an intermediate result that influences later work creates routing, repair, or resume obligations.

Direct composition is the narrow exception for one atomic, discardable action whose partial work can be thrown away and cheaply restarted, with no routing, repair, or resume obligation.

The [`write-graph-based-skills`](https://github.com/stefan-garofalo/skills/tree/main/skills/write-graph-based-skills) authoring skill applies this contract when creating, converting, or repairing a multi-step skill.
