# Experience Design Skill

Use before implementation when a consequential change could lock in the wrong experience, agent interaction, public seam, ownership, or persistent data shape. Skip routine behavior, mechanical migrations, and decisions with one honest shape. Architecture diagnosis remains in `skills/architecture-review.md`; execution choice remains in `skills/topology.md`.

## Admission

Write one usage sketch by default. Explore **two genuinely structural candidates** only when:

- a wrong choice creates durable caller or maintenance cost;
- two ownership, data-flow, or interface shapes can satisfy the intent — **not two implementations of the same ownership model**;
- candidate work is isolated and reversible enough to discard before implementation or external effects;
- the usage posture preserves final verification and repair capacity.

If unclear, develop one candidate with one rejected alternative. Permission expansion, destructive migration, irreversible action, and cross-user authority require human decision before selection or application.

## Frame

Copy `templates/design/brief.md` into project scratch. Ground it in current evidence, then **write the desired user/caller experience first**:

- two or three realistic journeys/call sites, including failure or recovery;
- expected result, feedback, and knowledge the caller must carry;
- **agent affordances**: exposed context, available actions, authority/confirmation, visible result, and use mode versus change mode;
- constraints, non-goals, compatibility, and smallest independently verifiable outcome.

Pre-register a 3–6 item gradeable rubric and one held-out pressure scenario. **Candidates do not receive the rubric or held-out scenario**; they receive identical intent, grounding, constraints, and output contract.

## Produce candidates

Use `templates/design/candidate.md`. Each writes usage before internals, derives interfaces/modules, traces access patterns, names invariants/test seams, and states rejections. Outputs stay isolated.

Use one agent for one candidate. When Admission earns two candidates, use Arena: same brief, two competing candidates, no shared writable artifact.

## Select and synthesize

Use `templates/design/synthesis.md`:

1. Read both end to end; **score both candidates criterion by criterion** against the pre-registered rubric.
2. Run the held-out scenario and record fit or failure.
3. Select a base on caller load, agent operability, interface depth, locality, testability, compatibility, and recovery.
4. Adapt compatible strengths only. Preserve **one coherent mental model**. **Do not average incompatible shapes** or paste fragments together.
5. Record rejections, remaining risks, and human gates.
6. **Verification is independent of candidate self-report**: run synthesized usage through external evidence.

Ambiguous divergence means reframe once. Fewer than two viable candidates means continue as a one-candidate design and make no Arena agreement claim.

## Completion

Output final usage, agent affordances, public ownership, rubric scores, held-out result, synthesis/rejections, verification seam, human gates, and next end-to-end slice; then hand the route to `skills/planning.md`. Static structure tests do not prove live-agent compliance.

## Pressure checks

- **Pressure: consequential public seam with two viable ownership models. Outcome: two-candidate Arena**, held-out evaluation, coherent synthesis.
- **Counter-scenario: local routine button placement. Outcome: skip experience design** and follow the normal UI branch.
- **Counter-scenario: permission expansion with irreversible effects. Outcome: human decision**, never autonomous application.

Influence: adapted from pstack's `architect`/`arena` workflow (MIT) under this workflow's one-agent economics, model portability, fixed-point evidence, and human authority.
