# Review of the first consolidation slice and S3a cleanup

**Status:** independent read-only review; evidence for the implementation
owner, not acceptance or design authority. No implementation, documentation,
decision, or existing report was modified. No measured fresh-agent task was
run.

**Compared against:** checkpoint `adef9ee76` on `design-system-v1`, the Phase 1
audit and reconciliation, the revised consolidation plan, the capture report,
the evaluation record, and the repository sources named below.

**Inspected:** the tracked diff (13 files, +826/−490) and the untracked
deliverables: `e2e/design-system/review-source.ts`,
`e2e/design-system/source-capture.spec.ts`, two helper tests, the
`design-system-consolidation-evidence/` folder (12 images, 4 source records,
index), the three named plan documents, the slimmed V1 plan, the router, the
reference, the transaction checkpoint and audit, the ledger and log, the two
catalog files and their test, and the Playwright configuration.

**Checks run (non-destructive):**

| Check | Result |
| --- | --- |
| Vitest: catalog test + `e2e/helpers/tests` | 9 files, 113 tests passed |
| `tsc -p e2e/tsconfig.json --noEmit` | pass |
| `node scripts/llm-workflow/wiki-lint.mjs` | 20 pages green |
| `scope.mjs --base adef9ee76 --dry-run` | correctness + complexity lenses; area-guide warning for `e2e/`; expected verify-gaps for documentation and images |
| Relative links and heading anchors across the 12 changed documents | 266 checked, 0 broken |
| Evidence index hashes and sizes versus files on disk | 16 of 16 match; 2.8 MB total |
| Source digest before/after inside each retained record | equal (`544bf4c9…`), 2,250 files, no observed changes |
| Same digest recomputed on the current tree | `e3424eff…` (differs; the catalog files under `src/` changed after capture) |
| Pressure-register rows: plan → transaction checkpoint | 0 left in plan, 18 in the checkpoint document |
| Word counts: V1 plan / router | 2,363 (was 8,025) / 1,565 (was 1,633) |

---

## Verdict

**Ready to proceed to S2 with two conditions and a handful of small,
documentation-only corrections.** The slice does what it claims: transaction
material left the required plan without wording changes and stays reachable;
every recorded baseline now routes to scoped evidence; the eight historical
rows preserve partial acceptance, deferred engineering review, and non-adoption;
the capture harness fails closed on source drift and missing attachments, and
its report states its limits accurately. The two conditions are that S2 starts
from a fresh capture on its own starting source (the retained set is a harness
proof, not the S2 baseline) and that the hash of the private `.env` file is
removed from the retained records before anything is committed. The acceptance
wording for three baselines (Menu, minimal Popover, MultiSelectFilter) should
be narrowed now because their only acceptance record is the reference's own
sentence; that is a wording fix, not a reason to hold S2.

---

## 1. Documentation routing

**Verified sound.**

- The plan dropped from 8,025 to 2,363 words while keeping precedence, the
  authority vocabulary, the operating model, the anti-cascade rule, the
  engineering register, verification cadence, and test seams. All 18 pressure
  rows and the provisional contract moved verbatim: every removed plan line
  that carried a rule reappears in `transaction-consolidated-regression.md`
  § Retained transaction composition guidance or in the audit § 14.
- Transaction guidance stays findable from two entry points: the plan's
  "Transaction-only guidance" section and the router's composition paragraph,
  both linking to `#retained-transaction-composition-guidance`,
  `#fresh-flow-transfer-contract`, and `#transaction-composition-pressure-register`.
  The moved section opens with a correct authority boundary: it "retains
  existing scoped contracts and unresolved pressure, not new acceptance", and
  later accepted decisions take precedence.
- The router's link to the automated-issuance reconciliation was already
  broken at the checkpoint (`#12-automated-mint-lab-reconciliation-2026-09-03`
  against a heading dated 2026-09-04); the slice fixed it.
- The reference's stale "Current Review is empty" sentence and the stale
  ActionGroup/Field "exploratory, awaiting review" paragraphs were corrected
  against the 2026-08-19 decisions.

**R1 — The active pressure register now lives inside a dated regression
report.** *Uncertainty, non-blocking.* `transaction-consolidated-regression.md`
is a completed-pass report (task contract, results, verification) that now also
hosts the provisional geometry contract and the register the old plan called
"an active reconciliation tool rather than another history file". The preamble
and the plan's pointer make the ownership explicit, so nothing is lost today.
When transaction work resumes, the register should be in a file whose name
says it is current guidance; renaming or splitting can wait until then.

**R2 — Two flow-specific sentences have only indirect equivalents.**
*Verified, minor.* The removed "Slices" narratives contained "do not force this
high-capital professional workflow into the simple Zapper/Vote Lock shell" and
"disclose its intrinsic multi-step nature before execution". Their intent
survives (checkpoint disposition: no universal workflow/controller; router:
"not a universal Dialog, stepper or order-row contract"; audit § 12 stage
structure), but the wording is gone. The other removed facts I checked
(Redeem authorisation before collateral-sale fills, on-demand order evidence on
narrow screens, mismatch classification, `stakeAndDelegate`) exist elsewhere.
Correction: add one sentence to the checkpoint's automated-issuance row or
§ 12 preamble; no other action.

**R3 — Ordinary component discovery.** The required path is now CLAUDE.md →
kit skills → project page → a 2,363-word plan → the router → the catalog
entry. The plan is still mandatory for lab work via `CLAUDE.md:29`, which is
acceptable at this size. Whether this materially helps a fresh agent is
exactly what the S4 guidance-only arm measures; the static result here is
necessary, not sufficient, and the slice says so.

## 2. Acceptance accuracy

**Verified sound.**

- 25 entries carry `accepted-decision` links (4 pre-existing plus 21 added);
  7 carry `authority` links into the reference with an explicit "No dedicated
  decision entry is recorded" detail. The new test enforces both the routing
  rule and that anchors resolve to real headings; I confirmed the anchors
  independently.
- The scoped `detail` strings are honest and useful: IconButton and Checkbox
  link the 2026-08-14 dependency decision "only the compact named-action
  kernel" and "only the binary kernel"; Lifecycle Status records "roles
  accepted, sizing reopened"; Select excludes the density trial and searchable
  choices; Entity identity scopes the stacked-separator decision; Card scopes
  the Home delta; Copyable Value keeps the separated default.
- The eight ledger dispositions match the decisions they cite. Partial
  acceptance is preserved (Link/Accordion accepted, Drawer separate; Select
  family accepted, popup density and elevation provisional), engineering
  review stays deferred for the shared Link default and Inline Message
  defaults, and every row keeps adoption at none. Nothing in the eight rows
  or the catalog changes `designAuthority`, `review.status`,
  `implementationStatus`, or `adoptionStatus`; the diff confirms only
  `contextSources` and two `nextAction` strings changed.

**A1 — Three of the seven reference-backed baselines have no acceptance record
outside the reference itself.** *Verified.* For Copyable Value, Skeleton,
Spinner, and EmptyState, `docs/wiki/log.md` records "is accepted as an
unadopted current baseline" (2026-08-20 and 2026-08-21). For Metric, the
2026-08-18 decision "Rich records share foundations" records inline Metric
anatomy as a reused accepted seam. For **Menu, minimal Popover, and
MultiSelectFilter**, the only acceptance statement anywhere is the reference's
own sentence ("accepted current baseline … its approval emptied the prior
Current Review"), written by an agent at the time; no decision, log line, or
ledger row records a human acceptance, and the ledger row for that stage was
`human-review-required` with "Review MultiSelect trigger summary, option
density…" as its next step. The disposition table and the reconciled ledger row
call these "recorded baselines", and the catalog role is `authority`.
Consequence: a fresh agent reading "recorded baseline" will assume human
acceptance of the same class as the other 29. Smallest correction: change the
three `detail` strings and the disposition/ledger wording to "acceptance
asserted only by the reference synthesis; not recorded in decisions or log",
and put a one-line confirmation question to the human. If confirmed, add one
short decision entry for the three; if not, set `designAuthority` back to
`exploratory` in S3b. This does not affect S2.

**A2 — The reference heading rename removed a date and resolved a
contradiction toward "accepted" without citing where acceptance was recorded.**
*Verified, minor.* "2026-08-20 — Provisional safe-autonomy candidates stay
independent" became "Accepted independent primitives and composition
boundaries". The body already said "accepted", and the log supports it for the
primitives named there, so the rename is defensible, but it now reads as an
undated authority statement in a document that precedence ranks below
decisions. Correction: keep the date or add "recorded in the log 2026-08-20/21"
to the first sentence.

**A3 — Metric can cite a decision.** *Improvement.* Link the 2026-08-18
decision with a detail scoping it to inline anatomy and the 16px/500 value
emphasis, instead of the reference section. Also add the log dates to the
Copyable Value, Skeleton, Spinner, and EmptyState details so "recorded" points
at the record.

**A4 — New ledger status words.** *Verified, minor.* `partially accepted — …`
and `engineering-review-deferred — …` are not among the five states
`skills/stage.md` defines (`active`, `implementation-verified`,
`review-pending`, `human-review-required`, `done`). The plan's own F11
disposition argued for reusing existing vocabulary. Correction: use
`done — <accepted scope>` for accepted parts and keep `human-review-required`
where a visual question remains (the density trial), or extend `stage.md`
deliberately with one line. Wiki-lint does not check this, so it will not
catch drift.

## 3. Verification reliability

**Verified sound.**

- `updateSnapshots: 'none'` is set and tested; `capture` remains the writer.
  The owned strict-port server on `DESIGN_SYSTEM_PORT` is tested, invalid
  ports fail before launch, and the review project refuses an external URL.
- The manifest covers `src`, `public`, the design-system and shared e2e
  directories, the root configuration files, and the lockfile; it is computed
  before and after each test; a recursive watcher rejects observed edits even
  if content is restored; required attachments are enforced. Each of these has
  a unit test, and the tests exercise failure paths, not only success.
- The retained evidence is internally consistent: every hash and byte count in
  `index.json` matches the file on disk, and each source record's before and
  after digests are equal with an empty observed-change list. Runtime,
  browser, platform, viewport, theme, and an explicit exclusion list are
  recorded.
- The three images I inspected match the claims: light 1400 overview lands on
  the transaction specimens (the known auto-scroll, correctly described as
  preserved, not fixed); light 375 Select shows the open listbox with 40px
  rows; dark 1400 Button shows the focus ring on "Tab to focus" in the dark
  theme.
- The capture report's limits are stated candidly: source stability during
  the test, not Vite startup or binary identity; no motion, not all states;
  window scroll is not evidence of page position; sandbox limits on the
  watcher; no full-gate claim.

**V1 — The retained set is not the S2 "before" baseline.** *Verified.* The
capture ran at digest `544bf4c9…`; the S3a catalog edits under `src/` moved
the tree to `e3424eff…`. The capture report calls the set "a before-state".
It is a proof of the mechanism. Consequence: A2's before/after comparison for
S2 must start from a capture taken immediately before S2's first owner change.
Correction: one sentence in the capture report and the S2 start checklist;
the harness already makes this cheap.

**V2 — The private `.env` file's hash is in the retained records.** *Verified.*
Each `*-source.json` lists `.env` with a SHA-256 alongside `.env.example`. A
hash of a small secrets file is a fingerprint, not a value, but it is
committed evidence about a private file and the report says no environment
values are stored. Correction: keep `.env*` in the in-run manifest if desired,
but strip `.env` entries (or the whole env group) from the retained copy under
`docs/plans/`, and say so in the exclusions.

**V3 — Four copies of a 2,250-entry manifest.** *Improvement.* The four
`*-source.json` files (≈460 KB each) repeat the same file list. Retain the
manifest once with the per-run digests and views, or keep only the digest in
each run record. This halves the evidence folder and keeps future checkpoints
under the 5 MB budget without pruning images.

**V4 — The watcher watches the repository root.** *Uncertainty, matters for
CI.* `watchReviewSource` calls `fs.watch(root, { recursive: true })`, which
includes `node_modules`; filtering happens after the event. On Linux runners
recursive watches over large trees can exceed inotify limits, which the helper
records as `watcher-error` and therefore fails the run. Correction before the
CI slice: watch only the manifest directories and root files.

**V5 — Two exclusions are missing from the record.** *Verified, minor.* The
spec runs under the strict `base` fixture (default-deny egress, `VITE_E2E`),
so remote assets are blocked and the app is in its e2e configuration; the
overview metrics record `window.scrollY` but not the lab's inner scroll
offset, so the auto-scroll defect's "reproduce before fix" evidence is
screenshot-only. Correction: add both to the exclusion list and record the
inner scroller's `scrollTop` in the metrics.

**V6 — Missing-baseline behaviour is a manual probe.** *Acceptable.* The
configuration test proves the setting; the report describes the probe. A
tiny e2e that asserts a deliberately missing snapshot fails without writing a
file would make the claim repeatable; optional.

**V7 — The e2e area guide was not updated.** *Verified, minor.* `scope.mjs`
flags that the diff touches five files under `e2e/` without touching the area
guide. `e2e/TEST_MAP.md` and `docs/wiki/domains/e2e.md` were updated;
`e2e/CLAUDE.md` was not. Correction: one line, or a recorded reason.

## 4. Comparison integrity

**Verified sound.**

- The contract was frozen before dispatch: task and rubric digests recorded;
  arms named (checkpoint, guidance-only, consolidated package); provider and
  runtime identities recorded from actual metadata; tools restricted to file
  operations with a tested confinement probe; read evidence taken from tool
  events, not narration; first artifacts hashed and preserved before any
  repair; the control composition artifact is not in the repository.
- The guidance-only candidate is the right basis for the arm the
  reconciliation asked for: it contains only the ten documentation, catalog,
  and test files and excludes S1 runtime and S2 owner changes, with three
  preserved snapshot manifests so the review can move the candidate without
  losing the earlier versions.

**C1 — The overlay files carry coordinator-only content that must be stripped
mechanically, and eight ledger links must be redirected, not deleted.**
*Verified.* In the ten overlay files: the log's three 2026-09-08/09 entries
name the audit, the plan review, and the control runs (including "the control
repeated an obsolete reference claim"); the ledger holds two consolidation rows
and eight reconciled rows whose `[scope]` links point at
`design-system-foundation-consolidation.md#historical-stage-dispositions`; the
plan's "Inventory reconciliation and outside audit" paragraph links the audit,
reconciliation, plan, and review; the router's evidence list links the plan.
None of those targets exists in the `adef9ee76` archive, so a performer would
see dangling links that name the audit and the plan. The evaluation record
already requires removal. Correction: make it a rule with a check. Delete the
three log entries and the two consolidation rows; replace the eight rows'
`[scope]` links with the decision anchors they cite; delete the audit paragraph
and the router bullet; then run the same link checker used here against the
assembled fixture and record its digest. The reconciled wording ("Reconciled
2026-09-09: …") can stay, since it is guidance, not audit content.

**C2 — The retention deadline will likely expire before the treatments run.**
*Verified risk.* Raw control transcripts are scheduled for deletion by
2026-09-16; the treatment arms wait for S1–S3b. The record's fallback is to
rerun matched controls, which reintroduces the provider-drift risk the early
controls were meant to avoid. Correction: request approval now to retain the
coordinator-only raw controls until the treatments run, with the same access
rules, rather than planning a rerun.

**C3 — Minor disclosures are adequate.** The rubric preparer saw the router's
consolidation link; a small auxiliary Haiku call is recorded; the rubric is
public only as digests. These are disclosed and do not compromise the design.

## 5. What is sound and should be preserved

Verbatim moves with a stated authority boundary; the anchor-resolving catalog
test and the "scoped evidence per baseline" rule; scoped `detail` strings that
name what a decision does not cover; the eight dispositions' separation of
accepted part, pending part, engineering review, and adoption; the fail-closed
source guard and attachment requirement; read-only snapshot mode with a
separate writer; the hash-indexed evidence folder with recorded runtime and
exclusions; the capture report's refusal to overclaim; the evaluation
record's frozen digests, restricted tools, event-based read evidence, and
preserved first artifacts; the fixes to the router's broken audit link and the
reference's stale claims.

## 6. Blockers, corrections, follow-ups, and sequence

**Blockers before proceeding:** none that stop S2, subject to the two
conditions in the verdict: start S2 from a fresh capture on the S2 starting
source (V1), and strip the `.env` hash from the retained records before any
commit (V2).

**Small corrections worth making now (documentation and test-harness only):**

1. Narrow the acceptance wording for Menu, minimal Popover, and
   MultiSelectFilter and raise the one-line confirmation question (A1).
2. Restore a date or a log pointer to the renamed reference section (A2).
3. Link Metric to the 2026-08-18 decision and add log dates to the four
   log-recorded baselines (A3).
4. Align the new ledger status words with `skills/stage.md` or extend it (A4).
5. Add the missing exclusions and the inner scroll offset to the capture
   record (V5); note the recapture requirement for S2 (V1).
6. De-duplicate the retained manifest (V3); update `e2e/CLAUDE.md` (V7).
7. Write the performer-packaging rule with the link check and the ledger link
   redirect (C1); request extended retention for the raw controls (C2).

**Non-blocking follow-ups:** watch manifest directories rather than the root
before the CI slice (V4); an automated missing-baseline test (V6); the
one-sentence restoration of the professional-workflow boundary (R2); give the
pressure register a current-guidance home when transaction work resumes (R1);
introduce a `recorded-baseline` or `synthesis` context role in S3b so the
reference is not labelled `authority` (A1, A2).

**Recommended sequence:** apply corrections 1–7 in one short documentation
pass (they touch no owners); package and digest the guidance-only fixture
(C1) so the arm is ready whenever treatments run; then start S2 with a fresh
capture, migrating the role maps in green batches under computed-style parity;
continue S1's CI and routing wiring in parallel with V4 fixed first; S3b after
S2's owner paths settle.
