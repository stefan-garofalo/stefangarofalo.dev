# X Post Drafts

Draft only. No publication action has been taken.

## Launch Thesis

A checklist records a sequence but cannot govern what happens when evidence changes the route. When obligations must survive model invocations, the workflow needs state-machine rules and durable state.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Agent Graph Engineering

A Durable Workflow Graph separates three responsibilities. Graph topology defines routes, state-machine semantics decide which transition is legal, and an actor-like gate owns work and validation.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Stable Gate Ownership

A gate may invoke narrower skills, but it still accepts their output, validates the result, and returns one outcome. This actor-like boundary keeps ownership stable while internal execution changes.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Durable Handoffs

At gate exit, the agent validates the outcome, persists a handoff, and returns control to the router. Once accepted, the handoff lets routing resume from recorded state instead of conversation memory.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Terminal Guard

A terminal guard confirms global completion only when every obligation remains satisfied for current dependencies. If no route is eligible and the guard is false, the router reports what is missing.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines
