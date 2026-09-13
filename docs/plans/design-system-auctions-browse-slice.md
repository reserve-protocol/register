# Auctions browse records — review preparation

This is the historical preparation and follow-up record. The current review is
the [history-only table](design-system-auctions-history-slice.md). The earlier
record exploration remains at `#auctions-records-review`; its visual and
state contract is the [composition refinement](design-system-auctions-composition-refinement.md),
which supersedes the 512px width, evidence rail, inline-only outcomes and
viewer-dependent Ready role below. Earlier verification receipts remain bound
to their recorded snapshots, not the current implementation.

## Contract

Base: `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`. Medium, one lab-local
stage. User authorized preparing the next Auctions record slice until visual
review is ready; no commit, production migration or transaction authority.

The checkpoint specimen combined invented CMC20 identities, permanently ready metrics,
placeholder routes, a false selected-row claim and an inert launch action.
Desired outcome: a participant can scan the active rebalance and historical
outcomes, distinguish pending/unavailable/zero data, and reach a real record or
its proposer without confusing those destinations. The designer can compare the
same record grammar at desktop browse-column and 390px phone widths.

## Experience and transfer

- Scan: title and lifecycle first, useful timing or outcomes second, provenance
  last. Preserve square surfaces, 24px inset, 16px region gaps, 8px related rows,
  16px/500 titles and inline metric emphasis from the August 18 decision.
- Failure/recovery: metrics-loading retains the identity and metric slots;
  unavailable uses the existing `—` convention, not zero or a permanent skeleton.
  Changing preview state retains width and auction-phase choices. Empty and
  list-loading do not fabricate navigable records.
- Access: record navigation and proposer explorer are separate native anchors;
  no nested links or pointer-only rows. Links open the correct source route in a
  separate tab to preserve the lab. No false `aria-current` or simulated routing.
- Agent/user affordances: labeled preview controls change offline specimens only;
  no wallet, permission, network adapter or action simulation is introduced.
- Rejected alternative: copying production's centered islands or implementing
  full live browse/detail selection now. The former contradicts accepted direction;
  the latter widens this bounded record review into engineering work.

### Source and disposition

| Owner / fact | Disposition |
| --- | --- |
| `e2e/snapshots/bsc/cmc20/governance.json` and `rebalances.json` | Copy minimal joined identity/date/window fields; unit-check against the original snapshots by execution block. Long title is an actual rebalance, not the unrelated long governance proposal. |
| Production `rebalance-list` | Preserve active/history order, section counts, timing, historical diagnostic jobs, provenance destination and empty wording. Loading skeletons use canonical owner in the new anatomy. |
| Independent rich-record research, old review worktree | Discovery evidence only. Its 96.4%, 1.51%, $84,210 metrics and ongoing auction were explicitly synthetic. Any reuse is visibly identified as an illustrative overlay, never captured CMC20 outcomes. |
| Current auction state absent from production list | Retain the accepted list-state direction with an explicit offline phase fixture. Live adapter and launch permissions remain engineer-owned. Long-running auction uses active indicator, not indeterminate spinner. |
| Completed on every expired production record | Preserve neutral closed semantics for historical records; zero-auction pressure uses the existing Expired vocabulary, not success. Final vocabulary remains a human review question. |
| Provenance date incorrectly links to proposer in production | Date remains plain text; proposer retains its own explorer link in the accepted one-sentence provenance layout. No new destination invented. |
| Selected detail context / launch actions | Context-only frame; no copied title masquerading as current selection, no enabled launch action. Exact split, route-backed selection and phone detail behavior deferred. |
| Governance / legacy / version branches | Preserve Governance specimen unchanged; legacy navigation, version branches and all detail/actions are later adoption work. |

### Exact reuse, geometry and truth

LifecycleStatusPill consumes the current 28px implementation **as a declared
provisional sizing dependency**; this task does not accept or change it. Metric
uses `inline`, local 500 value emphasis; Skeleton, Select and Switch use current
canonical APIs. Color and focus use semantic roles. No shared defaults change.

The record owns its single 24px inset; evidence region owns its 4px offset + 16px
inset and 1px rail; each record owns its 16px region gap. The list owns 1px seams;
the existing 512px browse trial bounds desktop reading distance. The phone
preview is 390px including the record inset. Lab controls/frame own no additional
record padding. The selected context remains outside the reviewable list.

Values are display fixtures, not financial calculations: identities and windows
are snapshot-derived; metrics and auction activity are explicitly synthetic;
unknowns remain null. Display-only percentage signs are pinned with literal
positive-cost / negative-cost / zero examples. No Number-based on-chain math,
SDK hook, global timer or live state derivation is added.

## Verification and review

Highest stable seam: mounted lab with strict offline Playwright; colocated tests
pin copied snapshot identity and display-state projection. RED proves missing
state control on the checkpoint before implementation. Fresh browser proof must
cover default and phone-dark long/missing state first, then both themes,
metrics loading → unavailable → ready, empty/list loading, zero, independent
phase/width controls, keyboard/provenance and actual link targets. Capture with
source guard on owned port 3043; never modify 3005 or Claude's 3047.

Scoped checkpoint checks: affected unit/catalog tests, app/E2E typecheck, rich
record and row-link browser checks, touched-file lint/format, source-bound
captures, wiki lint and docs housekeeping. No unrelated full repo gate or CI
claim. Lab interactions do not need product analytics.

One implementation owner. Repository-mandated Dark/Light read-only review pair
receives fixed point and this contract after a coherent diff. No shared writes;
coordinator verifies/dispositions findings. A missing reviewer remains pending.

Human review gates: pill vocabulary, useful timing/countdown presentation,
outcome labels, provenance and record density. Exact split/routing/detail,
production metrics failure handling and adapters require later engineer review.

## Evidence / closeout

**Human-review-required; initial implementation and bounded verification complete.**
The receipt below is the initial record-only snapshot. The repeated-auction follow-up
at the end owns the latest source and verification; earlier captures remain historical.
Review `/internal/design-system/components/table#auctions-browse-review` on the
existing 3005 preview. Start with Default at desktop width, then Constrained
column · 390px and Long content; compare the phase and availability states.
No design acceptance, production adoption, commit or push is claimed.

Final source digest:
`872ac7d9db9463eda250ce03b3702baf1759f52de8be3fe70426c57f442a7262`.
The [manifest](design-system-auctions-browse-evidence/record.json) retains all
12 browser results and 24 viewport captures from the final 3043 run. Ten cases
have matching public-source guards; the two legacy rich-record cases ran against
the same owned preview without individual source-guard receipts. All captures'
SHA256 values and the current public-source digest were rechecked at closeout.

Fresh checks after the final proposer-wrap edit:

- Playwright: **12/12, no retries**, covering both themes, phone/desktop, loading
  recovery, missing versus zero, independent phase/width controls, exact container
  boundaries, reduced motion, keyboard focus and physical record/proposer links.
- Vitest: **55/55 across five files** (model 8, mounted record 2, catalog 33,
  catalog UI 5, inventory reconciliation 7).
- `pnpm typecheck`: app and E2E pass. Touched TS/TSX oxlint and Prettier pass.
  Wiki lint: 20 pages green; relative links and diff whitespace checked.
- Eight final captures visually inspected: light 1400 default/unavailable;
  dark 1400 ongoing/constrained-long-unavailable; light 390 default/list-loading;
  dark 390 zero/long-unavailable. Remaining captures are retained, not claimed
  as individually inspected. The existing 3005 preview also exposes the new
  controls, full timestamps and real record links without a restart.

Reproduce the browser slice with existing dependencies (available Node 24.19.0,
pnpm 11.19.0; the repo's pinned pnpm is 11.5.2, no upgrade/install performed):

```sh
pnpm_config_verify_deps_before_run=false DESIGN_SYSTEM_PORT=3043 pnpm exec playwright test \
  --config=playwright.design-system.config.ts \
  --project=design-system-review --project=design-system-desktop --project=design-system-mobile \
  e2e/design-system/auctions-browse-lab-regressions.spec.ts \
  e2e/design-system/auctions-record-links-lab-regressions.spec.ts \
  e2e/design-system/table-row-links-lab-regressions.spec.ts \
  e2e/design-system/lab.spec.ts \
  --grep 'auction browse|table row links|source-grounded rich record'
```

Focused unit seam: `pnpm exec vitest run` with the two files under
`src/views/internal/design-system/auctions-browse/tests/` plus
`component-catalog.test.ts`, `catalog-ui.test.tsx` and
`inventory-reconciliation.test.tsx` under the lab's `tests/` directory. Use the
same dependency-check override. Existing React act-deprecation and Tailwind
ambiguous-duration warnings remain non-blocking; no full repository gate or CI
was run. No production, shared-default, live adapter or transaction behavior was
changed. Routing selection, detail overflow, metrics failure handling and launch
permission/copy reconciliation remain **Engineer review required** at adoption.

### Reconciliation and failure receipts

- Initial browser RED on the unchanged checkpoint: `rebalance-preview-state`
  absent. The new mounted state control and state matrix now exercise that seam.
- First visual pass exposed unsupported container-plugin shorthand in the new
  local composition. Replaced it with the existing arbitrary container-query
  syntax and added measured 512px boundary assertions. A test also incorrectly
  demanded wrapping where the title genuinely fit, and focused after pointer input
  without first entering keyboard modality; both harness assumptions were fixed.
- Dark review confirmed lost visible timestamp information. Restored production
  `formatDate`, including weekday/time; a mounted RED temporarily restored the
  date-only bug and failed on `8/3/2026` lacking time-of-day. Loading reserves the
  full provenance wrapping. The initial literal timestamp oracle typo was corrected
  against the snapshot epoch before the actual RED run.
- Light review found no scoped product/intent blocker. Both reviews require fresh
  final source-bound rendering, not acceptance by source inspection. Dark also
  requested physical date/metric click testing after the metadata became positioned.
  The physical date click returned no anchor in the RED run; the metadata now
  passes pointer events through to the record except its independent proposer link.
  Date, metric and padding clicks plus proposer navigation pass after that fix.
- Final visual inspection keeps “by” with the address as one wrapping unit so
  phone provenance does not strand the address on a separate line. The native
  link, full date formatter and loading geometry are unchanged.
- Existing broad rich-record checks contained counts for two now-replaced review
  notes. These stale assertions are updated while Governance checks remain intact;
  expanded Auctions behavior lives in the dedicated regression suite.
- Tooling: existing Prettier is used (oxfmt is not installed). The first scope
  command omitted `--dry-run` and the dependency-check override; pnpm bootstrap
  aborted before lint, with no module purge or dependency changes. Subsequent
  commands use the available Node 24 runtime and disable automatic dependency
  checks. Verification is the project's affected-checkpoint cadence, not a full
  production/integration gate or remote CI.

## Connected launcher wallet follow-up — September 12

User requested the active pre-permissionless record from a connected wallet with
permission to launch. Low-radius lab-only follow-up on the same `404bcbc41` base;
the cumulative uncommitted diff includes the previous completed slice, not a new
shared-default or authorization change. No commit or real wallet connection.

The separate Connected launcher wallet switch is a fixture input, independent of
auction phase, width and metric state. Restricted + authorized uses the existing
actionable Ready to start pill, while retaining Permissionless in 18h / Expires
in 1d 18h. Turning it off restores waiting. Permissionless and ongoing states,
historical records and real destinations remain unchanged. Preview explanatory
copy identifies simulated membership and assumes launch prerequisites satisfied;
no product labels or transaction controls are added. The earlier section-heading
and background recommendations remain unimplemented pending authorization.

Source grounding: `isAuctionLauncherAtom` checks the connected wallet against
`auctionLaunchers`; rebalance detail chooses the authorized launch branch and
suppresses it for an ongoing auction. The preview does not model live role
resolution, hybrid weight management, price readiness or launch execution. Those
remain engineer-owned adoption requirements. Existing 24px/16px record geometry
is unchanged; the new control uses the existing Switch and 44px label wrapper.
No new analytics event is needed for this internal fixture selector.

RED: the focused projection test failed with `waiting` instead of `actionable`
for the connected launcher in the restricted phase. Final GREEN: **11/11 local
unit tests and 10/10 browser cases**, no retries. App/E2E typecheck, scoped oxlint
and Prettier pass. Source guards match
`946b0166bf25f226b7c517a1ee846f79909a5700066c3020635c6ca359fbd4c6`.
All four authorized-wallet captures (390/1400, light/dark) were visually inspected;
their hashes and the current source digest match the
[follow-up manifest](design-system-auctions-browse-evidence/launcher-wallet/record.json).
The ordinary-state, loading, container-boundary and physical-link regressions
also passed in the same run. Low-profile intent/correctness/product self-review
found no remaining scoped blocker; human visual acceptance remains pending.

Browser command: the same `DESIGN_SYSTEM_PORT=3043` / dependency-check override
above with `--project=design-system-review` and the three specs
`auctions-launcher-lab-regressions.spec.ts`,
`auctions-browse-lab-regressions.spec.ts` and
`auctions-record-links-lab-regressions.spec.ts` under `e2e/design-system/`.
Units: `pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests`.
Wiki lint, relative links and diff checks pass. No production/shared-default
change, real role validation, transaction, full repository gate, CI or commit.

Verification friction: sandbox denied the first preview listener before tests
ran; the permitted rerun used the same isolated port, leaving 3005 untouched.
The first browser run passed the six existing cases but the four new cases
compared `innerText` with the matcher's default `textContent`; the preserved
history assertion now consistently uses `innerText`. No product change was
needed for that harness mismatch. The final run above supersedes both attempts.

## Repeated-auction follow-up — September 12

User requested an active rebalance that has run auctions but still needs another.
Low-radius lab-only follow-up on `404bcbc41`; the cumulative scope size includes
earlier completed work and retained captures. No production data/permission
contract, shared default, real transaction, or architecture change is authorized.

Production numbers the next auction as `rebalanceAuctionsAtom.length + 1` in
`launch-auctions-button.tsx`; `use-is-rebalance-completed.ts` checks active auction,
expiry/completion and metrics independently. The metrics library's EJECT/PROGRESS/FINAL
round is not this ordinal. The preview therefore adds an independent Auctions run
selector with 0/1/2 **fixture choices, not a protocol maximum**. Two auctions run
shows Auction 3 ready to start or ongoing, with a supporting count of 2. It never
predicts a final total, interprets the gap as failure, or derives completion from
count. All ready examples assume outstanding rebalance work and launch prerequisites
satisfied; actual readiness and completion remain engineer-owned at adoption.

Default 0 preserves existing record geometry. Positive counts add one inline
metric using the current Metric owner; phase/countdowns, wallet, history and
availability remain independent. The third Select extracts the repeated lab
control block locally; no shared control behavior or product analytics change.
The proposed operational hierarchy, backgrounds and wider browse/detail trial
remain separate visual decisions, not silently included in this fixture pass.

RED: three projection assertions returned Auction 1 instead of Auction 3.
The first browser run passed the ten existing cases but its four new keyboard
cases selected 0: the test pressed Enter before Radix's deferred End-key focus
move. It now waits for the actual focused option before confirming, with no
arbitrary timeout or product workaround. The isolated phone rerun then passed.

Final GREEN: **14/14 local unit tests and 14/14 browser cases**, no retries.
App/E2E typecheck and scoped oxlint/Prettier pass. All four repeated-auction
captures (390/1400, light/dark) were visually inspected; the new third metric
fits without clipping, and existing loaded/loading height parity is retained.
The [follow-up manifest](design-system-auctions-browse-evidence/repeated-auctions/record.json)
contains all fourteen source-guarded results and four hashed viewport captures.
Public source digest:
`d2d9784ead291635a6c48f0466263c275baa5b20b879182c8586a0f0a7bc2a18`.

Reproduce with the launcher-wallet browser command above, adding
`e2e/design-system/auctions-repeat-lab-regressions.spec.ts` to its three specs.
The focused unit command is unchanged. Low-profile intent/correctness/product
self-review found no scoped blocker: state recovery retains count, current
auction is excluded from auctions already run, history is unchanged and no
final total is fabricated. Human visual acceptance remains pending. No full
repository gate, CI, production/shared-default changes, transactions or commit.
