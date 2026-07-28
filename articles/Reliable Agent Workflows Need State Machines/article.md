# Reliable Agent Workflows Need State Machines

Agent skills invite composition. Each one already carries instructions, outputs, and completion checks for a bounded job, so an author can place several skills in a Markdown sequence and ask the agent to run the whole workflow in one session.

The arrangement feels complete because every component contract is present. One run still ended with a completion report while several required steps had produced no work or evidence.

The completion report moved verification back to the author, who now had to reopen every promised step and reconstruct the route after the run. The continuous flow had no workflow-level transition check tying “complete” to evidence from every required step. A state-machine design makes workflow states explicit and defines the evidence that authorizes each transition.

Those transition rules govern when the workflow may advance. The graph records where it can go next, including branches, repair cycles, and checkpoints for resumption. Encoding both through skills produces a Durable Workflow Graph.

The skill-native implementation divides responsibility between two contracts: the router reads current artifacts and selects one eligible gate, while the selected gate owns its bounded work through validation. The model traverses the graph by following those contracts inside its ordinary skill loop.

Durable return carries a gate’s validated result into workflow state. During that operation, the gate validates its exit, commits a lean handoff pointing to the workflow’s native artifacts, and returns control to the router. The handoff preserves the transition evidence required before the router can select another gate.

That bounded ownership gives the gate an actor-like boundary: local execution and validation stay inside it, and the handoff carries the gate’s outcome back to the router.

Because the handoff survives beyond the gate’s local execution, it makes the workflow stateful and gives the graph a checkpoint for resumption. On re-entry, the router treats current artifacts as authoritative and reads committed handoffs as transition evidence before selecting the next eligible gate, including after an interruption or context reset.

Consider a graph with research, draft, and review gates. `draft.md` exists while the draft handoff is still absent. On re-entry, the router keeps draft current because the artifact alone contains no validated transition evidence.

The draft gate now commits a handoff with `status: complete` pointing to the same `draft.md`. The work product and transition rules stay unchanged, so the handoff is the only new evidence. Under those same rules, the router should now select review on re-entry.

On re-entry, the router reads the committed handoff and selects review. The handoff supplies the guard evidence that `draft.md` alone lacked.

That handoff still represents the draft gate’s validated outcome whether the gate writes `draft.md` directly or invokes another skill. In either case, the gate validates `draft.md` and commits the handoff. The actor-model similarity lies in that stable boundary: the gate keeps local autonomy and validation responsibility, while the router receives one durable outcome as transition evidence.

Use a Durable Workflow Graph whenever a multi-step workflow must complete every required step. Give each required step an explicit gate contract, require validated workflow-native evidence plus a committed handoff at exit, and authorize final completion only after the router can account for every required gate. Missing work then remains visible as an uncommitted transition, while interrupted runs retain durable evidence for resumption.

The added guards, handoffs, and router passes form the workflow’s completion protocol. They strengthen omission detection, resumption, and auditability inside the model’s ordinary skill loop. Formal runtime enforcement remains outside this skill-level contract.

For work where completing every required step is non-crucial, list the intermediate results that must remain trustworthy after context loss and give each one a durable gate boundary. If that list is empty, direct composition is sufficient: no intermediate progress needs to survive for resumption or audit, so the skills can run as one continuous flow and restart after interruption.

For completion-critical work, model each required result as an explicit state. Place its work behind an actor-style gate, define the evidence that validates its exit, and require a committed handoff before the router advances. Repeating that contract across the graph makes final completion account for every required step.
