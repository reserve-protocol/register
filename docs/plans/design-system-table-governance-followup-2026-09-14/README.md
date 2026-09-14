# Table and governance lab follow-up — September 14

Subsequent user review requested a [compact Earn rate-help refinement](earn-rate-help/README.md).
That receipt owns its newer source and verification; the batch below remains
the historical integration record, not evidence for the later layout change.

Scope: integrate the two prepared non-auction table fixes and finish bounded
governance layout work without new product decisions. User authorization:
“Go ahead with the pieces you can finish without my help.”

## Boundary and changes

Fixed point: `289b2af86e8245ced89d9058a09182799c65f825` plus inherited dirty work.
The prior [auction closeout manifest](../design-system-current-rebalance-table-evidence/closeout/source-final.json)
identifies the actual starting source. No commit/checkpoint, dependency install,
production migration, shared default, token, wording or data change is authorized.
Low-profile local lab layout work; self-review covers intent, correctness,
product and complexity. `scope.mjs --base 289b2af86 --dry-run` reports medium
from 3,432 accumulated changed files, not this bounded three-owner layout patch.
No trust/shared-contract/control-flow change warrants that larger profile here.

- **Earn:** constrain the compact identity button and wrap its supporting label
  within its allocated cell. The full label stays visible beside the rate.
- **Owned positions:** let Balance/Value wrap as complete facts when long numeric
  strings cannot fit as a pair. Preserve every digit, unit, action and sort value.
  Short facts remain paired; Governs/APY retain their existing pair.
- **Governance:** below 28rem of record content width, put unchanged Fast/Contested
  qualifiers below a full-width title and decision evidence below status.
  Stack standard Quorum and vote evidence without a stranded divider; preserve
  inline grouping at larger widths. Keep
  the lab's review notes content-height instead of stretching beside the list.

The actual source changes are the two local column owners and
`governance-proposal-state-review.tsx`. Two focused browser specs and the lab
area guide describe/prove those boundaries. The original
[overnight patch](../design-system-overnight-2026-09-14/isolated-layout.patch)
is retained as historical evidence; its changes are now integrated, not a patch
to reapply. The active Current Review remains Auctions.

## Subsequent governance review refinement

The later [interactive content hover trial](../design-system-content-hover-trial.md)
supersedes this refinement's gray hover overlay with an opaque, theme-owned
candidate across three lab families. It does not promote either to acceptance.

September 14 feedback supersedes the initial narrow arrangement described above:
Fast/Contested now precedes the narrow title; Quorum and Votes have supporting
labels above their unchanged values and sit side by side when their full groups
fit. Smaller widths wrap whole groups. Wide records retain their previous inline
presentation. Optimistic challenge evidence, lifecycle/timeline, destinations and
all figures are unchanged.

The lab-only Constrained proposal column switch caps only the governance list
at 390px and retains all 11 examples. It has no analytics event or persisted state.
Row wrappers retain the card background beneath the existing semantic subtle
hover role; previously a half-transparent muted background replaced the card and
exposed the near-black separator substrate in dark mode. Shared defaults and
tokens remain unchanged. The approved new labels use Lingui; the new control has
English, Spanish, Korean and Chinese catalog entries.

The existing governance layout spec now covers these relationships, keyboard
toggle/recovery, unchanged Earn width, both hover themes and reference navigation.
RED confirmed the missing control. An initial verification run passed layout and
hover but caught a test setup race: it read text before the 11 records mounted.
Waiting for that record count corrects the test without changing application code.
This remains a low-radius lab refinement; no production or financial behavior
changed, and the engineer adoption boundary below remains in force.

Final refinement verification: 6/6 governance layout/control/hover/navigation
checks and 2/2 retained rich-record checks passed on the isolated 3047 preview.
Application/E2E types, scoped lint/formatting, wiki lint and whitespace checks
passed. Inspected constrained light, 320px dark, and both actual hovered-row
captures; the existing 3005 browser was also checked for the new control and
loaded hover classes without reloading. The isolated runner stopped normally.
The scope tool's medium hint reflects 3,494 inherited branch paths, not this
local owner, its spec, four translation entries and documentation updates.

## Fresh verification of the initial batch

| Pass | Evidence and scope | Result |
| --- | --- | --- |
| Initial RED | [Receipt](red/results.json): Earn text overlap, Owned split number, narrow governance grouping, stretched notes; original inventory also ran | Four expected product failures; four inventory passes |
| First GREEN | [Receipt](green/results.json), both themes | 8/8 |
| Surrounding suite | [Receipt](combined/results.json): Earn states/actions/loading/sorting, Owned states/disclosure/touch/Modify/navigation, new local regressions and governance inventory | 46/46; no skips/retries |
| Visual boundary follow-up | [RED](boundary-red/results.json): at 527px the narrow evidence stack could sit beside/above status. Its outer group now also stacks until enough width is available | One expected failure before the final grouping correction |
| Final affected suite | [Receipt](final/results.json): both new specs, including all 11 governance records at seven widths, keyboard Tab/Enter and overview popup, both themes, Earn/Owned literal pressure cases | 16/16; no skips/retries |
| Retained contracts | [Receipt](retained-contracts/results.json): existing rich-record test in desktop and emulated mobile projects; familiar governance statuses, evidence, spacing, timeline tones and retained auction record contracts | 2/2 |

The 46-case surrounding pass preceded only the last governance outer-group
correction; Earn/Owned source has not changed since. Final source is bound by
[this manifest](source-final.json): 2,441 files, digest
`cb478e0a75429ec04cbdead91b1346427d6f8e5f8253b42e77cd59985280cb14`.
Compared with the auction-closeout starting manifest, exactly six watched paths
changed: three local app owners, two added specs, and the lab area guide.

Additional fresh checks: 29/29 Earn/Owned unit tests; application/E2E typecheck;
scoped oxlint and Prettier; wiki lint; local links, retained-image hashes and
whitespace checks. Final source comparison is unchanged after verification.

### Reproduce

Use the project's existing Node 24 runtime and pnpm dependencies (no install).
This machine's existing pnpm is 11.19.0 versus declared 11.5.2; no tooling changed.
Set `pnpm_config_verify_deps_before_run=false`, `DESIGN_SYSTEM_PORT=3047` and
`CURRENT_REBALANCE_CAPTURE_DIR` to a temporary directory. The isolated listener
is owned by the runner, never the user's 3005 preview.

```sh
pnpm design-system:review overnight-lab-regressions.spec.ts governance-record-layout-lab-regressions.spec.ts earn-family-lab-regressions.spec.ts earn-recovery-lab-regressions.spec.ts owned-positions-lab-regressions.spec.ts
pnpm design-system:review overnight-lab-regressions.spec.ts governance-record-layout-lab-regressions.spec.ts
pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-desktop --project=design-system-mobile lab.spec.ts --grep 'renders the source-grounded rich record review'
pnpm exec vitest run src/views/internal/design-system/tests/earn-family.test.tsx src/views/internal/design-system/tests/owned-positions.test.tsx
pnpm typecheck
```

RED used the same two specs with `--grep 'Earn identity.*light|Owned amount.*light|governance.*light'`.
Boundary RED used the governance spec with `--grep 'governance narrow grouping light'`.
Reports retain all outcomes/attachment hashes and selected image bodies, not
complete raw browser archives. Raw-report hashes are included. Existing Tailwind
duration warnings and unit-library initialization/deprecation warnings remain;
they did not fail checks or prompt dependency/data changes.

### Review and limits

Self-review found no remaining blocker for this bounded layout batch. It sought
peer text collisions, split numeric text, qualifier squeeze, orphan dividers,
mixed intermediate grouping, changed labels and lost keyboard navigation. The
intermediate grouping escape was caught visually, given a failing regression,
then fixed. No source fixture values, wording, semantic tokens, shared component
defaults, route destinations or production files changed. This does not approve
the entire governance composition, original timelines or financial meaning.

Retained final light/dark phone, boundary and desktop captures support layout
review. Checks use Chromium and offline fixtures, not a real wallet, physical
device, screen reader, translated-content audit, full CI run or transaction flow.
No new analytics event is needed for local layout changes with unchanged actions.

The owned 3047 listener stopped; the existing 3005 listener remained running
without restart. No commit, checkpoint, install or shared workflow change was
made. The existing real-surface checks plus local guide updates address the
demonstrated escapes; no workflow-kit expansion was justified.

## Deliberately unresolved

- The later authorized [presentation closeout](../design-system-governance-presentation-closeout.md)
  supersedes the countdown/timeline questions and adds Expired, loading/empty and
  a separately supplied queued-ready example. Its proof is separate from this
  historical 11-record receipt; human visual acceptance remains separate.
- Show all, real deadline crossings, eligibility, submission and recovery remain
  unimplemented. All rows still open the same overview reference, not individual
  production proposals.
- **Engineer review required before production migration:** preserve proposal
  identity, governor, lifecycle/tally/time derivation, optimistic versus standard
  evidence, and vote/queue/execute authority. None changed in this batch. The
  [governance assessment](../design-system-overnight-2026-09-14/governance.md) and
  [central register](../design-system-v1.md#deferred-engineering-review-register)
  remain the engineer handoff, not the lab fixture labels.
- Chart visual work and source/financial-meaning questions remain separated in
  the [chart brief](../design-system-overnight-2026-09-14/charts.md) and
  [engineering note](../design-system-overnight-2026-09-14/chart-engineering.md).
  No chart, rate, freshness, SDK, RPC/subgraph or on-chain calculation changed.

Implementation verification is not human visual acceptance or engineer adoption.
