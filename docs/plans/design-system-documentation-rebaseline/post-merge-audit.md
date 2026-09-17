# Design-system documentation post-merge audit

Status: S1 rebaseline evidence; documentation only. Snapshot:
`02434707c0614d2262b10560eebb05cde4319931` on 2026-09-16.

This audit revalidates the content and authority findings that feed the
documentation migration. It does not change design authority, authorize source
cleanup, or replace the typed catalogs, decisions, tests, family guides, or
retained evidence.

## Evidence boundary

- **Confirmed** means the current source or a current test directly proves the
  claim.
- **Corrected** means the earlier claim was directionally useful but inaccurate
  in scope or ownership.
- **No longer current** means the integrated tree has already resolved the
  earlier uncertainty.
- **Unverified** means this pass found no sufficient current evidence.
- The typed counts below were derived by importing `FOUNDATION_ITEMS`,
  `COMPONENT_GROUPS`, and `COMPONENT_ITEMS` from the current TypeScript modules.
  They were not copied from an earlier audit or counted from rendered cards.
- A fresh isolated render rechecked representative current-tree surfaces. The
  exact coverage and remaining runtime limits are recorded below; no stale
  render is used as current evidence.

## Typed source snapshot

| Axis                     | Derived result                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Foundations              | 9 total: 8 `defined`, 1 `evidence-found`; 8 `current-baseline`, 1 `exploratory`; all 9 `rendered`; only Layout has open decisions |
| Component groups/items   | 8 groups, 45 items                                                                                                                |
| Component status         | 5 `defined`, 39 `evidence-found`, 1 `not-needed`                                                                                  |
| Component authority      | 34 `current-baseline`, 6 `exploratory`, 5 `undefined`                                                                             |
| Component output         | 35 `rendered`, 5 `in-composition`, 5 `none`                                                                                       |
| Component implementation | 31 `canonical-candidate`, 3 `reusable-recipe`, 6 `specimen`, 5 `none`                                                             |
| Component adoption       | 45 `none`                                                                                                                         |
| Component review         | 34 `ready`, 4 `exploration`, 3 `not-started`, 2 `provisional`, 2 `deferred`                                                       |
| Current Review           | 0 entries; `CURRENT_REVIEW` is an empty array in `current-review.ts:43`                                                           |

Six current-baseline components do not have a literal `accepted-decision`
context source: `multi-select-filter`, `popover`, `dropdown-menu`, `spinner`,
`skeleton`, and `empty-state`. This is not nine. The catalog test deliberately
accepts either an accepted-decision source or an `authority` source whose detail
states that no dedicated decision exists
(`tests/component-catalog.test.ts:161-168`). This is a corrected count, not an
authority defect inferred by this audit.

## Fresh rendered recheck

The current tree was served with the design-system test environment on isolated
loopback port `41739`. The browser used deterministic `register.locale=en` and
the test splash setting. Port `3042` was never used or stopped. The isolated
server was stopped after inspection and the port was confirmed clear.

| Surface/theme                            | Stable rendered or DOM receipt                                                                                                                                                                                                                                                                                                               | Disposition                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Studies · dark                           | Visible markers were `Meaning colors` + `Values open`; `Auctions · discard centered islands` + `Browse and inspect`; and `Modal width and state continuity` + `Provisional`, with `432/384px width roles · Canonical V1`.                                                                                                                    | Matches the corrected Meaning-color classification and confirms the two stale Studies presentations.            |
| Typography · dark                        | DOM receipt: `theme: dark`; `foundation-detail-typography`, `typography-recommended-refinements`, and `foundation-direction-typography` present; visible `Accepted refinements`, `Accepted direction`, `Current baseline`, `Reasoning and validation`, and `Why this candidate exists`; expanded evidence showed `decision candidate below`. | Confirms accepted refinements and the candidate-era/stale-relative-copy findings coexist in the current render. |
| Typography · light                       | DOM receipt: `theme: light`; `typography-recommended-refinements` and `foundation-direction-typography` present, with the same accepted and candidate-era presentation.                                                                                                                                                                      | Confirms representative light/dark parity for the Typography findings.                                          |
| Hashless Table · light                   | DOM receipt: `theme: light`, empty hash, `auctions-history-review: true`, `current-rebalance-review: true`, `current-table-review: false`.                                                                                                                                                                                                   | Confirms the deferred workspace remains the hashless default.                                                   |
| `#auctions-current-table-review` · light | DOM receipt: exact hash present, `auctions-history-review: true`, `current-rebalance-review: false`, `current-table-review: true`, `current-rebalances-table: true`.                                                                                                                                                                         | Confirms the approved current-table branch renders only behind its explicit hash.                               |

Runtime limits remain explicit. The Spacing route rendered
`foundation-detail-spacing`, but its evidence disclosure stayed collapsed, so
the empty-evidence placeholder was not visually confirmed. No dark Table pass
or rendered Elevation/Accessibility placeholder pass was completed. Their
source classifications remain valid, but the omitted runtime checks still
belong to their owning migration slices.

## Content and cleanup findings

| Finding                                                                    | Classification        | Current evidence                                                                                                                                                                                                                                                                                                                                     | Later owner                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Empty Current Review                                                       | **Confirmed**         | `current-review.ts:43` exports `[]`. The earlier populated render is not current evidence.                                                                                                                                                                                                                                                           | S2a-1 projects the explicitly empty queue.                                                                                            |
| Modal study still presents accepted width roles as provisional             | **Confirmed**         | `modal-geometry-study.tsx:13-25` sets review status to `provisional`, and lines 84-86 display `Provisional`; the 432px/384px roles are accepted in `docs/wiki/decisions.md:55-57`.                                                                                                                                                                   | S7 reconciles the study label and scope.                                                                                              |
| Auctions study still recommends the discarded browse-and-inspect workspace | **Confirmed**         | `layout-workspace-studies.tsx:4-44` and `route-layout-audit.ts:14-25` retain the discard/workspace call. `docs/wiki/decisions.md:637-652` accepts the current table scope and explicitly excludes the unfinished workspace.                                                                                                                          | S7 corrects the study while preserving its evidence history.                                                                          |
| “Meaning colors · Values open” is a proved authority contradiction         | **Corrected**         | `meaning-color-study.tsx:13-22` applies the broad label. `foundation-catalog.ts:29-32` defines semantic intent and interaction roles, while `color-foundation-data.ts:176-224` still marks exact role values provisional/open. The copy is ambiguous, not wholly false.                                                                              | S7 reconciles the label against both owners.                                                                                          |
| Accepted foundations still render candidate-era direction scaffolding      | **Confirmed**         | `foundations-pages.tsx:87-89` mounts `FoundationCandidateDirection`; `foundation-candidate-direction.tsx:15-19,58-103` relabels current baselines as “Accepted direction” but retains candidate reasoning and validation sections. The mapping applies to current-baseline Color, Typography, Spacing, Radius, and Elevation; Layout is exploratory. | S2b moves Typography history; S6 migrates remaining foundation content; S8 removes superseded scaffolding after replacement coverage. |
| Typography says “the decision candidate below”                             | **Confirmed**         | `foundation-reference.tsx:43-48` retains the relative candidate copy although Typography is current-baseline.                                                                                                                                                                                                                                        | S2b fixes the relative copy during Typography migration.                                                                              |
| Typography “Recommended refinements” remain unverified                     | **No longer current** | `typography-recommended-refinements.tsx:10-21` now says “Accepted refinements” and identifies them as current baseline; `tests/typography-review.test.tsx:57-95` mounts and verifies the accepted group.                                                                                                                                             | S2b preserves and projects the accepted rules; it does not reopen them as a candidate.                                                |
| Spacing, Elevation, and Accessibility show empty-evidence placeholders     | **Confirmed**         | They fall through `FoundationEvidence` to “No structured evidence” at `foundation-reference.tsx:117-122`, despite current-baseline catalog status and their rendered definition/study content.                                                                                                                                                       | S6 supplies the result-first foundation projection; S8 removes the obsolete fallback after replacement coverage.                      |
| Hashless Table opens the deferred current-rebalance workspace              | **Confirmed**         | `auctions-browse/review.tsx:6-13` sends every hash except the two recognized branches to `AuctionsHistoryReview`; `history-review.tsx:122-139` mounts `CurrentRebalanceReview` when no current-table override is supplied.                                                                                                                           | S7 makes the approved current table the default while preserving an explicit deferred-workspace route and affected tests.             |
| `control-geometry-matrix.tsx` has no active source or test consumer        | **Confirmed**         | A repository scan of `src` and `e2e`, excluding the file itself, found no import or symbol reference. Historical manifest mentions remain evidence, not runtime consumers.                                                                                                                                                                           | S8 repeats the consumer/reference scan and deletes only after replacement coverage exists.                                            |
| `product-facing-component-audit.ts` is dead                                | **Corrected**         | It is imported by `tests/component-catalog.test.ts:14` and `tests/inventory-reconciliation.test.tsx:6`. Those test consumers preserve unique decision-lane coverage.                                                                                                                                                                                 | S8 keeps it until a replacement owner exists and both tests deliberately migrate.                                                     |
| Long specimen surfaces repeat provenance/disclaimer prose                  | **Confirmed**         | Examples remain in `charts/next-families/review.tsx:42`, `charts/review.tsx:153-175`, and `auctions-browse/history-review.tsx:154-155`.                                                                                                                                                                                                              | S2/S4/S7 establish the sourced one-line projection; S8 removes superseded repetitions after parity.                                   |
| Chart viewport controls use duplicate conventions                          | **Confirmed**         | Primary controls live in `charts/review.tsx:83-145`; next-family controls are repeated in `charts/next-families/responsive-review.tsx:18-60` and its standalone preview at `charts/next-families/preview.tsx:20-84`.                                                                                                                                 | S4 preserves frozen internals. Replacement is a separately bounded follow-up, not wrapper cleanup.                                    |
| Representative rendered presentation matches the audited source findings   | **Confirmed**         | The fresh isolated recheck confirmed Studies in dark, Typography in light/dark, and both Table dispatch branches in light. Coverage is scoped to the exact markers and DOM receipts above; the named placeholder and dark-Table limits remain.                                                                                                       | Each owning UI slice supplies its still-missing narrow/wide and state coverage before acceptance.                                     |

## Table URL-state correction

The deferred workspace and approved table are different URL-state owners. They
must not be represented as one compatibility matrix.

| Surface                              | Hash behavior                                                                                                                                     | URL-backed state                                                                                                 | Local or absent state                                                                     | Evidence and disposition                                                                                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deferred current-rebalance workspace | Hashless `/components/table`, `#auctions-browse-review`, and every unrecognized hash currently fall through to Auctions history/current workspace | `current` only; absent defaults to `ready`, valid fixture values are accepted, invalid values become `not-found` | `viewer`, `data`, `outcome`, `network`, clock, and archived records are local React state | `auctions-browse/review.tsx:6-13`, `auctions-current/use-scene.ts:5-27`, and `auctions-current/review.tsx:52-61`. Preserve through S7, then retain behind an explicit route.                                                                               |
| Approved current-table surface       | Selected only by `#auctions-current-table-review`                                                                                                 | `current`, `viewer`, `data`, `network`, and `rebalance-preview`                                                  | `outcome` is not read by this owner                                                       | `auctions-current-table/review.tsx:30-60,80-87,96-136`; direct-hash browser coverage starts at `e2e/design-system/current-rebalance-table-lab-regressions.spec.ts:8-18`. Preserve all five keys and fresh-tab/hash behavior through the S7 default change. |

The earlier combined matrix is therefore **corrected**: only the approved table
owns the five-key URL contract, while the deferred workspace owns only
`current`. Most hashes do not select named branches; they inherit the Auctions
history fallback.

## Disposition

This file is evidence for the migration ledger and later owning slices. It is
not cleanup authorization. A stale label, candidate-era section, placeholder,
duplicate control, repeated disclaimer, or apparently unimported file may be
changed or removed only in its named slice, after a fresh consumer/reference
scan, replacement ownership for unique content, affected test migration, and
the slice's required rendered verification.
