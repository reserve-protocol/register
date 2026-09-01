# Foundation Review Skill

Use this when a decision is **load-bearing** — other work will be built on top and getting it wrong means a rewrite, not a patch: the data model, the streaming/wire contract, the auth boundary, persistence, the migration strategy. Stop and validate it before building on it. Skip it for an ordinary feature (that is `planning`/`stage`), for critiquing structure that already exists (`architecture-review`), for closeout of a finished change (`review-panel`), or for a single reversible choice (decide and move on).

## The one invariant

A foundation mistake costs a rewrite, so a foundation decision is not trusted because it reads well — it is trusted because hostile lenses and a second, independent model tried to break it and reported what they found. One model agreeing with itself is not validation.

## Procedure

1. **Decompose into load-bearing topics.** Name the distinct things others will build on — each a place a mistake propagates outward. Distinct and exhaustive; anything left out is named, not dropped silently.
2. **Ground each topic before validating it.** Read the real current state, cite it (`path:line` or `NOT PRESENT`), and propose one concrete approach. Validating a vague direction proves nothing — a skeptic must be able to attack a specific mechanism.
3. **Pressure-test each topic with three hostile lenses, in parallel** (delegate the fan-out to `topology`): **correctness** (adversarial — hidden assumptions, races, partial-failure and ordering paths), **security** (trust boundary, authorization on every new path, leakage, fail-open), and **scale & failure-injection** (volume, concurrency, backpressure, power-loss, the deployment target's real limits). Each returns a verdict and concrete failure scenarios — *state → failure*, never "seems fine".
4. **Cross-model check.** Have a second model from a different family independently attack the hardened conclusion, invoked headless and read-only. Report its verdict faithfully, especially where it disagrees — that disagreement is the highest-signal output of the whole pass. If it is unreachable, record that; never skip the check silently.
5. **Harden.** Fold the verdicts into what to actually build: the forced changes (which finding forced each), the residual risks, and the decisions that are the human's to make.
6. **Sequence into a decision map.** Order by blast radius — a failure that loses user data or is hardest to reverse goes first — and flag every topic where the lenses or the two models disagreed. It charts the work and the decisions; it does not implement them.

## Stays out

- An ordinary or reversible change → `planning`/`stage`, or just decide.
- Existing structure to critique → `architecture-review`; closeout of a finished change → `review-panel`.
- Dropping a lens or the cross-model pass because it is slow — the check costs less than the rewrite it prevents.

Link: [[topology]] for the fan-out, [[wayfinder]] to chart follow-on work, [[create-verification]] to turn a survived scenario into a regression test.
