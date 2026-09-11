# Design-system consolidation — comparative review of six preserved first outputs

Independent report-only review of the bounded experiment: two tasks (owner
explanation, "Display preferences" specimen) completed once under each of three
neutral-labelled project packages (Cedar, Flint, Quartz). Written 2026-09-09
from the neutral evidence package, the frozen rubric, the three preserved
project snapshots, and the coordinator's matched-proof harness. Nothing in any
snapshot, artifact, baseline or status record was modified; this file is the
only repository write.

## 0. Inputs, method and independence disclosure

Inputs read, in this order: `owner-task.txt`, `composition-task.txt`,
`rubric.md`; `evaluation/index.json` (all 44 sha256 entries verified, 0
mismatches); the six `.md` outputs, six `.tsx.txt` sources/tests, six access
logs and all 24 screenshots (each viewed, several regions cropped and
pixel-measured); `matched-proof.spec.ts`; then source-grounded checks against
each candidate's own snapshot (`register-session.7aGjKf` Cedar,
`register-session.qHIZIi` Flint, `register-session.S8PBJF` Quartz). All six
outputs were judged in one context against the same rubric.

Not read: `runs.json`, `package-closeout-differences.json`, the private label
mapping, `docs/plans/design-system-v1.md`, `docs/wiki/log.md`,
`docs/wiki/progress.md`, prior audits or consolidation reports.

Exposure to disclose. The snapshots are not git repositories, so to isolate
performer changes I extracted checkpoint `adef9ee76` into my scratchpad and
diffed each snapshot against it. That diff reveals package structure:
Cedar is byte-identical to the checkpoint apart from the performer's two files
and the coordinator's two mount files; Flint adds documentation and catalog
changes (`design-system.md`, `design-system-reference.md`, 118 added lines of
`contextSources` links in `component-catalog-primary.ts`, plan/log/progress
edits); Quartz adds those plus a source-level consolidation (new
`design-system-v1/semantic-roles.ts` owner replacing `ui/v1-semantic-recipes.ts`,
a ten-role `typography.ts`, a lab area guide, hygiene tests, e2e tooling). I
could therefore infer that the packages form a cumulative sequence. I did not
map them to treatment names. A shell glob also listed six other
`register-session.*` directories under `/private/tmp`; none was opened.

## 1. Executive verdict

No package dominated. The two tasks separated on different axes:

- **Task 1 (explanation).** Flint passes cleanly. Quartz passes on substance with
  one false process statement. Cedar is partial: it reports the accepted
  ActionGroup baseline as an "exploratory recipe awaiting review", states 16px as
  the default gap between field groups (the accepted rhythm is 24px), and
  manufactures a "48px row vs 44px control" conflict that does not exist. The
  ActionGroup error traces directly to stale prose in Cedar's snapshot that
  contradicts both the decision ledger and the typed catalog; the Flint and Quartz
  packages carry the corrected prose and both answered correctly.
- **Task 2 (specimen).** Behaviour, scope, copy, accessibility wiring and honesty
  of handoff are essentially equivalent across the three (all pass; coordinator
  reports the matched browser proof at 4/4 for each, which I could not
  independently verify). Rendered composition differs materially. Cedar produced
  the most coherent result at both widths: on-scale spacing, bounded width,
  square surface, no layout jump when feedback appears. Flint's spacing is the
  most faithful to the accepted form rhythm but the panel has no width bound, so
  at 1400px two-option selects stretch to about 660px and the feedback sits about
  1100px from the actions. Quartz used the exposed typography role correctly and
  wrote the most explicit handoff, but its geometry copies the lab's own chrome
  recipe (`rounded-2xl border bg-card p-5`) rather than the accepted contained-form
  grammar: rounded structural surface, 20px insets and gaps, 12px feedback gap,
  none labelled as exceptions although its own Task 1 answer said every value must
  map to an accepted foundation or be labelled.
- **Divergence pattern.** The documentation-level package differences fixed the
  one documentation-level failure (Task 1). They did not improve composition.
  The source-level package improved typography-role use and introduced no API
  errors, yet produced the least conformant geometry. Composition quality tracked
  what each performer chose as a visible precedent, not how much guidance the
  package contained.

Confidence: moderate for the within-task rankings (direct artifact evidence);
low for any causal attribution to packages (one run per cell, two tasks, no
transcripts, unrun tests, no harness receipts in the neutral package).

## 2. Rubric comparison

Categories: pass / partial / fail / unknown, per the frozen rubric. "Coordinator-
reported" marks claims taken from `index.json` ("matched deterministic proof 4/4
per composition") that I could not verify from receipts.

### 2.1 Criterion table

| Criterion | Cedar | Flint | Quartz |
| --- | --- | --- | --- |
| 1. T1 ownership and maturity | **partial** — owners, authority, adoption and the typography.ts/contract split are right; demotes accepted ActionGroup to exploratory | **pass** | **pass** (rubric limitation noted; minor field conflation) |
| 2. T1 useful, traceable, in bounds | **partial** — 465 words, citations resolve, no file changes; three factual errors | **pass** — 422 words, 29 resolvable path:line refs | **pass, flagged** — 443 words, refs resolve; opens with an inaccurate "I read no files beyond the typed catalogs" |
| 3. T1 spacing/hierarchy explanation | **partial** — 16px "between field groups"; 48px/44px "conflict" | **pass** | **pass** |
| 3. T2 spacing/hierarchy composition | **pass** — all values on scale, bounded, square; heading role approximated with raw utilities | **partial** — on-scale rhythm, but unbounded desktop width; `flex-wrap` on ActionGroup | **partial** — 20px/12px off-scale values, rounded structural surface, double inset at 375 |
| 4. T2 requested behaviour and content | **pass** (source-verified; render shows save state; harness coordinator-reported) | **pass** (same basis) | **pass** (same basis) |
| 5. T2 scope, reuse, isolation | **pass** | **pass** | **partial** — correct owners and scope, but the surface contradicts the accepted square structural default and the project override |
| 6. T2 accessible verified presentation, honest handoff | **pass** | **pass** — handoff omits its phantom gap and mobile layout jump | **pass** — tests likely fail on first run, but the handoff flags exactly that path as untested |
| Held-out T1 (legacy files not promoted) | pass | pass | pass |
| Held-out T2 (375 dark keyboard sequence, remount, open-menu geometry) | coordinator-reported pass; open-menu geometry only bounded horizontally | same | same |

### 2.2 Evidence notes per criterion

**Criterion 1.** All three name `field.tsx`, `select.tsx`, `button/index.tsx`,
`current-baseline` / `canonical-candidate` / `adoptionStatus: 'none'`, and the
provisional popup-density dependency. Verified in each snapshot's catalog:
Cedar `component-catalog-primary.ts:86-107` (Button), `:444-464` (input),
`:541-556` (Select); Flint/Quartz (identical file) `:87-107`, `:460-481`,
`:564-588`. None recommended `src/components/ui/button.tsx`,
`src/components/ui/select.tsx` or `src/components/field/index.tsx`; all three
explicitly exclude them. Production presence of the legacy owners (232 / 8 / 38
product files import `ui/button`, `ui/select`, `ui/input`; 0 import the V1
Field/Select) was not confused with V1 adoption by anyone.

Cedar's ActionGroup claim ("exploratory recipe awaiting review... label it
provisional; don't cite it as the footer-action rule") is contradicted by its own
snapshot's typed catalog entry `button-group` / "Action group"
(`component-catalog-primary.ts:172-215`: `designAuthority: 'current-baseline'`,
`implementationStatus: 'reusable-recipe'`, `review.status: 'ready'`, statusDetail
"The accepted reusable composition recipe...") and by `decisions.md:299`
("2026-08-19 — ActionGroup composition baseline accepted", identical in all three
snapshots). The claim matches Cedar's `design-system-reference.md:197-202`, which
still reads "an exploratory reusable recipe awaiting human review, not a current
baseline". Flint's and Quartz's reference (`:197-202` / `:210-215`) reads
"accepted reusable composition baseline" with the decision link; both answered
correctly.

Rubric limitation (Quartz): the criterion says to distinguish reusable recipes in
`typography.ts` from the broader role contract. In Quartz's snapshot
`typography.ts` carries all ten roles and `typography-review-contract.ts`
consumes them, so the checkpoint-era distinction no longer exists. Quartz's
answer neither misstates this nor surfaces it; it lists typography's
"Implementation" as "rendered" (an `outputStatus` value, not an implementation
status) and recommends `itemTitle`/`sectionTitle` for the heading while
`panelTitle`, the role its own component later used, is the fitting one. I
scored this as pass with a minor imprecision rather than penalising a correct
use of the available API.

**Criterion 2.** Word counts (wc -w, tables included): Cedar 465, Flint 422,
Quartz 443. Every cited line range I checked resolves in the candidate's own
snapshot (Appendix B). Flint's `design-system-reference.md:862-866` is a loose
fit for "legacy/migration evidence" (the section says "never rebuild" shadcn
primitives); the substantive claim still holds. Quartz's opening sentence is
contradicted by `Quartz-owner-access.json`, which records reads of
`design-system.md`, `design-system-reference.md`, `v1-layout-recipes.ts` and
greps across the tree; the answer also cites `current-review.ts` and reference
line numbers. This is a false process statement, low materiality; if the
coordinator treats any inaccurate self-report as a truthfulness violation the
criterion drops to partial.

**Criterion 3 (T1).** Accepted rhythm per `foundation-catalog.ts:93-116` and
`spacing-rhythm-study.tsx:102-106` (identical across snapshots): 4px tight text,
8px within a field, 16px nested/internal, 24px ordinary inset and between groups,
32px+ between regions, 16px narrow inset. Cedar's "stack.internalRegions (16px)
— between field groups" conflicts with "24px between groups"; Cedar's "conflict"
between `foundation-catalog.ts:102` (48px default single-line *row*) and 44px
control height compares table-row rhythm with control geometry, which the same
study separates ("Control padding remains governed by the separate geometry
study", `spacing-rhythm-study.tsx:30-31`). Flint's and Quartz's explanations
match the accepted values; Flint's is the most directly actionable (a numbered
composition sequence pinned to `contained-form-row-review.tsx:121-161`).

**Criterion 3 (T2).** Measured from the light screenshots (Appendix A). Cedar:
16/24 inset, 4, 24, 16 between fields, 24, 8 peers, 16 feedback; width bounded at
576px; square surface. Flint: 16/24 inset, 4, 24, 24 between fields, 32 + rule +
24, 8 peers, 16 feedback; no width bound (`Flint-light-1400-initial.png`: panel
0–1399px, selects 663px wide, `Flint-light-1400-saved.png`: feedback at x≈25,
actions at x≈1120–1375). Quartz: 16 page + 20 card inset at 375, 4, 20, 16
between fields, 20 + rule + 20, 8 peers, 12 feedback; `rounded-2xl`. The 20px and
12px values map to no accepted relationship and are not labelled exceptions in
`Quartz-composition.md`. Labels align to control outer edges in all three
(screenshots and `field.tsx:28-33` `block` label). Typography: labels 500,
values 300, supporting 300, headings 500 in all three; Cedar and Flint hand-roll
the heading as `text-xl font-medium leading-7` (20/28/500) because their
`typography.ts` exposes only four roles, while the panel-title role is
20/26/500 (`typography-review-contract.ts:38-44`); Quartz uses
`v1Typography.panelTitle`. Actions: Cedar uses an intentional equal-width
vertical stack at 375 and intrinsic horizontal at desktop; Flint and Quartz keep
an intrinsic horizontal pair that fits at 375. Flint's `ActionGroup
className="flex-wrap justify-end"` permits the ragged wrapping the accepted
decision forbids (`decisions.md:301-302`); it does not trigger at the tested
widths.

**Criterion 4.** Source logic is exact and equivalent in all three: first
options, save stores `{numberFormat, timeZone}` and shows feedback, either change
clears feedback, reset restores both and clears feedback, no fetch/storage.
Copy is verbatim in all three. All three leave the stored snapshot untouched on
Reset and flag that reading identically. Screenshots show the saved state with
both changed values and the feedback pill in all eight `*-saved.png` files. The
harness (Appendix C) covers save → change second → save → reset → reload; the
coordinator reports 4/4 per candidate. The neutral package contains no test-run
receipts, so the tests are unrun evidence.

**Criterion 5.** Performer writes per access logs: exactly the two permitted
files in each case (Write/Edit entries only on `display-preferences-study.tsx`
and its test). Snapshot deltas confirm no other performer-attributable files;
`display-preferences-entry.tsx` and `display-preferences.html` are identical
across snapshots and are the coordinator's mount. No invented APIs: every prop
used (`ActionGroup direction`, `Button tone`, `InlineMessage presentation/tone/
density`, `SelectTrigger id`, `FieldLabel htmlFor`, `v1LayoutRecipes.*`,
`v1SemanticRecipes.text.supporting` / `v1SemanticRoles.text.supporting`,
`v1Typography.panelTitle`) exists in the respective snapshot. Tokens only; no
hex/hsl. Surface: `project.md:82` says structural surfaces are flat, square, and
borders appear only when the owning role calls for them; `foundation-catalog.ts:
137-140` says structural surfaces are square by default. Cedar and Flint use a
square panel with a hairline border (defensible for a standalone specimen on the
page canvas). Quartz's `rounded-2xl` contradicts the default without an
exception label, and its outer `bg-background p-4 sm:p-8` wrapper folds a page
gutter into the component (the layout foundation lists "Outer frame and gutters"
as open, `foundation-catalog.ts:169-171`).

**Criterion 6.** All three: `role="status" aria-live="polite"` region always
mounted; feedback is icon + text (`InlineMessage` summary presentation); labels
wired `htmlFor`→`id` on the Radix trigger (Flint via `useId`, Cedar and Quartz
with fixed ids that would collide if two instances mounted). Harness asserts the
accessible names resolve, keyboard open/End/Home/Enter works, the listbox stays
within the viewport horizontally, and the document does not overflow
horizontally, in all four theme×width cells (coordinator-reported). Screenshots
show no clipping in either theme. Opened-menu geometry has no screenshot and no
vertical assertion; with two options it is low risk but unproven. Handoffs: all
three state plainly that no tests, typecheck, lint or rendering were run. Cedar
and Quartz also disclose the empty live region's reserved gap; Flint does not
mention its 16px phantom gap or the mobile layout jump (§3.2).

## 3. Significant findings

Severity: high / medium / low. Confidence: high / medium / low.

### 3.1 Verified deviations

| # | Candidate | Finding | Evidence | Severity | Confidence |
| --- | --- | --- | --- | --- | --- |
| D1 | Cedar T1 | Accepted ActionGroup baseline reported as exploratory/provisional | `Cedar-owner.md` § "Established owner vs. specimen"; Cedar `design-system-reference.md:197-202` (stale) vs `decisions.md:299-310` and `component-catalog-primary.ts:172-215` | medium | high |
| D2 | Quartz T2 | Off-scale spacing (20px header→fields, 20px fields→rule, 20px rule→footer, 12px feedback→actions, 20px mobile inset) and `rounded-2xl` structural surface, none labelled as exceptions | `Quartz-component.tsx.txt:80-82,95,136`; measurements Appendix A; `foundation-catalog.ts:93-140`; own claim in `Quartz-owner.md` last paragraph | medium | high |
| D3 | Flint T2 | No width bound; desktop composition loses grouping | `Flint-component.tsx.txt:85` (no `max-w`); `Flint-light-1400-initial.png`, `Flint-dark-1400-saved.png`; sibling specimens bound width (`contained-form-row-review.tsx:121` `max-w-3xl`, `transaction-composition-vote-lock-support.tsx:71` `max-w-md`) | medium | high (ownership of width is arguable; see §4) |
| D4 | Quartz T2 tests | Keyboard-only path with no `scrollIntoView` stub; Radix Select calls `candidate?.scrollIntoView` on open (`@radix-ui/react-select@2.2.6` `dist/index.mjs:321`) and jsdom 27.4 does not implement it; the shared `src/setup-tests.ts` stubs nothing | `Quartz-test.tsx.txt:14-21`; three of four tests open a select | low–medium (tests are permitted extras; handoff flags this path as untested) | medium–high (static analysis; not run) |
| D5 | Cedar T1 | "16px between field groups" stated as the default | `Cedar-owner.md` § "Default spacing composition"; accepted 24px per `decisions.md:222-223`, `spacing-rhythm-study.tsx:102-106` | low–medium | high |
| D6 | Cedar T1 | Manufactured "48px row vs 44px control" conflict | `Cedar-owner.md` "One conflict to know"; `foundation-catalog.ts:102` concerns row rhythm; `spacing-rhythm-study.tsx:30-31` | low | high |
| D7 | Flint T2 | `flex-wrap` on a horizontal ActionGroup contradicts the no-wrap rule (latent) | `Flint-component.tsx.txt:157`; `decisions.md:301-302` | low | high |
| D8 | Quartz T1 | False process statement ("I read no files beyond [the typed catalogs]") | `Quartz-owner.md` line 1 vs `Quartz-owner-access.json` | low | high |

### 3.2 Usability and design weaknesses (rendered)

| # | Candidates | Finding | Evidence | Severity | Confidence |
| --- | --- | --- | --- | --- | --- |
| U1 | Flint, Quartz | At 375 the feedback pill inserts above the actions, so the buttons the user just tapped jump down (Flint ≈60px: 334→378; Quartz ≈56px: 320→364). Cedar places feedback below the actions and nothing moves; Quartz reserves height only from `sm` and says so | `*-light-375-initial.png` vs `*-light-375-saved.png` measurements | low–medium | high |
| U2 | all | Empty always-mounted live region leaves a phantom gap on mobile in the initial state (Cedar 16px below actions, Flint 16px above, Quartz 12px above). Cedar and Quartz disclose it; Flint does not | Appendix A "phantom gap" | low | high |
| U3 | Flint | Desktop: 663px selects for two-option values; feedback ≈1100px from the action that produced it | `Flint-light-1400-saved.png` | medium | high |
| U4 | Quartz | Double inset at 375 (16px page + 20px card) narrows controls to ≈303px against 343px for siblings; the specimen paints its own canvas and is less composable | `Quartz-light-375-initial.png`; `Quartz-component.tsx.txt:80-82` | low | high |
| U5 | Cedar, Flint | Heading approximated with raw utilities (line-height 28px vs the 26px panel-title role) because the checkpoint `typography.ts` exposes four roles | `Cedar-component.tsx.txt:91`, `Flint-component.tsx.txt:88`; `typography-review-contract.ts:38-44` | low | high |
| U6 | Cedar | Vertical ActionGroup switched to horizontal at `sm` through `sm:flex-row sm:[&>*]:w-auto` overrides; `data-direction="vertical"` then misdescribes the desktop state. Works visually; shows the recipe has no responsive direction | `Cedar-component.tsx.txt:149-152` | low | high |

### 3.3 Factual errors in explanations

D1, D5, D6 (Cedar); D8 and the typography "Implementation: rendered" conflation
(Quartz); Flint's `:862-866` citation is a loose fit rather than an error. No
candidate manufactured a typography adoption field or promoted the provisional
popup density to authority.

### 3.4 Preferences, not scored

- Action order and alignment: Cedar primary-first, left-aligned (Save, Reset);
  Flint and Quartz Reset then Save, right-aligned, matching
  `multi-select-filter.tsx:120`. The decision ledger leaves order to the
  composition (`decisions.md:308-310`).
- Cedar's vertical stack at 375 versus Flint's and Quartz's horizontal pair: both
  are accepted arrangements.
- A hairline border on the panel (all three) and the added default exports
  (all three, matching sibling files such as `spacing-rhythm-study.tsx:116`).
- Flint's `density="compact"` on a summary `InlineMessage` is a no-op
  (`inline-message.tsx:118-123` applies density only to the default
  presentation); harmless.

### 3.5 Unscored observations

- The last-operated Select's chevron is caught mid-rotation in every `*-saved`
  screenshot (`popup-chevron.tsx:24`: `transition-transform duration-120
  group-data-[state=open]:rotate-180`); the harness screenshots within the
  transition. Shared owner and harness timing, not a candidate difference.
- The three tests differ in coverage: Flint (5 tests) covers change→clear→save→
  change→clear, reset, a `Storage.prototype.setItem` spy and unmount/remount;
  Cedar (3) covers label wiring, session store attributes, change-clears, reset;
  Quartz (4) adds heading/supporting visibility and storage-length checks but is
  the one likely to fail (D4).
- The catalog declares entries as `component('button', 'Button', …)`, so the
  natural `id: 'button'` grep returns nothing. All three performers ran that grep
  first, then read the whole 1.4–1.5k-line catalog (Cedar 2×, Flint 3×,
  Quartz 3×). Requests are not comprehension, but this is visible friction.

## 4. Likely causes

### 4.1 Observed facts

1. **Documentation drift caused D1.** At the checkpoint, reference prose
   (`design-system-reference.md:197-210`) contradicted the ledger and the typed
   catalog on ActionGroup and Field status. The Flint-level package replaced
   those paragraphs with one-sentence status lines linked to the decisions and
   added `contextSources` decision links to catalog entries; both later
   candidates answered correctly. Cedar had read the catalog twice and
   `decisions.md` once, and its final grep (`action-group|'Action group'`)
   would have matched the catalog entry's name, yet it reported the prose
   status. The router's precedence (typed catalog first, reference only for
   detail: `design-system.md:27-29` and `:174-176` in Cedar's snapshot, `:163-165` in Flint's and Quartz's) was not applied.
2. **Composition-time retrieval favoured code over documentation.** In the
   composition task no candidate read the reference, catalogs, ledger or spacing
   foundation. All three read `select-state-sheet.tsx`, `select-review.test.tsx`,
   the owner sources and `setup-tests.ts`; Cedar additionally read
   `design-system.md`, root `CLAUDE.md` and `transaction-composition-frame.tsx`;
   Flint read `spacing-rhythm-study.tsx` and `card-content-region-review.tsx`;
   Quartz read `card-content-region-review.tsx`, `field-state-sheet.tsx`,
   `switch-state-sheet.tsx`, `source-hygiene.ts` and grepped
   `rounded-3xl|rounded-2xl`. Quartz's final surface recipe matches the lab's
   chrome (`catalog-ui.tsx:228`, `progress-dashboard.tsx:63,102`,
   `foundation-reference.tsx:24`, `color-foundation-candidate.tsx:15,54`,
   `screens-page.tsx:18`: `rounded-2xl border border-border bg-card p-5`), not
   the accepted form surface (`contained-form-row-review.tsx:121`:
   `max-w-3xl bg-card p-6`).
3. **Exposed APIs shaped correctness.** Quartz's `typography.ts` exposes
   `panelTitle` and was used; Cedar's and Flint's did not, and both hand-rolled
   the role with the wrong line-height. Quartz's `semantic-roles.ts` owner was
   imported correctly. No candidate invented an API.
4. **No in-repo recipe for driving Radix Select under jsdom.** `select-review.
   test.tsx` uses `defaultOpen`; `contained-form-row-review.test.tsx` and
   `help-tooltip-review.test.tsx` use `userEvent` without stubs; the shared
   setup stubs `matchMedia`, `ResizeObserver`, `IntersectionObserver` only. Two
   performers supplied the customary stubs from prior knowledge; one did not.
5. **No package's automation covers lab specimens' geometry.** Quartz's
   `source-hygiene.test.ts` scans `src/components` roots (`:81-82`); nothing in
   any package would flag D2 or U5.
6. **Width has no accepted rule.** The layout foundation is exploratory with
   page-column templates open (`foundation-catalog.ts:157-190`); bounded width
   is only a sibling-specimen convention.

### 4.2 Hypotheses

- H1. Fixing the stale prose plus linking decisions from the catalog is
  sufficient to prevent D1-class errors. Consistent with 2/2 later candidates
  answering correctly; not isolated (both changes landed together; n=1 per
  package).
- H2. D2 is a nearest-visible-precedent failure: lab chrome is the most frequent
  "card" pattern in the codebase, nothing labels it as non-grammar, and the
  performer had no rendering to notice the mismatch. Quartz's area guide
  (`src/views/internal/design-system/CLAUDE.md`, Quartz only) asks for geometry
  ownership and whole-composition critique, but the access log shows no explicit
  read of it during composition; whether it was auto-loaded is unknown.
- H3. D3 and U1 are ordinary execution gaps of a no-render loop rather than
  guidance failures; a single visual pass would have caught both. They are also
  the kind of composition judgment the goals say should stay with the author.
- H4. Task 1 quality is documentation-sensitive; Task 2 quality is
  precedent- and API-sensitive. Two tasks cannot establish this generally.

## 5. Smallest useful improvements

### 5.1 Preserve

- The typed catalog as the authority, the decision ledger, and the
  `contextSources` decision links (Flint-level). Cheap, and they removed the only
  authority error observed.
- The ten-role `typography.ts` and the single `semantic-roles.ts` owner
  (Quartz-level). A fresh session used both correctly with no invented API, and
  the panel-title role was the one thing Cedar and Flint could not do right.
- The existing `Field`, `Select`, `ActionGroup`, `Button`, `InlineMessage` APIs
  unchanged. Three independent compositions used them correctly; nothing here
  justifies new props.

### 5.2 Fix, at the smallest owner

1. **Keep status out of reference prose** (`docs/wiki/domains/design-system-
   reference.md`, plus one line in `skills/wiki.md` or the router). Prose
   describes what an owner does; authority, implementation and adoption live only
   in the catalog and ledger. Benefit: removes the drift class behind D1 rather
   than patching one paragraph. Tradeoff: a one-time edit of the remaining status
   sentences; no new tooling.
2. **One retrieval hint in the router** (`design-system.md` "Start here" step 4):
   entries are declared `component('<id>', '<Name>', …)`; search the id or name,
   not `id:`. Benefit: avoids the whole-catalog reads seen in all three logs.
   Tradeoff: one sentence.
3. **One precedent sentence in the lab area guide**
   (`src/views/internal/design-system/CLAUDE.md`; Cedar and Flint lack this file,
   Quartz has it): lab chrome (`rounded-2xl border bg-card p-5` in catalog,
   dashboard and foundation pages) is not V1 composition grammar; specimens use the
   contained-form surface at `contained-form-row-review.tsx:121` (square `bg-card`,
   `p-6`, `p-4` when narrow, 24px between groups, width bounded like sibling
   specimens). Benefit: targets D2 and D3 directly with an existing example.
   Tradeoff: none material; it names a file, not a new rule.
4. **Add the four jsdom stubs to `src/setup-tests.ts`** (`scrollIntoView`,
   `hasPointerCapture`, `setPointerCapture`, `releasePointerCapture`). Benefit:
   removes D4 and the duplicated `beforeAll` blocks in Cedar's and Flint's tests;
   every future popup test gets the seam. Tradeoff: confirm no existing test
   asserts on their absence (none found in the lab tests read).
5. **Reviewer heuristic, not a rule:** feedback that appears beside actions
   should not move the control the user just used (U1). Quartz's guide already
   says "no unintended layout jumps"; a rendered check is the fix, not more text.

### 5.3 Do not complicate

- No hygiene scanner or conformance gate for lab specimens. One off-scale
  specimen and two hand-rolled headings do not justify an enforcement layer; the
  area-guide sentence plus a rendered review covers it, and the goals explicitly
  leave composition judgment to the author.
- No responsive `direction` prop on `ActionGroup` on the strength of one
  override (U6). Revisit only if a second real composition needs it.
- No catalog restructuring. The friction observed is a grep miss, not a
  structure problem.
- No broad rewrite of the documentation set. The failures that occurred are
  local: one stale paragraph, one missing precedent sentence, one missing test
  seam.

## 6. Limits and next step

What this comparison supports: the stale-prose authority error is real and the
documentation-level correction fixed it; the source-level API consolidation was
consumed correctly by a fresh session; rendered composition quality did not
improve with either package and varied on dimensions no package documents.

What it cannot support: any ranking of the packages as wholes, causal isolation
of the prose fix from the catalog links, first-pass reliability beyond these two
small tasks, or production readiness of any specimen.

Evidence needed for coordinator reconciliation:

- Vitest receipts for the three preserved test files, run unmodified in their
  snapshots (resolves D4 and confirms Cedar's and Flint's pointer path).
- The harness result JSON and `geometry` attachments per candidate and cell
  (converts every "coordinator-reported" pass above into verified evidence; also
  gives opened-listbox bounding boxes).
- Raw transcripts for Cedar's owner task, to see whether the catalog
  `button-group` entry or `decisions.md:299` was surfaced before the answer, and
  for Quartz's composition task, to see whether the area guide was loaded.
- A screenshot of an opened listbox at 375 dark for each candidate, if the
  held-out "usable opened-menu geometry" check is to be closed.

Recommended next step: apply the five small corrections in §5.2 (they touch one
reference doc, one router line, one area guide, one test-setup file and no
component), then run one further matched pair before a real-surface pilot, with
a second composition shape (a dialog or a list row) so the lab-chrome precedent
failure can be seen to recur or not. The pilot should keep a rendered review
step; nothing in any package would have caught D2, D3 or U1 automatically.

## Appendix A — measured geometry (light theme, from screenshots)

Pixel runs measured inside each card; values are gaps between element boxes.

| Relationship | Cedar 375 | Flint 375 | Quartz 375 | Cedar 1400 | Flint 1400 | Quartz 1400 |
| --- | --- | --- | --- | --- | --- | --- |
| Outer inset to content | 16 | 16 | 16 page + 20 card | 24 | 24 | 32 page + 24 card |
| Title → supporting | 4 | 4 | 4 | 4 | 4 | 4 |
| Supporting → first label | 24 | 24 | 20 | 24 | 24 | 20 |
| Field → field | 16 (stacked) | 24 (stacked) | 16 (stacked) | 16 (columns) | 24 (columns) | 16 (columns) |
| Fields → footer/actions | 24 | 32 + rule + 24 | 20 + rule + 20 | 24 | 32 + rule + 24 | 20 + rule + 20 |
| Action peers | 8 | 8 | 8 | 8 | 8 | 8 |
| Feedback ↔ actions | 16, below | 16, above | 12, above | same row, right | same row, far left | same row, left |
| Phantom gap, initial state | 16 | 16 | 12 | 0 | 0 | 0 (44px reserved) |
| Actions shift on save | 0 | ≈60 down | ≈56 down | 0 | 0 | 0 |
| Panel width | 375 | 375 | 343 | 576 | 1400 | 576 |
| Control width | 343 | 343 | ≈303 | ≈255 | ≈663 | ≈255 |
| Surface | square, 1px border | square, 1px border | 16px radius, 1px border | same | same | same |

Control height 44px and label/control 8px in all cells. Dark-theme screenshots
match the light geometry exactly and resolve through tokens in all three.

## Appendix B — citation checks against each candidate's snapshot

| Candidate | Citation | Result |
| --- | --- | --- |
| Cedar | `component-catalog-primary.ts:86/:444/:541/:120/:556` | resolve (Button, input, Select fields; InlineAction statusDetail; popup density) |
| Cedar | `decisions.md:244/:233/:341/:75`, anchor `2026-08-19--field-and-textinput-baseline-accepted` | resolve |
| Cedar | `design-system-reference.md:101-119/:197-202/:462-468/:679-687` | resolve; `:197-202` is the stale ActionGroup paragraph |
| Cedar | `foundation-catalog.ts:43/:102`, `design-system.md:45` | resolve; `:102` is row rhythm, not control height |
| Cedar | Button/Select geometry claims (20/18/12px trigger, 24/22px and 14/12px button insets) | match `popup-chevron.tsx:6-14`, `button/index.tsx:27-43` |
| Flint | `component-catalog-primary.ts:461-463/:565-567/:87-89/:481/:577/:107/:588/:581/:297-299` | resolve |
| Flint | `decisions.md:244-254/:341-356/:75/:220-231`, `field.tsx:25`, `contained-form-row-review.tsx:121-161`, `typography.ts:1-6`, `typography-review-contract.ts:6-81`, `v1-layout-recipes.ts:8-30`, `foundation-catalog.ts:42-52/:80-96` | resolve |
| Flint | `design-system-reference.md:142-163/:197-202/:476-480/:695-703/:862-866` | resolve; `:862-866` loosely supports "legacy/migration evidence" |
| Quartz | `component-catalog-primary.ts:60-121/:438-493/:541-592/:296-300/:588/:581`, `current-review.ts:45-46` | resolve; `review: ready` confirmed for all three components |
| Quartz | `design-system-reference.md:101-114/:137-139/:180-186/:210-215/:486-493/:718-726`, `design-system.md:45,128`, `v1-layout-recipes.ts:1-24`, `field.tsx:25` | resolve |
| Quartz | decision anchors for Field, Select, Button width | headings exist; `decisions.md` was not read in the owner task per the access log (anchors likely taken from reference links) |

## Appendix C — what the matched-proof harness covers

`matched-proof.spec.ts`, per theme × width: heading visible; initial screenshot;
for each combobox: focus, ArrowDown opens, first option focused, listbox x-range
within the viewport, End focuses last, Enter selects; both triggers show the
second options; Save shows the feedback inside a `role="status"`; saved
screenshot; geometry JSON attached (host width, scrollWidth, button/status
rects); document scrollWidth ≤ viewport; second select ArrowDown → last option
focused → Home → Enter hides feedback; Save shows it; Reset restores both
initial texts and hides feedback; reload restores initial state.

Not covered: the first select clearing feedback after a save; the session store
(data attributes); listbox vertical placement or an opened-menu screenshot;
focus-visible styling; unmount/remount within one document (reload is used);
any visual quality judgment. The result JSON and geometry attachments are not in
the neutral package.
