# Review of the design-system foundation consolidation plan

**Status:** independent read-only review of
`design-system-foundation-consolidation.md`; evidence for the plan's owner, not
acceptance and not design authority. Nothing was implemented and the plan file
was not edited.

**Compared against:** the Phase 1 audit, its reconciliation, and the
repository at `adef9ee76` (branch `design-system-v1`). The working tree now
carries four documentation-only modifications made while preparing the plan
(plan status paragraph, a router evidence link and `sources` entry, a log
entry, a ledger row) plus the untracked audit and plan files; no source,
token, configuration, or test file has changed.

**Checked for this review:** `playwright.design-system.config.ts` (server,
snapshot, reporter settings), `e2e/design-system/capture.css`, `.gitignore`,
the CI workflows' artifact steps, `skills/evaluate-workflow.md`,
`vite.config.ts` and the one consumer of `VITE_GIT_SHA`, the ten roles in
`typography-review-contract.ts` against `typography.ts`, `.oxlintrc.json` and
`scope.mjs` (whether custom checks can fail a gate), import counts for the two
role maps and the layout recipes, whether any shared code imports lab code, and
the catalog test that pins accepted ids.

---

## Verdict

**Ready with adjustments.** The plan addresses every demonstrated problem the
audit and reconciliation agreed on, keeps the accepted design decisions and
component defaults out of scope, and its acceptance evidence is the right kind
(computed-style parity, retained artifacts, per-entry dispositions, a real
migration rehearsal). It should not be authorised as written in three places,
all of which are plan edits rather than new work: S2 is blocked behind all of
S1 when it needs only one S1 primitive; S3 bundles documentation tiering that
has no dependency with a catalog reshape that does; and S4 defers the control
runs that are cheapest and most valuable now. Four mechanisms it relies on are
under-specified against the repository (baseline read-only mode, evidence
retention, preview source identity, and how a "scoped check" can actually
fail). With the adjustments in § 5, S1 and the documentation half of S3 can
start immediately.

---

## 1. Does the plan address the demonstrated problems?

| Demonstrated problem (audit / reconciliation) | Plan slice | Adequate? |
| --- | --- | --- |
| Two overlapping role maps with one behavioural difference (`focus.onContent` static vs `focus-visible`) | S2: consolidate under one owner, distinct static / focus-visible / group-focus recipes, compatibility exports without duplicate values | Yes. The "no duplicate values" rule is the important safeguard. |
| Ten accepted type roles exist only as lab class strings; four exported | S2: `typography.ts` owns all ten; lab renders from the owner | Yes. See F9 on the owner file's exceptions. |
| Tokens unwired, some reachable only through `[var(--x)]`; no enforcement of approved values | S2: wire aliases, inventory tokens as accepted / candidate / legacy, scoped checks with tested exceptions; no blanket syntax ban | Yes in intent. See F7 on the mechanism. |
| Rendered review is self-reported, unscoped, artifacts discarded, tooling unaware of the suite | S1: workflow mapping, source-bound record, retained artifacts, missing-coverage failure exercise, viewport captures separate from full-content sheets | Yes in intent. See F4, F5, F6 on mechanisms. |
| Four rendered defects (auto-scroll, `StakeRSR`, clipped table, index overflow) and the missing radius baseline | S1: reproduce before, check after; baseline treated as a harness defect | Yes. Correctly separates the harness defect from visual defects. |
| Reading path too heavy; plan two-thirds transaction narrative; duplicated review guidance | S3: move transaction-only guidance to its domain documents; one lab area guide replacing duplicated passages | Yes, but sequenced too late (F2). |
| Catalog prose-heavy; 28 of 32 accepted entries without a decision link; vestigial axes | S3: reshape around owner paths and scoped acceptance links; five independent questions with a lossless per-entry mapping | Yes. The "retain the distinction if lossless simplification fails" clause is correct. |
| Ledger acceptance state not reconciled with decisions | S3: "reconcile historical ledger pointers" | Partly. See F11. |
| Migration capability untested; eight legacy twins imported by proximity | S5: one section, inventory → disposition → proof, isolated working copy | Yes for the rehearsal; the page-shape question stays open (F10). |
| Which change actually helps a fresh agent | S4: bounded fresh-agent validation of the package | Partly. See F3. |

Out of scope by choice and consistent with the reconciliation: universal
size/tone API, IconButton default alignment, Lifecycle Status trial
acceptance, elevation/radius values, capability/context factorial study,
legacy import replacement. None of these exclusions leaves a demonstrated
defect unaddressed; two of them warrant a one-line note rather than silence
(F8, F12).

## 2. Does it preserve authority distinctions and established defaults?

Yes. The non-goals are precise and match the accepted decisions: square
structural regions, transaction amount radii, reviewed transaction layouts and
secondary-action treatments stay closed; component defaults and the pending
trials stay pending; candidate token names do not become accepted values; the
performance palette may be tokenised only in a separately identified,
value-preserving batch. The acceptance criteria keep "rendered" separate from
"accepted" and "adopted", and S4 explicitly refuses to call a fresh start a
blind test. I found no authority change hidden in the slices. Two small
points: the plan's own ledger row introduces a new status word
(`review-pending`) into a vocabulary the plan itself proposes to shrink, and
the router now lists this planning document under `sources`, which makes the
domain-drift lint count planning edits as router staleness and nudges the plan
toward being a routine reading prerequisite it says it is not (F13).

## 3. Is the verification credible?

The evidence contract is stronger than anything in the current ledger: A2
demands computed-style parity with every intended delta named, A3 demands that
missing coverage fail loudly and that artifacts survive, A4 demands per-entry
dispositions, and the theme checks test meaningful pairs instead of imposing a
single contrast threshold. The gap is between what the text promises and what
the repository can deliver today. Four mechanisms are asserted rather than
specified, and each has a concrete answer in the repository (F4–F7).

## 4. Material findings

**F1. S2 is blocked behind the whole of S1, but needs one primitive.**
Evidence: the plan makes S2 "blocked by S1's working evidence loop"; A2's
proof for S2 is "before/after computed styles plus rendered interaction and
geometry checks". A computed-style capture of the lab in both themes is a
short Playwright script (the audit's capture script already drives the same
routes); it does not need the workflow mapping, the coverage manifest, CI
routing, or the defect fixes that make up the rest of S1. Consequence: the
most mechanical, highest-certainty consolidation waits behind harness and
process work. Adjustment: make S2 depend on "controlled server or proven
preview, plus the computed-style capture primitive"; let S2's viewport parity
claims wait for S1's captures. S1 and S2 then overlap.

**F2. S3 bundles work with no dependency (documentation tiering, ledger
reconciliation, decision links) with work that has one (catalog reshape after
S2 renames owners).** Evidence: moving the plan's transaction sections
(L198–L559 at `adef9ee76`) into the transaction documents, adding decision
links, and reconciling ledger rows touch no code owner that S1 or S2 changes.
Consequence: the single cheapest retrieval fix (a plan back to its 2026-08-27
size) is deferred behind two slices. Adjustment: split into S3a
(documentation tiering, decision links, ledger reconciliation; start now) and
S3b (catalog reshape and five-question schema; after S2). S3a also yields,
for free, the comparison arm the reconciliation asked for (F3).

**F3. S4 defers the control runs and drops the routing-only arm.** Evidence:
"controls can run later from that snapshot"; "measure the consolidated
package as a package". `skills/evaluate-workflow.md` requires the same
model and settings across arms; model versions are outside the team's
control, so a control run months later is not the same control. Consequence:
the package can be validated but the counter-review's cheaper alternative
(routing alone) is never tested, and attribution is lost by design.
Adjustment: run the two control tasks now from the current checkpoint (two
short tasks, no infrastructure); record model id and settings; when S3a lands
before S2, run the same tasks once more from that intermediate state. That
gives control, routing-only, and package arms at almost no extra cost, judged
together under the frozen rubric. Keep the plan's honest labelling if
isolation or an independent judge is unavailable.

**F4. Evidence retention names an "existing artifact mechanism" that does not
exist for this suite.** Evidence: the design-system suite is not in any
workflow; `playwright.yml` and `guardian.yml` upload artifacts only for the
product suites (14 and 30 day retention); `test-results/` and
`playwright-report/` are gitignored; the audit's curated evidence folder is
4 MB for 35 images, so "synthetic checkpoint evidence with a manifest in
`docs/plans/`" will bloat the repo if it means images per checkpoint.
Adjustment: (a) add one CI job for the design-system suite, path-filtered to
lab and V1 directories, with `upload-artifact` and the same retention as the
product suites; (b) the durable manifest holds digests, run identity, and
artifact pointers, not images; (c) a checkpoint that needs images in the repo
keeps a curated set under a stated budget; (d) reuse Playwright's JSON and
HTML reporters with attachments rather than a bespoke manifest format: one
fixture writes source revision, dirty-diff digest, server identity, and
browser version into the report.

**F5. "Keep `design-system:verify` read-only with respect to baselines"
requires a configuration change the plan does not name, and CI baselines will
not match local ones.** Evidence: the config sets no `updateSnapshots`, so
Playwright's default `missing` writes absent baselines and fails; the
`snapshotPathTemplate` has no `{platform}` segment, and the 34 committed
baselines were captured on macOS, so a Linux runner will render Lausanne
differently and fail every pixel comparison. Adjustment: set
`updateSnapshots: 'none'` for `verify` and keep `capture` as the only writer;
in CI run the relational and geometry assertions and upload viewport
screenshots as artifacts; either keep pixel baselines local-only or add
`{platform}` to the template and capture Linux baselines in a CI capture job.
Do not put the suite into CI with the current template.

**F6. "Prove the reused preview serves the intended source" has no mechanism
today, and the controlled server cannot start while the preview runs.**
Evidence: `VITE_GIT_SHA` is defined from `CF_PAGES_COMMIT_SHA` only
(`vite.config.ts` define block), so a local preview reports `development`;
the design-system config starts its own Vite on port 3005 with `strictPort`
and `reuseExistingServer: false`, and the regression report already records
that it "could not bind protected port 3005"; the plan forbids stopping the
preview. Adjustment: give the dev build a local fallback for `VITE_GIT_SHA`
(`git rev-parse HEAD` plus a dirty marker) and render it in the lab shell
footer; the capture fixture reads it and refuses to run when it does not match
the checkout. Run the controlled server on a different port when a preview
occupies 3005, or point `DESIGN_SYSTEM_BASE_URL` at the proven preview.

**F7. The "scoped checks" have no home that can fail.** Evidence:
`.oxlintrc.json` enables built-in plugins only and oxlint has no custom-rule
mechanism in this configuration; `scope.mjs` line 115 states that red flags
"inform, they do not fail the inner loop". Adjustment: implement the checks as
a Vitest source-hygiene test with an explicit allowlist file, in the style of
the existing `component-catalog.test.ts` file-existence checks. It runs in the
unit gate, so a violation fails `scope.mjs --gate`; positive and negative
fixtures satisfy the plan's own requirement to test exceptions.

**F8. The role-map consolidation direction and size are not stated.**
Evidence: 53 non-test files import `v1SemanticRecipes` and 17 import
`candidateSemanticRoles`; the plan picks `semantic-roles.ts` (the 17-importer
file) as the owner, which is fine for location but means roughly 70 consumer
edits. `v1LayoutRecipes` (9 importers, zero components) is not mentioned.
Adjustment: state the count, do the migration as a codemod in green batches
with a re-export from `ui/v1-semantic-recipes.ts` that contains no values,
drop the "candidate" prefix from the final export name, and give
`v1LayoutRecipes` a disposition (consume it from components that re-type its
values, or fold it into the owner).

**F9. The typography owner will legitimately contain arbitrary values.**
Evidence: the ten review roles include `text-[32px] leading-[38px]`,
`leading-[30px]`, `leading-[26px]`, and a responsive display role; the role
ids are `display`, `page-title`, `section-title`, `lead`, `panel-title`,
`item-title`, `body`, `label`, `supporting`, `auxiliary`, of which four already
match `typography.ts`. Adjustment: name `typography.ts` explicitly in the
hygiene test's exceptions, keep the ten ids as the exported keys so lab and
consumers use one vocabulary, and let the check flag `text-[Npx]` anywhere else.

**F10. The page-shape question is neither reopened nor settled, and S5 cannot
settle it.** Evidence: the non-goals keep square structural regions closed
"without new evidence"; S5 applies square structure to one section, forbids
a whole page, and asks to "validate page structure in context before
proposing alternatives". One square section among production's rounded cards
is the least favourable context for that direction and does not test the
page-level decision. Adjustment: do not reopen the decision, but add an
explicit designer gate before tables/rows: one golden screen rendered in the
accepted direction, both themes, 375px and 1400px, beside production. This is
the check the plan implies; it should have an owner and a date rather than be
an incidental outcome of S5.

**F11. Ledger reconciliation should name the rows.** Evidence: at least eight
`human-review-required` rows have subjects the decision ledger records as
accepted (Accordion, Link, Tabs/Segmented, Select/SearchField, Copyable Value,
Inline Message twice, Link icon spacing); the plan says only "reconcile
historical ledger pointers without promoting mixed-scope stages".
Adjustment: list them in S3a with the disposition "accepted, see decision",
and use an existing status word for the plan's own row.

**F12. Keeping IconButton defaults is acceptable only with a note at the
prop.** Evidence: Button defaults to `default`/`primary`, IconButton to
`compact`/`secondary`; the plan keeps both silently. Adjustment: one WHY line
at the IconButton default, within the comment budget, so a consumer swapping
one for the other is warned.

**F13. The router `sources` addition should be reverted.** Evidence: the
router diff adds the planning document to `sources`; wiki-lint's domain-drift
check counts commits to `sources` files against the router's `updated` date.
Keep the on-demand evidence link, drop the `sources` entry.

**What the plan gets right and should keep unchanged:** the non-goals; the
"no duplicate values in compatibility exports" rule; computed-style parity as
the guard for S2; treating the missing baseline as a harness defect;
separating unmodified-viewport captures from full-content sheets; theme checks
by meaningful pairs rather than a blanket threshold; the lossless-mapping
requirement before removing catalog fields; the area guide as a replacement
for duplicated passages rather than an addition; S5's inventory → disposition
→ proof loop on one section with deterministic boundaries at the real data
seams; and the refusal to call a fresh start a blinded evaluation.

## 5. Recommended adjustments and simpler mechanisms

| Adjustment | Replaces | Why simpler or safer |
| --- | --- | --- |
| S2 depends on the computed-style primitive only (F1) | S2 blocked by all of S1 | Mechanical consolidation proceeds while harness work continues |
| Split S3 into S3a (docs, decision links, ledger; now) and S3b (catalog reshape; after S2) (F2) | One S3 after S1–S2 | Delivers the cheapest retrieval fix first; creates the routing-only arm |
| Run control tasks now; add the routing-only arm from the S3a state (F3) | Controls "later from the snapshot" | Same model and settings; attribution recovered at near-zero cost |
| CI job for the suite with artifact upload; manifest holds digests and pointers; reuse Playwright reporters (F4) | "Existing artifact mechanism"; bespoke manifest; images per checkpoint | Uses what the repo already does for the product suites; no repo bloat |
| `updateSnapshots: 'none'` for verify; platform-aware or local-only pixel baselines (F5) | Read-only baselines by convention | Without it, verify writes files and CI fails on font rendering |
| `VITE_GIT_SHA` local fallback rendered in the lab shell; alternate port for the controlled server (F6) | "Prove the preview serves the intended source" with no mechanism | One define fallback and one footer line; respects "never stop the preview" |
| Vitest source-hygiene test with allowlist (F7) | Unspecified "scoped checks" | Fails the existing gate; no new lint tooling |
| State migration counts, codemod in green batches, drop "candidate" naming, dispose of `v1LayoutRecipes` (F8) | Unstated direction | Bounds the churn and removes a second half-owner |
| Explicit designer gate for page shape before tables/rows (F10) | Implicit outcome of S5 | Keeps the decision closed while giving it the one test it needs |
| Name the eight stale ledger rows; reuse an existing status word (F11) | "Reconcile pointers" | Removes the inconsistency the reconciliation identified |
| One WHY line at the IconButton default (F12) | Silent divergence | Warns the consumer at the point of use |
| Remove the planning document from router `sources` (F13) | Current diff | Prevents drift noise and reading-prerequisite creep |

Revised order: S1 and S3a in parallel now (with F4–F7 written into S1); S4
control runs now; S2 once the computed-style primitive exists; S3b after S2;
S4 treatment arms after S3b; the page-shape gate before any tables/rows work;
S5 after S4 and a named pilot approval.

## 6. Risks the adjustments introduce

Running S1 and S2 in parallel means two slices touch the lab at once; keep
S2's edits to the owner files and consumer imports, and let S1 own the state
sheets and specs, to avoid merge conflicts in `component-visual-output.tsx`
and the transaction compositions. Splitting S3 means two ledger rows instead
of one; that is the correct accounting. Adding the suite to CI without F5
would produce red builds unrelated to design quality; F5 is a precondition,
not an option. Running control tasks now consumes evaluation effort before the
rubric has been exercised; freeze the rubric first, as the evaluation skill
requires, and accept that the first run may refine it.

## 7. Immediate next step

Amend the plan text for F1–F3 and write F4–F7 into S1's mechanism list, then
authorise S1 and S3a. In the same window, freeze the S4 rubric and run the two
control tasks from the current checkpoint so that later arms have a genuine
comparison.
