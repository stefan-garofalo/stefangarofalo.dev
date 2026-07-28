# Durable Workflow Graph Article Spine

Context: Begin with the reasonable greedy composition of placing every required skill in one continuous run, then use its implicit control flow to ground the state-machine concepts of explicit state and guarded transitions.

Tension: Connect the missing-step failure to workflow transitions that were never made explicit or durably committed.

Mechanism: Encode the workflow as a **Durable Workflow Graph** through skills, using state-machine guards to select transitions, actor-style gates to own bounded work, and durable return to commit each gate exit before control returns to the router.

Example: Trace one run from a missing required transition through gate activation, durable return, router re-entry, and a completion decision derived from current evidence.

Boundary: Keep the state-machine and actor comparisons structural around control state, guarded transitions, bounded ownership, message-like return, and resumption; formal runtime guarantees, mailboxes, persistent actor identity, and actor concurrency lie outside the skill protocol.

Decision / takeaway: Guide the reader to give one existing workflow explicit states, actor-style gates, guarded transitions, and durable returns, producing the smallest **Durable Workflow Graph** that can resume and account for every required step.
