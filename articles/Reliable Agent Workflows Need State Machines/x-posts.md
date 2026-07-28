# X Post Drafts

Draft only. No publication action has been taken.

## Why Linear Skill Wrappers Fail

In a multi-step skill, an ordered sequence can call skills without creating a persistent run. When evidence changes the route, the workflow needs explicit states, entry rules, and durable state.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Durable Workflow Graph for Skills

In multi-step skill architecture, a Durable Workflow Graph separates three jobs. Topology defines routes, state-machine guards decide which move is legal, and actor-like gates own work and validation.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Delegating Between Skills

In a skill workflow, a gate may invoke narrower skills but must still accept their output, validate it, and return one outcome. Execution can vary while responsibility stays at that actor-like boundary.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Resuming Across Model Invocations

After a gate validates an outcome and persists its handoff, control returns to the router. Once accepted, the handoff preserves that outcome and evidence for router re-entry across model invocations.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Completing the Whole Skill Workflow

A multi-step skill completes only when every obligation has fresh evidence for its current dependencies. A terminal guard enforces that condition, so one finished gate cannot close the whole workflow.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines
