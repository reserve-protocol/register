# Design-system context-routing cleanup

**Status:** complete at the working-tree handoff; no commit or production
adoption is implied.

## Goal

Make the first high-leverage context-routing cleanup at fixed point
`921839ac3`: a fresh design-system worker should reach current relevant truth
with less historical context and less authority ambiguity, without changing any
visual decision, transaction UI, production consumer, or design-system
workflow.

## Current state

- `docs/plans/design-system-v1.md` mixes the active contract with roughly 2,500
  lines of dated studies, superseded queues, and prior handoffs.
- `docs/wiki/domains/design-system.md` is both the mandatory entry point and a
  roughly 1,200-line detailed corpus containing current rules, chronology, and
  implementation notes.
- Component-group foundation dependencies are loose display strings. Component
  evidence is prose, so authority, implementation, and visual/product evidence
  paths are not consistently distinguishable or mechanically validated.
- `docs/wiki/project.md` already owns Register overrides, but it does not state
  four known design-system conflicts with reusable kit guidance.

## Non-goals

- No transaction UI or flow change, production adoption, foundation/component
  redesign, or authority promotion.
- No per-foundation or per-component-family document split, decision-ledger
  restructure, dependency service, new Skill, or workflow redesign.
- No attempt to reconcile every historical duplication or perfectly model
  every dependency.

## Acceptance evidence

- The active plan contains current goal, precedence, operating model, state,
  frontier, unresolved risks, active synchronization, and bounded evidence
  links; its former detail remains available at an explicitly historical path.
- The design-system domain page is a concise router to operating authority,
  foundations, catalogs, implementations, decisions, Current Review, evidence,
  and adoption boundaries; its former detailed corpus remains available as an
  explicitly on-demand reference.
- `docs/wiki/project.md` explicitly resolves the four known kit/Register
  tensions without editing reusable Skills.
- Typed catalog tests prove foundation IDs are valid and representative context
  routes distinguish authority, accepted decisions, implementation, strong
  visual evidence, behavioral/product evidence, and legacy/coverage evidence.
- One representative component route demonstrates target → catalog →
  foundation authorities → implementation → accepted decision/evidence.
- Documentation links, focused catalog tests, typecheck, scoped lint, wiki lint,
  and `git diff --check` are green. No unrelated full-repository gate is run.

## Test seams

- `src/views/internal/design-system/tests/component-catalog.test.ts` owns typed
  dependency and context-source coherence.
- TypeScript owns schema migration completeness.
- Wiki lint plus a focused local-link check owns documentation routing.
- Diff inspection proves transaction composition and visual implementation
  files remain untouched.

## Slices

- Slice: preserve the current plan/domain corpora behind explicit historical or
  reference paths and replace mandatory entry points with concise current
  routers; blocked by: none.
- Slice: add explicit project overrides and extend the existing catalog types
  and representative entries with deterministic context paths; blocked by: the
  router naming/precedence established in the first slice.
- Slice: validate the representative route, links, typed schema, unchanged UI
  boundary, and documentation housekeeping; blocked by: both slices.

## Unresolved decisions

- Later work may split the on-demand detailed reference by foundation or
  component family, but this cleanup deliberately does not choose that
  taxonomy.
- If existing accepted sources genuinely disagree on design meaning, record the
  ambiguity instead of selecting a new owner.
- Strongest case against this plan: moving large prose behind reference links
  could hide rules that lack another consumable owner. The migration therefore
  preserves the corpus intact, routes to it explicitly for deep work, and adds
  typed pointers only where the current catalog can validate them without
  inventing authority.

## Outcome

- The mandatory active plan is 190 lines and the mandatory domain router is
  157 lines. Their former 2,667-line history and 1,238-line detailed reference
  remain intact and explicitly load on demand.
- `docs/wiki/project.md` now resolves the four known reusable-kit conflicts at
  the existing project override seam.
- Component groups use typed foundation IDs. `getComponentContextRoute()`
  returns the target, resolved foundation owners, implementation, and typed
  context sources. Button, Field, Dialog, and the transaction review prove the
  common authority/evidence roles without attempting complete catalog modeling.
- No transaction composition, transaction candidate, canonical component,
  foundation value, production consumer, Skill, or workflow was changed.

## Verification

- RED: focused catalog test failed on loose foundation labels and missing typed
  context sources (2 expected failures).
- GREEN: focused catalog test 28/28.
- App and E2E TypeScript: green.
- Scoped oxlint: green; mapped repository lint exited green with existing
  warnings.
- Wiki lint: 20 pages green; routed source paths exist; `git diff --check`
  green.
- Intent/risk self-review found no transaction-UI diff, authority promotion, or
  larger document split. Independent subagent review was unavailable under the
  active session constraint and was not substituted with invented findings.
