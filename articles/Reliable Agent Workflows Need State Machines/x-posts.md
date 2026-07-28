# X Post Drafts

Draft only. No publication action has been taken.

## Local and Global Completion

When implementation finishes with passing tests, review can still be pending. A final check keeps the workflow open until every required step has current evidence.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Separate Workflow Responsibilities

If review can send work back to implementation, an ordered Markdown sequence cannot govern the loop. Declare routes, their conditions, and who owns each step's work and validation.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Accepted Durable Handoffs

When an invocation ends after implementation, the next run needs a reliable checkpoint. A saved handoff records the accepted outcome and validation evidence so the workflow can resume.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Dependency-Aware Repair

When review finds a blocker, the workflow returns the task to implementation for a new revision. Earlier evidence becomes stale only when the artifact or dependency it checked has changed.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines

## Small Default Contract

When a skill must survive interruption or repair, it needs explicit routes, accepted handoffs, and a final check. Direct composition fits atomic work that is cheap to discard and restart.

https://stefangarofalo.dev/blog/reliable-agent-workflows-need-state-machines
