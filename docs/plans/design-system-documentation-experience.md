# Design-system documentation experience

> **Presentation contract superseded 2026-09-17; remediation active
> 2026-09-18.** The implemented scroll-first contract and receipt live in
> [design-system-documentation-visual-reconciliation.md](design-system-documentation-visual-reconciliation.md).
> The first human review is now governed by
> [design-system-documentation-human-review-remediation.md](design-system-documentation-human-review-remediation.md).
> This document remains the historical authority and rollout record; its
> right-rail, teaser-summary, and Workbench-first presentation clauses no longer
> describe the current direction.

Planned 2026-09-16. This is the durable contract for replacing the current
hard-to-navigate lab presentation with a shareable documentation experience.
It authorizes planning and read-only discovery only. Shell implementation,
component integration, Git checkpointing, and upstream integration require the
explicit decisions listed below.

## Revision note — independent IA audit reconciliation

Revised 2026-09-16 after reading and checking Claude's independent read-only
information-architecture/content audit. The plan that preceded that report is
the preserved independent baseline: neutral route-aware shell; dense sidebar and
search; Canonical/Workbench/Internal Records separation; derived presentation
over existing authority; Typography, Button, and Charts as the first migration
set; upstream integration before meaningful shell work; secure hosted preview;
and newcomer evaluation. The report did not replace those decisions.
This revision note and the source-backed issue/decision sections below are the
durable reconciliation digest; the transient raw report is evidence, not a new
repository authority document.

### Agreement

- Both analyses require a human presentation layer over the typed catalogs,
  accepted decisions, Current Review, engineering register, tests, and evidence.
- Both separate stable guidance from Workbench review tooling and internal
  engineering/history; require a dense sidebar, search, stable deep links,
  progressive disclosure, explicit host/specimen boundaries, and leaf-first
  migration; preserve agent routing and existing tests; and defer deletion until
  parity is proved.
- Both select Typography and Charts as representative first migrations and keep
  Toast/Progress drafts, paused transactions, deferred auctions, and frozen
  chart internals outside the documentation-shell edit boundary.

### Material additions from the independent audit

- The Components landing page currently mounts all 35 rendered state sheets;
  its screenshot timeout is 30 seconds rather than 7.5 seconds elsewhere. The
  new landing page must be an index, not a specimen wall. The timeout supports
  unusual test cost but does not by itself prove user-perceived performance.
- `/components/table` without a hash shows the deferred auction workspace while
  the approved current table requires `#auctions-current-table-review`.
- Studies contains two demonstrated stale/current-authority mismatches: Modal
  geometry's provisional label and the Auctions discard/workspace call
  superseded by the September 14 decision. Meaning colors' “Values open” may
  distinguish open exact ramps from defined semantic intent, so it requires
  authority reconciliation rather than automatic relabeling.
- Accepted foundations still show candidate-era direction scaffolding;
  Typography contains a stale “candidate below” reference; Spacing, Elevation,
  and Accessibility use an empty-evidence placeholder.
- `control-geometry-matrix.tsx` has no source/test importer.
  `product-facing-component-audit.ts` is not dead: two tests consume it, so its
  decision lanes must be preserved or relocated before any later deletion.
- Long pages need a right-rail table of contents; specimens benefit from one
  provenance line instead of repeated disclaimers; and human presentation
  vocabulary needs one named code owner plus a short lab-guide pointer.

### Reconciled differences

- **Status:** the baseline's two large Design/Usage labels keep the right
  separation but still overstate status chrome. Adopt one primary design pill
  plus compact Code and Production facts. “Awaiting human review” derives only
  from `CURRENT_REVIEW`; review readiness stays engineering detail. “Paused” is
  not inferred from prose and remains a human decision about typed versus
  presentation-only ownership.
- **Patterns:** the baseline proposed new pattern routes. Existing catalog IDs,
  hashes, and tests support the audit's lower-risk proposal: Patterns is a
  navigation/presentation alias onto current component routes first. A typed
  pattern kind is a later foundation-reviewed option, not a prerequisite.
- **Ordinary pilot:** the audit proposes Select because it has a clean accepted
  decision and a useful unresolved density seam. The baseline retains Button as
  the user-selected first ordinary component; its mixed InlineAction/CSV content
  must be separated. Select follows as the first repeatability check rather than
  replacing Button.
- **Shell rollout:** the final experience still removes product chrome and the
  legacy horizontal lab navigation. Its component and route contracts may remain
  temporarily for compatibility, but two navigation systems should not be
  visibly presented together once the new shell slice is accepted.
- **Cleanup:** dead/stale candidates become an audited post-migration cleanup
  queue, not immediate deletions. Evidence and test-only decision data move only
  after a replacement owner and consumer scan exist.

### Unsupported or no-longer-current claims

- The audit's `164` dirty count and the later `165` count use collapsed
  `git status --short` directory entries, not expanded paths: adding this plan
  changed the collapsed count from 164 to 165. The same current snapshot expands
  to 672 paths: 49 modified, 0 staged, and 623 untracked. Neither counting mode
  is stale; every later checkpoint must name which mode it uses.
- The port-3044 render is explicitly stale: it shows a populated Current Review
  and 33 baselines; the working tree has an empty queue and 34. Use that render
  only for stable layout/content-density observations, never current status.
- The audit verifies that the route is unconditional and lazy in the built app.
  The lab route and sources are absent from the pinned `origin/master`, while
  actual production and branch-preview publication behavior remains externally
  configured and unverified. Until the Pages dashboard, branch-preview policy,
  and Access boundary are checked, conservatively treat any push containing the
  lab as potentially publishing it.
- Only `charts/mobile-preview.html` is a registered Vite input.
  `charts/next-families/preview.html` is currently addressed through a literal
  source URL and tests, so production-build emission is unproved. The deployed
  `_headers` policy would block iframe rendering through its
  `frame-ancestors 'none'` rule; preview planning preserves those loopback tools
  locally and must verify the existing non-loopback inline/direct fallback,
  emitted assets, and CSP rather than assuming the iframes host unchanged.
- The audit's authority appendix miscounts the 45 component entries. Current
  source extraction yields 34 current-baseline, 6 exploratory, and 5 undefined
  entries, not 34/9/2. Six current-baseline components lack an
  accepted-decision context source (multi-select-filter, popover, dropdown-menu,
  spinner, skeleton, and empty-state), not nine. The migration ledger must derive
  these counts from source rather than copy either report.
- The audit's Table query matrix also overstates URL state. The deferred current-
  auction workspace reads only valid `current` scenario keys; its `viewer`,
  `data`, `outcome`, and `network` controls are local state. The separately
  approved current-table surface owns URL-backed `current`, `viewer`, `data`,
  `network`, and `rebalance-preview` state. Most other hashes fall back to
  Auctions history rather than selecting an explicit branch. S1 must derive the
  compatibility matrix per surface from the current routers, fixtures, and tests
  instead of copying either report.
- The report also overstates direct test pinning: some named hashes have no
  dedicated e2e reference. Preserve source-derived contracts, and record whether
  each is code-, test-, or evidence-owned in S1.
- “Meaning colors · Values open” is ambiguous, not a proved contradiction:
  semantic intent is defined while exact feedback/performance ramps may remain
  open. Reconcile the copy with both authorities after the merge.
- A one-pill model, an optional typed presentation field, and one sentence in
  the lab guide are recommendations rather than repository facts. This plan
  adopts the first only in reconciled form; the typed field requires a separate
  foundation decision, and the guide pointer is added only with its code owner.

### Second-opinion disposition — 2026-09-16

The independent second opinion was checked against the plan and current owners.
Its durable disposition is:

- **Adopted:** split the former S2a into shell/index and foundation/canvas
  slices; measure the provider/network baseline before shell implementation and
  repeat it as post-shell acceptance; decide Paused ownership before S2a-1; add a
  sourced compact scope line for Accepted items with provisional or partial
  boundaries; decide how markdown/inline Workbench and Records sources project
  without copied normative prose; propose temporary Legacy lab pattern aliases
  for U1/U3 approval;
  use zero live Chart renderers in the Patterns overview; run the non-Chart
  newcomer subset after Button; add explicit pre-push access/indexing gates; and
  expand the checkpoint and test contracts named below.
- **Corrected:** the 164/165 count is collapsed-versus-expanded counting, the
  two auction surfaces have different query owners, `origin/master` lacks the
  lab while deployed Pages behavior remains unknown, and the wrapper-only Chart
  slice preserves local loopback tools while verifying its existing non-loopback
  fallback rather than rewriting frozen internals.
- **Rejected:** S1 does not fold into S0 because operational integration
  acceptance must remain separate from the post-merge content/compatibility
  rebaseline. `review.status: deferred` does not map to **Not planned** because
  review scheduling and design authority are independent typed axes; a specific
  item becomes Not planned only through its owning `status: not-needed` decision.
- **Still human-gated:** U1/U3 own temporary Legacy lab sidebar aliases; U2 owns
  Paused storage and the compact accepted-scope treatment; the markdown/inline
  derivation mechanism and any typed activity field require the architecture or
  foundation approval named below. This disposition changes no design authority.

### Effect on upstream sequencing (resolved by S0)

Claude's report added no Git evidence that changed the synchronization strategy.
Before the upstream merge, only this reconciliation, its approval decisions,
and the recoverable-checkpoint preparation occurred. The checkpoint,
safety ref, isolated integration worktree, freshly pinned upstream SHA,
merge-not-rebase choice, no-stash rule, and focused impact verification remain
intact in the S0 receipt. After the merge, S1 checked every IA/content
claim against the integrated tree and current render before shell or cleanup
work. Stale-copy fixes, Table-default changes, deletion candidates, and all
component migrations therefore move after that revalidation.

### Subsequent human clarification — foundation browsing

The Foundations destination is not an index of header visuals or cards that must
be opened one by one. Its default experience is a continuous, casually scannable
reference with the accepted result—or clearly labeled current exploratory
state—in the foreground. A user can scroll through every foundation, use
sidebar/right-rail anchors to jump selectively,
and understand the important visual output and rules without opening a detail
page. Technical metadata, provenance, engineering constraints, evidence, and
history are secondary and collapsed by default. This direction does not apply
to the Components overview, where mounting every full state sheet is a verified
problem.

### S1 post-merge rebaseline — 2026-09-16

S0 is complete at merge `02434707c`; its recoverable checkpoint, safety ref,
verification, and preserved detached packages are recorded in the upstream
integration receipt. S1 rechecked the integrated tree and representative current
renders, then produced the [migration ledger](design-system-documentation-rebaseline/migration-ledger.md),
[post-merge audit](design-system-documentation-rebaseline/post-merge-audit.md),
[provider/runtime baseline](design-system-documentation-rebaseline/provider-baseline.md),
and [independent re-review](design-system-documentation-rebaseline/independent-review.md).

The rebaseline corrects Typography's Recommended refinements to accepted current
guidance; records the missing Chart and Table test boundaries; confirms the
source and representative rendered cleanup classifications; and leaves cleanup
with its later owning slices. The provider evidence supports a human-gated
same-build S2a-1 recommendation, not acceptance of the inherited provider
boundary: the docs work with external traffic denied and showed no account
request, signing, chain-switch, transaction-send, or other write behavior, but
still inherit a large wallet chunk, storage initialization, analytics, and
79–86 external attempts per cold route.
U13 recommended the minimal typed presentation index. S1 evidence was accepted
for S2a-1 after U1–U4, U10, and U13 were resolved. The
[S1 receipt](design-system-documentation-rebaseline/README.md) contains the exact
decision list and verification.

### S2a-1 authorization — 2026-09-16

The user approved the recommended disposition of U1–U4, U10, and U13. S2a-1
was authorized to implement only the same-build neutral shell, navigation and search,
sourced human-status projection, stable and temporary Legacy lab aliases, and a
lightweight Components overview. Paused/Deferred remain presentation-only
Workbench activity owned by the minimal typed presentation index; Patterns are
navigation aliases over existing catalog identities; and the migration order is
Typography → Button → newcomer gate → Charts → Select. This authorization does
not start those migrations, production adoption, a provider split, hosted
preview work, or changes to shared component defaults.

The exact provider/runtime baseline must be repeated after S2a-1. If inherited
provider requests or payload cost remain materially unchanged, further
migration and preview work stops for the already-defined human choice between a
provider split and a standalone documentation entry. U11/U12 remain unresolved
hosted-preview decisions and do not block the local shell slice.

### Content-architecture audit reconciliation — 2026-09-17

Claude's independent route-by-route content audit was read in full after S2a-1.
It confirms that the authority system remains intact, while the legacy content
projection routinely places thumbnails, readiness machinery, comparisons,
candidate material, and invented product-like examples before the actual
foundation or component contract. It also identifies stale local status copy,
missing primary definitions, misleading hand-built examples, unreachable
presentation branches, and several already-known Studies/Table contradictions.
Those findings are presentation evidence, not authority edits.

This revision adopts the audit's P/S/X/W/R/D disposition model as a migration
aid and its recommendation to keep one concise sourced scope line beside the
primary result. It also adopts its warning that exploratory, paused, deferred,
or not-planned entries must lead with the truthful current result and authority
state rather than a fabricated specimen. The following corrections keep the
audit subordinate to the user-approved direction and current sources:

- Every Canonical section begins with **the system itself**: the current tokens,
  rules, component output, or approved composition. Identity/status and one
  necessary scope boundary may accompany it; review machinery, provenance,
  comparisons, and implementation history may not precede it.
- Canonical usage examples use already-approved design-system components. If an
  approved owner does not exist, omit the example or keep it in Workbench; an
  invented product-like composition never teaches only the property it was
  created to demonstrate.
- The audit's row-only Components recommendation is rejected. The user requires
  one continuous anchored document with a lightweight real result for Button,
  Icon button, Action group, and each following component. Full state sheets,
  heavy families, and Workbench controls remain excluded from the overview.
- The absence of a dated foundation decision does not invalidate a typed
  `current-baseline` catalog record. Its defined slots are current wording under
  the existing authority precedence; a page may render them without inventing
  new guidance. Provisional implementation values remain explicitly provisional.
- The post-S2a-1 provider evidence supersedes the earlier deferral of a
  standalone entry. A provider-free documentation entry preceded the completed
  local content candidates. It shares repository sources and authority; it is not a
  second design system or a broad product-provider refactor.
- Color replaces Typography as the first foundation content pilot because it is
  the clearest test of result-first reference design and of the approved-owner-
  only example rule. Typography follows once that grammar is accepted.

The user's instruction to begin the recommended next work authorizes this
reconciliation and the smallest local standalone-entry slice. It does not
authorize publication, preview access changes, production adoption, catalog
authority cleanup, deletion, commit, or push.

## Goal

Turn `/internal/design-system` into a neutral, searchable documentation
experience that lets designers and engineers find current guidance, review
work-in-progress safely, and follow implementation/adoption detail without
mistaking any one of those layers for another.

The human interface is a curated projection over the existing authority. It
must preserve the agent-facing router, skills, domain guides, typed catalogs,
accepted decisions, handoff rules, tests, and retained evidence as their
current owners rather than copying or replacing them.

## Current state

- S2a-1 provides the neutral shell, persistent desktop/mobile navigation,
  grouped search, Canonical/Workbench/Internal Records destinations, simplified
  human status, and stable compatibility links. It is implementation-verified
  but remains human/engineer-review-required.
- S2a-entry provides the verified standalone runtime without the product App,
  wallet/chain providers, updater, analytics/telemetry startup, product chrome,
  chat, or Toaster. The in-app route and direct compatibility routes remain.
- Foundations is now one continuous result-first reference for all nine typed
  records. Components is one continuous anchored reference for all 45 catalog
  entries. Patterns presents substantive Charts, Tables, Navigation, and Forms
  references while keeping paused Transactions separate in Workbench and keeping
  provider-coupled product graphs out of the standalone artifact.
- Supporting foundation/component detail routes remain reachable for retained
  guidance, evidence, history, and review content. They are secondary to the
  canonical overview results and explicitly return to them.
- Current Review is empty and shown truthfully in Workbench. Legacy Studies,
  Screens, Status, heavy component pages, hashes, and preview documents remain
  compatibility/supporting surfaces. Collaboration-readiness polish now states
  their standalone limits and mixed-status boundaries explicitly.
- The standalone entry, all nine Foundations, all 45 Components, all five
  Patterns, and collaboration-readiness polish are implementation-verified local
  candidates. All still require human visual review; none is publication,
  design acceptance, or production adoption.
- Existing deep links are already test and review contracts. Important examples
  include foundation/component IDs, chart and transaction hashes, table query
  state, and standalone chart-preview documents.
- S0 integrated the verified upstream `origin/master` commit `e0f3213897` and
  promoted the verified merge `02434707c` to the local `design-system-v1`
  branch. The pre-merge checkpoint `783030433e` remains recoverable through
  `codex/safety-design-system-v1-pre-upstream-20260916`; the exact verification
  receipt is in `design-system-upstream-integration/README.md`.
- The primary checkout contains the verified but uncommitted documentation
  candidates and substantial unrelated preserved work. Toast and Progress
  drafts remain parked on `codex/preserve-small-components-20260916`; the other
  detached Claude packages and nine pre-existing stashes remain preserved.

### Complete-pass revision — 2026-09-17

The user authorized one accelerated pass rather than waiting for S5 before every
remaining documentation migration. The
[complete-pass receipt](design-system-documentation-complete-pass/README.md)
therefore supersedes the earlier assumption that S4 would stay teaser-light and
that all complex-family documentation would wait for S7. It does not reorder
production adoption or hosted-preview gates.

The accelerated result deepens accepted ordinary component references; adds one
scroll-synchronized navigation model and specimen grammar; presents rich Charts,
Tables, and Navigation documentation; and replaces the Transaction radio wall
with a paused five-family Workbench explorer. Final automated and independent
review is complete. Human visual review and U11/U12 remain the next gate. Later
stages now contain only genuinely missing component authority/implementation,
remaining Studies/Auctions/Internal Records cleanup, hosted validation, and
post-migration housekeeping—not a replay of this completed presentation work.

## Non-goals

- Do not replace or relocate `CLAUDE.md`/`AGENTS.md`, skills, domain guides,
  typed catalog records, Current Review ownership, handoff templates, tests,
  decisions, plans, fixtures, or evidence merely to make the human UI cleaner.
- Do not make the human status projection a new authority schema.
- Do not integrate Toast or Progress, reopen Charts design, migrate production
  consumers, or prepare another component during documentation planning.
- Do not adopt Storybook or a separate documentation framework without evidence
  that the proposed in-app shell cannot meet the real requirements.
- Do not delete the current lab renderers, hashes, query contracts, previews, or
  evidence until their destinations have parity and replacement verification.
- Do not repeat or alter the completed integration, change its safety or
  preservation refs, touch the existing stashes, commit, push, or publish
  without explicit human approval.

## Audiences and use cases

| Audience | Primary job                                                         | Successful path                                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Designer | Understand the current visual contract and inspect realistic states | Search or browse to an approved foundation/component/pattern, read the concise rule, inspect bounded specimens, and share the exact state URL without entering project machinery.                                |
| Engineer | Implement or consume the supported contract safely                  | Find anatomy, states, accessibility, source/API pointer, adoption state, exclusions, and engineering caveats; expand provenance only when needed.                                                                |
| Reviewer | Evaluate an active candidate against its authority and precedent    | Enter Workbench, see what is provisional, compare the intended contexts and edge states, then follow evidence/decision prompts without confusing the candidate with approved guidance.                           |
| Adopter  | Plan production use without treating lab availability as adoption   | Confirm whether a reusable implementation exists, where it is already used, which product behavior must be preserved, and which engineer-review gates remain.                                                    |
| Agent    | Retrieve the smallest authoritative source set                      | Continue to route through `CLAUDE.md`, the design-system router, typed catalogs, current-review record, domain guides, tests, and evidence. Human pages are discoverability aids, never higher-precedence input. |

The common newcomer journeys are: find Button from the landing page; distinguish
approved Button guidance from a provisional study; locate the implementation and
adoption state; open a shareable Chart review state; and return to the same
section from a copied URL.

## Content inventory and destination classification

| Destination          | Content shown to humans                                                                                                                                                                                                           | Existing owners preserved behind it                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Canonical Docs**   | Current-baseline foundation definitions; approved component guidance; approved pattern summaries; usage, anatomy, states, accessibility, exclusions, and concise implementation/adoption pointers.                                | Foundation/component catalogs, accepted decisions, canonical implementations, design-system router, and relevant tests. |
| **Workbench**        | Current Review; studies; product-context compositions under review; comparison controls; responsive previews; pressure fixtures; migration/adoption previews. Interactivity alone does not make an accepted specimen provisional. | `current-review.ts`, specimen renderers, fixtures, study files, review tests, and bounded handoffs/evidence.            |
| **Internal Records** | Project status, audit coverage, unresolved inventory, review readiness, detailed engineering handoffs, adoption gates, provenance, and historical evidence links.                                                                 | Progress derivation, plans, decision/evidence files, test map, and engineering handoff register.                        |

Items that currently mix roles are split as projections, not moved wholesale:

- Foundation detail: concise accepted definition in Canonical Docs; candidate
  direction from accepted foundations in Records/history; active stress studies
  in Workbench; evidence and provenance in Records.
- Component detail: accepted usage and states in Canonical Docs; interactive or
  otherwise provisional state sheets in Workbench; accepted interactive sheets
  may remain Canonical; audit/readiness/dependency detail belongs in Records.
- Charts: approved-for-now pattern guidance in Canonical Docs; source comparisons,
  responsive controls, simulated states, and pressure tests in Workbench;
  engineering/adoption constraints and evidence in Records.
- Tables and transaction systems remain later migration waves. Their current
  multi-family workbenches must not be misrepresented as single component pages.
- Screens is split by purpose rather than moved wholesale: an approved host
  example may appear with its Canonical pattern, an active comparison belongs
  in Workbench, and a production launcher/adoption example belongs in Internal
  Records. Status becomes an Internal Records entry rather than primary
  navigation.

### Inventory coverage baseline

The migration covers every ID and non-catalog route below. These lists are a
coverage snapshot, not a second authority; the referenced source remains the
owner and may add IDs before migration reaches it.

| Current owner/surface                              | Covered inventory                                                                                                                                                                                                                                                                               | Destination rule                                                                                                                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `foundation-catalog.ts`                            | color, typography, spacing, radius, layout, elevation, motion, iconography, accessibility                                                                                                                                                                                                       | Current baselines receive Canonical pages; exploratory studies remain Workbench; exact decision/evidence metadata remains Records.                                                  |
| `component-catalog-primary.ts`                     | button, icon-button, button-group, transaction-action, input, textarea, select, combobox, multi-select-filter, search, amount-field, asset-picker, checkbox, radio-group, switch, segmented-control, slider, global-navigation, product-navigation, link, tabs, pagination, stepper, breadcrumb | Current-baseline guidance projects to Canonical; provisional/exploratory output projects to Workbench; audit, implementation, readiness, adoption, and evidence project to Records. |
| `component-catalog-support.ts`                     | dialog, drawer, popover, dropdown-menu, tooltip, alert, toast, progress, spinner, skeleton, empty-state, badge, entity-identity, metric, card, table, data-table, chart, copy-value, accordion, collapsible                                                                                     | Same catalog-derived rule. Toast and Progress stay parked until a later authorized integration; Slider retains its assessment rather than gaining a candidate.                      |
| `/foundations` and `/components` overviews/details | overview lists, detail pages, status badges, relationships, evidence/history, output dispatch                                                                                                                                                                                                   | Split into destination-specific projections while keeping catalog IDs and canonical detail paths stable.                                                                            |
| `/studies`                                         | layout foundation/architecture studies and unresolved work                                                                                                                                                                                                                                      | Workbench, with accepted outcomes linked back to their Canonical owner.                                                                                                             |
| `/screens`                                         | live product/golden-screen launchers                                                                                                                                                                                                                                                            | Split by purpose: approved pattern host in Canonical, active comparison in Workbench, launcher/adoption evidence in Records; never canonical component chrome.                      |
| `/status`                                          | Current Review and progress dashboard                                                                                                                                                                                                                                                           | Current Review in Workbench; project/coverage machinery in Records.                                                                                                                 |
| `ComponentVisualOutput` and family workbenches     | ordinary state sheets; chart, table, navigation, governance, transaction, and auction compositions                                                                                                                                                                                              | Ordinary approved output moves into Canonical canvases; provisional and multi-family compositions remain Workbench; source/evidence detail remains Records.                         |
| Compatibility contracts                            | source-derived chart/table/transaction anchors and query state; chart preview HTML/fixtures; direct foundation/component routes                                                                                                                                                                 | Preserve as aliases or verified redirects until a generated consumer scan and browser matrix prove replacement parity; do not copy the audit's inaccurate Table query matrix.       |

Before S2a-1 edits the shell, S1 creates a derived migration ledger keyed by catalog ID
or route/anchor/query contract. Each row records current owner, current URL/state,
Canonical/Workbench/Records destination, migration slice, compatibility action,
and verification owner. Generate catalog rows from the typed sources; maintain
only non-catalog contracts manually. S8 requires this ledger to have no
unresolved or unverified row before deleting any old structure.

The post-merge cleanup queue begins with the two proved stale Studies claims;
the ambiguous Meaning-colors label; accepted-foundation candidate scaffolding;
Typography's stale relative copy and accepted Recommended refinements that must
remain current guidance rather than being reopened as candidate work;
Spacing/Elevation/Accessibility placeholders; the hashless Table default; the
unimported control-geometry matrix; the test-only product-facing audit; repeated
disclaimers; and duplicate chart control conventions. A queue entry authorizes
revalidation, not deletion. Every removal requires a current consumer/reference
scan, replacement ownership for unique content, and its affected test update.

## Proposed information architecture

The information architecture remains the S2a-1 shell, but its long-term runtime
owner is now a dedicated documentation entry in this repository. The entry
mounts the documentation router, localization, theme, tooltip support, and
documentation shell without importing the product `App`, `Layout`, wallet/chain
providers, updater tree, referral handling, product analytics/telemetry startup,
or chat. It consumes the same typed catalogs, decisions, implementations,
fixtures, tests, and presentation index; no content or status is copied into a
second authority.

The first entry slice preserves `/internal/design-system/*` paths, hashes, query
state, and the existing in-app route as a compatibility surface. Detailed and
Workbench renderers stay lazy. A specimen that genuinely needs a provider must
use an explicit fixture harness or remain on the compatibility route; it cannot
pull the product provider tree back into the global documentation root. The
standalone artifact and local server were verified before the local content
candidates. Hosted deployment remains gated by U11–U12. Removing the
compatibility route is a later parity and housekeeping decision.

```text
Register Design System
├── Start
│   ├── Overview
│   ├── How to read status
│   ├── Adoption workflow
│   └── Glossary
├── Foundations
│   ├── All foundations (continuous reference)
│   └── Color · Typography · Spacing · Radius · Layout · Elevation · Motion · Iconography · Accessibility
├── Components
│   └── Button (migration seed)
├── Patterns
│   ├── Charts (alias to the existing chart catalog entry; migration seed)
│   ├── Tables and records (temporary Legacy lab alias)
│   ├── Forms (temporary Legacy lab alias)
│   ├── Navigation systems (temporary Legacy lab alias)
│   └── Transactions (temporary Legacy lab alias)
├── Workbench
│   ├── Current review
│   ├── Experiments and studies
│   ├── Product contexts
│   └── Migration previews
└── Internal records
    ├── Adoption and engineering
    │   ├── Project status and coverage
    │   ├── Engineering handoffs
    │   └── Golden-screen adoption evidence
    └── Reference and history
        ├── Decisions
        ├── Detailed reference
        └── Plans and retained evidence
```

Desktop uses a dense persistent left sidebar with grouped, collapsible
navigation and a search trigger at its top. The content header owns breadcrumb,
page title, one primary design-status pill, and compact Code and Production
facts. Long pages use a right-rail table of contents derived from stable `h2`
anchors.
Narrow layouts use the same information hierarchy in a dismissible navigation
panel; they do not invent a second mobile taxonomy.

Foundations is a continuous, result-first reference rather than a card gateway.
Its default page lets someone scroll through all nine foundations with each
foundation's actual visual outcome, governing rules, and most important usage
guidance already visible. Sidebar items and the right-rail contents link directly
to those sections. Large headers, decorative summary cards, candidate-era
scaffolding, provenance, engineering constraints, evidence, and history must not
push the design-system results below the fold; technical and extra documentation
is collapsed by default. Stable foundation detail routes remain available for
deep links and genuinely substantial detail, but opening them is not required to
understand or browse the system.

Components is one continuous anchored reference grouped by job (Actions,
Fields, Selection, Navigation, Overlays, Feedback, Data display, and
Disclosure). Each component section shows its name, one-line job, compact
authority/adoption facts, supported-scope summary, and a lightweight real result
inline. Button flows directly into Icon button, Action group, Transaction
system, Text input, and the remaining catalog without requiring navigation into
and back out of detail pages. It does not mount the existing complete state
sheets or heavy workbenches: ordinary components use a purpose-built canonical
summary specimen; heavy, exploratory, paused, deferred, or not-planned entries
show the truthful current result and links rather than fabricating output.
Detail pages remain optional depth. Patterns exposes the existing chart,
table/records, form, navigation-system, and transaction compositions as aliases,
with child anchors where current routes already contain distinct families. The
migration ledger owns the complete grouping and route mapping.

### Primary-overview browsing contract

Every primary destination is a useful scrollable document, not merely a grid of
links. A newcomer can understand what the section contains, what is current, and
the important high-level result by scrolling or using anchors without repeatedly
navigating in and out. Detail pages remain for full state matrices, interactive
review tooling, implementation APIs, engineering constraints, and history—not
for basic orientation. Overviews use document sections, compact rows, and real
results rather than decorative header cards.

| Destination      | Visible in the overview                                                                                                                                         | Kept out of the overview                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Foundations      | All foundation results, core values/rules, compact authority, essential usage, and primary specimens in one anchored flow.                                      | Complete detail trees, rich studies, evidence, provenance, and engineering history.                              |
| Components       | Every component as an anchored section: name, job, compact status/scope, and a lightweight real canonical result or honest unavailable/current-state treatment. | Full state sheets, exhaustive variants, heavy family boards, Workbench controls, APIs, evidence, and history.    |
| Patterns         | Pattern families, approved composition rules, scope, and at most one lightweight canonical representative for each pattern.                                     | Pressure fixtures, responsive/source comparison controls, large scenario matrices, and adoption/engineer detail. |
| Workbench        | Current queue, study/review question, actual authority/activity state, owner, and concise scenario summary.                                                     | Mounted interactive workbenches, full fixture sets, and historical evidence bodies.                              |
| Internal Records | Derived current adoption/coverage/engineering signals and dated indexes into decisions, handoffs, and retained evidence.                                        | Full plans, evidence bodies, or an undifferentiated chronological archive.                                       |

The Components overview never mounts `ComponentVisualOutput`, complete state
sheets, heavy family canvases, or Workbench renderers. It may import canonical
component implementations through small documentation-owned summary specimens;
those specimens expose only supported variants and do not create a parallel API.
Patterns may use only dedicated lightweight canonical representatives—not
hidden live workbenches, iframes, invented product screens, or provider-dependent
previews. Workbench queue state derives from `CURRENT_REVIEW` and shows its empty
state directly. Internal Records derives current signals from existing owners
and cannot become a second hand-maintained tracker or leak record bodies into a
build where those records should be absent.

Charts uses one lightweight source-faithful canonical representative in the
Patterns overview during S4. It does not mount the full Chart family, review
controls, iframes, product screens, pressure fixtures, or provider-dependent
previews; those remain lazy Canonical detail or Workbench content.

Start explains this model and links directly to the most useful anchored result
in each destination. Narrow navigation exposes the same anchor hierarchy; it
does not replace the scrollable overview with a mobile-only drill-down tree.

Search indexes stable catalog IDs, human names, aliases, descriptions, and
canonical headings. Results are grouped by Canonical, Workbench, and Records,
with Canonical first. Detailed evidence contents are not silently indexed into
the default result set. Search remains keyboard operable and each result targets
a stable route/anchor.

One presentation index, `documentation-presentation.ts`, owns only human-facing
aliases, navigation group/order, page kind, and destination route for migrated
catalog IDs and non-catalog pages. Subject to U1/U3, it may also own temporary
Legacy lab aliases keyed to the existing Table/records, Forms, Navigation
systems, and Transactions catalog IDs/routes. Those aliases carry no invented
Canonical/Workbench classification and disappear as their rows migrate. The
index cannot own design/usage status or accepted rules, every catalog key must
resolve, and projection tests reject duplicate or orphaned keys. Until a surface
is migrated, search and approved temporary sidebar aliases present its
catalog-derived name/description under an explicit Legacy lab label.

### Routes and compatibility

- Preserve `/internal/design-system/foundations/:foundationId` and
  `/internal/design-system/components/:componentId` for canonical pages.
- Make `/internal/design-system/foundations#<foundationId>` the primary casual-
  browse target for foundation sidebar and search results. Preserve existing
  foundation detail routes as stable deep links and optional deep-dive surfaces;
  do not require them for ordinary foundation comprehension.
- Initially make Patterns navigation aliases to existing catalog IDs, routes,
  hashes, and query states. Do not add a typed pattern kind or require new
  `/patterns/:patternId` routes merely for presentation.
- Add explicit `/workbench/*` and `/records/*` routes only where they provide a
  new destination without breaking the existing state-restoration contract.
- Keep old top-level routes and all currently exercised hashes/query parameters
  as aliases until callers and browser tests migrate. Redirect only when the
  destination can restore the same review state and fragment.
- Keep standalone chart preview documents and fixture routes until Workbench
  isolation proves equivalent.
- Catalog IDs remain the stable identity. Presentation routes may map from them;
  they must not mint a competing ID system.

### Rejected alternatives and pressure case

- Restyling the current pages in place is rejected because it leaves temporary
  review content and project machinery inside canonical reading paths.
- An independent framework or duplicated documentation application remains
  rejected. A dedicated entry in this repository is now required because the
  measured route-aware shell could not avoid production-only initialization.
  It creates a runtime/build boundary while preserving one source and authority
  system.
- Charts is the pressure case. The architecture is not accepted if a newcomer
  cannot distinguish its approved pattern, interactive review specimens, host
  context, and engineering/adoption record on desktop and phone.

## Simplified human-facing status

The default UI shows one primary design-status pill plus two compact, explicitly
labeled facts: **Code** and **Production**. This resolves the independent
baseline's important design-versus-adoption distinction without reproducing two
large status axes. The projection is deterministic and read-only; it never
writes a second source of truth.

| Primary pill    | Meaning                                              | Typed derivation                                                                                      |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Accepted**    | Current guidance may be used as the design baseline. | `designAuthority: current-baseline`; “approved for now” detail may remain in scope copy.              |
| **Exploring**   | Evidence or a candidate exists but is not authority. | `designAuthority: exploratory`; an `in-composition` output may add “seen in <composition>” as detail. |
| **Not started** | No accepted or exploratory design contract exists.   | `designAuthority: undefined` unless the Not planned rule applies.                                     |
| **Not planned** | The system explicitly does not plan this item.       | `status: not-needed`, with the typed rationale in expanded detail.                                    |
| **Superseded**  | A newer owner replaced this guidance.                | `designAuthority: superseded`; show the successor link in Records.                                    |

**Code** renders the exact implementation fact in short language: no module,
lab specimen, reusable recipe, or reusable module with its path. **Production**
renders not in production, opt-in, or in use. `adoptionStatus: in-use` remains
the only source for an in-product claim. Foundations omit Production where it
does not apply.

**Awaiting human review** appears only when the ID is present in
`CURRENT_REVIEW`. `review.status: ready` becomes collapsed engineering detail
(“review readiness: available, not scheduled”), never a visible review-queue
claim. Paused and Deferred are Workbench activity labels, not canonical design
authority. They must be explicitly owned and must not be inferred from prose.
Capital-D **Deferred** activity is therefore distinct from the typed lowercase
`review.status: deferred` readiness value below.
Whether Paused becomes an additive typed catalog field or a presentation-only
annotation is U2 and must be decided before S2a-1 because the Components index
will expose the paused transaction row. A presentation-only annotation may own
activity only; it cannot redefine design authority, review readiness, or
adoption. A typed field requires the separately approved foundation review.

`review.status: deferred` remains collapsed review-readiness detail and never
derives **Not planned**. It means no review is scheduled; it does not mean the
system has decided the item is unnecessary. Only the owning `status:
not-needed` field produces **Not planned**. For example, an undefined item whose
review is deferred remains **Not started** unless its typed owner explicitly
changes that design-plan status.

An **Accepted** item with a provisional or partial review/dependency boundary
shows one compact sourced scope line beside the primary status facts. The line
states exactly what is accepted and names the still-open boundary; it links to
the owning catalog/decision text and does not paraphrase a broader rule. Full
scope and exclusions remain in Rules and engineering detail.

The expanded engineering section retains the exact audit, implementation,
review-readiness, dependency, and adoption fields. The detailed project tracker
retains its machine gates; the ordinary human summary does not surface them all.

## Standard page templates

### Universal result-first contract

Every Canonical foundation, component, and pattern section begins with the
answer to **“This is the system.”** A casual reader must encounter the current
tokens/rules, real component result, or approved composition before review
machinery, provenance, comparisons, implementation detail, or history. The
opening may include identity, derived authority/adoption facts, and one concise
sourced scope boundary when needed to prevent over-reading.

If no accepted result exists, the section begins with the truthful current
state—Exploring, Paused, Deferred, Not started, or Not planned—plus what exists
and where. It never fabricates a specimen to make the page appear complete.

Canonical usage examples are optional. When an example is necessary, every
visible UI element uses an already-approved design-system component or an
explicitly accepted product composition. If an owner is missing, define and
approve it first, omit the example, or keep it in Workbench. A hand-built
product-like composition cannot be Canonical guidance for only one of its
visible properties.

Every Canonical foundation, component, and pattern page then uses one five-tier
reading order. The specialized templates below refine it rather than inventing
different page grammars.

1. **Primary system result** — name, one-line job, one status pill,
   Code/Production facts where applicable, one necessary scope line, and the
   actual rules/tokens/specimen or honest current-state treatment.
2. **Rules and guidance** — anatomy, variants, supported states, use/not-use,
   accepted scope, exclusions, accessibility, and accepted decision studies.
3. **Related** — visible sibling, dependency, and pattern links rather than a
   hidden navigation disclosure.
4. **Engineering and adoption** — collapsed implementation/adoption metadata,
   dependency and verification seams, review readiness, and engineer-review
   constraints.
5. **Decisions and history** — collapsed evidence, open questions, superseded
   candidate direction, next action, plans, and receipts.

Core design-system outputs are not “technical extras”: color roles, typography
slots, spacing values, radii, layout rules, motion durations, icon sizing, and
accessibility requirements remain visible and searchable. Source paths,
implementation metadata, audit/readiness fields, verification seams, evidence,
candidate history, and receipts are closed by default; a deep link may open and
focus a specific disclosure.

Do not display a decision title or date merely because a catalog row is accepted.
Link a real accepted-decision/history anchor when one exists; otherwise label the
catalog record honestly and record the missing decision anchor as an authority
gap. `review.scope` is edited into source-backed accepted-scope and exclusion
statements instead of being rendered as a long status paragraph.

### Foundations continuous reference and detail pages

The default Foundations page renders all nine foundation sections in one reading
flow. Each section puts the result before its documentation:

1. Foundation name, compact authority state, and one-sentence purpose.
2. The actual primary visual result or token/role specimen—not a decorative
   preview card that acts as a gateway.
3. The small set of governing rules and common usage guidance needed for casual
   comprehension.
4. Compact do/don't, accessibility, responsive, and related-component guidance
   only where it materially changes use.
5. Collapsed implementation, open decisions, authority, provenance, evidence,
   and history.

Sections use ordinary document rhythm rather than nine competing cards. Every
section has a stable anchor and clear visual separation, but the user should be
able to continue scrolling without repeatedly entering and leaving pages. A
foundation detail route may expand substantial specimens or technical material;
it repeats enough of the visible result to remain understandable when opened as
a direct deep link. The aggregate page uses purpose-built catalog-derived
summaries and primary specimens; it does not mount nine complete
`FoundationDetail` trees, rich studies, Workbench content, or evidence trees.

### Component page

1. Real canonical component result, one-line job, derived status, and one
   necessary accepted-scope boundary.
2. Supported variants, sizes, states, and behavior directly sourced from the
   implementation/catalog/accepted decision.
3. Content and accessibility guidance.
4. Optional approved-component usage example only when it materially adds
   information the component result cannot show.
5. Visible Related components and explicit exclusions.
6. Collapsed implementation/API, adoption, provenance, and engineering detail.

### Pattern page

1. User problem and approved composition rules.
2. Required parts, ownership boundaries, and data/behavior assumptions.
3. Default, responsive, and meaningful edge-state specimens.
4. Accessibility, localization, and interaction guidance.
5. Adoption boundaries and product-specific exceptions.
6. Links to Workbench scenarios and Internal Records.

### Specimen canvas

Every non-trivial render has three explicit layers:

1. **Documentation** — page prose, navigation, status, and specimen controls.
2. **Host context** — named width/theme/product-context frame, with the owner of
   outer padding and background stated.
3. **Specimen** — the component/pattern boundary itself.

The canvas provides a stable anchor, reset, theme/viewport controls only when
the specimen needs them, and an isolated/open-in-context link. It must not add
card padding or decorative chrome that can be mistaken for component anatomy.
Controls and host labels are outside the measured specimen boundary. Static
examples use the same canvas contract without unnecessary controls.

Every non-neutral host carries a concise host caption. Every specimen carries
one provenance line in a stable shape (data source/capture, host, and whether it
is lab-only or production-derived); repeated disclaimer paragraphs are removed.
The three layers expose testable boundary/host attributes so automated checks
can assert ownership without treating a proposed TypeScript API as pre-approved.

### Workbench page

1. Persistent non-canonical-tooling marker, the item's sourced authority, and
   the exact question under review when one exists.
2. Primary authority, rendered precedent, and what must not be inferred from it.
3. Scenario/fixture scope and named host context.
4. Specimen canvas plus only the controls needed to inspect relevant states.
5. Preserved decisions, open decisions, and explicit exclusions.
6. Review prompts and durable evidence/Current Review links.

### Internal record page

1. Concise record summary, owning source, owner, and current/superseded state.
2. Exact design, implementation, verification, and adoption metadata.
3. Engineer-review constraints and affected production seams.
4. Decision, handoff, test, and retained evidence links.
5. Archived material grouped below current records and clearly dated; no raw
   chronological dump in the default view.

## Canonical, Workbench, and record boundaries

- Canonical Docs shows only current-baseline guidance and explicitly scoped
  approved-for-now patterns. A rendered specimen alone never qualifies content.
- Workbench is visibly **non-canonical tooling** at the shell, page, and canvas
  levels. Each item retains its sourced authority: an accepted comparison does
  not become provisional merely because Workbench hosts its controls, while a
  candidate must display its real provisional/review state. Workbench may consume
  canonical owners and product evidence but cannot promote either itself or its
  contents.
- Internal Records exposes provenance and project mechanics progressively. It
  is reachable but visually secondary and is not part of the ordinary designer
  reading path.
- Product-context hosts are labeled evidence. They preserve real jobs and
  constraints without implying that their surrounding product layout is a
  reusable component contract.
- Canonical pages link to, rather than restate, the exact decision and engineering
  sources. Concise human summaries are tested against their catalog owner and
  updated when that owner changes.

During S1, define the normative-claim rule before S2a-1 implementation: visible guidance either renders an
existing typed field directly or carries a stable source key/link to its current
authority. A genuinely new reusable rule is first added to its owning catalog,
decision, component, or domain guide; it is never born only in documentation
prose. Projection tests check that source keys exist and remain authoritative.
They do not claim to prove free-form prose is semantically equivalent.

S1 must also settle, with explicit human architecture approval, how Workbench
and Internal Records summarize owners that exist only in markdown headings,
tables, or inline study objects. Choose one bounded mechanism: tested build-time
heading/source extraction, or a minimal typed presentation index limited to
`sourceKey`, route, question, owner, and activity. The latter cannot copy
normative guidance, accepted scope, decision prose, engineering conclusions, or
record bodies. Both mechanisms must fail on a missing/renamed source and link to
the owner; neither becomes a second hand-maintained decision or engineering
register.

## Agent-authority preservation safeguards

- Keep source precedence in `design-system-v1.md` and the design-system router
  unchanged. The documentation shell is not added above typed authority.
- Generate navigation/status/search records from existing catalog IDs and fields
  where possible; do not create a parallel hand-maintained catalog.
- Retain `CURRENT_REVIEW`, context-source roles, progress derivation, family
  guides, fixtures, test maps, handoffs, and evidence at their existing paths.
- Add projection tests that fail on missing/duplicate IDs, invalid destination
  classes, broken authority links, or a human Approved label without a current
  baseline.
- Treat existing route/hash/query contracts, catalog and implementation-source
  keys, `data-testid` values, Current Review/progress shapes, and the tests that
  consume `product-facing-component-audit.ts` as migration inputs. The derived
  ledger records their disposition; it does not duplicate their authority.
- Add one concise lab-area-guide pointer naming the human-status derivation
  owner and stating that machine fields remain authoritative. Do not rewrite
  workflow skills or broaden the guide into a second IA specification.
- Keep implementation delegation under the existing bounded-handoff rule.
- During the first wrapper migrations, treat `charts/`, `table-family/`,
  `auctions-*`, and `transaction-*` internals as read-only. A separately bounded
  owner may change them only after their existing decisions and dirty-work
  ownership are reconciled.
- Preserve Toast/Progress/Slider Claude materials in the detached
  small-components package. Later integration must use the improved handoff and
  classify those drafts as integration evidence, not first-pass composition
  proof.

## Upstream synchronization stage

S0 completed this stage on 2026-09-16. The inputs and recoverable sequence below
remain as the audit trail for that integration; the current result is the merge
and receipt named in Current state. They are not instructions to repeat the Git
operations during S1.

### Verified read-only state

- Remote/default: `origin` → `refs/remotes/origin/master`.
- Fetched target: `715fa19067299a10535043d9b95a15edf9676251`.
- The pinned `origin/master` does not contain the lab route or directory. This
  does not prove production or branch-preview behavior; those remain dashboard-
  configured and require the pre-push verification gate below.
- Current/fork: `49f9f22ae` / `2312d5434`.
- Divergence: 22 local commits, 17 upstream commits.
- Dirty state: 49 tracked modifications, 0 staged, 623 untracked paths after
  adding this plan.
- Nine pre-existing stashes are present. They are unrelated recovery state and
  remain untouched throughout checkpoint, integration, promotion, and recovery
  proof.
- Upstream changes no `src/views/internal/design-system/**` or
  `src/components/design-system-v1/**` path directly. It does change the app
  route, product Overview, chat launcher, packages, locales, and shared project
  records that the current branch also touches.
- Read-only merge simulation against committed `HEAD` predicts textual conflicts in
  `src/components/dtf-chat/index.tsx` and
  `src/views/index-dtf/overview/CLAUDE.md`. This is not an exhaustive forecast
  for the eventual checkpoint: current dirty work also overlaps upstream in
  `docs/wiki/log.md`, `docs/wiki/progress.md`, `e2e/TEST_MAP.md`, and the four
  locale catalogs. Reconcile rather than choose one side: keep internal-docs
  launcher suppression together with upstream drag and Overview visibility
  behavior; keep both upstream Overview routing/testing guidance and the local
  chart-lab seam guidance.
- High-risk additive groups are `docs/wiki/{log,progress,zapper}.md`,
  `e2e/TEST_MAP.md`, `package.json`/lockfile, `src/app-routes.tsx`, the four
  locale catalogs, and the Overview chart/product restructuring.

### Recommended recoverable sequence

1. Human confirms `origin/master` as the target and authorizes the checkpoint
   operations.
2. Freeze writers. Classify the 623 untracked paths into intentional
   source/tests/templates/evidence versus transient reports. Preserve unrelated
   work; do not add ignored dependencies, `.env`, build output, or test output.
   The intentional checkpoint set must explicitly include the untracked
   implementation-handoff template, lab guidance, Chart source and
   next-family files, Chart tests/specifications, read-path receipt/verifier,
   and retained evidence that the active log or plans cite. Classify exact paths
   at the checkpoint; do not create a broad repository manifest or sweep in
   unrelated work.
3. Create scoped local checkpoint commit(s) for that approved inclusion set with
   a path-level receipt and fresh affected verification. Do not use a stash for
   this volume of untracked evidence, and do not apply, drop, rewrite, or clear
   the nine existing stashes.
4. Create a named safety ref at the checkpoint.
   If the human approves an explicit destination outside the repository, also
   create an external Git bundle of the checkpoint and verify that it contains
   the commit. The bundle is optional and no location is inferred.
5. Rerun path-overlap and read-only merge simulation against the exact checkpoint;
   replace the preliminary two-conflict forecast with that result.
6. Create a clean integration worktree/branch from that checkpoint, leaving the
   current checkout untouched. Re-fetch and pin the exact target SHA if master
   moved; stop for confirmation if the upstream set materially changed.
7. Merge the pinned upstream commit. Prefer a merge over rebase so the 22 local
   commits and the recovery point stay legible.
8. Resolve every checkpoint-derived conflict by preserving both intents, then
   reconcile the additive docs/locales/package/routing groups. Do not import the
   paused small-component worktree during this merge.
9. Run scope-derived verification, then the repository gate and mounted checks
   for Overview, chat dragging/internal-doc suppression, locales, and existing
   design-system/chart routes. Perform a focused design-system impact review
   before any shell slice begins.
10. Keep ref ownership explicit: `design-system-v1` remains the project branch;
    the integration owner works only on a dated `codex/design-system-v1-upstream-*`
    branch; a dated `codex/safety-design-system-v1-pre-upstream-*` ref remains at
    the checkpoint. Bind the verification receipt to the exact merge commit and
    request separate human approval before promoting it.
11. Promotion is a fast-forward-only move of `design-system-v1` to that verified
    merge commit from the clean current checkout. Stop if the project branch,
    worktree, or upstream target changed since the receipt. Retain the safety ref
    through post-promotion smoke and prove it can seed a clean recovery worktree.
    A failed integration leaves the project branch at the checkpoint; no reset,
    ref deletion, or backward branch move occurs without explicit approval.

## Delegation topology

The coordinator owns the plan, shared tree, content model, convergence, and
final verification. Read-only discovery uses Swarm coverage because the packets
have independent outputs and no write overlap. Implementation uses one bounded
handoff per vertical slice; workers never edit the same shell/catalog projection
files concurrently.

| Packet                            | Topology/posture                                                           | Owned result                                                        | Done predicate                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Initial lab/content inventory     | Read-only coverage worker (complete before Claude's later audit)           | Baseline destination map, seed selection, compatibility risks       | Coordinator verified representative routes and owners for the independent plan.                                |
| Independent IA/content audit      | Claude read-only coverage (complete)                                       | Full route/content/status/preservation report                       | Full report read; working-tree caveat and factual claims checked.                                              |
| IA reconciliation                 | Coordinator plus read-only fact/reconciliation reviews (complete)          | Revision note, corrected claims, revised stages and approval gates  | Durable plan preserves the baseline and records agreements, additions, and conflicts.                          |
| Upstream/default/divergence audit | Read-only risk worker (complete)                                           | Exact refs, dirty overlap, conflict simulation, checkpoint strategy | Coordinator independently verified default, fork, divergence, overlaps, and fetched state.                     |
| Upstream integration              | One integration owner after approval                                       | Clean integration branch/worktree and reconciliation receipt        | Merge verified; no lost local/upstream intent; design-system impact recorded.                                  |
| Each migration slice              | One implementation owner with required design-system handoff               | Slice-owned routes/components/tests/evidence                        | Affected-surface run and durable evidence pointer; coordinator inspects output.                                |
| Newcomer evaluation               | Read-only observed-task coverage after Button, then the full hosted S5 run | Task timings, failures, and disposition                             | Early non-Chart findings are repaired before S4; complete hosted findings are repaired or explicitly accepted. |

Dark/Light review follows the existing medium/high risk budget after each
meaningful slice. Concurrency is reserved for independent inspection or platform
coverage, not competing edits to the shell.

## Slices

- **R0 — IA audit reconciliation (complete; documentation only).** Preserved
  the independent plan, incorporate Claude's later evidence, correct stale or
  unsupported claims, and obtain the decisions below. R0 performs no shell,
  migration, checkpoint, merge, commit, or push.
- **S0 — Recoverable upstream integration and impact pass (complete).** The
  pinned upstream merge, verification, promotion, safety ref, and preserved
  detached packages are recorded in the S0 receipt. S1 deliberately remains a
  separate post-merge content and compatibility rebaseline; do not repeat the
  Git operations as part of documentation work.
- **S1 — Post-merge rebaseline and migration ledger**; complete after S0. Rechecked
  every audit finding against the integrated tree and a current render; derive
  the catalog/status counts; inventory protected routes, hashes, query states,
  preview documents, test IDs, and active owners; classify each destination and
  cleanup candidate; settle the presentation mapping without changing typed
  authority; and obtain U13 on markdown/inline Workbench and Records derivation.
  Correct the hashless Table default and stale Studies labels only in later
  owning slices after this revalidation, not opportunistically in S1. As S1's
  final pre-implementation gate, measure the unchanged lab route's
  provider/network baseline: denied-network usability, wallet/write behavior,
  analytics/updater requests, and initial bundle/runtime cost. Return its facts
  and recommendation for U10; no privacy/performance budget exists yet, so the
  baseline cannot autonomously accept the inherited provider boundary.
- **S2a-1 — Neutral shell, navigation, status, and Components index**;
  implementation-verified and human/engineer-review-required after S1 and the
  2026-09-16 approval of U1–U4, U10, and U13. The shell bypasses product
  header/chat; adds Start, desktop and narrow sidebar
  navigation, grouped search, right-rail TOC, sourced status projection, stable
  aliases, temporary Legacy lab aliases if approved, and the concise lab-guide
  ownership pointer. Replace the old navigation's visible role while retaining
  compatibility contracts. Establish the primary-overview browsing contract and
  explicit empty Current Review without pretending unmigrated destinations are
  complete. Make Components a result-bearing index rather than a state-sheet
  wall. The Paused owner selected in U2 must exist before the transaction row
  renders; no prose inference is allowed. Because this changes global layout and
  routing behavior, its handoff is **Engineer review required**. Preserve an
  `#app-container`-compatible scroll owner or deliberately update and verify the
  `ScrollToTop` contract so route changes do not silently lose scroll reset.
  The final rerun observed no wallet prompt or mutating call, but the inherited
  provider/request/payload cost remained material. That planned stop fired and
  was resolved by the verified standalone-entry choice; it no longer blocks the
  completed local content candidates. The
  [S2a-1 receipt](design-system-documentation-shell/README.md) recommends the
  standalone entry.
- **S2a-entry — Standalone documentation runtime**; implementation-verified and
  **Engineer review required** after S2a-1 and R1. The
  [receipt](design-system-standalone-entry/README.md) records the dedicated
  artifact, zero provider/external startup trace, direct-route matrix, product
  compatibility, scoped identity, and review repairs. Build the smallest
  separate documentation entry in this repository and mount
  the existing shell/router without the product `App`, wallet/chain providers,
  updater tree, referral capture, analytics/telemetry startup, product chrome,
  or chat. Preserve current paths and the in-app compatibility route. Do not
  migrate or redesign any foundation, component, pattern, Toast, or Progress in
  this slice. Verify denied-network usability, zero wallet/provider startup,
  direct deep-link reloads, product-route non-regression, and absence of wallet
  code from the documentation artifact. This shared routing/build boundary is
  **Engineer review required**.
- **S2a-2 — Color and foundation-section pilot**; implementation-verified local
  candidate; human visual review required. Replaced
  the Foundations card gateway with the continuous anchored document grammar,
  and fully migrated Color as the first result-first section: semantic aliases,
  light/dark values, purpose and boundaries first; audit counts, comparisons,
  alternatives, token-usage evidence, and candidate history later or linked to
  Records/Workbench. Added the specimen canvas, its three testable boundaries,
  stable anchors, scroll restoration, narrow/wide behavior, and baseline
  migration. Canonical Color examples use approved owners or are omitted.
- **S2b — Remaining foundation summaries, beginning with Typography**;
  implementation-verified across all nine Foundations; human visual review
  required. Applied the Color grammar to Typography, then the remaining
  foundations in bounded batches. Render typed current-baseline rules first;
  show Layout's exploratory state honestly; keep provisional recipes visibly
  provisional; move candidate direction, stress studies, comparisons, and
  hand-built examples to Workbench/Records. Typography preserves the accepted
  refinements, fixes stale relative copy, and uses approved owners for any
  retained context example.
- **S3 — Continuous Components reference**; implementation-verified across all
  45 catalog entries; human visual review required. Converted the row-only
  overview into anchored inline-result sections beginning with Button, Icon
  button, and Action group. Each section shows the real canonical result,
  one-line job, supported scope, and compact status/adoption facts without
  mounting the existing full state sheet. Button separates provisional
  InlineAction/CSV material, promotes accepted loading/hierarchy guidance, and
  proves the ordinary component/detail template and specimen boundaries.
- **S3a — Early local newcomer/readiness gate**; complete for the local
  candidate. Independent cold-newcomer/readiness audits drove the bounded polish
  receipt and rerun. This local gate did not include the complete hosted human
  evaluation and does not replace S5's full run.
- **S4 — Patterns documentation**; implementation-verified across five
  Patterns and deepened by the complete pass; human visual review required. Projected the
  approved-for-now guidance into the Patterns navigation alias, separated
  interactive review controls/source comparisons/responsive and pressure
  content into Workbench, and exposed adoption/engineering history through
  Records while preserving all existing internals, hashes, query state, preview
  documents, tests, and evidence. Canonical Patterns must still show a
  source-faithful Chart results; “zero live representatives” means
  zero review environments or heavy interactive families, not a text-only
  gateway. The first slice is wrapper-only: do not edit
  `charts/` family internals or the frozen source renders. Replacing the two
  viewport-control conventions is a separately bounded follow-up, not silent
  wrapper cleanup. Preserve the loopback iframe/source-URL tools for local
  review. Without editing Chart internals, verify that non-loopback hosting uses
  the existing inline/direct fallback, that built output contains every required
  target, and that CSP allows the supported direct navigation without weakening
  `frame-ancestors`. Use Charts to prove that the Patterns overview can expose
  one lightweight canonical result while Workbench summarizes review tooling
  and Records exposes adoption constraints without mounting the full Chart
  family or Workbench machinery.
- **S4a — Documentation share-readiness repair**; implementation-verified and
  human-review-required. The [bounded handoff and receipt](design-system-documentation-share-readiness-handoff.md)
  repair late-layout anchors, keep primary destinations fixed beside a
  scroll-tracked current-page tree, route complex component entries to their
  real Pattern/Workbench surfaces, and add the mobile/search/skip-link states
  required for sharing. Component-level findings remain in the engineering
  handoff and are not silently treated as documentation fixes.
- **S5 — Shareable preview and full newcomer validation**; next gated stage,
  blocked by decisions U11–U12 and human review of the local candidate. Publish
  a non-production preview only after its
  no-index/access configuration, branch-preview behavior, and Records exposure
  boundary pass the pre-publication gate; then verify direct deep-link reloads,
  built assets, security headers, and all newcomer tasks below. Repair failures
  in their owning slice and retain the evaluation record.
- **S6 — Remaining catalog gaps and adoption preparation**; blocked by: S5.
  The complete pass already supplies the continuous ordinary-component reference
  and completed the Select specimen pilot. After hosted/newcomer review, address
  only catalog entries whose accepted result or implementation is genuinely
  missing, plus separately authorized production-adoption work. Preserve the
  established anchored summary and optional deep-dive grammar.
  Toast and Progress may enter only through a separately authorized integration
  slice using their preserved Claude drafts; those drafts do not prove clean
  first-pass composition.
- **S7 — Remaining Workbench and record cleanup**; partially completed ahead of
  S5 by the complete pass. Charts, Tables, Navigation, and the paused Transaction
  explorer now have their target documentation structure. Remaining owner-bounded
  work is limited to Auctions/Studies contradictions, product-context and
  Internal Records cleanup, and any issue found by human/hosted newcomer review.
  Preserve paused/deferred systems and their unique engineering context rather
  than flattening them into ordinary pages.
- **S8 — Contract old lab structures and housekeeping**; blocked by: every
  intended ledger row reaching route/evidence parity. Remove superseded
  overview/dispatcher/navigation structures, candidate-era scaffolding,
  placeholders, and confirmed dead files only after consumer/reference scans
  and replacement tests. `product-facing-component-audit.ts` remains until its
  unique decision lanes have a replacement owner and its two consuming tests
  deliberately migrate. Finish with a dedicated documentation housekeeping pass.

## Newcomer-oriented usability checks

Use fixed tasks with people who did not build the shell. Preserve the first run,
repairs, and rerun result.

1. From the root, find Button and state whether its design is approved and
   whether it is already used in product. Target: correct answer in 45 seconds.
2. Find the supported Button states, implementation pointer, and one explicit
   exclusion. Target: all three in 90 seconds without opening raw project status.
3. Open Charts and identify which content is approved guidance, which is a
   simulated review state, and which needs engineer review before adoption.
   Target: no authority/adoption misclassification.
4. Copy a deep link to one Chart Workbench state, open it in a fresh tab, and
   recover the same state/section. Target: exact restoration without manual
   navigation.
5. On a 320–390px viewport, find search/navigation, inspect a specimen, and
   return to the page without horizontal document overflow or trapped focus.
6. Find Typography, identify the approved numeric-data rule, and navigate to a
   component that consumes it. Target: correct rule and relationship in 90
   seconds without entering Workbench.
7. Open Foundations and identify the current Color, Typography, and Spacing
   results by scrolling only, without leaving the route or using back navigation.
   Then intentionally open Typography's implementation/history detail and return
   to the same scroll position. Target: core results are understandable without
   expansion and technical depth is available on demand.
8. After Select migrates, state whether it is accepted, name its supported
   sizes, find its import/adoption path, and identify whether popup density is
   final. Target: correct authority, 44/32px geometry, production status, and
   open decision within two navigation steps.
9. After the Tables slice, ask for the current approved auction table. Target:
   the default path does not expose the deferred workspace first.
10. Ask what is waiting for human review while `CURRENT_REVIEW` is empty. Target:
    an explicit empty answer in one navigation step, with no inference from
    review-readiness metadata.
11. Ask an engineer which opt-in shared renderer seams Charts added and what
    blocks production adoption. Target: the relevant register entries and
    adoption boundary in two navigation steps.
12. Run the agent route from the design-system router through one catalog entry,
    its foundations, implementation source, and decision/evidence pointer.
    Target: unchanged authority path and existing routing/catalog tests green;
    the human shell is not required reading.
13. After their overview migrations, browse Components, Patterns, Workbench, and
    Internal Records without opening child pages. Identify what Button is for and
    its authority/adoption state, which pattern families have current guidance,
    what awaits review, and where adoption blockers and accepted decisions live.
    Then open one deep dive and return to the same overview position. Target:
    correct orientation without repeated in/out navigation or authority confusion.

Automated checks cover keyboard search, focus restoration, route/anchor reload,
status mapping, reduced motion, light/dark, and 320/390/768/1400 boundaries.
Human observation covers naming, orientation, authority comprehension, and
whether progressive disclosure hides information people actually need. Record
clicks, elapsed time, the first answer, each substantive repair, and the rerun
result rather than keeping only the final successful outcome.
The agent journey is verified separately by the existing catalog/router/context
tests and an unchanged-authority source check; agents are not expected to scrape
the human shell.

## Shareable-preview strategy

Start with the existing Vite/Cloudflare Pages delivery path and a branch preview
for the same build. The dedicated route-aware shell gives designers a neutral
experience without introducing a second deployment system. Preview acceptance
requires direct SPA deep-link reloads, stable assets and direct fallbacks for
local-only iframe tools, an explicit access/indexing policy, and a visible source
revision.

Before any push or other publication event containing the lab, inspect the
actual Pages project/dashboard: production branch, branch-preview behavior,
preview hostname, deployment source, and Cloudflare Access attachment. Repository
files do not establish those settings. Until that check passes, treat a push as
potential publication and keep integration/promotion local. The first publishable
slice must emit an `/internal/*` `X-Robots-Tag: noindex, nofollow` override and
verify it on direct responses. `robots.txt` is only crawl guidance; neither it nor
`noindex` is authentication or an access-control boundary.

Treat Cloudflare Pages as a likely path, not a verified deployment fact:
`CF_PAGES_COMMIT_SHA` and copied `_headers` show integration seams, while repo
evidence does not establish a configured Access policy or public exposure. The
preview receipt must inspect the actual emitted build. In particular,
`mobile-preview.html` is a Vite input but the next-families preview currently is
not; neither may be assumed available at a hosted URL.

The current `frame-ancestors 'none'` policy means the hosted experience must be
navigated directly; iframe-based external embedding is not part of this plan.
Do not weaken security headers merely for convenience. If a preview must be
private, decide the Cloudflare access/auth boundary before publishing. Consider
a separate docs entry or host only if provider/network initialization, bundle
weight, or access policy makes the same-build route unsuitable after the S2a-1
post-shell acceptance measurement.

The recommended first preview protects the entire same-build site with
Cloudflare Access and may therefore include Internal Records for the invited
team. A public-unlisted alternative must compile Records content and routes out
of that build, exclude them from search, and scan emitted assets to confirm the
records are absent; client-side route denial or hidden navigation is not a
confidentiality boundary. The current global `X-Robots-Tag: index, follow` must
be overridden for `/internal/*` with a verified `noindex, nofollow` policy before
either preview publishes. S5 tests direct Records URLs, built-asset/search
leakage, response headers, dashboard-backed access behavior, and branch-preview
policy in addition to ordinary navigation. The actual dashboard configuration
remains unknown until that receipt is captured.

## Acceptance evidence

| Criterion                                                                                        | Slice/evidence                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neutral shell has no product header/chat and remains accessible at narrow and wide widths        | S2a-1 mounted desktop/phone captures, DOM/keyboard pass, engineer handoff, and verified `#app-container`/`ScrollToTop` compatibility.                             |
| Retained App-root providers are safe for the docs route or trigger an explicit architecture stop | S1 pre-shell and S2a-1 post-shell denied-network, wallet/write, request, and bundle/runtime measurements with an explicit delta and disposition.                  |
| Standalone documentation does not initialize product runtime boundaries                          | S2a-entry separate-artifact inspection, denied-network run, zero wallet/provider/RPC/analytics startup trace, direct-route matrix, and product-route regression.  |
| Persistent navigation/search reaches stable canonical routes                                     | S2a-1 search-unit, keyboard, Canonical/Legacy alias, and direct-reload tests.                                                                                     |
| Every primary destination begins with the actual system and supports selective deep dives        | Migrated-overview captures, stable anchors/back restoration, derived-status checks, empty Current Review, and absence of heavy child renderers.                   |
| Foundations keeps actual results foregrounded in one continuous, casually scannable reference    | S2a-2 Color pilot plus S2b all-section/anchor assertions, closed technical disclosures, narrow/wide captures, scroll restoration, and render/DOM-cost comparison. |
| Components supports continuous casual browsing with real lightweight results inline              | S3 Button/Icon button/Action group sections, same-page anchor navigation, no full-sheet/Workbench imports, and overview cost comparison.                          |
| Canonical examples never teach unapproved surrounding UI                                         | Source-owner assertions plus visual review of every retained example; invented or ownerless compositions are absent from Canonical output.                        |
| Canonical, Workbench, and Records are unmistakable                                               | S2b Typography, S3 Button, S4 Charts captures plus newcomer classification task.                                                                                  |
| Human status is simple but truthful                                                              | Projection unit table and exact source-link inspection in S2a-1/S3; Paused owner fixed before rendering; no duplicated writable status.                           |
| Page and canvas templates preserve boundary ownership                                            | S3 geometry assertions and default/edge-state captures; S4 Charts pressure test.                                                                                  |
| Agent authority and discoverability are unchanged                                                | Catalog/inventory/context-routing tests, router/source hash or no-diff evidence, and bounded-handoff verification after each slice.                               |
| Existing deep links remain recoverable                                                           | S1 ledger plus S2a-1–S4 alias/hash/query/preview route matrix with fresh-tab reload checks.                                                                       |
| Preview is shareable under an explicit policy                                                    | Pre-push Pages/Access/noindex gate plus S5 deployed URL receipt, revision marker, direct-route smoke, response-header inspection, and access proof.               |
| Old lab structure is removed safely                                                              | S8 reference scan, migrated route/test map, no broken links, and docs housekeeping receipt.                                                                       |

Every implementation slice ends with a final post-edit affected-surface run and
a durable evidence pointer under `docs/plans/`. Static checks do not substitute
for rendered review. Repository-wide verification is reserved for S0 integration,
shared shell/provider changes, preview/release boundaries, and final contraction.

## Test seams

- Pure status-projection and navigation/search-index functions derived from the
  catalogs.
- Standalone-entry tests proving documentation startup does not import or
  initialize the product `App`, wallet/chain providers, updater, analytics,
  referral, chat, or product layout; inspect the emitted artifact as well as
  runtime requests and provider calls.
- Pure overview projections sourced from catalogs, `CURRENT_REVIEW`, progress,
  and record indexes, plus import/DOM assertions that heavy detail renderers are
  absent rather than merely hidden.
- Route tests for canonical, Workbench, Records, aliases, fragments, and query
  restoration.
- Foundation-summary tests proving all current foundation headings and primary
  results are present on the continuous route, sidebar/search anchors restore
  correctly, and full detail/Workbench/evidence trees are not mounted there.
- Color tests proving semantic aliases, light/dark values, purpose and usage
  boundaries precede comparisons, audits, candidates, and engineering detail.
- Components-overview tests proving each catalog entry has a stable anchored
  section and that migrated ordinary entries render their lightweight canonical
  result without importing the full state-sheet dispatcher or heavy families.
- Component tests for sidebar keyboard behavior, search results, narrow drawer
  focus restoration, progressive disclosure, and specimen boundary labels.
- Migrate the existing browser contracts that currently require horizontal
  `design-system-nav-*` controls, nine `foundation-visual-overview` links,
  overview start-position behavior, and direct Components/Status navigation.
  Preserve their behavioral intent under the new shell rather than deleting the
  assertions as obsolete.
- Deliberately regenerate or retire, with replacement evidence, the existing
  foundations-overview, components-overview, project-status-page, and
  screens-overview pixel baselines across their recorded light/dark and
  desktop/mobile cases. The current Components capture has a 30-second timeout
  while ordinary overview captures use 7.5 seconds; record the post-index cost
  instead of carrying the exception forward silently.
- Existing catalog/inventory/context-routing tests to prove authority records
  remain complete and independent.
- Design-system browser tests for Typography, Button, Charts, light/dark,
  320/390/768/1400 widths, and direct fresh-tab loads.
- Existing chart/table/transaction suites remain owners of their interactive
  contracts until explicitly migrated.
- Hosted-preview smoke for direct deep links, assets, revision identity, and
  security/indexing headers.

## Documentation housekeeping

- This plan becomes the active documentation-experience contract; it does not
  supersede the V1 authority plan or historical receipts.
- Each slice updates only claims it makes stale. Evidence remains linked rather
  than copied into canonical prose.
- Route aliases, legacy shell structures, and old tests are removed only in S8
  after a recorded consumer/link scan and parity review.
- Completed migration receipts are merged or deleted when superseded; Git keeps
  chronology. Internal Records may link to retained history but must not render
  the repository as an undifferentiated archive.

## Strongest case against this plan

A curated human layer can become a second source of truth and add maintenance
cost without improving the design system. The plan fails if authors must update
status, IDs, implementation ownership, or acceptance independently in two
places, or if Charts still requires thread context to tell approved guidance
from evidence. The first three content migrations therefore derive identity/status
from existing catalogs, keep authority links explicit, and use Charts plus
newcomer tasks as the go/no-go test before broad migration.

## Decisions and remaining gates

### Approved reconciliation decisions — 2026-09-16

- **U1 — IA hierarchy:** approved: Start, Foundations, Components, Patterns,
  Workbench, and Internal Records, with Adoption and engineering plus Reference
  and history nested under Internal Records rather than promoted to competing
  top-level domains. Foundations is a continuous anchored canonical reference;
  Components remains a specimen-free grouped catalog; Patterns summarizes
  canonical compositions; Workbench summarizes active/review activity; and
  Internal Records summarizes current adoption, engineering, and history signals.
  Each is a useful scrollable overview with optional selective deep dives.
  Approve or reject the temporary explicitly labeled Legacy lab sidebar aliases
  for Tables/records, Forms, Navigation systems, and Transactions while their
  full destination migrations remain later.
- **U2 — human status:** approved: one primary pill (Accepted / Exploring / Not
  started / Not planned / Superseded) plus labeled Code and Production facts;
  “Awaiting human review” derives only from `CURRENT_REVIEW`. Paused/Deferred stay
  explicit Workbench activity labels. `review.status: deferred` remains review
  readiness and cannot derive Not planned. Before S2a-1, decide typed versus
  presentation-only ownership for Paused; no prose inference is permitted. Also
  approve the compact sourced scope line for Accepted items with provisional or
  partial boundaries. A typed activity field still requires foundation review.
- **U3 — Patterns:** approved: presentation/navigation aliases over current
  catalog IDs and routes now, including or excluding the temporary Legacy lab
  sidebar aliases named in U1. Do not add a typed pattern kind without later
  foundation-review evidence.
- **U4 — migration order:** approved: Typography → Button → Charts as the first
  migrations, followed by Select as the clean ordinary-page repeatability check;
  run the local newcomer tasks 1, 2, 6, 7, and 10 after Button and before Charts,
  then retain the complete hosted rerun in S5.

### Superseding presentation direction — 2026-09-17

Later explicit user feedback supersedes only the affected presentation and
sequence clauses above:

- **U14 — Canonical opening:** every Canonical section begins with the actual
  current system result and concise supported scope. Optional examples use
  approved owners; implementation detail, evidence, comparisons, and history are
  secondary.
- **U15 — Components overview:** the specimen-free row catalog is a verified
  intermediate shell result, not the destination. Components becomes a
  continuous anchored reference with lightweight real component results inline.
- **U16 — Runtime boundary:** resolved. The S2a-1 provider stop fired and the
  verified local resolution is a standalone documentation entry in this
  repository, not an App-root provider split or second authority system.
- **U17 — Content sequence:** completed through the accelerated local candidate:
  Color established the foundation grammar, all nine Foundations and all 45
  Components followed, readiness review repaired the broad result, and five
  lightweight Patterns closed the breadth-first pass. Further component depth
  and Select/repeatability work remains bounded follow-up after human review.

### Accelerated local-candidate authorization — 2026-09-17

The user prioritized a broadly useful documentation experience for collaborator
review on 2026-09-18 over serial human acceptance between every content slice.
That authorized train is now implementation-verified: all nine Foundations,
the continuous 45-entry Components experience, five lightweight Patterns, and
collaboration-readiness polish. Each local candidate remains explicitly
human-review-required and may be repaired after review; none promotes
exploratory work, changes tokens or shared defaults, migrates production,
deletes history, publishes, commits, pushes, stashes, or resets. The next gated
stage is human review followed by U11/U12 before any hosted preview. Detailed
Workbench, Records, legacy-study, and component refinement remains bounded
follow-up rather than unfinished breadth-first migration.

### Existing synchronization, architecture, and preview gates

U5–U9 were resolved by the completed S0 receipt and are retained here as the
approved integration record, not as open gates. U10 and U13 are resolved by the
shell/standalone and derivation decisions. U11–U12 remain the hosted-preview
gates.

- **U5 — synchronization target:** confirm `origin/master` is the intended
  upstream and that the execution should pin the freshly fetched SHA at S0.
- **U6 — checkpoint contents:** approve a scoped classification of the 623
  untracked paths and identify any unrelated work that must remain outside the
  design-system checkpoint. Explicitly disposition the handoff template,
  guidance, Chart sources/next families/tests/specifications, read-path
  receipt/verifier, and cited retained evidence. Do not authorize a broad
  manifest. The detached Toast/Progress package remains parked.
- **U7 — Git operations:** authorize checkpoint commit(s), a named safety ref,
  and a clean integration worktree/branch. No such operation is implied by this
  plan. Promotion of the verified merge remains a separate approval after its
  receipt; it is not pre-authorized with setup. The nine existing stashes remain
  untouched. An external checkpoint bundle is optional and requires separate
  approval of its exact destination.
- **U8 — integration method:** approve a merge of pinned upstream into the
  dated integration branch descended from the checkpoint; rebase is not
  recommended for this history. The project branch remains unchanged until the
  separately approved fast-forward promotion.
- **U9 — other worktrees:** decide whether any other detached outputs must be
  checkpointed independently before S0. They should not be silently imported.
- **U10 — shell architecture:** approved for S2a-1: the same-build route-aware shell as the
  smallest reversible S2a-1 implementation while treating inherited providers
  as temporary. The S1 baseline found usable denied-network docs and no
  account-request/sign/switch/send/write behavior, but also 79–86 blocked
  external attempts and a 5.322 MB decoded wallet chunk per cold route. Rerun
  the exact baseline after S2a-1; if those costs remain materially unchanged,
  require an explicit provider-split versus standalone-entry decision before
  hosted preview or further migration expansion. No acceptable budget is
  inferred by this recommendation. The chosen local resolution is the verified
  standalone entry; hosted preview still waits for U11–U12.
- **U11 — preview policy:** choose who may access the hosted preview and whether
  it is public-unlisted, access-controlled, or internal-only; choose the preview
  hostname/project if it is not the existing Cloudflare Pages preview. No push
  containing the lab occurs before the actual Pages production/branch-preview
  and Access settings are checked; the first publishable slice must verify an
  `/internal/*` `noindex, nofollow` response policy.
- **U12 — record exposure:** approve the recommended whole-preview Cloudflare
  Access boundary, or require a public-unlisted build that compiles Internal
  Records out and proves their absence. Do not publish before this is set.
- **U13 — markdown/inline derivation:** approved: the recommended minimal typed
  presentation index for Workbench and Internal Records. It extends the planned
  presentation owner already needed for navigation and aliases, handles both
  markdown headings and inline study objects, and avoids introducing a build-time
  markdown parser before the first shell slice. The index is limited to source
  key, route, question, owner, and activity; tests must fail on missing or renamed
  sources. It may not copy normative prose or become a second decision/engineering
  register. Tested build-time extraction remains the alternative if later scale
  makes the small index costly. If U2 selects a presentation-only Paused
  annotation, this index is its sole activity owner; do not create another
  writable annotation store. This approved mechanism was consumed by S2a-1 and
  no longer blocks the completed local candidates.

## Unresolved decisions

- **Hosted access and records exposure (U11/U12):** before any push or
  publication, choose the preview host, Access policy, indexing policy, and
  whether Internal Records is included or compiled out. This does not block the
  local standalone-entry slice.
- **Typed authority hygiene:** the component-group Definition slots are
  group-wide open questions; accepted item-level decisions do not prove those
  broader contracts are complete. Keep them collapsed in Records and do not
  rewrite them during presentation migration. Any later correction is a
  separately reviewed group-level authority change before S8 cleanup.
- **Final documentation URL:** preserve `/internal/design-system/*` throughout
  local standalone work and compatibility verification. A friendlier hosted
  root or redirect is decided with U11/U12, not during the entry slice.
