# Design-system documentation complete pass

Started 2026-09-17. This is the active high-profile stage contract for taking
the standalone documentation candidate from breadth-complete but teaser-heavy
to a share-ready, scroll-first system reference with coherent complex-family
navigation. It consumes the approved documentation-experience plan, the user's
rendered feedback, and both independent Claude audits. It does not replace the
typed design authority or production adoption process.

## Goal

Deliver one coherent local documentation candidate in which:

- Foundations, Components, and Patterns are continuous, result-first references;
- the sidebar and page navigation follow the reader's current section and every
  listed item scrolls to a stable deep link;
- ordinary component summaries show the accepted essentials without requiring
  a detail-page round trip;
- documentation status and controls cannot be mistaken for the system being
  demonstrated;
- Charts, Navigation, and Tables use one specimen-canvas grammar while retaining
  family-specific dimensions;
- the paused Transaction system has a truthful Canonical summary and a compact,
  directly navigable Workbench explorer;
- existing authority, accepted owners, evidence, tests, and provider-free
  boundaries remain intact.

## Current state

- The standalone documentation shell, search, anchors, provider isolation, nine
  Foundations, 45 Components, and five Patterns are implemented local candidates.
- Foundations, Components, and Patterns are continuous result-first references.
  Accepted ordinary components show their defining variants, sizes, or states;
  supporting detail pages remain optional depth rather than the only useful view.
- Sidebar, page index, mobile section control, search, direct links, and browser
  history share one observed-section owner. Scroll updates the active section;
  explicit navigation restores the target section with the documentation offset.
- Charts, Tables, and Navigation now render substantive family references through
  the shared specimen grammar. Navigation uses neutral or cropped hosts rather
  than a fabricated product page body.
- Transactions remain explicitly Exploring and Paused in Workbench. Five family
  sections expose scoped Operation, Step, and State controls, direct URLs,
  Previous/Next traversal, and an opt-in audit index without changing mechanics.
- The standalone entry is provider-safe: its final desktop/mobile runtime matrix
  made no wallet/provider calls, external requests, or WebSocket connections.
- The branch and checkout are intentionally dirty. Fixed point:
  `02434707c0614d2262b10560eebb05cde4319931`. Port 3055 is the user's review
  preview and must not be stopped or repurposed.

## Non-goals

- No production component adoption, SDK/data/math/transaction behavior change,
  shared token change, or unapproved shared component default change.
- No publication, hosted-preview setup, access-policy decision, commit, push,
  stash, reset, rebase, or merge.
- No promotion of paused Transactions, deferred auction workspace, pressure
  fixtures, or invented application composition into Canonical authority.
- No removal of compatibility routes, dead branches, evidence, or legacy aliases
  until the final cleanup slice proves replacement parity and reference safety.
- No promise that every exhaustive state belongs in the default reading view.

## Acceptance evidence

- Every Canonical section begins with the system result, one human job/scope line,
  and low-emphasis metadata; technical evidence remains secondary.
- All accepted ordinary components expose their defining variants, sizes, or
  states using existing accepted owners; unresolved entries render no invented UI.
- Scrolling, clicking, direct loading, reload, Back, and Forward keep exactly one
  active section across sidebar, page index, and the compact mobile equivalent.
- Query-only specimen changes never move the document. Section state is directly
  linkable, resettable, and resilient to unknown values; retained aliases work.
- Documentation controls sit outside the specimen boundary and use a consistent
  labelled grammar with a 12px minimum text role and 44px interactive targets.
- Navigation contains no fabricated product body; Chart uses the accepted
  Overview line representative; natural-size narrow evidence remains legible.
- Charts, Navigation, Tables, and the Transaction Workbench each expose their
  real dimensions without importing the Transaction step metaphor elsewhere.
- Standalone startup remains provider-free, no document-level horizontal overflow
  appears, and existing accepted family invariants remain green.
- Fresh rendered evidence covers 1400/390 light/dark plus targeted 320px pressure
  cases and one deep state per migrated family.
- Captured Chart owners retain source identities, image hashes, and dimensions in
  [the capture manifest](evidence/chart-capture-manifest.md).

## Test seams

- Vitest documentation presentation/component/foundation/pattern/standalone tests
  for authority gating, stable anchors, status projection, canvas layers, and URL
  schema behavior.
- Playwright standalone shell/components/patterns/foundations journeys for
  observed-section navigation, history restoration, mobile section control,
  keyboard focus, responsive overflow, and provider isolation.
- Existing family e2e suites remain the oracle for Chart, Table, Navigation, and
  Transaction state counts, interactions, and accepted geometry.
- Rendered evidence is inspected at the actual standalone surface; static tests
  do not constitute visual approval.

## Slices

- **Slice 1 — Share-integrity and ordinary reference depth.** Repair status chrome,
  Typography width, Color completeness, truthful Card/not-planned/Legacy copy,
  natural-size captures, docs-local link contrast, ordinary component summaries,
  detail-page claims, and source-backed human usage language. Blocked by: none.
- **Slice 2 — Scroll-synchronised documentation navigation.** Establish one
  observed-section owner, click/push versus scroll/replace behavior, one offset
  contract, expandable active Component groups, right-rail fine navigation, and
  a compact mobile section control. Blocked by: none; converges with Slice 1.
- **Slice 3 — Specimen canvas and state pilot.** Add the three-layer canvas,
  labelled control slots, section-scoped semantic query schema, reset/link behavior,
  and shared Viewport vocabulary. Prove it on Select plus one ordinary no-control
  specimen. Blocked by: Slice 1 shell grammar and Slice 2 URL/offset ownership.
- **Slice 4 — Charts.** Present Overview, Home, Discover, Yield, and Portfolio as
  anchored result-first sections; retire duplicate viewport chrome in favor of the
  canvas slot; preserve real renderer behavior and Workbench pressure evidence.
  Blocked by: Slice 3.
- **Slice 5 — Navigation.** Reorder by complete Global and Product systems, expose
  important states through documentation controls, crop or use a captioned neutral
  host, and keep anatomy secondary. Do not change the canonical divider owner in
  this pass. Blocked by: Slice 3.
- **Slice 6 — Tables.** Order by product job, make accepted current rebalances the
  hashless Canonical default, split real anchors, consolidate family controls and
  provenance, and preserve current URL aliases. Blocked by: Slice 3.
- **Slice 7 — Transactions Workbench.** Replace the all-at-once board with five
  family sections and family-declared Operation/Step/State dimensions, direct
  state access, optional Previous/Next, `view=all`, semantic test identities, and
  lazy stage mounting without changing product mechanics. Blocked by: Slice 3.
- **Slice 8 — Convergence and closeout.** Reconcile shared files, remove only
  proved-superseded navigation rows/fixtures/tests, run affected and gate evidence,
  preserve first/final renders, complete Intent and Engineering Risk review, update
  durable documentation, and leave human visual review explicit. Blocked by:
  Slices 1–7.

## Unresolved decisions

The user approved the recommended direction by authorizing this complete pass.
Implementation therefore uses: cropped/neutral Navigation hosts; Overview line as
the primary Chart representative; section hashes plus namespaced semantic query
keys and temporary legacy aliases; one shared Viewport slot with family-specific
rendering; expandable Component groups with the current component highlighted;
and a Canonical Transaction summary linking to a paused Workbench explorer.

Still outside this stage: hosted-preview access/indexing decisions U11/U12, any
Navigation-owner divider redesign, production adoption, and final human visual
acceptance.

## Closeout state — 2026-09-17

Status: **implementation-verified; human visual review required**.

- The final focused documentation batch passes 12 files and 69 tests; application
  and E2E TypeScript pass; the standalone production build passes with 4,034
  transformed modules and its required local assets.
- Final browser evidence passes the documentation shell 20/20, collaboration
  readiness 4/4, Patterns 2/2, standalone provider/asset isolation 18/18,
  Components 3 passed with one intentional capture skip, and the exact legacy
  lab inventory journey 1/1.
- The standalone isolation journey scrolls every Foundation, Component, and
  Pattern family, exercises Navigation identity states, and rejects provider
  calls, non-loopback requests, WebSockets, and failed local assets.
- Independent Intent and Engineering Risk re-reviews pass after repairing stale
  scope copy, the Copyable Value specimen boundary, malformed URL reset,
  unknown-hash synchronization, provider-safe Navigation marks, built assets,
  and all affected inventory assertions.
- Human review still owns subjective 1400/390/320 light/dark quality. Hosted
  preview access/indexing remains U11/U12. The 1,000-line-plus Navigation
  documentation module is recorded as non-blocking maintainability debt.

Durable evidence is retained in this directory, including the specimen pilot,
Transactions matrix, family notes, and [Chart capture provenance](evidence/chart-capture-manifest.md).

## Strongest case against this plan

The breadth risks recreating the original heavy lab or introducing a generic
control system that flattens family differences. The plan survives only if each
slice keeps accepted owners intact, mounts lightweight default results, declares
family dimensions locally, and retains exhaustive matrices as opt-in Workbench or
`view=all` evidence. If the shared canvas requires family-specific branching in
the shared owner, stop and return control ownership to the family.
