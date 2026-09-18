---
title: Design System
updated: 2026-09-18
type: domain
sources:
  - docs/wiki/decisions.md
  - src/views/internal/design-system/foundation-catalog.ts
  - src/views/internal/design-system/component-catalog.ts
  - src/views/internal/design-system/documentation-presentation.ts
  - src/views/internal/design-system/current-review.ts
---

# Design System

This is the entry point for using Register's design system. It intentionally
contains current usage and authority only; implementation history and review
artifacts belong in Git history.

## Browse it

Open `/internal/design-system` for the human-readable library. Foundations,
Components, and Patterns are continuous references with stable deep links and a
sidebar that follows the visible section. Component detail pages add usage depth;
they are not required to see the supported variants and states.

The library is internal and English-only. Product UI remains localized.

## Read status correctly

The visible status and typed catalogs describe design maturity. They do not
claim production adoption.

- **Accepted**: the current visual/interaction baseline for new work in the
  named scope.
- **Exploring**: useful review material, but not a default to copy into product.
- **Not planned**: no canonical V1 result is defined.

`adoptionStatus` is separate. An accepted component can still have no production
consumer. Existing product behavior also does not become design authority merely
because it is live.

## Use it in code or with an LLM

1. Find the foundation, component, or pattern in the rendered library.
2. Find the same ID in `foundation-catalog.ts` or `component-catalog*.ts`.
3. Check `designAuthority`, `implementationStatus`, `implementationSource`, and
   `adoptionStatus`.
4. Import or compose the named implementation. Do not copy JSX from a specimen,
   state sheet, documentation host, or product screenshot.
5. Follow only the entry's accepted decisions and current implementation
   sources. Product evidence preserves behavior and content constraints but does
   not override an accepted component contract.
6. Keep production adoption explicit and scoped. A lab result never authorizes
   a shared-default, token, routing, transaction, or data-contract change.

Use the [consumer reference](design-system-reference.md) when the catalog and
implementation do not contain enough practical guidance. Durable design choices
and rationale live in [Accepted Decisions](../decisions.md).

## Authority order

When sources disagree, use this order:

1. Repository safety rules in `CLAUDE.md` and `docs/wiki/project.md`.
2. Accepted decisions in `docs/wiki/decisions.md`.
3. Typed foundation/component catalog state and the canonical implementation it
   names.
4. The consumer reference and component API documentation.
5. Product implementations as behavior/content evidence.
6. Lab specimens and exploratory studies.

If resolving a conflict would create new design meaning, stop for human review.

## Primary source map

| Need                                    | Source                                                       |
| --------------------------------------- | ------------------------------------------------------------ |
| Human visual reference                  | `/internal/design-system`                                    |
| Foundation status and relationships     | `foundation-catalog.ts`                                      |
| Component/pattern status and owner      | `component-catalog.ts` and split catalog files               |
| Human navigation and presentation order | `documentation-presentation.ts`                              |
| Accepted rationale                      | `docs/wiki/decisions.md`                                     |
| Canonical component APIs                | named `implementationSource` and local README                |
| Design tokens                           | `tailwind.config.ts` and semantic variables in `src/app.css` |
| Shared visual roles                     | `src/components/design-system-v1/semantic-roles.ts`          |
| Shared layout relationships             | `src/components/ui/v1-layout-recipes.ts`                     |
| Current internal review target          | `current-review.ts`                                          |
| Behavioral coverage                     | `e2e/TEST_MAP.md` and focused tests                          |

Catalog `contextSources` use these roles:

- `authority`: current typed or canonical owner;
- `accepted-decision`: durable human-reviewed meaning;
- `implementation`: reusable or specimen implementation;
- `product-evidence`: behavior, data, and content constraints;
- `visual-evidence`: composition precedent without authority;
- `legacy-evidence`: migration/coverage context only.

## Consumption rules

- Use semantic tokens and shared role owners; never hardcode colors.
- Keep component defaults. Add a supported opt-in variant when the system owns a
  real recurring need.
- Let compositions own width and placement. Do not encode page-specific layout
  into a reusable component.
- Preserve product mechanics, financial meaning, transaction truth, data sources,
  permissions, and copy unless separately authorized.
- Keep `Amount`/`bigint` through money logic and use the SDK/RPC boundaries
  defined by the product area.
- Preserve accessible names, focus behavior, keyboard operation, target sizes,
  reduced motion, and readable contrast.
- Treat documentation/lab backgrounds as presentation context, not component
  implementation requirements.

## Patterns

Navigation, Tables, Charts, and Transactions are documented as patterns because
their useful result depends on composition and product state.

- Navigation, Tables, and Charts have bounded accepted lab baselines. Use the
  named owners and scope in their catalog entries; do not infer a universal page,
  row, or chart API.
- Transactions are an exploratory, paused composition reference. They preserve
  distinct flow mechanics and are not a universal flow controller or production
  migration approval.
- A pattern may contain accepted lower-level components while the overall
  composition remains exploratory.

## Verification

Generated screenshots, measurements, and browser reports are ephemeral and live
under ignored `test-results/` or CI artifacts, never under documentation.

- `pnpm typecheck`
- `pnpm design-system:docs:build`
- `pnpm design-system:review` for the focused browser suite
- focused unit tests for the component or pattern being consumed

The review suite owns its own local server. Do not reuse or stop another
developer's preview process.

## Adoption boundary

Production adoption, shared defaults, global tokens, package styling, routing,
wallet/transaction behavior, and cross-feature migrations require their own
scope and proportional review. For engineer-review surfaces listed in
`docs/wiki/project.md`, include an explicit engineer handoff before shipping.
