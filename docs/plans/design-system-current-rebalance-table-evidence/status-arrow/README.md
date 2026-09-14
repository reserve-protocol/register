# Compact current row — status and navigation

Lab-only follow-up, 2026-09-14. User approved auction context → status with
arrow → rebalance expiry, plus a narrow-width fallback. This supersedes the
[previous footer arrangement](../mobile-footer/README.md).

At compact container widths of 352px and above, the existing 32px circle is
centred on the status pill, not on any supporting warning beneath it. Below
352px it stays beside auction context so status/help retain full width. One
compact link remains mounted with its 44px hit region. Expiry stays label left,
counter right. Desktop, history, translations, permissions, state derivation,
transaction behavior and shared component defaults are unchanged.

## Visible right inset correction

The compact circle now ends at the same 24px content inset as the expiry value.
Its invisible 44px hit region extends 6px into the existing outer padding;
desktop and shared button defaults are unchanged. The preceding captures in
`final/` predate this small correction; current captures are in `inset-final/`.
[Inset RED](inset-red/browser-report.json) measured the visible circle 6px left
of the value at every compact width. [Inset verification](inset-final/browser-report.json)
passes 8/8: both themes and breakpoint bands, all-state containment, target-edge
clicks, navigation and Back. App/E2E types, scoped lint/format and wiki/whitespace
checks pass. Light 390px and dark 320px inspected; touch-up correctness/product
self-review found no change to state meaning, hit size or row behavior.

## Verification

- [RED](red/browser-report.json): status preceded auction context and the arrow
  remained beside auction context at ordinary phone width.
- [Initial follow-up](final/browser-report-initial.json): 16/17. Three unknown-
  auction states exposed a stretched grid item whose dash was not centred with
  the arrow. Local `self-center` fixes that geometry without changing data.
- [Final browser report](final/browser-report.json): **17/17**, no retries or
  mock-wallet sends. All 18 states fit 288/351/352/353/390/430/576/1023/1024px
  containers. Light/dark composition, pill/link alignment, help/link clearance,
  real help taps at 320/390px, navigation/Back, and es/ko/zh layouts pass.
- App/E2E typechecks, scoped lint/format, whitespace and wiki checks pass.

The broad scope script counted 3,155 accumulated changed files, not this local
slice; its lint launch stopped at pnpm's dependency preflight. No dependency
installation completed. The explicit scoped lint and type/browser commands above
passed with that preflight disabled; no full-repository gate is claimed.

Owner inspected light 390px, dark 320px fallback, Spanish 390px, and restricted
weight help. Low-profile correctness/product self-review: no duplicated action,
hidden restriction, changed status meaning or reduced hit target. Existing
24px insets and typography remain; no new copy or analytics interaction.

Human visual disposition and the bounded independent closing review remain
open. This is not production migration approval; the selected detail remains
a dated read-only reference. [Current scope](../../design-system-current-rebalance-table.md).
