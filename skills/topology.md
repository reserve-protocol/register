# Execution Topology Skill

Use when work appears parallelizable, competing candidates have decision value, or the user requests multiple agents. It chooses **one agent**, **Arena**, or **Swarm** without weakening verification, review, or human authority.

## Authority and admission

**One agent is the default and a complete execution path.** Every fan-out condition in `skills/workflow.md` must pass: substantive independent packets, low overlap, stable cut edges, enough work, meaningful speedup, permitted posture, and cheap convergence. **If one admission answer is unclear, use one agent.**

A user-requested count authorizes Burst topology, but not shared writes, skipped proof, fabricated agreement, or bypassed trust gates. Record added usage. **Choose by observed capability evidence, never by provider or model name.**

Before spawning, record topology/reason, posture, briefs, isolated outputs, write boundaries, done predicate, convergence owner, dropout rule, and verification reserve. One coordinator owns the final tree.

## One agent

Use for sequential work, shared-state coupling, unstable seams, or inadequate convergence budget. Do not manufacture packets.

## Arena — compete and synthesize

**Arena gives the same brief to competing candidates** for one artifact when comparison and synthesis have decision value.

- Pre-register output contract, rubric, held-out evidence, and candidate count.
- Isolate writable outputs; candidates do not coordinate.
- The coordinator reads each artifact, scores the rubric, selects a base, and adapts only compatible strengths.
- Verify the synthesis; **review count follows risk, not worker count**.

Arena is not a vote. **Fewer than two viable Arena candidates means no comparison claim**: continue as one-agent proposal or rerun only if comparison still repays its cost.

## Swarm — cover or race

**Swarm uses partitioned independent coverage or a declared race.** Choose one shape before spawning:

- **Coverage:** distinct exhaustive slices, each with independent evidence.
- **Race:** identical objective with predeclared `first pass`, `rank all`, or `best-of`. **A race selects; it does not graft.** Use Arena for synthesis.

Use Swarm for inspection, platform matrices, or parallel reproduction. Avoid shared files, sequential workers, or negotiated design.

## Convergence and failure

Workers return paths, commands/evidence, and blockers. **Worker reports are claims until the coordinator inspects** artifacts and the current tree. Recompute scope after convergence, integrate changed cut edges, reconcile once, then verify the widest affected seam.

- **Missing required Swarm coverage leaves the result incomplete**; reassign or finish sequentially.
- A race may use valid arms only under its predeclared rule; report dropouts.
- Unexpected overlap stops new fan-out and returns remaining work to the coordinator.
- Reserve final verification and one repair attempt before optional workers.

## Pressure checks

- **Pressure: deadline, but packets touch shared files and one schema. Outcome: one agent**; concurrency adds reconciliation, not progress.
- **Pressure: broad inventory across independent platforms. Outcome: Swarm coverage**, one report per platform.
- **Pressure: flaky reproduction across independent environments. Outcome: Swarm race**, with a predeclared selection rule.

**Static tests do not prove future agent compliance**; run blinded live-agent evaluation before claiming pressure behavior works.

Influence: adapted from pstack's `arena`/`swarm` skills (MIT), retaining one-agent economics, portable roles, and fixed-point convergence.
