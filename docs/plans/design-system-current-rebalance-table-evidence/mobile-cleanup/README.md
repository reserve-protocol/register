# Current and historical tables — mobile cleanup

September 14, 2026. Low-profile, lab-only follow-up against the existing dirty
`design-system-v1` worktree. [Scope owner](../../design-system-current-rebalance-table.md#near-term-and-deferred-scope).

The later [compact footer follow-up](../mobile-footer/README.md) changes the
current-row arrow/expiry arrangement. This receipt retains the initial cleanup
geometry and historical-table proof, not the later footer layout.

## Changes and preserved boundaries

- Current status and auction facts remain stacked below a 576px container.
  The old 384px cutover squeezed the pill onto two lines and overlapped its
  helper at a 430px phone viewport and in the 390px constrained column.
- Historical identity and provenance take the full width below 512px; status
  follows that group. Wider compact rows keep status alongside identity.
  This removes the avoidable two-line default title at 320px and gives long
  titles room without truncation, smaller text or missing metadata.
- Removed only the current table's 4px bottom padding. Its hover surface now
  reaches the bottom edge. The static history table's desktop footer is retained.

The desktop table cutovers (current 1024px, history 896px), 24px content insets,
whole-cell centering, typography, shared component defaults, copy, permission
and timing semantics, financial values, links and transaction behavior remain
unchanged. No production integration, dependency installation or commit.
The deferred auction workspace was not edited. No new lab analytics event.

## Verification

The [RED report](../constrained-red/browser-report.json) has two expected layout
failures and two passing first-tap historical helper checks. Layout assertions
reproduced the 4px strip, title compression, wrapped pill and crowded status/round
composition. The same four checks passed after the two local table-file edits.
Historical helper taps already worked; their implementation was left unchanged.

The [final combined report](browser-report.json) passes **34/34**, no retries or
mock-wallet sends. It covers both tables in light/dark, 320/390/430/608/768/1072px
views and a 390px constrained column; all 18 current examples across 288–1024px
containers, including either side of the 576/1024px cutovers; history's
895/896/897px boundary; loading, unavailable, zero and long-title states;
real 44px navigation/help hit regions, first-tap toggles, keyboard/resize/Back
focus, static history rows and independent proposer links. es/ko/zh checks
include 320px phones and single-line pills at 430/608/1072px.

App/E2E typecheck and 48 focused history/catalog/UI unit tests pass. Scoped
lint/format, wiki and whitespace checks pass. Existing tool/dependency warnings
remain (Tailwind duration ambiguity, React testing/deprecation and unavailable
remote wallet configuration); no new failure or dependency change.

Owner inspected ready/live/weight-setup phones, both themes, intermediate-width
composition, desktop preservation and the constrained unknown long title.
The mounted 3005 preview was also confirmed available with the updated source.
The source guard stayed unchanged during every browser test. The area guide and
verification documentation were updated afterward; no application code changed.
RED and final evidence are retained; superseded before/intermediate screenshots
were moved outside the repository to temporary storage, not added to checkpoints.

## Review limits

Local correctness/product self-review, not independent review or human visual
acceptance. The remaining bounded closing review and engineer-owned production
integration gates in the scope owner are still open. Fixture values and all-state
examples are illustrative, and dated deeper-page captures are not a working
production-flow migration or a mobile-detail parity claim.
