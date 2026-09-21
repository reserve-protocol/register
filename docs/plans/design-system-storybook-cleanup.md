# Design system: Storybook migration and preservation

## Goal and fixed point

Replace the bespoke designer lab with Storybook while keeping every substantive
visual design area reviewable. Baseline: `2bfca0d1c1513e6f5d3a82c6d0245716a7821d00`
on `design-system-v1`. The initial representative-only migration was insufficient;
the user's expanded preservation request supersedes that narrower scope.

Preserve original presentation owners and their meaningful states. Use canonical
components where available; keep unadopted compositions as clearly labeled local
references. Do not invent generic replacement layouts. Old review dashboards,
readiness catalogs, bespoke navigation, capture infrastructure, source-string
tests and fake transaction execution engines remain retired.

## Desired experience

- A designer browses foundations, individual components, product patterns and
  historical explorations through the Storybook sidebar.
- Supported props and original fixture states are selectable in Controls.
  Important defaults, edge cases and responsive variants have direct story links.
- Docs explains usage, canonical imports and maturity. Code and accessibility
  panels use standard Storybook tooling.
- Light/dark themes, phone widths, keyboard behavior, loading, missing, disabled,
  long-content, recovery and outcome states can be inspected without wallet,
  RPC, subgraph or analytics startup.
- Introduction gives a short browsing guide. `src/stories/COVERAGE.md` keeps the
  migration map in the repository.

## Boundaries

No production adoption, changed financial calculations, API/default changes or
new universal transaction/table/chart controller. Original legal and transaction
copy is historical visual fixture content, not current policy or execution truth.
English-only stories stay excluded from production translation extraction.

Production import isolation is limited to unchanged leaf extraction: chart tick
and candle helpers plus the Discover card presentation. Original public import
paths retain exports. Storybook replaces only chart atoms and token-logo icon
state with local fixtures. Never patch a third-party dependency.

Preserve unrelated untracked `src/hooks/tests/use-index-dtf-transactions.test.ts`;
its three missing-export type errors and six unit failures predate this work.
The existing basket-overview wiki drift warning is also outside this task.
The September 21 request authorizes committing and pushing the completed migration
to the new `design-system-storybook` branch. Final review fixes only verified
regressions and removes redundant tests; production adoption remains out of scope.

## Work and ownership

The two user-authorized GPT-5.6 Sol High workers share the tree with the coordinator.
No nested delegation. Root owns integration, builds, browser checks and docs.

| Slice                             | Owner           | Deliverable                                                                                                                                                                           |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lab removal and component cleanup | Worker B + root | Remove legacy route/host/config/test scaffolds; retain canonical components, behavior checks and semantic tokens; component-owned brand CSS; clean translation catalogs               |
| Foundations and components        | Root            | Individual sidebar entries, supported controls, original typography/color/spacing/shape/motion/iconography/accessibility studies; long/empty/loading/error/unavailable cases          |
| Navigation and layouts            | Root            | Original global/product desktop/mobile navigation, Home without an active destination, DTF switching, connected/narrow headers, utilities; original workspace/workflow/layout studies |
| Market patterns                   | Worker A        | Portfolio/withdrawals, Holdings datasets, Discover cards/tables, Earn/DeFi/owned, governance; auction table/detail/editor/browse/history and access/data/outcome dimensions           |
| Charts and brand cards            | Worker A        | Overview line/candles and Home/Discover/Yield/Portfolio families; constrained/phone and empty/partial/missing/zero states; original organic card compositions                         |
| Transactions                      | Worker B        | Original Zapper/RFQ, manual/automated issuance, stake/unstake/delegation, vote lock/unlock/delegation, recoveries/outcomes/support; historical modal geometry                         |
| Storybook and coverage            | Root            | Docs, Code, a11y, theme/viewport tools; coverage map; local fixture isolation; focused browser suite; docs housekeeping                                                               |

## Acceptance evidence

| Requirement                          | Proof                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Designer intent survives             | Compare baseline presentations with actual story owners; source-to-story map; independent intent review; desktop/mobile light/dark inspection |
| Original state space stays available | Named important stories plus complete supported controls; all-story rendering and transaction state-control sweep                             |
| Library is usable                    | Real manager Docs/Code/Controls/a11y results, mobile navigation, overlay focus/scrolling and keyboard selection checks                        |
| Product isolation                    | Every named story produces no console/page errors, external HTTP, injected-wallet calls or WebSocket connections                              |
| Cleanup stays bounded                | Old lab imports/routes/hosts/process catalogs remain absent; canonical APIs and translation behavior retained                                 |
| Integration remains sound            | Storybook build/browser suite, focused unit tests, lint/typechecks, product build/smoke; baseline failures reported explicitly                |

Standard axe scans supplement manual review; they do not certify accessibility.
Screenshots are local inspection artifacts under ignored `test-results/`, not
pixel baselines or designer approval.

## Review and reconciliation

Review the whole goal once through Intent and Engineering Risk; after substantive
fixes revisit only affected findings. Findings are untrusted until checked against
current code. Do not restore process/catalog scaffolds merely because they existed.

Confirmed and corrected during integration:

- Generic replacement transaction layouts did not preserve the original design;
  replaced with direct presentation ports and thin story wrappers.
- A nested Storybook hook broke mobile global navigation; moved globals access to
  the CSF render function and passed theme controls to the reference component.
- Organic card barrel imports initialized wallet code; direct unchanged leaves
  preserve canonical cards without application startup.
- Intent review found missing auction dimensions, Holdings datasets/states,
  partial/constrained charts and Home navigation; all four findings were resolved
  and independently rechecked.

- Engineering review found an external loading image, retained transaction
  simulation transitions and missing initial modal focus. The original animation
  is local, fixed state selection replaces execution reducers, and the keyboard
  regression passes after the initial-focus correction. The same strict isolation
  observer now covers both named stories and transaction state controls.

## Final review and verification — September 21

Both independent reviewers cleared the four verified final-pass findings after
correction: Holdings tabs and chart ranges now synchronize canvas interaction with
Controls; the overflow chevron rotates; transaction keyframes and responsive quote
metadata rules live with their preserved Storybook owners. Browser checks confirmed
both controls, desktop/mobile metadata layout, all three outcome animations and
the chevron rotation. The proposed missing Bridge dialog was rejected: the original
lab classified that existing product reference outside its review scope.

Removed eight redundant tests: four Radix primitive behavior checks, a duplicate
Dialog focus check, an IconButton render smoke check, a primitive keyboard check,
and a screenshot-only job without visual assertions. Kept isolation, meaningful
application behavior, modal focus, Controls, accessibility tooling and API checks.

| Fresh verification                           | Result                                                                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm storybook:test`                        | Build + 8 browser tests pass; 272 stories and 124 transaction states render without page/console errors, external HTTP, wallet calls or WebSockets |
| Staged-source snapshot: TypeScript app + E2E | Pass; direct installed TypeScript CLI against the archived Git index, excluding unrelated untracked files                                          |
| Staged-source snapshot: Vitest               | All 950 tests pass in 112 files; direct installed Vitest CLI                                                                                       |
| `pnpm e2e:smoke`                             | 59 pass, 1 existing skip                                                                                                                           |
| `pnpm exec vite build`                       | Pass                                                                                                                                               |
| `pnpm lint`, formatting and diff check       | Pass; existing repository lint warnings remain                                                                                                     |
| Workspace scoped verification / full gate    | Blocked only by three pre-existing missing exports in the unrelated untracked hook test; that file is excluded from the candidate                  |
| `wiki-lint.mjs`                              | Only existing basket-overview source drift remains                                                                                                 |

Status: ready for review on `design-system-storybook`; commit and push authorized.
No verified task finding remains open. The source-to-story map remains in
`src/stories/COVERAGE.md`.

`pnpm storybook` remains on port 6007; static browser verification uses 6008.
Engineer review is required before merge for the initial migration's shared
API/default/routing changes and unchanged production leaf extractions. Designer
review decides adoption of exploratory transaction and historical modal designs.

## PR 1121 integration review

Fixed points: PR head `f3d1d826b`, master `356066697`. Merge master without
rewriting history, preserve AppKit/rebalance updates and the Storybook migration,
review the combined PR, and push the resolved branch. No production adoption or
new wallet behavior. Resolve documentation by retaining both current contracts;
validate the combined lockfile with pnpm. Acceptance: no conflicts, independent
Intent/Risk review, typecheck/unit/lint, Storybook isolation and product wallet
checks against the merged source. The unrelated untracked hook test remains out
of the commit.

Resolved all six conflicts by retaining Storybook plus master’s AppKit guidance,
wallet coverage and dependencies. Reconciled union-merge duplicates in the wiki
ledger/log. Both review lenses passed; the sole minor finding was an unused
DeFiLlama fixture from retired lab tests, now removed so the fixture matches master.
AppKit and the legacy rebalance fix remain unchanged from master.

Merged verification: frozen install, candidate app/E2E TypeScript, 950 unit tests,
8 Storybook checks (272 stories/124 transaction states), 59 product smoke passes
with one existing skip, 8 desktop/mobile wallet checks, Vite build and lint. Wiki
lint now passes all 21 pages after retaining master’s refreshed documentation.
The workspace gate still stops only on the unrelated untracked hook test; the
candidate snapshot excludes that file. Engineer review remains required for shared
component APIs and opt-in chart presentation extensions before merging PR #1121.
