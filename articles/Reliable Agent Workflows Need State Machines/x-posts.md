# X Post Drafts

Draft only. No publication action has been taken.

## Why Linear Skill Wrappers Fail

In a multi-step skill, an ordered sequence can call skills without creating a persistent run. When completion accuracy is critical, the workflow needs explicit states, entry rules, and durable state.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Durable Workflow Graph for Skills

A linear multi-step skill orders work until evidence changes the route. A Durable Workflow Graph adds topology for routes, state-machine guards for legal moves, and actor-like gates that own outcomes.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Delegating Between Skills

Calling narrower skills from a linear multi-step sequence leaves ownership implicit. A skill workflow needs gates that accept their output, validate it, and own the outcome returned to the router.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Resuming Across Model Invocations

When a linear multi-step skill workflow resumes, the model reconstructs its route from context. Accepted durable handoffs preserve outcomes and evidence, so the router can resume the same run.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Completing the Whole Skill Workflow

A linear multi-step sequence has no global completion check by itself. A terminal guard permits completion only when every obligation has fresh evidence for its current dependencies.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines
