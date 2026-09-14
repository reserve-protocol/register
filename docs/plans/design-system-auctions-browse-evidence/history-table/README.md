# Historical rebalance table — review receipt

September 13, 2026. Base `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`;
working-tree lab candidate, not a committed or accepted design.
The [slice contract](../../design-system-auctions-history-slice.md) owns scope.

September 14: [combined current/history mobile cleanup](../../design-system-current-rebalance-table-evidence/mobile-cleanup/README.md)
is the latest narrow-layout verification. It gives historical identity and
provenance full phone width while retaining static rows and existing metrics.
The September 13 captures and receipts below retain their original scope.

## Card-surface follow-up — September 13

The user requested card color and no gray row dividers. Only the history surface
and seams changed; navigation is retained pending their decision. The updated
browser check failed against the recessed surface, then passed 5/5 after the
change (both themes, phone/desktop, loading states and projection boundaries).
Scoped lint, formatting, wiki lint and whitespace checks passed. Fresh light
desktop and dark phone captures were visually inspected from the local Playwright
report; the captures retained in this directory describe the earlier styling.
No shared defaults or production behavior changed.

## Self-contained history follow-up — September 13

The user approved non-clickable history rows with NAV Change and dollar price
impact included. Proposer links remain independent; body and header hover
treatment is removed. The two new metrics use illustrative overlays with signed
NAV change and supporting dollar magnitude; unknown, zero and loading remain
distinct. Desktop is six columns; phone uses two paired metric rows.

RED: the focused history tests found row links and absent NAV/dollar values.
GREEN: 63/63 focused model, rendered and catalog tests; 5/5 history browser cases;
app/E2E typecheck, scoped lint, formatting and wiki/whitespace checks. The browser
suite checks physical non-navigation, no row hover, proposer navigation/focus,
both themes at 390/1400px, 895/896/897px boundaries and 320px pressure. Initial
phone captures centered the now-taller entire table and clipped the first row;
they now scroll the inspected phone row into view, retaining framing assertions.
Fresh desktop, boundary, 390/320px, unavailable-long-title and loading captures
were inspected in the local Playwright report. The retained image files in this
directory predate this follow-up and are not evidence of its latest layout.
This is a bounded lab pass, not production adoption, a full repository gate or CI.

## Width, provenance and help follow-up — September 13

The first column now takes the remaining width and Status uses 112px. At the
1400px viewport this returns about 50px to identity without changing numeric
column proportions, cell padding or typography. Provenance flows as a sentence,
retaining the full timestamp and keeping proposer attribution together. The
long record's metadata uses two lines at the 896px table boundary instead of
three. Whole-cell vertical centering is intentionally unchanged and now asserted;
aligning the primary numeric baselines was explicitly rejected.

Accuracy and NAV Change reuse the completed-view explanations through canonical
help controls. No substantive historical price-impact explanation exists in that
source, so none was invented. The help icon stays with its label's final word.

RED checks reproduced the old width, three-line provenance and missing help.
GREEN: 26/26 focused units, 5/5 history browser cases and 1/1 retained-record link
case, with browser suites run sequentially. Final help refinement was rechecked
with 6/6 history units, all five browser cases, app/E2E typecheck and scoped lint.
Browser coverage includes both themes at 390/1400px, boundary/320px pressure,
keyboard focus, Escape and return focus, clicks and actual 44px edge hit points.
Fresh final dark-phone and light-896px captures were visually inspected in the
local Playwright report. Retained images here predate this follow-up; they do not
document its latest widths, wrapping or help controls. This remains self-reviewed
lab work, not human visual approval, production adoption, a full gate or CI.
Wiki lint and whitespace checks pass. Scoped formatting passes except an existing
unrelated Portfolio coverage table in `e2e/TEST_MAP.md`, left unchanged. The owned
3047 preview is stopped; the user's 3005 preview remains running and was inspected
in the existing in-app tab with the updated history visible.

## What to inspect

- Compact-date follow-up: history alone now uses `Jul 1, 5:48pm` and
  `Nov 13, 2025, 4:39am`; weekday and leading zeros are removed, while attribution,
  timezone behavior and the machine timestamp remain. Four literal date cases
  failed before implementation, then all 30 focused tests passed, including the
  unchanged older record format and both history projections. App/E2E typecheck,
  scoped lint/format, wiki lint and whitespace checks passed. Current- and
  prior-year rows were inspected in the user's dark constrained preview on 3005;
  no browser regression suite was rerun for this formatting-only follow-up.
- Full-width table: Rebalance/provenance, Status, Rebalance accuracy, NAV Change,
  Total price impact with dollar magnitude, Traded with auctions-run context.
  Newest-first source order; only proposer provenance is linked.
- Constrained rows below 896px retain all information and proposer links.
  No doubled outer/content inset. The initial captures below show recessed
  surfaces and gray dividers; the September 13 follow-up supersedes that styling
  with the canonical card surface and no gray row dividers.
- Completed, expired, unavailable, zero, metrics-loading, whole-list loading
  and empty recovery. Outcomes/metrics are illustrative; identities are copied
  from retained snapshots. Missing metrics never establish lifecycle.
- Current rebalances, a selected pane, live adapters and actions are absent.
  The older record exploration is retained separately, not accepted by this pass.

## Verification

Commands use the installed Node 24 runtime and pnpm, with dependency verification
disabled for this existing offline install. Browser checks use the isolated
3047 preview, pinned e2e environment and one worker.

```sh
pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests src/views/internal/design-system/tests/component-catalog.test.ts src/views/internal/design-system/tests/catalog-ui.test.tsx
pnpm typecheck
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3047 pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review auctions-history-lab-regressions.spec.ts auctions-browse-lab-regressions.spec.ts auctions-composition-lab-regressions.spec.ts auctions-launcher-lab-regressions.spec.ts auctions-repeat-lab-regressions.spec.ts auctions-record-links-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts
node scripts/llm-workflow/wiki-lint.mjs
git diff --check
```

Focused units: 62/62. Browser results and source fingerprints are retained beside
this receipt: 27/27 history/retained cases and 2/2 desktop/mobile lab integration
cases. App/E2E typecheck and scoped oxlint/Prettier pass. The final history
checks include both themes at 390/1400px, 320px pressure, 895/896/897px boundaries,
actual mobile-cell width, physical row/proposer clicks, focus transfer, exact
loading-height parity, state recovery and no transaction effects.
The final five-case capture run is separately recorded in `final-results.json`;
`source.json` matches its guarded public-source digest. It retains 24 captures.
Visually inspected desktop defaults in both themes, the complete light phone
list, dark unavailable long content, desktop loading, the 896px boundary and
the corrected 320px value alignment. The owned 3047 server is stopped.

## Corrections and limitations

- RED: the old specimen did not render a Historical Rebalances table.
- RED: phone content used 179px of a 358px table despite no overflow. Moving the
  divider from `tr::after` into a real cell fixed the anonymous-column behavior.
- RED: at 320px the wrapped accuracy label put its value 20px below price impact.
  Local fact labels now flex within the stretched grid cells, aligning values
  without fixed heights, shortened copy or a new breakpoint. This final RED used
  a separate test browser on 3005; its GREEN and captures use owned 3047 again.
- A retained-record test initially still expected the old hash after opening
  an explorer popup. Its expectation now matches the separately retained route.
- Screenshot framing initially scrolled `window`, but the lab owns a nested
  scroll container. Captures now use native `scrollIntoView` and assert that the
  reviewed row is inside the ordinary viewport before attaching the image.
- Chromium needed execution outside the filesystem sandbox to launch. The
  initial sandbox launch error was environmental, not a rendering result.
- An accidentally executing scope run attempted dependency verification and
  aborted on pnpm's no-TTY install guard. No install completed. The subsequent
  scope dry-run reports correctness/product lenses; its 223-file size includes
  earlier dirty work and evidence. This isolated lab iteration remains low-profile.
- Self-review, not independent review or human visual approval. No full unit,
  full lint, smoke/full e2e, full scope gate, CI or production-adoption claim.
  Earlier audit findings and current-rebalance workspace decisions remain open.
- The user's 3005 preview was refreshed and the new history table verified in
  the existing in-app tab. No shared defaults, production code, dependency
  manifest, transaction, commit or push changed in this slice.
