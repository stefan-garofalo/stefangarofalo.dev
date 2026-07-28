# Durable Workflow Graph hierarchy

Use this hierarchy to prevent terminology drift:

1. The subject is a skill-native model for reliable long-running agent workflows.
2. **Durable Workflow Graph** names the architecture.
3. Skills encode the router, gates, and transition contracts.
4. The model traverses the graph inside its ordinary skill loop.
5. State machines explain explicit state, guarded transitions, and resumption.
6. The actor model explains bounded gate ownership, local autonomy, validation responsibility, and message-like return.
7. Graph language explains possible paths, branches, cycles, and checkpoints.
8. Every gate commits a durable handoff before router re-entry.

The practical contribution is a skill-native implementation recipe. `route-gated` is historical shorthand. Subagents are optional and stay outside the article spine. This ordering matters because current agent-graph discourse often implies an external orchestration runtime, while this model runs through ordinary skill contracts inside the model's own loop.

For reusable authoring guidance, keep the universal layer semantic: evidence-derived routing, bounded gate ownership, workflow-specific durable return on every controlled exit, cold resume, and terminal accounting. Filenames, fields, status vocabulary, persistence shape, and lifecycle sequences stay domain-owned because copying them from one example turns an architecture into a template.
