# Planning Skill

Use this after `skills/workflow.md` classifies work as high or multi-session. Do not load it for touch-up, low, or medium work.

If the destination or major product/architecture decisions are still too foggy to form a trustworthy contract, use `skills/wayfinder.md` first. Wayfinder decides the route; this skill converts a clear route into executable slices. Do not create a Wayfinder map merely because implementation is large.

For a consequential experience, agent interaction, public seam, ownership, or persistent-data choice with multiple honest structures, use `skills/experience-design.md` first. It owns candidates and synthesis; planning records the result. Routine reversible choices stay here.

## Durable Contract

Create one project-owned plan using the repository's convention:

```markdown
## Goal
## Current state
## Non-goals
## Acceptance evidence
## Test seams
## Slices
- Slice: <end-to-end result>; blocked by: <slice or none>
## Unresolved decisions
```

Do not prewrite complete implementation code. It becomes stale and biases tests toward an imagined solution. Name produced/consumed interfaces only where slices depend on each other.

## Slices and Blockers

A **slice** is a *vertical*, end-to-end, independently demonstrable result sized for one fresh context. Work the first unblocked slice. Setup, docs, and tests belong with the behavior that needs them, not in horizontal phases.

A plan never implies fan-out: for parallel-looking slices or a requested agent count, `skills/topology.md` decides one agent, Arena, or Swarm before spawning.

For a wide mechanical migration that cannot stay green as vertical slices, use **expand → migrate callers in green batches → contract**. Name every batch blocking contraction.

## Stage Integrity

A **stage** is a reviewable checkpoint. It is complete only at an immutable user-authorized commit/snapshot, or as the final worktree closeout before handoff.

If commits are not authorized, keep one stage active while slices accumulate; never record several “done” stages against the same mutable base. Start high work with:

```bash
node scripts/llm-workflow/workflow-start.mjs --stage "<name>" --contract <plan.md>
```

The command validates required sections and links the contract from the progress row.

## Plan Self-Review

Before implementation, check once:

- every acceptance criterion maps to a slice and evidence;
- no placeholder, contradiction, or unresolved blocking decision remains;
- blockers and produced/consumed interfaces agree;
- each slice is independently demonstrable and context-sized;
- nothing outside the goal slipped in;
- the strongest case against the plan is stated; if it survives contact with the evidence, change the plan before implementing. A plan is a claim to evaluate, not proof that it works.

## Durable Context Boundary

For an explicit pause, unavoidable context boundary, or multi-session resume, use `skills/resume-work.md`. It owns the snapshot-bound checkpoint; planning contributes goal, completed/pending slices, decisions, and next action by pointer. Ordinary same-session progress needs no checkpoint.

Influence: adapted from Matt Pocock's `to-tickets`/`wayfinder` and Obra Superpowers' file handoffs/plan self-review (MIT), without mandatory issue trackers, micro-steps, complete-code plans, or automatic commits.
