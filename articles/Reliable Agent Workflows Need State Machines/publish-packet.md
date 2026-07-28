# Publish Packet

## Title

Reliable Agent Workflows Need State Machines

## One-line pitch

A Durable Workflow Graph combines state-machine transitions with actor-style gates so long-running skill workflows can resume from durable evidence and account for every required step.

## Final compress-and-transfer paragraph

Start with the first intermediate result that must survive context loss and model it as a state. Place its work inside an actor-style gate, then require a durable handoff before the router advances. Repeating that boundary for every required result turns the existing skill flow into a Durable Workflow Graph that can resume from current evidence.

## Publication checklist

- [x] Reader need
- [x] Claim consistency
- [x] Bounded evidence
- [x] Explicit boundary
