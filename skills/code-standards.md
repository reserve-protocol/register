# Code Standards Skill

Use this when writing or reviewing application code. These are cross-project defaults; a project overrides them only via an explicit note in `docs/wiki/project.md`.

## Root Rule

The dumb solution wins. Code an agent or a human can rewrite in a week beats code that needs a diagram. If it can't be explained in 30 seconds, it's too complex. Three similar lines beat a premature abstraction. Optimize in this order: stability, simplicity, performance.

## Shape

- The containment test: a feature should be addable without understanding the whole app, and deletable in one `rm -rf` without breaking anything else.
- Domain-gated feature folders: each feature owns its local types, tests, fixtures, and boundaries. Shared code must not import from a feature folder; features must not reach into each other's internals — lift shared needs up.
- Fix local bugs locally: never solve a feature's layout or behavior issue by changing shared containers, providers, routing shells, or component defaults unless the task is explicitly about that shared surface. Shared components keep their defaults; add behavior via opt-in props.
- Rule of three, counted in blocks not lines: two near-identical blocks stay; the third copy of a structural block triggers extraction as part of that change. Guard the opposite failure — if covering the variations needs more than ~2–3 params or branches, the duplication was fine.
- Keep logic inline until an extraction names a real concept, hides a complex boundary, or is reused.
- No barrel files that force unrelated modules to load.
- Size gates: components under ~200 lines, files under ~300; anything over ~500 is a review-required flag, over ~1000 is cleanup work, not a normal feature shape.
- Route/flow/step components orchestrate only: select data, call hooks, compose UI. If one owns network reads, timers, animation state, or business derivation, extract that logic before adding more.
- Early returns over nested conditionals and `else`.
- Prefer `const`; avoid reassignment unless it materially simplifies control flow.
- Helpers live below the exported function they support when that keeps the happy path readable.

## Types

- No broad `any`. `unknown` plus schema/type guards at boundaries.
- Validate at trust boundaries (IPC, network, storage, user input); trust internal calls.
- Money and on-chain amounts are BigInt, never Number.

## Naming & Files

- Files: kebab-case (`use-auction-status.ts`, `auction-card.tsx`).
- Functions camelCase, constants UPPER_SNAKE_CASE, booleans prefixed is/has/can/should.
- Verbose names over abbreviations.

## State (jotai projects)

- Small focused atoms, one responsibility each.
- Derived atoms for computed values — never useEffect sync.
- Action atoms for coordinated updates.
- `useAtomValue` by default, `useSetAtom` for writes, `useAtom` only when both are needed.

## Comments

- A comment states a constraint the code cannot show: a WHY, a security boundary, an upstream compatibility note, a deliberate shortcut with its ceiling and upgrade trigger.
- Never narrate what the next line does, where code came from, or why a change is correct.

## Tests

- Tests live in dedicated `tests/` folders, not alongside source.
- Behavior, not implementation. Would this catch a real bug? If not, delete it.
- Good targets: critical business logic, trust boundaries, failure modes, edge cases that have broken before, complex async flows.
- Tests are typechecked like source. Failing tests get root-caused, never skipped.
- Tests are deletable when requirements change — they are feedback loops, not coverage metrics.

## Migrations

Safe and dumb: create new code in parallel (never delete/rename old code mid-migration); migrate one consumer at a time to surface breakage incrementally; tighten types case by case, no big-bang type changes; write tests that pin current behavior before migrating, re-run after; delete old code last, only when every consumer is migrated and tested.

## What Not To Do

Abstractions for one-time use. Features nobody asked for. Clever one-liners that sacrifice readability. Error handling for impossible scenarios. Optimizing before it's slow. Custom config where the framework default works.
