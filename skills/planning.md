# Planning Skill

Use this after `skills/workflow.md` classifies work as high or multi-session. Do not load it for touch-up, low, or medium work.

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

Acceptance evidence names the command, behavior, visual state, or artifact that proves each criterion. Ask the human only when an unresolved choice changes behavior, architecture, risk, or scope.

Do not prewrite complete implementation code. It becomes stale and biases tests toward an imagined solution. Name produced/consumed interfaces only where slices depend on each other.

## Slices and Blockers

A **slice** is an end-to-end, independently demonstrable result sized for one fresh context. Work the first unblocked slice. Setup, docs, and tests belong with the behavior that needs them, not in horizontal phases.

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

## Context Handoff

At a context boundary, write only: goal + fixed point; completed slices; decisions; exact evidence; current diff/state; next unblocked slice; unresolved risks. Pass paths to large plans, diffs, and reports instead of copying them into prompts.

Influence: adapted from Matt Pocock's `to-tickets`/`wayfinder` and Obra Superpowers' file handoffs/plan self-review (MIT), without mandatory issue trackers, micro-steps, complete-code plans, or automatic commits.
