# Design-system foundation consolidation

**Status: implementation verified; comparison reconciled with mixed results (2026-09-09).** Claude's
[review](design-system-foundation-consolidation-review.md) found the plan ready
with adjustments. The user authorized this revision on 2026-09-09. Dispositions
are recorded below; the revised text is self-reviewed, not independently
re-approved. The subsequent go-ahead authorizes the bounded program, beginning
with its controls, independent guidance cleanup and capture prerequisite. It
does not approve a design trial, production adoption, commit or push.

## Goal

Make the accepted system straightforward for fresh agents to discover, apply,
verify, and explain, while preserving excellent visual composition and room
for task-specific judgment. Consolidate five areas: semantic ownership,
typography, rendered verification, documentation routing, and acceptance state.
Prove improvement with a bounded fresh-agent exercise and a real integration
rehearsal, not instruction volume or green tests alone.

## Original checkpoint and sources

Planning reference: `adef9ee76ffe2a579f6811cae2f5cf152cd0cf99`, branch
`design-system-v1`. The original audit, evidence directory, and reconciliation
are uncommitted inputs; preserve them unchanged. Before implementation, record
the live diff and an immutable source snapshot, retaining this original control.

The [audit](design-system-outside-audit-phase-1.md) and
[reconciliation](design-system-outside-audit-phase-1-reconciliation.md) are
independent evidence, not instructions or design authority. Current anchors:

- [Typography](../../src/components/design-system-v1/typography.ts) exposes four
  of the ten roles in the [review contract](../../src/views/internal/design-system/typography-review-contract.ts).
- [Semantic roles](../../src/components/design-system-v1/semantic-roles.ts) and
  the former `src/components/ui/v1-semantic-recipes.ts` overlapped;
  their similarly named focus treatments did not have identical behavior.
- [Browser coverage](../../e2e/design-system/lab.spec.ts) exists, but
  [workflow routing](../../llm-workflow.config.json) does not select it for lab
  changes. The radius capture has no committed baseline. Full-content capture
  CSS changes overflow and positioning; it cannot prove ordinary viewport behavior.
- [Catalog types](../../src/views/internal/design-system/catalog-types.ts),
  [decisions](../wiki/decisions.md), and [progress](../wiki/progress.md) need
  reconciliation. Historical stage labels are not a current approval queue.
- [Transaction work](transaction-consolidated-regression.md#checkpoint-disposition)
  is paused with retained local designs, unreviewed surroundings, and separate
  engineering/adoption boundaries. Production migration remains untested.

These bullets describe the original checkpoint, not current implementation.
The overlapping semantic maps below have since been consolidated; the obsolete
recipe path is historical, not an import or reading recommendation.

### Desired caller experience and proposed ownership

1. **Use:** an agent building a settings section finds its Field/Select entry,
   imports the named owner, chooses supported states and type roles, and runs
   the affected checks without reading transaction history.
2. **Change:** an agent adjusting a component follows its accepted scope and
   pending proposals, changes the owner rather than overriding a consumer,
   and sees which interaction and layout evidence must be refreshed.
3. **Migrate:** an agent inventories a real section's behavior, preserves what
   the lab did not define, and proves the rendered integration against that
   inventory. Missing permission or evidence is reported, not improvised away.

Keep existing modules and catalogs; do not introduce a registry platform.
Consolidate role definitions under `src/components/design-system-v1/semantic-roles.ts`,
with a final `v1SemanticRoles` export and distinct static, focus-visible, and
group-focus recipes where required.
Temporary compatibility exports contain no duplicate values and are removed
only after the consumer inventory is migrated in green batches. Shared code
must not import lab implementation. `typography.ts` owns all ten reviewed roles;
the lab renders them directly. Legitimate component-specific typography remains
explicit rather than forced into an ill-fitting generic role.

The catalog owns discovery and scoped acceptance links; canonical code owns
implementation; decisions own accepted meaning; Current Review owns scheduling;
the progress ledger describes historical work. One lab area guide owns the
project-specific review procedure and points to the existing test map. General
kit guidance remains in force; local guidance replaces duplicates, not safety rules.

## Non-goals

- No production deployment, transaction/SDK/math/approval-policy changes,
  package restyling, product-copy rewriting, or real wallet transactions.
- No reopening square structural regions, transaction amount radii, reviewed
  transaction layouts, or secondary-action treatments without new evidence and
  specific approval. Validate page structure in context before proposing alternatives.
- No automatic IconButton default alignment, Lifecycle Status trial acceptance,
  universal size/tone API, or speculative elevation/radius values. Named aliases
  may encode an accepted role; unresolved design remains unresolved.
- No wholesale replacement of kit skills, new dependency platform, model
  tournament, blanket arbitrary-syntax ban, or mass legacy import replacement.
- No commit, push, new external review dispatch, or production adoption inferred
  from approval of this plan. Obtain the relevant authority at those boundaries.

## Acceptance evidence

| Criterion                                                  | Evidence and owning slice                                                                                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1: One usable owner for each consolidated rule            | Imports, exported type roles, valid owner/decision links, and a representative rendered consumer; S2 and S3a–S3b                                    |
| A2: No unintended visual or behavioral change              | Before/after computed styles plus rendered interaction/geometry checks; every intended delta identified, not buried in snapshot updates; S1–S3b     |
| A3: Verification claims match what ran                     | Source-bound coverage record, retained artifacts, missing-coverage failure exercise, explicit untested states; S1                                   |
| A4: Authority is truthful and discoverable                 | Per-entry migration dispositions and invariants covering partial acceptance, pending trials, unprepared/deferred/paused work, and adoption; S3a–S3b |
| A5: Better first-pass application, preserved functionality | Initial output retained, independently checked fresh-task results and source-backed integration inventory; S4–S5. Missing live proof stays unproven |

Public acceptance criteria are not a hidden evaluation rubric. Do not claim
blind or held-out testing merely because an agent was started fresh.

## Test seams

Extend existing Vitest and Playwright seams; do not build a parallel runner.
Use the V1 plan's bounded/checkpoint/integration cadence. Shared/global token or
production changes trigger the wider repository gate and engineer-review handoff.

- Unit/type tests: exports, role semantics, supported API subsets, catalog
  invariants, routing, and enforcement positive/negative fixtures.
- Browser: real viewport layout, meaningful text spacing, keyboard focus,
  enabled/disabled/loading/open states, accessible controls, and reduced motion.
  Inspect light/dark at 375px and 1400px, plus affected narrow/breakpoint cases
  (including 320px and the Stake label's 359px boundary) and a short viewport.
- Visual evidence: inspect screenshots and landmark relationships, not only
  component bounds. Full-content sheets remain useful but are labeled separately
  from unmodified-viewport captures. Every accepted role changed by S2 is exercised.
- Theme checks: compare computed values before/after; test meaningful foreground
  and control-boundary pairs against their applicable requirements. Do not impose
  one contrast threshold on every decorative seam or duplicate derived dark tokens.
- Docs: scoped formatting, wiki lint, link/anchor integrity, stale-claim review,
  and diff checks. Do not claim visual verification from a documentation-only pass.

## Slices

### Execution checkpoint — 2026-09-09

S1–S3b implementation and verification are complete, with retained evidence in
the [capture record](design-system-consolidation-capture.md). Full unit tests
1,172/1,172, the read-only browser suite 159/159 and the existing app smoke
58 passed/one pre-existing fixme are green. No retries were needed in the final
browser runs; earlier failed attempts and their corrections remain documented.
The semantic migration accounts for all 61 original modules, preserves distinct
focus behavior, and removes both obsolete maps. All ten reviewed type roles are
owned in code. Twelve accepted aliases preserve existing CSS values; scoped
hygiene checks are executable. CI selects the full unit suite and bounded
normal-viewport browser review. The catalog derives five independent questions
without discarding its original distinctions or promoting adoption.

The overview scroll, joined Stake label and mobile table clipping have regression
coverage. Before/after semantic captures match 71/72 images; the retained unequal
identity pair exposes unfinished logos, and later captures require image readiness
and actual dedicated routes. Computed-geometry exceptions are explicitly scoped
in the capture record, not hidden by snapshot replacement.

Both control tasks, both valid guidance-only tasks and both consolidated-package
tasks are retained with identical prompts/tool boundaries. All three unchanged
compositions pass the same mounted behavior checks. The
[evaluation record](design-system-consolidation-evaluation.md) distinguishes
first artifacts, setup failures and deterministic checks. The
[independent comparison is reconciled](design-system-consolidation-reconciliation.md):
authority/API benefits are evidenced, better first-pass composition is not.
S4's stronger positive exit criterion is not met; the original candidates stay
unpromoted. S5 has a source-backed proposal below, not
implementation authorization. Neither broader migration readiness nor improved
first-pass reliability is established by this implementation checkpoint.

After implementation authorization, freeze the S4 evaluation contract and run
the two control tasks before changing performer-visible guidance or code.
Then bring S3a forward and establish S1's controlled capture prerequisite.
S2 may start when that prerequisite works, without waiting for all S1 CI work.
S3b follows settled owner paths. S4 treatment runs and S5 close the program.
One implementation owner may interleave this work; overlap does not require
parallel agents or multiple completed stages against one mutable worktree.

### S1 — A trustworthy rendered-review loop

**Blocked by:** implementation authorization; S4 control run or an explicitly
recorded comparison limitation before altering the evaluation input.

Extend the existing Playwright configuration, fixtures and specs, not the audit's
one-off script or a parallel runner. Implement these mechanisms:

- **Controlled source and capture, first:** launch the test-owned server from a
  recorded checkout on a configurable unused port, with strict binding and
  cleanup limited to that owned process. Keep the user's 3005 preview running.
  Record revision, relevant tracked/untracked source-content digests, dependency
  and runtime versions, working directory, URL and launch identity. Check that
  source identity did not change during the run; otherwise invalidate affected
  evidence. A commit plus a boolean dirty flag, or startup-only footer, is not
  sufficient. Reuse `DESIGN_SYSTEM_BASE_URL` only when equivalent provenance is
  demonstrated; otherwise use the controlled server. Capture computed styles,
  unmodified viewport screenshots and affected interaction states before S2.
- **Read-only verification:** explicitly configure `updateSnapshots: 'none'`;
  retain the existing capture command's explicit update option as the writer.
  Test that a missing baseline fails without creating a replacement. Capture
  is not approval. Record the OS, browser and font environment of pixel baselines.
- **CI and routing:** add design-system coverage to workflow mapping and a
  path-filtered CI job, including canonical component directories outside V1,
  shared styles/tokens, relevant configs, tests and dependency changes. Initially
  run relational/behavior assertions and viewport artifact capture in Linux CI;
  keep existing pixel comparisons in their matching recorded environment. Do
  not silently compare macOS baselines on Linux. A later pixel-baseline promotion
  needs platform-aware paths and inspected captures from that platform. Exclusions
  stay explicit; documentation-only edits do not trigger the full specimen matrix.
- **Retained evidence:** configure Playwright JSON/HTML reports and fixture
  attachments with source identity, route/state, viewport/theme, actual checks
  and exclusions. Add CI artifact upload with 30-day retention, following the
  product workflow pattern; this is new wiring for the design-system suite.
  A small checkpoint index in `docs/plans/` holds report pointers, digests and
  expiry, not another report schema. Keep only curated synthetic screenshots
  needed for durable decisions in the repo, initially capped at 5 MB per
  checkpoint; state and justify any increase. Expired artifacts are unavailable
  evidence, not retrospectively inspected proof. Do not rely on `/tmp` alone.
- **Failing coverage contract:** the selected browser run must fail on missing
  required captures/metadata or stale source identity, and CI must select the
  relevant suite. Test selection and a deliberately missing attachment. Informational
  `scope.mjs` flags alone do not establish either enforcement or completion.

Reproduce and fix unexpected initial scroll, `StakeRSR` spacing, mobile table
clipping, and confirmed index overflow. Preserve modal focus/accessibility;
make table content reachable without deciding its final mobile anatomy.
Repair missing/stale baselines only after reviewing each intended difference.
The missing baseline is a harness defect, not a fourth visual design defect.

Add the lab area guide as the procedure owner, replacing duplicated passages.
**Exit proof:** known defects reproduced before fixes and checked after; the
mapping selects the browser seam; deliberately absent coverage is reported;
normal viewport screenshots and focused interaction checks pass. This does not
claim every lab state or the whole production app is verified.

### S2 — Foundations consumed without reconstruction

**Start prerequisite:** S1's controlled-source capture seam and before-change
evidence, not its completed workflow/CI rollout. Exit still requires all affected
viewport, geometry and interaction checks; static style parity alone is insufficient.

Inventory all consumers of both role maps, including canonical components
outside the V1 directory; record unique files and counts rather than adding
overlapping import counts. Migrate callers in green batches with value-free
compatibility exports, then remove obsolete aliases. Export the ten typography
roles while preserving the existing four API keys; map lab role IDs to their
owner rather than renaming APIs just to match display vocabulary.
Document selection guidance at the owner. For `v1LayoutRecipes`, record consume,
retain-as-composition-evidence, or remove-unused dispositions based on matching
relationships; do not fold spacing into the color map or change component insets
because two values happen to match. Document IconButton's different defaults at
its API without inventing a historical rationale or changing those defaults.

Wire accepted semantic aliases consistently; inventory each token as accepted,
candidate, or legacy before changing it. Preserve exact theme-dependent results.
Tokenizing the accepted performance palette is allowed only within a separately
identified, value-preserving batch with its real consumers verified. Do not
turn candidate token names or unspecified elevation into accepted values.

Implement scoped source-hygiene checks as Vitest tests in the existing V1 test
seam, so failures fail the unit gate rather than becoming advisory red flags.
Use an explicit, reviewed exception map for token definitions, `typography.ts`,
historical/candidate evidence, local/Radix variables, and legitimate measured or
component-owned geometry. Check unknown references, unexplained raw colors/palette
classes and duplicated reviewed typography. Test allowed/forbidden examples;
enforcement must neither bless arbitrary new tokens nor reject legitimate owners.

**Exit proof:** one definition per consolidated role, all ten type roles rendered
from the owner, no unaccounted consumer, default and interactive visual parity,
and actionable enforcement fixtures. Keep IconButton defaults and trial geometry.
Record **Engineer review required** for shared token/contract changes before adoption.

### S3a — Earlier documentation and authority-link cleanup

**Blocked by:** implementation authorization and the S4 control run or a recorded
comparison limitation. No dependency on S1 completion or S2's new owners.

Move transaction-only guidance from the default plan to its existing domain
documents, select one owner per rule, and repair inbound links. Add scoped
acceptance links using current owner paths; update renamed paths in S2's own
batch. Test destinations and scope, not just non-empty URLs. Missing acceptance
evidence is a reconciliation question, not an invented decision. Do not weaken
kit safety rules or publish commands before S1 implements them.

Audit the eight historical stage rows named by the review: `accept accordion
and prepare collapsible`, `design-system-v1-link-accordion-preparation`,
`Design-system V1 safe-autonomy frontier`, `design-system safe-autonomy frontier`,
`CopyableValue inline treatment`, `contained inline message icon`, `Inline message
transaction qualification`, and `standalone link icon spacing`. Link accepted
parts to their decisions while preserving any pending visual, engineering or
adoption scope. Do not label mixed stages wholly accepted. Remove this planning
document from the router's domain-drift `sources` list; retain its on-demand link.

**Exit proof:** routine component work no longer requires transaction history;
links resolve and each named stage has a justified scoped disposition. Preserve
a guidance-only snapshot for S4, containing documentation/routing changes but
no S1 runtime or S2 owner changes. This may be assembled in an isolated copy;
it does not require delaying independent engineering work.

#### Historical stage dispositions

Reconciled on 2026-09-09 against existing decisions, typed acceptance and the
current reference. These are corrections to historical scheduling labels, not
new design approvals. Original verifier results remain historical; the active
stage records this documentation pass's checks separately.

| Historical stage                              | Recorded acceptance                                                                                                                                                                                                                                                                      | Still outside that acceptance                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `accept accordion and prepare collapsible`    | [Accordion](../wiki/decisions.md#2026-08-21--informational-accordion-baseline-accepted) and subsequent [Collapsible](../wiki/decisions.md#2026-08-21--independent-collapsible-baseline-accepted), including 180ms motion                                                                 | Hosted content, native details, bespoke triggers and adoption                                                       |
| `design-system-v1-link-accordion-preparation` | [Link](../wiki/decisions.md#2026-08-21--navigation-link-baseline-accepted), Accordion and subsequent Collapsible                                                                                                                                                                         | Drawer remains separate; shared Link engineer review remains deferred                                               |
| `Design-system V1 safe-autonomy frontier`     | Dedicated control decisions; [Copyable Value](../wiki/domains/design-system-reference.md#copyable-value), [Skeleton/Spinner](../wiki/domains/design-system-reference.md#skeleton-and-spinner) and [EmptyState](../wiki/domains/design-system-reference.md#emptystate) recorded baselines | Loading/empty host compositions, Home variants, Drawer and adoption                                                 |
| `design-system safe-autonomy frontier`        | Select/SearchField decisions; [Menu](../wiki/domains/design-system-reference.md#action-menu), [minimal Popover](../wiki/domains/design-system-reference.md#minimal-popover-shell), [MultiSelectFilter](../wiki/domains/design-system-reference.md#multiselectfilter) recorded baselines  | Popup density and elevation remain provisional; searchable expansion, mobile substitution and adoption are separate |
| `CopyableValue inline treatment`              | [Opt-in integrated treatment](../wiki/decisions.md#2026-08-31--copyable-value-supports-an-integrated-dense-row-treatment), with separated default retained                                                                                                                               | Parent layouts, paired explorer controls, native/bridged lists and adoption                                         |
| `contained inline message icon`               | [Summary-only contained icon](../wiki/decisions.md#2026-09-01--inline-message-supports-full-and-compact-summary-presentations)                                                                                                                                                           | Automated introduction composition is retained at the paused transaction checkpoint, not general callout approval   |
| `Inline message transaction qualification`    | [Full/summary anatomy](../wiki/decisions.md#2026-09-01--inline-message-supports-full-and-compact-summary-presentations); consequential information stays visible                                                                                                                         | Product copy, recovery behavior, shared-default engineer review and adoption                                        |
| `standalone link icon spacing`                | [4px standalone relationship](../wiki/decisions.md#2026-08-21--navigation-link-baseline-accepted)                                                                                                                                                                                        | Shared Link engineer review before adoption; no new Button/IconButton default                                       |

All 32 current-baseline entries now route to scoped evidence. Twenty-six have
an accepted-decision link, including Metric's composition-only supporting
decision. Six instead name their existing reference section and explicitly
disclose the absence of a dedicated decision entry: Menu, Popover,
MultiSelectFilter, Skeleton, Spinner and EmptyState. This does
not manufacture a decision or promote their exclusions. Some decision links
cover only a kernel or extension, as stated in the source detail; they are not
blanket acceptance of every rendered variant.

Transaction geometry, transfer boundaries and the pressure register now live in
the existing [transaction checkpoint](transaction-consolidated-regression.md#retained-transaction-composition-guidance).
The dated upstream reconciliation lives in the existing
[transaction audit](transaction-system-audit.md#14-versioned-upstream-transaction-reconciliation-2026-09-02).
The active V1 plan keeps project precedence, scope and the cross-project
engineering register. No catalog authority, review, adoption or implementation
status changed; two obsolete Textarea/Collapsible next-action prompts now route
to their accepted scope instead of repeating the completed baseline review.
No component or foundation implementation changed in S3a.

Static route and content-preservation checks do not prove that fresh agents
perform better. The guidance-only snapshot and its packaging limits are in the
[evaluation record](design-system-consolidation-evaluation.md#guidance-only-candidate).
At the S3a checkpoint no treatment had run; the evaluation record owns subsequent
execution. No comparative judgment is inferred from these static checks.

#### Focused external review handoff

The [first-slice review](design-system-consolidation-first-slice-review.md) is
complete. Its original report remains unchanged; this implementation pass does
not claim independent re-approval or new human acceptance.

| Findings | Disposition                                                                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1       | Deferred until transaction work resumes; current owner remains explicit.                                                                                                                                                                          |
| R2       | Restored the upfront multi-step/professional-page boundary in the existing automated audit.                                                                                                                                                       |
| R3       | Preserved: static routing checks do not establish fresh-agent improvement.                                                                                                                                                                        |
| A1       | Wording narrowed, not automatically downgraded. Typed baseline classifications predate this pass; direct human provenance for Menu/Popover/MultiSelectFilter was not recovered. Do not fabricate a decision or seek blanket approval from memory. |
| A2       | Added dated acceptance-log pointers to the renamed reference section.                                                                                                                                                                             |
| A3       | Metric keeps its broad reference plus a scoped rich-record decision; that decision does not make all values weight 500. Loading/empty chronology is linked from their reference owner.                                                            |
| A4       | Reused existing stage statuses; pending density and deferred engineering scope stay separate.                                                                                                                                                     |
| V1       | Fresh controlled captures taken before the first S2 owner change, not reused from the historical harness proof.                                                                                                                                   |
| V2–V3    | Private configuration checked in memory only; sanitized historical private-derived hashes and deduplicated public manifests. No raw credential values were stored.                                                                                |
| V4       | Native watchers now cover source directories and nonrecursive root events, not the dependency tree.                                                                                                                                               |
| V5       | Added test-configuration/remote-asset limitations and inner-scroll measurements; historical records disclose missing inner-scroll evidence.                                                                                                       |
| V6       | S1 now includes an automated real-runner missing-baseline test. The earlier manual probe remains labeled historical, not retroactively automated.                                                                                                 |
| V7       | Updated the e2e area guide with the scoped lab loop and protected preview boundary.                                                                                                                                                               |
| C1       | Packaged from the original archive plus ten guidance files; removed four coordinator log sections/two ledger rows and redirected the actual three scope links. 186 links/anchors pass; no S1/S2 code enters this arm.                             |
| C2       | Retention still ends by 2026-09-16. Deadline risk is not certain expiry; obtain a bounded extension before then if needed, never silently extend.                                                                                                 |
| C3       | Existing provider/preparer limitations preserved; no new measured run.                                                                                                                                                                            |

The historical disposition table's Menu/Popover/MultiSelectFilter baseline
wording denotes the pre-existing typed classification, not independently
recovered approval. Their catalog details and ledger now expose that gap.

### S2 first batch — typography owner

`typography.ts` now owns all ten exact reviewed class recipes and their existing
usage descriptions. The lab contract consumes both; its samples, role IDs and
four existing API keys are preserved. No component defaults, layout, copy,
theme values or production consumers changed. A missing-six-roles regression
failed before implementation and passes afterward.

The [capture record](design-system-consolidation-capture.md#typography-batch-verification)
owns before/after evidence. This closes the typography-owner batch only, not
all S2 hygiene/semantic work. The import/export inventory resolves relative and
alias paths: 14 modules reference the semantic owner, 54 the recipe map, and
two the lab proxy; their union is 61 unique modules, including the forwarding
proxy and ten canonical component modules outside V1. Typography has 52
importing modules including the new characterization test. Do not add these
overlapping counts together. [Exact inventory](design-system-consolidation-evidence/typography/consumer-inventory.json).

Those were the first batch's limits. The subsequent semantic batch is recorded
below; its evidence is separate rather than attributed to the earlier run.

### S2 completed ownership and enforcement

The [disposition inventory](design-system-consolidation-evidence/consolidated/owner-dispositions.json)
accounts for the 61 original modules, all 13 layout relationships and 12 new
Tailwind aliases. Existing consumers retain exact class behavior. The obsolete
UI recipe map and lab proxy are removed; no shared module imports a lab owner.
Static on-content, focus-visible, inset and within-group focus remain distinct.

All layout recipes are retained for their matching relationships, not merged
into the color map. IconButton's actual compact/secondary defaults are documented
beside its API, without changing them to Button's default/primary behavior.
The performance palette keeps its existing implementation owner. Candidate
palette values, unspecified elevation and radius values are not promoted.

Canonical hygiene tests reject raw colors, palette utilities, unknown semantic
references and duplicate reviewed type recipes, including important modifiers
and reordered literal classes. Fourteen duplicate recipes in seven canonical
files were replaced by exact owner values. Explicit exceptions preserve the
existing dialog/drawer scrims, owner definitions, Radix/local variables and
legitimate measured geometry. This is scoped static enforcement, not a universal
CSS validator. Runtime/variant-composed strings and legacy surfaces remain outside.

**Engineer review required before adoption:** semantic public contracts and
Tailwind wiring remain shared-code review surfaces even when value-preserving.

### S3b — A truthful, simpler catalog

**Blocked by:** S3a dispositions and settled S2 owner paths. No requirement to
wait for all CI integration before drafting the per-entry mapping.

Reshape entries around owner paths, concise usage boundaries, scoped acceptance
references and relevant evidence. Test link meaning and catalog invariants,
not a frozen list of accepted IDs.

Prefer five independent questions: authority, implementation, output, adoption,
and review. Before removing fields, map every existing entry and affected
foundation/dashboard consumer. Keep scheduling and acceptance separate: preserve
unprepared, deferred, paused, blocked, and active states; preserve an accepted
base with a pending variant. Map pending/partial/complete evidence explicitly;
do not turn missing evidence into a false boolean meaning complete. Priority is
planning metadata. Derive duplicate labels/gates rather than hand-maintaining them.
If a lossless simplification fails, retain the necessary distinction instead of
forcing a target field count. Keep stable IDs and route anchors.

**Exit proof:** catalog invariants cover every old entry's disposition; routine
component work routes without transaction history; paused/pending examples are
truthful in the lab; required links and wiki checks pass. Record which duplicate
passages and concepts were removed, not a target word count as proof of quality.

Implemented as a lossless derived view, not a destructive schema replacement.
All 45 entries are mapped in the [catalog disposition record](design-system-consolidation-evidence/consolidated/catalog-dispositions.json).
Authority, implementation, output, adoption and review each retain their source
and detail. Priority/audit are quiet metadata; redundant generic status badges
are removed where the five answers already communicate the state. Foundation
and dashboard consumers retain needed fields. Paused transaction work, partial
baseline scope, pending geometry trials and unprepared outputs stay distinct.
Catalog tests check the full mapping and named edge cases. No design or adoption
status was changed to make the display simpler.

### S4 — Bounded fresh-agent validation

**Reconciliation scope — 2026-09-09:** the human authorized closing the
[independent comparison](design-system-consolidation-comparative-review.md).
Fixed point remains `adef9ee76`; preserve the existing consolidation diff and all
first outputs. This medium, bounded pass checks the original tests, browser
receipts, requested read-event evidence and opened-menu geometry; reconciles
each finding; and corrects only confirmed project guidance or verification gaps.
No specimen repair, shared-default change, new workflow experiment, table
implementation or production pilot is included. Exit requires a sourced
disposition, fresh focused evidence, resolved documentation links/statuses and
scoped review. Documentation improvements alone do not establish better future
agent behavior.

**Result:** the [comparison disposition](design-system-consolidation-reconciliation.md)
closes the evidence questions except unobservable automatic guide loading.
The bounded reconciliation's focused checks and required reviews are complete;
the program itself is not closed.
Fresh original tests and supplemental browser checks pass, but important first
composition mistakes remain in the deliberately frozen outputs. The positive
exit criterion below is not satisfied; repair burden and better normal-loop
performance remain unproven. Do not change the criterion or silently authorize S5.

**Controls:** first implementation activity after authorization and isolation
checks. **Treatment runs:** after S3a and the consolidated S1–S3b package exist.

Use one short owner/authority explanation task and one small new-composition
task. Freeze the rubric before either run. Capture controls from the original
checkpoint now, then guidance-only and consolidated-package outputs in the same
bounded window. Record provider/model identity, settings, dates and observable
runtime versions; the same marketed model name does not prove an immutable model.
If provider behavior changes, disclose the confound or rerun matched comparisons.
Git preserves source for later controls but cannot freeze the provider.

Keep audit findings, this plan, conversation history and other arms' outputs out
of performer-visible workspaces without breaking required project routing. Use
the same organic task, data, external tools and permissions. The guidance-only
arm changes guidance/routing metadata; the package arm declares its code and
in-repo verification changes. Compare both with the same original fixture, not
serially repaired output. Record actual instruction reads when available; do
not infer them from an agent's citations or narration.

Follow `skills/evaluate-workflow.md` when comparing workflow variants: freeze
the evaluation decision and independent rubric before runs, vary one factor,
and preserve first output before feedback. Score rendered quality, correct reuse,
scope/behavior preservation, explanations, and repair cost; reading volume is
secondary. The guidance-only comparison tests whether that cheaper treatment is
adequate, not a claim that routing alone must suffice. The full-package comparison
cannot identify which individual code/tool change caused improvement. Do not
revise the rubric after observing one arm and still call the result preregistered;
reclassify as a pilot and rerun matched arms if criteria need revision. No
capability/context factorial study is required. If isolation or independent
judgment is unavailable, record the limitation and obtain direction before
dropping the comparison; deterministic engineering proof is still separate.

**Exit proof:** an independent reviewer inspects the actual first outputs; no
unresolved important mistake in the tested tasks; compare repair burden honestly.
A small sample supports only this bounded conclusion, not universal first-pass reliability.

### S5 — One real migration rehearsal before broad adoption

**Blocked by:** explicit disposition of S4's unmet positive exit criterion and
approval of a named pilot scope. Comparison reconciliation is not that approval.

Choose one existing section with meaningful behavior and mostly accepted
dependencies, preferably read-only information plus an action/disclosure. Record
the exact production path and exclusions before editing; do not select a whole
page, unfinished chart/table system, or transaction execution as the first pilot.

Use an isolated working copy to change the actual section and test its normal
integration. Inventory current states, actions, copy, data, responsive behavior,
accessibility, and analytics; classify each as reviewed replacement, preserved
behavior, or unresolved. Preserve real data/behavior seams with deterministic
test boundaries, not a newly invented lookalike fixture. Apply accepted square
structure in its page context; compare alternative shapes only for a demonstrated
problem and a separately authorized design decision.

**Exit proof:** every inventory item reconciles against the resulting integration;
inspect happy, empty/error and constrained states where applicable; no omitted
feature, unauthorized mechanics/copy change, or unresolved important regression.
Keep the result unadopted until a separate production decision.

### Page-context proof before settling table/row composition

#### Prepared pilot proposal — not authorized or implemented

Recommended first target: the existing **Downloadable resources** section in
`src/views/index-dtf/overview/components/dtf-downloadable-resources.tsx`, hosted
by `index-about-overview.tsx` on the Index DTF Overview page. It combines a real
data boundary, loading/absence states, localized information and actionable
links without depending on an unfinished table family or transaction execution.
This is a source-inspected proposal; its real-page visual inventory and named
approval still precede any implementation. It is not already a golden screen.

Preservation inventory for the eventual isolated rehearsal:

| Existing behavior                | Required preservation / proof                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| SDK-backed DTF and brand atoms   | Keep the real consumers; no substitute data model or hook change.                                                |
| DTF not loaded                   | Preserve the loading branch and compare its actual footprint with resolved content.                              |
| No downloadable resources        | Section remains absent; do not invent a generic empty card.                                                      |
| Address-keyed built-in resources | Preserve token/address matching, per-locale tearsheets, default-locale fallback and the local Markdown resource. |
| Brand-provided resources         | Preserve safe-HTTP filtering, ordering and filename fallback when the label is missing.                          |
| Link activation                  | Preserve exact destination, new-tab/noopener behavior and `downloadable_resource` analytics payload.             |
| Embedding variants               | Keep `showDivider` and `className` contracts, desktop/mobile About placement and cover-adjacent composition.     |
| Internationalization             | Preserve Lingui strings and locale selection; test long translated labels.                                       |

Use accepted Link, typography and semantic surface relationships; retain domain
loading behavior. Do not redesign Cover, About metadata, charts, Holdings,
transactions, navigation or resource content. The primary full-page comparison
should show this section within its existing Overview host at 375/1400 and both
themes, identifying all retained legacy children. The current overview smoke,
lifecycle and unbranded-DTF coverage are useful integration seams, but do not
claim they already prove resource ordering, safety, locale or analytics. Those
need targeted assertions when the named pilot is approved.

There are two direct consumers to pressure-check: `index-about-overview.tsx`
and `overview/stocks/video-library.tsx`. The latter overrides the surface and
insets (`bg-transparent sm:p-2 sm:pt-5`); do not silently break that embedding
while proving the ordinary About host. No production file has been changed.

The simpler alternative is the About disclosure itself. Its responsive excerpt
and expansion behavior add more composition decisions; keep it out of this first
pilot unless the resource section proves too small to test meaningful integration.

#### Boundary

S5 proves one integration seam, not a whole-page visual system. At pilot selection,
the implementation owner must name a representative full page (preferably the
pilot's host) and a bounded lab proof in the accepted square/semantic-seam direction.
Keep its real information hierarchy and retained behavior primitives; do not
redesign unfinished charts or migrate the full production page. Inspect light/dark
at 375px and 1400px beside current production, distinguishing retained legacy
children from V1 framing. Complete this before calling table/row page composition
settled. It does not block independent table anatomy work or automatically reopen
square versus rounded. Bring demonstrated design pressure to the user; do not
claim this new page composition human-approved from engineering checks.

## Unresolved decisions

- Claude's review has been reconciled below. Bounded implementation and the
  control exercises are authorized; the revised plan is not a fresh reviewer pass.
- S3b preserves its backing schema and exposes a derived five-question view;
  removing more fields is not needed for this slice.
- S4's tools and evidence retention must support honest isolation. Current
  execution evidence and limitations live in the [evaluation record](design-system-consolidation-evaluation.md).
- S5's target, permitted integration changes and page-context proof require a
  named approval and scheduled checkpoint before they begin.
- Any actual theme value, component-default, or accepted-design change stops
  for its owner-level decision; unclear trial status remains pending.

## Tradeoffs and review disposition

The strongest objection is spending too much time on infrastructure before
testing the system's promise. Bound the work to these demonstrated seams, ship
owner/docs/tests together within each slice, and use the small pilot before
expanding the program. Dependencies govern evidence readiness, not mandatory
parallel teams or extra ledger stages. A shorter router alone leaves implementation ambiguity;
a wholesale rewrite risks accepted quality without supporting evidence.

Disposition of the [independent plan review](design-system-foundation-consolidation-review.md):

| Finding                                  | Disposition in this revision                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1: S2 waits for all S1                  | Accepted with safeguard: start after controlled capture; finish only with affected interaction and geometry proof                                                              |
| F2: independent docs deferred            | Accepted: S3a moves earlier; S3b retains its real dependencies                                                                                                                 |
| F3: controls deferred                    | Accepted timing risk: early controls plus guidance-only arm; no assertion of free evaluation or guaranteed provider stability                                                  |
| F4–F5: artifacts and baseline mode       | Accepted: explicit reporter/upload wiring, retention/expiry and image budget; read-only verification and platform-aware comparison policy                                      |
| F6: preview identity                     | Problem accepted; SHA-plus-dirty footer rejected as insufficient. Use controlled source-content identity and owned alternate port                                              |
| F7: checks cannot fail                   | Accepted: Vitest hygiene tests and tested failure paths, not advisory flags                                                                                                    |
| F8–F9: migration and typography          | Accepted inventory/batching and explicit owner exceptions; preserve API compatibility and distinguish layout recipes from semantic colors                                      |
| F10: whole-page proof                    | Accepted separately from the one-section rehearsal; retain accepted shape and scope, not a new blanket human gate before all table work                                        |
| F11: historical statuses                 | Accepted named-row reconciliation; reject whole-stage acceptance where scope is mixed. `review-pending` already exists in `skills/stage.md`, independent of catalog vocabulary |
| F12: IconButton defaults                 | Document the actual API; preserve defaults and avoid fabricated rationale                                                                                                      |
| F13: planning document in router sources | Accepted: keep on-demand link, remove drift-source coupling                                                                                                                    |

The original reports remain unchanged. This resolves the plan review once;
request a focused re-review only if implementation introduces a material new
choice. The implementation go-ahead follows this revision. Its first bounded
slice is S4 controls, S3a cleanup and the S1 capture prerequisite; the remaining
program and its separate adoption boundaries remain explicit.
