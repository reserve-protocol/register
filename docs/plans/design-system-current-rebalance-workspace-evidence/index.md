# Current rebalance workspace — verification

The September 13 auction-owned hierarchy revision is ready for human review,
not production adoption. This receipt supersedes the earlier 27-case workspace
receipt and its rejected geometry. Contract:
[workspace brief](../design-system-current-rebalance-workspace.md).
Claude's [source audit](../design-system-current-rebalance-flow-audit/report.md)
is preserved unchanged.

The [September 13 checkpoint](../design-system-review-checkpoint-evidence-2026-09-13/README.md)
losslessly externalizes this package's report attachments. Resolve attachment paths
relative to their JSON report. Historical timestamps/source digests remain unchanged;
fresh checkpoint captures live separately and do not overwrite these named images.

## Compact spacing — current candidate

The compact liquidity assessment and live Ends in pair now opt into an 8px gap,
instead of inheriting the 16px minimum from full-width detail rows. Their label
and value remain 14px/20px. Launch terms, totals and other aligned detail rows
retain their defaults. Expiry is a normal-weight sentence in proposal metadata;
the clock is removed, Details stands beside the title, and narrow metadata lines
share a left edge without a dangling separator. No production behavior changed.

RED reproduced the 16px liquidity gap and expiry outside provenance. The
[spacing/layout report](final/spacing-report.json) passed **28/28** at 14:10:45 UTC,
with public digest `f73df7a57d9030fe92a2c4dcd8410e908e6b09cd0818c52faff2014425f900e8`.
It covers sections, compact pairs, live/expired states, liquidity, header and
hierarchy. The subsequent narrow-header alignment has its own
[final header report](final/spacing-header-report.json), **8/8** with no retries,
at public digest `50d7102bb01de1cf71ce2623738bb63e2ef5e414f5dca23159bd233b02dac3e2`.
It does not invalidate
the unchanged liquidity/operation results or imply a full lifecycle rerun.

Owner inspected final [desktop header](final/header-light-1400.png),
[390px header](final/header-light-390.png), [320px dark](final/header-dark-320.png),
[expanded desktop](final/sections-light-1400-expanded.png) and
[expanded phone](final/sections-light-390-expanded.png). The latter pair belongs
to the 28-case spacing checkpoint; only header metadata changed afterward.
Self-review covered intent, correctness, default preservation and responsive UX.

The focused transaction composition unit suite passed **45/45**, protecting the
reused detail row's existing consumers. App/E2E typecheck, scoped lint and format
pass; repository lint exits zero with existing warnings. The broad scope runner
includes 525 accumulated files and is not this isolated follow-up's gate. Its
first lint launch lacked the runtime dependency-check override and aborted before
running lint; rerunning lint with the established local runtime passed. No package
or lockfile changed, no installation was completed, and no CI/full-suite claim
is made. Low profile: the only reused API change is opt-in, not a shared default.

Keyboard verification caught a harness race after immediate reopen: visibility
preceded focus readiness. The first correction incorrectly expected link autofocus;
source inspection confirmed Radix excludes links and initially focuses the panel.
The test now waits for that actual panel focus, Tabs to the first link, then checks
Escape and return focus. The interrupted test preview was identified and stopped
on 3022 before rerunning; user 3005 remained untouched.

## Earlier section boundaries

Two inset canonical Separators now distinguish general header, working auction
and cumulative results, without new card surfaces or nested outlines. Auction N
and Rebalance so far share the 16px heading role. The subordinate 14px disclosure
keeps label, token count and chevron together at every width; its expanded table
still spans the working area. Estimated trade liquidity is inside the disclosure,
not detached beneath Buying. Specific warnings remain visible before launch.

Fresh [section/action/detail/hierarchy report](final/sections-report.json):
**27/27**, no failures, retries, skips or flaky cases; September 13 **14:00:59 UTC**.
All 27 source attachments share public digest
`747a4d9df7e8ccc70680792dfaa296036324ed735123edcaa0633604d1504bed`
(2,413 files). App/E2E typecheck and scoped lint/format pass. No unit/CI/full-repo
rerun is claimed for this isolated visual follow-up; shared defaults and production
auction logic are unchanged. Owner self-review covers intent, correctness and UX.

RED proof caught absent boundaries, a **1,336px** stretched disclosure and its
section-sized label. GREEN covers 24px boundary spacing, matched content axes,
compact control and visible count, 44px-or-larger hits, keyboard open/close,
full-width expanded rows, live/expired continuity, role/data/transaction recovery,
liquidity retry and history handoff. No wallet sends occurred.

Owner inspected [desktop](final/sections-light-1400.png),
[phone](final/hierarchy-390-repeat.png),
[320px expansion](final/sections-light-320-expanded.png),
[dark desktop](final/sections-dark-1400.png),
[dark live middle width](final/sections-dark-900-live.png) and
[cumulative/history context](final/sections-light-390-progress.png).
These captures supersede prior section geometry, not human design acceptance.
Direct inspection on 3005 also checked the expanded table's final rows and totals
above the separator, cumulative results below it, and history following the card.
The test preview used and released its own 3022 port; user 3005 was not restarted.

## Earlier header follow-up

Subsequent copy-only cleanup removes the redundant connected-launcher label above
Start auction. Restricted-access guidance remains for visitors/non-launchers;
permission checks are unchanged. Scoped lint/format and direct preview inspection
cover this cleanup; the frozen browser digest below precedes it.

The user rejected the vertically stacked expiry and rounded information trigger.
The popover opened in direct reproduction; the malformed appearance came from
zero horizontal padding on a rounded quiet Button. The private header now pairs
clock/expiry with the canonical text-only InlineAction labeled Details. Both use
14px/20px; the actual 44px trigger has no rounded hover fill and its arrow rotates
when open. The panel can scroll if constrained. No shared defaults or auction
behavior changed. Low-profile isolated UI fix; owner self-review covered intent,
correctness, responsive geometry and keyboard access.

[Header/hierarchy report](final/header-report.json): **18/18**, no failures,
retries, skips or flaky cases, September 13 **13:52:42 UTC**. All 18 attachments
share digest `5c06afd27f5aaa683768c5049afd92e9d95a324e5843b273ddf1c8269af8757a`
(2,412 public files). Eight header cases cover light/dark 1400/900/390/320,
same-axis metadata, transparent hover, real touch targets, open/closed chevron,
panel fit, click/Space/Escape/focus return and expired inspection. The ten existing
hierarchy cases also pass. App/E2E typecheck and focused lint/format pass.

The regression failed before the fix on a **32px vertical center mismatch**.
Owner inspected [desktop](final/header-light-1400.png),
[middle width](final/header-light-900.png), [phone](final/header-light-390.png),
[320px open panel](final/header-light-320-open.png),
[dark open panel](final/header-dark-1400-open.png) and
[dark narrow header](final/header-dark-320.png).
This scoped pass supersedes header geometry in the baseline below; it does not
claim a fresh full lifecycle/unit run. The browser suite used its own 3022 preview.

## Earlier hierarchy baseline

The frozen current/history browser run passed **37/37**, with no failures,
retries, flaky cases or skips. It began September 13 at **13:39:52 UTC**.
[The report](final/browser-report.json) originally attached 96 ordinary-viewport
PNGs in `final/`; hierarchy captures were refreshed by subsequent follow-ups.
Thirty current-source attachments shared the public digest below;
the other seven retained composition/history cases ran in the same frozen suite.

Public source digest:
`211cf47c466aaba6d7b1e69213b30f6e6dfaffe63803702157fdcd5732eafec8`
(2,411 public source/config/test files; private environment hashes never emitted).
A post-run source read matched it at that baseline. All **81** production auction
files matched Claude's source fingerprints; the follow-up touches lab files only.

Node 24.19.0 and bundled pnpm 11.19.0 were used; this is not a matching-pnpm/CI
claim (project pin: 11.5.2). No dependencies were installed. Per-command
`pnpm_config_verify_deps_before_run=false` bypassed the bundled runner's attempted
dependency reconciliation. The first attempt aborted before removing dependencies.
Tests created and stopped their own single-worker preview at `127.0.0.1:3022`.
The user's existing 3005 preview was not restarted or navigated; 3043 was untouched.
HEAD remains `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`; unrelated dirty work and
audit packages are preserved. Nothing committed or pushed.

## Baseline checks

- `pnpm typecheck`: app and E2E TypeScript pass after the final source changes.
- `pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests src/views/internal/design-system/tests/component-catalog.test.ts`: **91/91**, nine files.
- Scoped `pnpm exec oxlint` and `pnpm exec prettier --check`: current workspace,
  rich-record integration and current browser specs pass without lint findings.
- Browser command: `pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review --reporter=line,json 'current-rebalance-.*lab-regressions.spec.ts' auctions-history-lab-regressions.spec.ts`.
  The JSON output is the report above. One worker and zero configured retries.
- Ten hierarchy checks cover ownership, card surface, 1400/900/390/320 geometry,
  real 32px logos, readable failed-row identity, resize focus, general reference
  scope, natural outcome spacing and single recovery after expiry during indexing.
- Existing lifecycle coverage remains: receipt/indexer waits, no re-arming,
  rejected/reverted recovery, role/network/phase gates, hybrid draft/CSV/limits,
  bid details, repeat rounds, expiry, missing data, two records and history handoff.
- `scope.mjs --base 404bcbc414cf54eed988a9e6c95b74fa0c6e7251 --dry-run`:
  correctness/product lenses, medium size hint, no red flags. The accumulated
  dirty tree includes hundreds of retained evidence files with unmapped checks.
  The V1 bounded-checkpoint override applies; this is **not** a whole-repository gate.
- Wiki/relative-link/diff checks pass. No full repository suite, CI or production
  E2E claim is made. Existing test-environment deprecation/optional remote-config
  warnings and unrelated Tailwind duration warnings remain.

## Baseline visual judgment and corrections

Owner reviewed preparation, repeated auction, live monitoring, hybrid/editor,
warning/recovery, completion and history context, in light/dark desktop and phone.
Direct browser review additionally checked 900px and 320px in both themes,
the general-information popover at 320px, and native table/row/cell accessibility
structure before/after reflow. Browser tests retain focused disclosure through resize.
Temporary review tab and viewport override were cleaned up; light theme restored.

Start with [repeated auction](final/hierarchy-1400-repeat.png),
[900px layout](final/hierarchy-900-repeat.png),
[phone](final/hierarchy-390-repeat.png),
[live monitoring](final/light-1400-live-top.png),
[320px warning row](final/hierarchy-320-liquidity.png),
[completion](final/hierarchy-complete.png), or
[320px weight editor](final/weights-320-top.png).

RED proof preceded the ownership change (missing shared Auction N section).
Further rendered REDs exposed 20px logos despite utility sizing, a 46px clipped
ticker at 320px, a duplicate outcome count, a 24px apparent label/value gap, and
two recovery regions after expiry during indexing. Public logo sizes, narrow
recovery stacking, natural metric spacing and single ownership fix those cases.
The expired pending operation also retains its Auction N identity.
General inspection no longer carries invented debug volatility.

[Independent review reconciliation](reconciliation.md) records the final
Intent/Risk pair and focused correction reviews. Both axes have no remaining
verified blocker. This is review readiness, not human design acceptance.

## Adoption boundary

**Engineer review required before adoption:** live-auction truth, both real write
paths, reverts/indexer lag, permission/network handling, weight units/persistence,
cap policy, filler/router blocking and v4/v2 coverage. The lab sends no signatures
or transactions and introduces no SDK/financial adapter. New explanations marked
`Lab` are not approved product copy. Curves, bid values and liquidity estimates
remain illustrative; NVDAon pressure is not an actual CMC20 holding. File import
is represented; production drag/drop is not. No workflow-kit change was needed:
the existing component-owner and mounted-geometry rules covered the failures.
