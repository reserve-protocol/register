---
title: Design System
updated: 2026-09-21
type: domain
sources:
  - .storybook/**
  - src/stories/**
  - src/components/design-system-v1/**
  - src/components/button/**
  - src/components/icon-button/**
  - src/components/dialog/**
  - src/app.css
  - tailwind.config.ts
---

# Design System

Run `pnpm storybook` to browse the internal component library. Storybook replaces
`/internal/design-system` and the standalone lab. It renders real components with
local example data, without the product's wallet, RPC or analytics startup.
Examples are English-only; production UI remains localized.

## Use a component

1. Find its story under `src/stories/` and import the same canonical module.
2. Check the exported props and the accepted decisions in [[decisions]].
3. Use the [consumer reference](design-system-reference.md) for visual semantics.
4. Keep production adoption scoped: an example is not approval to change product
   copy, money logic, permissions, shared defaults or SDK contracts.

Storybook is a demonstration host, not a second component implementation. Keep
fixtures small and local. Do not add review dashboards, status catalogs or
transaction simulators. Existing production `ui/` components retain their APIs
until their callers are explicitly migrated.

Overview stories import the real price/candlestick bodies and shared pure chart
helpers. Other chart families retain their original local presentation sources.
Storybook aliases chart atoms and the token-logo icon atom to local fixtures,
avoiding wallet startup through application state. Do not copy production chart
calculations into stories.
Automatic React prop extraction is disabled because its parser fails on the
application's generic state graph; supported controls use explicit args/argTypes.

## Sources

| Need                                      | Owner                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Component examples and interactive states | `src/stories/`                                                          |
| Reusable implementation                   | The canonical module imported by its story                              |
| Accepted design rationale                 | [[decisions]]                                                           |
| Consumer guidance                         | [[design-system-reference]]                                             |
| Semantic colors and theme values          | `src/app.css` and `tailwind.config.ts`                                  |
| Typography and semantic relationships     | `src/components/design-system-v1/typography.ts` and `semantic-roles.ts` |
| Layout relationships                      | `src/components/ui/v1-layout-recipes.ts`                                |
| Browser behavior checks                   | `e2e/storybook/`                                                        |
| Production-flow coverage                  | `e2e/TEST_MAP.md`                                                       |

When sources conflict, repository safety rules and accepted decisions take
precedence over examples. Preserve accessible names, focus, keyboard behavior,
reduced motion and contrast. Use semantic tokens; compositions own width and
placement. Financial values use Lausanne/tabular numerals, with `Amount`/`bigint`
retained through money logic. Monospace is for machine identifiers.

## Patterns and adoption

Navigation, table and chart stories preserve the original compositions and edge
states. They do not define a universal page, row or chart API. The Introduction
page embeds `src/stories/COVERAGE.md`, mapping removed design areas to current
stories. Foundation/layout studies and historical modal alternatives remain
browsable; review dashboards and simulation engines stay retired.

Use Docs for usage guidance and source, Controls for supported props and fixture
states, and Accessibility for axe results. The sidebar separates canonical
components, product compositions and explorations. Automated scans supplement
manual keyboard and visual review; they do not certify accessibility.

Transaction compositions remain exploratory. Distinct issuance, zap, staking and
vote-lock mechanics stay product-owned. Story states never certify protocol
behavior, source freshness, financial calculations or production adoption.

Transaction-only keyframes and container rules stay in the preserved story owners’
`transaction-presentation.css`; importing production `app.css` is insufficient.

## Verification

- `pnpm storybook:build` creates the static library.
- `pnpm storybook:test` exercises the library in Chromium using its own server on port 6008; the dev library stays on 6007.
- `pnpm typecheck`, `pnpm lint` and focused component tests cover source changes.
- Product integration also runs the relevant existing Playwright product specs.

Inspect default and relevant edge states, mobile/desktop and both themes when
presentation changes. Use semantic behavior assertions rather than class lists,
source-code string checks or documentation-copy snapshots. Browser artifacts live
under ignored `test-results/`; they are not design approval or pixel baselines.
Engineer review is required for shared defaults, routing and the other integration
surfaces listed in [[project]].
