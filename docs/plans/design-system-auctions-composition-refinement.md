# Auctions browse composition refinement

Superseded review direction: the [historical table pass](design-system-auctions-history-slice.md)
now owns Current Review. This record exploration is retained at
`#auctions-records-review`; active workspace composition is deferred. The
[state-led list revision](#state-led-list-revision--september-12) and earlier
receipts remain evidence for their own source snapshots, not current acceptance.

## Decision and evidence

Base: `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`; existing uncommitted Auctions
work is inspected input. Medium, one contained lab stage: user authorized a
coherent recommendation, not literal implementation of every earlier thought.
This revisits the August 18 inline-selector composition provisionally; it does
not rewrite accepted decisions, shared defaults, Governance or production.

## User/caller usage

- A disconnected potential launcher sees a ready rebalance, the restriction on
  launching, and when access opens. Connecting the simulated launcher changes
  the access explanation, not whether there is work ready to do.
- A participant sees an ongoing auction's end time. Two ended auctions remain
  supporting history, never a final total or a claim that the rebalance is done.
- Historical rows emphasize outcomes; missing metrics stay unavailable, zero
  remains zero and loading preserves the selected state's geometry. A known
  launch-price prerequisite failure replaces ready-to-start, without claiming
  that the rebalance failed or stopping an ongoing auction.
- A history-only fixture retains past outcomes when no active rebalance exists;
  its selector label reuses production `Historical Rebalances`.

## Agent affordances

Existing labeled state/phase/count/wallet/width controls remain independent,
offline and keyboard reachable. The price-unavailable option reuses exact
production preflight wording. Native record/proposer links remain separate;
no wallet connection, authorization check, transaction or fake detail selection.

## Constraints and non-goals

- Preserve snapshot identities, timestamps, window values, metric meaning and
  source labels. Reuse `Only the auction launcher can start auctions` from the
  community launch help, `Connected launcher wallet` and `Permissionless` from
  existing lab controls, and `Price unavailable — cannot launch` from production
  preflight. No invented product wording or dynamic readiness derivation.
- Content surface for the active section; recessed content for history including
  its header. Quiet 14px section labels; record titles and values retain 16px/500.
- A 640px browse trial replaces 512px; the context pane remains blank/context-only.
  This is a reading-width trial, not proof of the final browse/detail split.
- One 24px record inset; 16/24px internal groups; no inset evidence rail, nested
  metric cards, decorative progress, or new icon/color/default variant.
- Real price failure versus permissionless-launch mechanics remains engineer-owned.
  The offline negative readiness example is a presentation target only.

## Candidate output contract and ownership

One implementation owner, feature-local model/record/control helpers and tests.
Ready state uses the canonical actionable role for either viewer; a separate
plain-text access line states the restriction or simulated launcher context.
Ongoing uses active status, not a spinner. A blocking prerequisite uses existing
warning-message anatomy and suppresses Ready to start. Two active timing groups
use unframed 16px icons above left-aligned label/value pairs; prior auctions are
a quiet inline metric. Historical metrics use three left-aligned pairs when the
container is at least 512px and inline rows below that. All values keep their
labels and independently unavailable/loading treatment.

## Exploration admission and rejected shape

One reversible candidate; no competing architecture or caller boundary merits
Arena. Reject equal prominence for all metadata, icons on every historical
metric, and a wider pane with no demonstrated reading bound. Existing Metric,
LifecycleStatusPill and loading owners stay intact; local alignment/framing is
explicitly a composition trial, not a new canonical Metric variant.

## Pre-registered rubric / visible pressure case

1. Ready, ongoing and unavailable never make conflicting claims.
2. Disconnected restricted viewers can identify the restriction without a hover.
3. Active state/timing is distinguishable from history; headings are subordinate.
4. Timing values share a baseline; long names/labels and missing/loading states
   fit 320/390px and 512/640px containers in both themes without clipping.
5. Count, wallet and phase survive state recovery; native links/focus still work.

Visible pressure case: two auctions run, disconnected restricted viewer, long
history record with missing metrics at 390px dark. This is not held-out evidence.

## Verification and human gates

RED projection/render/geometry assertions before implementation. Focused unit,
typecheck, scoped lint/format, all Auctions browser regressions, and affected
catalog/row-link smoke checks. Only one browser worker on owned port 3043;
leave 3005 alone. Source-guarded ordinary-viewport captures, visual inspection,
wiki/links/hash/diff housekeeping. No full-repository or CI claim.

Repository-required Dark/Light reviews are read-only, combining intent and risk;
no browsers, tests, edits or additional agents. Coordinator owns reconciliation
and reserves final verification/repair. Missing review stays pending. Reviewers
receive this contract and exact current diff/evidence, not a fresh implementation
task. Human acceptance of hierarchy, icons and reading width remains required;
production readiness/access adapters remain deferred engineering review.

## Independent review reconciliation

Repository-required Dark and Light read-only reports both passed scoped Intent,
correctness and product review, with no confirmed blocking findings. Both
challenged contradictory ready/blocked states, wallet-dependent readiness,
invented auction totals and accidental production authority. Source branches,
mounted assertions and native-link coverage disconfirmed those concerns.

Both correctly limited the earlier 4/4 composition browser pass and inspected
captures to their source snapshot. Final-source verification, the new narrow
boundary assertions and history-only/long-unavailable captures remain the
coordinator's closeout responsibility. Human visual acceptance and real
price/access readiness remain separate gates, not implied by review passes.

## Verification receipts and reproduction

RED evidence preceded the implementation: restricted visitors still projected
waiting instead of objective readiness, mounted records lacked the access and
blocking-message anatomy, the browse measured 512 instead of 640px, and the
history-only projection still included an active record. Focused units then
passed **51/51** (14 model, four mounted record and 33 catalog cases).
`pnpm typecheck` passed app and E2E types; the final smoke-test edits received
another `pnpm exec tsc -p e2e/tsconfig.json --noEmit`. Scoped oxlint and Prettier
passed without changing shared components.

Reproduce units with `pnpm exec vitest run
src/views/internal/design-system/auctions-browse/tests
src/views/internal/design-system/tests/component-catalog.test.ts`.
Reproduce browser coverage with:

```sh
DESIGN_SYSTEM_PORT=3043 pnpm exec playwright test \
  --config=playwright.design-system.config.ts \
  --project=design-system-review --project=design-system-desktop \
  --project=design-system-mobile \
  e2e/design-system/auctions-browse-lab-regressions.spec.ts \
  e2e/design-system/auctions-composition-lab-regressions.spec.ts \
  e2e/design-system/auctions-launcher-lab-regressions.spec.ts \
  e2e/design-system/auctions-repeat-lab-regressions.spec.ts \
  e2e/design-system/auctions-record-links-lab-regressions.spec.ts \
  e2e/design-system/table-row-links-lab-regressions.spec.ts \
  e2e/design-system/lab.spec.ts \
  --grep 'auction|table row links|source-grounded rich record'
```

The first complete run passed all 22 regressions but failed the two older smoke
cases on their stale waiting-role oracle. Those checks now assert objective
readiness plus restricted access and a measured single 24px inset; the old
removed evidence-region expectation is gone, not bypassed. Governance
expectations remain unchanged.

Runtime: Node 24.19.0 / pnpm 11.19.0, existing installed dependencies, with
`pnpm_config_verify_deps_before_run=false`; no dependency update. An accidental
non-dry scope invocation without that override attempted pnpm bootstrap and
aborted before verification; package/lock/workspace files stayed unchanged.
An unnecessary E2E type command used the wrong config path; the correct command
above passed. These are invocation failures, not gate passes. Scope dry-run
reports correctness/product and no red flags. Its unmapped document/capture
files receive link/hash/visual checks. The V1 verification-cadence override
requires affected seam proof here, not a full production-integration gate.

## Final review handoff

**Human-review-required.** Final browser run passed **24/24**, no retries or
flaky cases, on owned port 3043. The [manifest](design-system-auctions-browse-evidence/composition-refinement/record.json)
retains 22 matching source guards, the two retained Governance/Auctions smoke
results and 28 hashed ordinary-viewport captures. Final public-source digest:
`f0cf59bff8c99826bc49e79fbbb9e39ff7f73f8ead78fd3e30179e71cb712ca2`.
The coordinator rechecked that digest after export. No private environment
fingerprints are retained.

Final captures visually inspected: light desktop restricted/repeat and launcher;
dark phone price-unavailable and long unavailable history; light phone ongoing
and history-only; dark desktop permissionless. They show a consistent inset,
subordinate section labels, distinct history surface and readable missing data.
The ongoing phone label wraps naturally while timing values share a baseline.

Rubric assessment: no ready/blocked contradiction; restrictions visible without
hover; active/history hierarchy distinct; measured timing/outcome reflow fits
320px viewport through 640px browse and both sides of the 512px container
boundary; state recovery and independent native links pass. This is objective
readiness for the defined offline fixtures, not proof of the eventual adapter.

Scope review found no red flags. Docs were reconciled at the current owner rather
than rewriting accepted decisions: V1 frontier, lab guide, catalog/current review,
coverage map and the historical preparation brief now distinguish this trial.
Wiki lint, relative links, capture hashes and diff whitespace checks pass. The
existing 3005 preview returned HTTP 200 and was not restarted; the test-owned
3043 preview stopped at suite completion.

Review at `/internal/design-system/components/table#auctions-browse-review`.
Start with Restricted period and Auctions run 2, toggle the simulated launcher,
then compare Ongoing auction and Price unavailable. Also review the 390px
constrained view and Historical Rebalances with no active item.

**Engineer review required before production adoption:** the feature-local
model and record composition introduce no live checks or actions. Real readiness,
permissionless price preflight, viewer authorization, completion and route-backed
selection still need their own data/interaction contracts. No shared defaults,
tokens, production code, dependency manifests, transactions, commits or pushes
changed. No full-repository/CI claim. Self-improvement review justified no kit
change; the invocation and stale-oracle errors were local execution corrections.

## State-led list revision — September 12

Current bounded candidate, authorized after rejection of the trial below.
Low profile: isolated auction presentation and its display projection/tests;
no shared defaults, new live behavior, transaction, route, or analytics change.
Fixed point remains `404bcbc41`; unrelated dirty-tree work is preserved.

Usage: identify the rebalance and its state together, then read the current
round's operational context or a historical result summary. History-only lists
omit the empty active group. Restricted viewers
see access next to the round with permissionless timing immediately below;
authorized launchers see their wallet context first. Ongoing rounds lead with
their ending timer; permissionless readiness retains expiry. Warnings do not
claim rebalance failure. Ended counts never imply a known total.

Composition: title and status share a wrapping header; auction number is outside
the pill. A single tightly spaced detail region replaces separated state/access/
metric bands. Historical outcome pairs lead that region instead of operational
facts. Provenance is the quiet final line. 24px record inset remains single-owned;
header-to-details and details-to-provenance are 12px. Inline pairs use 14px/20px
on both sides with 300/500 weights, matching Governance evidence and transaction
details. No global Metric variant or sibling redesign is needed.

Acceptance checks: status remains visible beside/below a wrapping title; round
and state are separate; every existing fact and independent link remains; inline
labels and values have equal computed sizes; loading preserves geometry; records
fit 320/390/640px and both themes. Visible pressure case: a third ongoing auction
on a 320px viewport plus long unavailable history. Judge the list together, not
only isolated rows. Visual acceptance remains the user's decision.

The approved shorter ending label is `Ends in`, beside `Auction N`; other copy
is retained. Price unavailability retains the existing warning component and
full explanation instead of a neutral historical-looking pill.

Closeout: 53/53 focused units, 24/24 browser cases, app/E2E types and scoped
lint/format pass. The [current receipt](design-system-auctions-browse-evidence/state-led-list/README.md)
contains the final source-bound 30 captures and RED/iteration details. Eight
final captures were inspected as full list compositions. Low self-review covers
Intent/correctness/product; the scope tool's medium hint is accumulated-tree
size only. No shared defaults or production seams changed. This is ready for
human review, not accepted design or production adoption.

## Proposal-like record trial — September 12

Rejected and superseded by the state-led list revision. Human review rejected
the fragmented layout and mixed-size inline pairs; its passing tests incorrectly
asserted 14px labels beside 16px values. This section is evidence, not authority.

User authorized the proposed compact hybrid. Low profile: local presentation
within the existing auction family; same base `404bcbc41` and inspected dirty
tree, no shared API/default, model, copy, route, interaction or protocol change.
Existing workflow/UI/type rules apply; no new durable experience boundary or
parallel review is warranted. Analytics is unchanged because actions are unchanged.

Usage: scan title, state and the most relevant timing together; identify launcher
restriction immediately beneath; read remaining facts or outcomes without a
dashboard-like icon/label/value grid. At phone widths, complete fact pairs wrap
without separating a label from its value. A missing outcome stays unavailable;
loading preserves each selected phase's geometry.

One candidate: 24px outer inset, 16px major internal gaps, 8px access spacing;
14px supporting labels and 16px/500 values via MetricValue. State and primary
timing share a wrapping band; primary timing is permissionless access, current
auction end, or expiry according to the existing ordered source projection.
Remaining expiry/completed-count facts and historical outcomes are inline pairs
that wrap to their available width without a layout breakpoint. Provenance stays last.
Active/history surfaces, warning replacement, native links and 640/390px widths
remain. No proposal progress bar: repeated auctions have no known final total.

Rejected: changing shared Metric defaults, copying fixed proposal progress, or
keeping all timing statistics equally prominent. The proposal predecessor's
title/state/evidence hierarchy is reused; its vote evidence and lifecycle model
are not. Governance and owned-position specimens stay untouched.

Verification target: phase-appropriate primary timing, every fact retained,
14/16px type, truthful readiness/access/count, loading-height continuity, no
overflow across the 512px container boundary, and native record/proposer links.
Visible pressure case: ongoing third auction at 320px plus long unavailable
historical outcomes in dark mode. Human visual acceptance remains pending.

Scope inventory's medium hint is size-only (150 files in the accumulated dirty
tree), not a shared-radius signal for this pass. This follow-up stays low:
three local presentation files plus regression and descriptive-authority updates;
Intent/correctness/product self-review, no new independent review pair.

**Human-review-required; verified.** Final 52/52 units and 24/24 browser checks
pass, with zero skips/failures/flakes; app/E2E types and scoped lint/format pass.
The [receipt](design-system-auctions-browse-evidence/proposal-like-records/README.md)
and generated manifest retain 28 captures and 22 matching source guards. Final
inspection covered captures 01, 08, 17, 18, 21 and 26: phone/desktop restricted,
blocked/ongoing phone, long unavailable history and desktop permissionless.
The new mounted hierarchy test failed before implementation; a type-check
correction kept loading visibility local instead of adding a shared pill prop.

Self-review confirms every source fact remains, the primary timing follows phase,
access stays independent from readiness, and remaining pairs wrap without a
layout breakpoint. Loading preserves row height, known-zero/missing handling
and independent native links pass, and the retained Governance smoke is unchanged.
No production correctness or visual-acceptance claim; no shared API or preference
was promoted. Wiki/links/hash/diff housekeeping and owned-preview cleanup complete
this bounded trial; no full repository gate or CI was run.
