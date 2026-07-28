# Parked Beats

## Stage 5 Mechanism Blueprint

- **Familiar anchor:** Map gates, routing predicates, the router, and handoff snapshots to control states, guards over evidence, transition selection, and durable transition evidence.
- **Actor-model lens:** Show each gate as the owner of bounded behavior and its return as a message-like boundary exchange.
- **Single changed operation:** A durable return validates the gate's exit state, commits a lean handoff snapshot, and returns control to the router.
- **Resumption:** Mandatory router re-entry derives the next gate from present evidence. Current artifacts outrank a suggested next gate, which remains advisory.
- **Runtime implementation:** The model interprets the graph inside its ordinary skill loop. The selected gate may invoke skills or spawn and manage subagents before validating their return.
- **Boundary:** Keep the comparison structural. Actor concurrency, mailboxes, and formal state-machine runtime guarantees remain outside the skill protocol.

Direction selected: B. The 244-word mechanism is accepted and written in `beats.md`.
