# State-composition refinement

Lab-only review candidate, September 13. Contract:
[active refinement](../../design-system-current-rebalance-workspace.md#active-state-composition-refinement).
Fixed point `289b2af86e8245ced89d9058a09182799c65f825`; earlier dirty lab work is input.

## Changes and boundaries

- Compact hybrid setup, followed by an actual saved-units/allocation table.
  The canonical editor uses aligned rows and bounded desktop inputs. Saved units
  remain inspectable when prices are unavailable; dependent percentages do not.
- Live bids lead with both exchange legs, with bid number secondary; selection
  owns the expanded detail and corresponding schematic chart marker.
- Preparation retains 3:2; live uses 2:1, and removal gives the longer asset side
  more room. The first-run recap is compact. Terminal execution and financial
  groups retain all seven metrics without a progress rail.
- High impact stays visible before launch; cap explanations sit with their terms.
  Existing transaction-step feedback precedes the disabled action. Liquidity
  summary and Refresh are grouped, with full-width borderless inspection retained.

No production behavior, model, money arithmetic, persistence, shared default,
token, or analytics event changed. Proposed new status wording is held: the user
asked for more context rather than approving it. Hybrid exact-weight setup is
before the first auction, not a stage inside a live auction. Existing empty-bid
and launch copy remains imperfect; layout does not settle product wording.

## Evidence

- Initial RED: three missing saved-value/bid-leg/compact-context checks failed
  before implementation. [Report](../state-composition-red/browser-report.json).
- Initial implementation: 21/21 browser checks passed; owner inspection then
  caught a split uDOGE label at 320px. The corrected identity width and ordinary
  16px numerical columns are now explicitly tested.
- Broader matrix: [report](../state-composition-final/matrix-report.json), 58/59
  passed. The single rejected capture was a source-freeze violation caused by
  updating the area guide during that test, not a geometry failure. The two
  retained source variants differ only in `src/views/internal/design-system/CLAUDE.md`.
  That capture is not acceptance evidence; the final focused run repeats it.
- Dark review found percentages displayed after prices became unavailable.
  The rendered RED reproduced 3.92% instead of unavailable:
  [report](../state-composition-price-red/browser-report.json). The correction
  reuses CurrentValue while preserving saved units and recovery.
- [Final focused report](browser-report.json): 25/25 passed on the corrected data
  guard, including saved/error/pending/retry at four widths and the previously
  interrupted live capture. App/E2E typecheck and 27 focused model/workspace/result
  unit tests pass.
- Loading-inset follow-up: the narrow placeholder extended 9.59px past its cell
  into card padding. The [edge assertion failed](../state-composition-loading-red/browser-report.json)
  before a local max-width constraint; [all four widths now pass](loading-report.json).
  Both placeholder edges, saved-value recovery and token identity are checked.
  This last change is CSS-only; shared Skeleton defaults are unchanged. Scoped
  lint/format, E2E types, diff and wiki checks pass.

Browser replay uses Node 24.19, pnpm, one Chromium worker and isolated port 3022.
Set `pnpm_config_verify_deps_before_run=false` and
`CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-current-rebalance-workspace-evidence/state-composition-verified`.
Run `pnpm design-system:review` with these files:

- `e2e/design-system/current-rebalance-state-composition-lab-regressions.spec.ts`
- `e2e/design-system/current-rebalance-feedback-lab-regressions.spec.ts`
- `e2e/design-system/current-rebalance-editor-lab-regressions.spec.ts`

The broader run additionally uses the current actions, hierarchy and
visual-review regression files. Reports retain per-case source fingerprints;
attachment paths are report-relative and externalization verifies byte hashes
and a reconstructed-report digest. The user preview on 3005 was not stopped.
The last four-case replay adds `--grep 'saved weights expose'` to the
state-composition spec. Named saved-weight captures reflect that final run.

Owner inspected required/saved/editor, live/selected bid, no-bids, risk, launch
wait, initial/terminal and removal captures, including dark desktop and dark
320px outcomes. Start with [setup](states-1400-weights-required.png),
[saved phone](states-320-weights-saved.png), [pending phone](states-320-saved-prices-pending.png),
[live](states-1400-live.png), [risk](states-1400-risk.png), or
[outcome](states-complete.png). These are review candidates, not approved designs.

## Review reconciliation and remaining judgment

Dark: one Important data-availability finding, confirmed and corrected; bounded
source re-review accepts it and the 25-case post-fix runtime proof closes it.
Light: no scoped blocker after source and retained desktop/phone inspection;
specifically checked the corrected 320px saved values and token identity.
Neither review implies human design acceptance.

Engineer review remains required before production adoption: real chart meaning,
RPC/receipt/indexing truth, units and saved-weight persistence, metric definitions,
cap policy and filler navigation. The two-bid fixture does not establish a
high-volume history design. Long mobile liquidity inspection remains a known UX
question. No workflow-kit change: existing freeze, component-owner and visual
verification rules already cover this pass's corrections.
