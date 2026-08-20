# Model Capabilities Skill

Use this when a workflow role needs to be assigned, an agent requests broader mutation authority, or repeated evidence suggests a current assignment is unsafe or wasteful. Skip it for ordinary single-agent work within existing authority.

A capability role is a task-local demand profile, not a permanent model identity. Never select from provider branding, model slugs, popularity, self-reported identity, or claims of being “strong.” The normal topology gate remains authoritative: describing several roles does not authorize several agents.

## Build the Profile

Use `templates/evaluation/capability-profile.md` and record:

1. **Job and seam:** the artifact or decision owned, allowed inputs, required outputs, and exact verifier.
2. **Required abilities:** observable behaviors such as repository navigation, instruction fidelity, bounded editing, tool use, visual judgment, adversarial reasoning, or concise synthesis.
3. **Evidence:** recent held-out tasks, exact artifact/evidence pointers, failure modes, repair cost, and expiry. Self-report is never evidence.
4. **Earned authority:** readable and writable roots, allowed tools, side effects, approval gates, and maximum blast radius. Start with the least authority that permits the job.
5. **Fallback:** how one available agent completes the role serially, or the honest pending state when independence is essential.

Separate capability from authority. Passing a design task may earn wider design work; it never grants secrets, money/spend, external messages or remote writes, destructive data changes, shared releases, permission expansion, or physical-device control. Those retain their explicit human gates.

## Assign and Reassess

- Prefer evidence from the same task class and verification seam. General reputation is weak evidence.
- Match required abilities first, then choose the cheapest configuration with sufficient recent proof.
- Keep builder, verifier, and judge artifacts separate even when one agent fills them serially. Do not claim independence that did not exist.
- Widen authority one boundary at a time after held-out evidence; expire or demote it after material failures, stale evidence, changed tooling, or a wider task class.
- Record unavailable capability as `unknown`, narrow the task or leave it pending. Never lower acceptance evidence to fit an available model.

## Pressure and Counter-Scenario

**Pressure:** a user naming a favorite or newest model does not prove it can own a risky role. Honor the requested configuration, but keep authority bounded until behavior earns expansion.

**Counter-scenario:** one agent implementing and verifying a contained change under existing authority needs no capability tournament, role registry, or extra worker.
