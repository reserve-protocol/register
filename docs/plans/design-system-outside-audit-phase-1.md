# Design system outside audit — phase 1

**Status:** independent assessment report; not design-system authority. Nothing
in this report promotes, accepts, or adopts any lab output.

**Inspected:** branch `design-system-v1`, commit `adef9ee76` ("Checkpoint design
system inventory before outside audit"), clean working tree. Preview at
`http://127.0.0.1:3005` (assumed to serve this checkout; not independently
proven). Rendered inspection used a headless Chromium driven by the repo's
installed Playwright 1.59.1, at 1400×1000 light, 1400×1000 dark
(`theme-ui-color-mode=dark`), and 375×800/900 light, with reduced motion on.
Screenshots and the capture script are in
`design-system-outside-audit-phase-1-evidence/`.

**Method:** entry-point docs first (`CLAUDE.md`, wiki index, design-system
router, active V1 plan, project page); then source inventory (five parallel
read-only sweeps of components, tokens, catalogs, verification, and process
docs) and rendered inspection of the lab and production; provisional
observations were written down (evidence folder) before the decision ledger,
postmortem, history, and log were read; those were then used to challenge the
observations. Four ordinary tasks were traced end to end (§ 8).

---

## 1. Executive summary

Register's V1 design system has a good visual language and a set of component
implementations that are, individually, well made. The transaction lab shows
the system can produce genuinely strong product UI: the Zapper, Automated
Mint/Redeem, Stake and Vote-lock compositions are coherent across roughly
ninety rendered states, in both themes, and they communicate lifecycle truth
(estimated vs received, delayed vs immediate) better than most DeFi products.

The central risk is not the design. It is that the layer that *defines and
governs* the system has grown heavier than the system itself, while the
mechanisms that would actually stop a fresh agent from making mistakes remain
thin:

- A fresh agent is routed through roughly 17,700 words of instructions plus
  a 7,400-word catalog file before it may write code for an ordinary lab task.
  The active plan is 704 lines and about two thirds of it is transaction
  narrative that is irrelevant to most tasks.
- Most accepted rules live in prose (catalog `statusDetail`, decision ledger,
  plan, reference) rather than in code at the point of use. Only 4 of the 32
  "current baseline" components link to their accepted decision; 9 have no
  matching decision heading at all. The accepted ten-role type scale exists
  only as class strings inside a lab file; elevation has no tokens; the
  performance colour roles shown on the Color foundation page are not defined
  in CSS.
- Two overlapping semantic-role objects are both imported under the name
  `roles`; the same visual meaning (a warning tint) can be reached five ways.
  Nothing enforces "design tokens only": product code contains 185 Tailwind
  palette classes and 135 non-icon hex literals.
- Verification that is green today proves internal consistency, not rendered
  quality. The design-system browser suite is outside CI and outside
  `scope.mjs`, and it cannot currently pass (a radius baseline was never
  committed; the other baselines are 85 commits old).
- After 91 commits over five weeks, no production view imports a V1 module,
  53 ledger rows sit at "human-review-required", and the lab's own pages have
  rendered defects (auto-scroll on load, a clipped table at phone width, a
  mode label that renders as "StakeRSR") that no check caught.

The good news is that the fixes are mostly *subtractive and mechanical*: move
rules into code and tokens, delete or consolidate prose, make the visual check
a command the agent runs and looks at, and shrink the reading path to what a
task needs. The recommendations in § 5 are ordered so that the first four
weeks of follow-up work would materially raise a fresh agent's first-pass
quality without changing any accepted visual decision.

**Answer to the central question.** At the component level the system is close
to helping a fresh LLM produce good UI, once its rules are moved into the
component API and tokens. At the composition and page level it is not there
yet: no complete page has been validated against the accepted "square
structural regions on beige" direction, tables/rows and charts are undefined,
and the only composition contract (transaction geometry) is family-specific.
The documentation layer, as it stands, lowers rather than raises the odds,
because it costs a lot to read and mixes established rules with provisional
and historical material.

---

## 2. Goals as understood, and overall assessment of the approach

The goal is a system that raises the product's quality bar, keeps complex
compositions flexible, and can be used by a fresh LLM, a developer, or a
designer without the original designer present. The chosen approach (from the
2026-08-07 decision) is a contained in-app lab rather than Storybook, one
visual direction developed iteratively, real product screens as the pressure
test, and strict separation of "rendered", "reusable", "accepted", and
"adopted".

That approach is sound and I would keep it. Three things about how it has been
executed deserve challenge:

1. **Authority was placed in prose.** The catalog, ledger, plan, and reference
   describe rules well, but the components, tokens, and lint do not embody
   them. A prose rule the agent has not read is not applied; a token or typed
   prop is applied whether or not it was read.
2. **The learning loop feeds documents, not defaults.** Corrections became
   pressure-register rows, plan paragraphs, and longer `statusDetail` strings.
   The postmortem itself concluded that most transaction failures violated
   rules that already existed; the response added contracts rather than
   enforcement or a runnable check.
3. **Ceremony scaled with the transaction work and never came back down.**
   The context-routing pass (2026-08-27) cut the plan to about 190 lines; it
   is now 704. Vocabulary, status axes, templates, and registers accumulated
   without a pruning step.

None of this invalidates the design decisions. It means the next phase should
be about *consumability and enforcement*, not more definition.

---

## 3. What is working well and should be preserved

- **The visual language.** Warm beige substrate, white content, Reserve blue,
  Lausanne 300/500, fully rounded controls, restrained 8px objects, quiet
  feedback tints, opaque lifecycle pills. It reads as one product in light and
  dark and it systematises what Home, Discover, and Overview already do in
  production. (Evidence: `production-home.png`, `production-index-dtf-overview.png`,
  `lab-dark-button-state-sheet.png`.)
- **Foundation pages as human-facing documents.** The contrast calibration
  with measured ratios (2.19:1 → 4.64:1 for the warning foreground), the type
  role map with explicit size/leading/weight, the spacing grammar
  (24/16/8 plus the 8px focused-tool shell), and the "reviewed / carry forward
  / adapt / leave behind / validate next" format are exactly what a designer
  or an LLM needs to explain a choice without inventing a rationale.
- **Component contracts that are already right.** Field/TextInput anatomy,
  bounded Select with compact 32px trigger, Inline Message tones and the
  compact-summary presentation, Lifecycle Status pill roles, Segmented
  Control vs Tabs vs SingleChoice semantics, Pagination, Global and Product
  navigation, Copyable Value integrated treatment. Their state sheets show
  the states that matter (invalid, read-only, disabled, loading, focus).
- **The transaction compositions.** Stable geometry through quote search
  (skeletons keep height), committed-mode header capsule after submission,
  progress replacing inactive action chrome only when no click is needed,
  distinct immediate/delayed/settlement/partial-failure outcomes, and the
  order ledger in Automated Mint. These are strong and should not be reopened.
- **Separation of rendered / reusable / accepted / adopted**, the anti-cascade
  rule, the copy-authority rule ("agents do not change product copy"), and the
  decision ledger's dated, reasoned entries. Keep these; simplify how many
  axes express them (§ 4.6).
- **The postmortem's seven-pass review discipline** (source fidelity, geometry
  owner, component role, state continuity, rendered visual pass, predecessor
  comparison, whole-composition critique). It is the best single artefact in
  the repo for a fresh agent; it is currently buried in a diagnostic report.
- **Verification that measures real geometry**: the browser assertions that
  check dialog width, overflow, keyboard trap, paint order, and translated
  copy fit at 320px are worth keeping; the problem is what surrounds them.

---

## 4. Findings

Findings are grouped by assessment area. Each significant finding states the
evidence, the consequence, confidence, the likely cause where supported, and
a recommendation. "Systemic" findings are labelled S; local cleanup items are
labelled L and collected in § 4.7. "Known" marks issues the project's own
documents already record as unfinished.

### 4.1 Product and visual quality

**S1. The accepted page-shape direction has never been seen on a page.**
The Radius foundation and the 2026-08-18 decision make structural regions
square (0px) with 1–2px beige seams; production Home, Discover, and Overview
use white cards with 24px corners and 8px beige gaps
(`production-index-dtf-overview.png`). The Screens section links to production
routes but renders no V1 composition of any page; the Studies layout grammar
uses grey placeholder blocks. Consequence: the single most visible change of a
migration is unvalidated, and migration cannot start without a decision.
Confidence: high that it is unvalidated; whether square regions will look
better is a *question requiring testing*, not a defect. Known (the plan lists
page-layout validation as a next workstream). Recommendation: § 5, step 6.

**S2. Tables, rows, and charts are missing, and they are the majority of
production surface.** Every product page inspected (Discover, Overview
holdings, Governance list, Earn, Explorer) is table- or row-led. The Table
entry is "exploratory / specimen only"; Data table and Chart have no lab
output. The table specimen clips at 375px (`defect-table-specimen-clipped-375px.png`;
measured `scrollWidth 600` inside a `343px` container with `overflow: hidden`).
Consequence: adoption of any list page would force a fresh agent to invent
row geometry. Confidence: high. Known as unfinished; the clipping is new.

**S3. The lab's own review surface has rendered defects that assertions
cannot see.** Three examples found in one pass:
- Opening `/internal/design-system/components` or `/components/transaction-action`
  lands the reader mid-page (measured initial scroll offset 7,741px and 5,799px)
  because `transaction-contained-modal.tsx:25` calls `.focus()` on the vote-lock
  dialog on mount. Reviewers never see the page top.
- The Stake mode label renders as "StakeRSR": `transaction-composition-stake.tsx:264`
  writes `Stake<span className="max-[359px]:hidden"> RSR</span>` inside a
  `flex` button, so the leading space is dropped. A text assertion sees
  "Stake RSR"; a screenshot does not (`defect-stake-mode-label-missing-space.png`).
- The components index overflows its container by 16px at 375px
  (`transaction-system-review` section, `scrollWidth 359` in `343px`).
Consequence: these are the same class of failure (overlap, clipping, spacing)
the postmortem attributes to missing visual QA; they recur in the review
surface itself. Confidence: high (reproduced). Cause: no routine screenshot
step on lab changes (§ 4.4). New.

**S4. Dark theme is coherent but its surface separation is untested.** Dark
renders well for controls, feedback, and transaction outcomes
(`lab-dark-inline-message.png`). The Dialog specimen in dark sits on a
near-identical canvas with no visible boundary; the disabled primary action
is near-black on near-black. The Color page lists "dark-theme surface
separation without heavy borders" under "validate next", so this is known and
honest. Fourteen V1 tokens (feedback surfaces/borders, `substrate-subtle`,
`status-neutral-*`, `disabled-structure`) are defined only in `:root` as
`color-mix()` of base tokens and adapt indirectly; nothing states that this is
intentional. Confidence: medium. Recommendation: define every token in both
blocks explicitly, then run one dark page review.

**S5. Production diverges from the lab in ways the lab cannot change.** The
installed Zapper renders a green "Market Buy" primary and its own chip styles
(`production-issuance-zapper-green-cta.png`); the lab candidate is blue. The
plan already says the lab must not restyle package internals. Consequence: a
migrated Overview would show two button languages until the package moves.
Confidence: high. Known partially (Zapper reconciliation notes). Add to the
engineering register explicitly as a cross-repo dependency with an owner.

**Preserve, do not reopen:** the transaction compositions' hierarchy, the 432px
substantial task width, the 8px shell/16px axis, the committed-mode capsule,
and the lifecycle vocabulary. Nine logged human rejections on 2026-09-07/08
(Manual hierarchy, redundant amount, action-only region) are composition
judgement iterations, not rule violations; a system cannot remove those and
should not try to encode them as rules.

### 4.2 How the system is defined and consumed

**S6. Authority is in prose, not in the component API or tokens.** Evidence:
- `design-system-v1/typography.ts` exports four roles (body, itemTitle,
  supporting, label). The accepted ten-role scale (display, page title,
  section title, lead, panel title, …) exists only in the lab file
  `typography-review-contract.ts` as strings such as
  `text-[32px] font-light leading-[38px]`. In the lab and V1 directories,
  hand-written `text-sm font-light leading-5` appears 162 times versus 85 uses
  of `v1Typography.supporting`; 51 arbitrary `text-[Npx]` sizes exist.
- Elevation (accepted 2026-08-13) has no shadow tokens; components use
  default `shadow-sm`/`shadow-lg`. Radius roles (0 / 8 / full) are convention;
  eight distinct radii are in use. Motion has durations but no easing tokens.
- The Color foundation page shows `--data-positive`/`--data-negative` roles
  with "nearest current value" hex; those tokens are not defined in
  `app.css`. The only implementation of gain/loss colour is hex literals
  (`chart-performance-colors.ts:49-50`, consumed by `performance-value.tsx`).
- `v1LayoutRecipes` (the spacing relationships) has zero component
  consumers; the 18px icon-side optical inset is re-typed in four files
  instead of consuming `popupTriggerPadding`.
Consequence: a fresh agent asked for a page title, an elevated popover, or a
red/green change must either read the foundation page and hand-write an
arbitrary class (which another rule forbids) or guess. Confidence: high.
Cause (supported): the operating model routes agents to catalog entries and
decisions, and treats "canonical-candidate" implementation as sufficient; the
foundation entries in `foundation-catalog.ts` contain no file, token, or
decision reference at all, so nothing forces a foundation to exist in code.

**S7. Two overlapping role vocabularies.** `candidateSemanticRoles`
(`design-system-v1/semantic-roles.ts`) and `v1SemanticRecipes`
(`ui/v1-semantic-recipes.ts`) share keys with identical values
(`surface.content`, `neutralControl`, `disabled.control`) and one key with
*different* behaviour (`focus.onContent` is a static ring in one and a
`focus-visible:` ring in the other). 45 files import the second as `roles`,
7 import the first as `roles`; `inline-message.tsx` and `navigation.tsx`
import both. A warning tint can be reached as `roles.feedback.warning.*`,
`text-feedback-warning-foreground`, `bg-[var(--feedback-warning-surface)]`,
`text-warning`/`bg-warning`, or `text-yellow-600`. Twelve V1 tokens are not
wired into Tailwind and are reachable only through arbitrary `[var(--x)]`
syntax. Consequence: two agents produce two spellings for the same intent,
and reviewers cannot tell a legitimate route from drift. Confidence: high.
Recommendation: one role object, every token wired, arbitrary `[var(--` banned
by lint (§ 5, step 1).

**S8. Size and tone vocabularies differ across siblings.** Button
`micro|compact|default` (28/32/44), Select/Tabs/Segmented `compact|default`,
Dialog `compact|standard`, Spinner `14|16|24`, Switch/TextInput/Checkbox no
size prop; `density` and `size` mean the same thing in different components;
`default` is used as a size, density, tone, treatment and presentation.
IconButton defaults to `compact`/`secondary` while Button defaults to
`default`/`primary`. Messages say `danger`, actions say `destructive`.
Consequence: a fresh agent cannot transfer knowledge between components and
will pick the wrong default when swapping Button for IconButton. Confidence:
high. Recommendation: one shared `Size` and one `Tone` type exported from a
single file, with the mapping table generated into the lab (§ 5, step 2).

**S9. Some correct uses depend on the consumer reproducing geometry.**
`TabsContent` has no spacing from its list (legacy owned `mt-2`);
`PopoverContent` has no padding; `Drawer placement="contained-bottom"` needs a
`relative overflow-hidden` fixed-height parent that only the state sheet
supplies; `PopupChevron` rotates only under a `group` ancestor with a Radix
`data-state`; `MenuSeparator -mx-2` assumes the menu's `p-2`. None of this is
documented at the component. Silent no-ops exist: `InlineMessage
iconPresentation="contained"` does nothing unless `presentation="summary"`;
`CopyableValue tone` applies only to `treatment="inline"`; `MultiSelectFilter`
disables Clear whenever `minSelected > 0`. Consequence: exactly the "rules
clear in isolation, ambiguous in composition" failure the brief asks about.
Confidence: high (read from source; not all rendered). Recommendation: make
impossible states unrepresentable in the prop types where cheap, otherwise a
one-line WHY at the prop.

**S10. Legacy and V1 coexist with no migration mechanism.** Eight same-named
components exist in both `ui/` and `design-system-v1/` (select, tabs, drawer,
link, switch, accordion, collapsible, popover); production imports the
legacy set (`ui/select` 8 files, `ui/tabs` 20, `ui/button` 232) and zero V1
modules outside three shared canonical files. `ui/link` defaults every link to
`target="_blank"`; V1 Link does not. Consequence: a fresh agent working in a
product view will import the legacy component by proximity, and the accepted
V1 contract will not apply. Confidence: high. This is by design until
adoption, but the design needs an adoption mechanism (§ 5, step 7).

### 4.3 LLM readability, retrieval, and documentation

**S11. Reading load and routing loops.** Following `CLAUDE.md` § Load Order
and the router literally, a medium lab task reads about 17,700 words of
instructions plus the 7,451-word primary catalog before code; the three traced
tasks reached 21,700–41,000 words (§ 8). The plan (704 lines, 8,025 words) is
required reading by `CLAUDE.md:29` although the router says not to load it as
an encyclopedia and 5,240 of its words are transaction-specific. Loops: router
→ plan → router; router → project → router; `ui-ux` → `design` → `project`.
`CLAUDE.md` gates the router on "changing the visual token system" although the
plan makes the router the entry for everything. Consequence: an agent either
reads everything (slow, context-diluting) or skips (misses the one rule that
mattered). Confidence: high (measured). Cause: transaction work was appended to
the active plan rather than to `transaction-*.md`; the context-routing pass
(2026-08-27) was never repeated. Recommendation: § 5, step 4.

**S12. The catalog is 80% prose and its typed fields are under-used.**
Two catalog files hold 85,145 characters of string literals (~1,870 per entry;
`transaction-action` alone 7,770). Typed fields that would make an entry
machine-checkable are rarely filled: `contextSources` on 5 of 45 entries;
`review.dependencies[].name` is free text (78 distinct strings, none a
catalog id); `authority` sources point at the catalog file itself; foundation
entries carry no paths. 28 of 32 baselines have no decision link; 9
(`icon-button`, `multi-select-filter`, `checkbox`, `popover`, `dropdown-menu`,
`spinner`, `skeleton`, `empty-state`, `metric`) have no decision heading at all,
so their "accepted" status rests on `statusDetail` prose. Consequence: an LLM
asked "why is X like this?" can find a confident-sounding sentence but not a
dated decision; a designer cannot tell an accepted rule from a description.
Confidence: high. Recommendation: § 5, step 3.

**S13. Vocabulary collisions and redundant status axes.** `provisional` has
five meanings (review readiness, dependency status, conformance claim,
progress source, prose "provisional recipe"); `blocked`, `defined`,
`canonical`, `specimen`, `deferred` each have two or three. Two different
five-way feedback taxonomies exist (router L124 vs plan L449) and the migration
disposition is worded three ways (router, template, Vote Lock plan). The
`status` field is vestigial next to `designAuthority`; the progress gates
`defined` and `design-reviewed` are the same predicate for every current row,
so the dashboard's "40/60 defined · 40/60 design reviewed" states one fact
twice. `current-review.ts` claims conformance for `component-dependencies`,
which is not a foundation id. The transaction reference legend adds a sixth
label set (Retained current, Proposed candidate, Flow-owned, Upstream-owned)
that maps only loosely onto the catalog badges. Consequence: the LLM's explanation of "what is
established vs provisional" — an explicit goal — is unreliable because the
words are not. Confidence: high. Recommendation: § 5, step 3.

**S14. The reference contradicts the code, and orphans exist.**
`design-system-reference.md:689-708` says every colour is an HSL variable
exposed as a Tailwind colour and must be added to both `:root` and `.dark`;
13 tokens are `color-mix`, 12 are unwired, 14 exist only in `:root`.
`docs/plans/design-system-context-routing.md` is linked from nowhere and its
outcome metrics are stale. `templates/design/candidate.md` and `synthesis.md`
have never been used; `flow-composition-transfer.md` once. `CLAUDE.md` says
`scope.mjs` fires a `comment-block` red flag; no such flag exists. The plan
says resolved pressure rows are deleted, which removes the only place the
rationale for a specific pixel value lives, while the comment budget forbids
putting it in code. Consequence: the future human-facing docs or Figma
representation would inherit conflicting sources. Confidence: high.

**Positive:** wiki-lint keeps links, frontmatter and staleness honest; decision
headings are dated and readable; the lab's "Evidence, dependencies, states, and
definition history" disclosure is a good place to hide the prose from a human
reader — the same should be true for the LLM (§ 5, step 3).

### 4.4 Working process and feedback loop

**S15. Green verification proves self-consistency.** `scope.mjs --gate` runs
typecheck, lint, and Vitest; for a diff confined to the lab it prints
`gate-equivalent: yes` and never opens a browser. The unit suite (289 tests,
passing) asserts class names, catalog strings, and reducers; the catalog test
pins a hard-coded list of 32 baseline ids and asserts the page's own prose. The
browser suite (114 tests, 34 snapshots) has real geometry, overflow, focus-trap,
and paint-order checks, but it is not in any CI workflow, not mapped in
`llm-workflow.config.json`, and cannot pass: `foundation-detail-radius` was
added to the snapshot list on 2026-08-25 with no baseline ever committed, and
the remaining baselines date from 2026-08-20 (85 commits ago) with a 20-pixel
tolerance. `capture.css` unpins the sticky nav and expands the page, so even a
passing screenshot is not what a reader sees. No test compares a lab
composition with the production surface it replaces; no axe/aria audit exists.
Consequence: "verified" in the ledger cannot be read as "looks right", and the
lab defects in S3 confirm it. Confidence: high (commands run; files checked).
Cause: the verification cadence override (lab iterations run focused checks
only) was written as prose and the tooling was never updated to know the
design-system suite exists.

**S16. Corrections are learned as documents, not as defaults or checks.** The
postmortem classified 41 correction clusters: 25 involved review/process
failure, 18 violated an existing rule, 15 exposed a missing rule, 15 needed
product evidence, 8 were judgement. Its own conclusion was "consume existing
authority correctly and review the rendered composition." What was built in
response: an 18-row pressure register in the plan, a provisional geometry
recipe (good), longer catalog prose, a transfer-brief template used once, and
more unit assertions. What was not built: an executable rendered check on
lab changes, lint for token/geometry rules, or a single self-review checklist
in the working folder. The seven-pass review discipline exists only inside the
postmortem. Confidence: high. Consequence: the same class of miss (S3)
recurred after the postmortem.

**S17. Human acceptance is the bottleneck and it has no defined ritual.** 53
ledger rows are `human-review-required`; Current Review holds one paused item
with no date, reviewer, or decision link; acceptance is recorded by editing
`designAuthority` and adding a decision heading by hand. Nothing tells a
reviewer what to look at (route, states, viewports) except free text.
Consequence: review debt accumulates and "accepted" drifts from what was
looked at. Confidence: medium-high. Recommendation: a review packet per
candidate generated from one command (§ 5, step 5).

**S18. Process instructions conflict in ways an agent must resolve alone.**
"UI parity is sacred" vs "authorised V1 work may change composition" (settled
only for "a V1 surface", which a production page is not); "arbitrary values
only for measured/chart geometry" vs the 432/448/26rem/18px recipe values and
the accepted `text-[32px]` title; kit `design.md` prescribes the bordered
shadowed card that `project.md` forbids, yet both are mandatory reads;
"shared components keep their defaults" vs the lab's global 28px Lifecycle
Status trial; the comment budget vs the geometry rationale that has no other
owner. Consequence: each is resolvable, but each costs a fresh agent a
judgement call it may get wrong. Confidence: high (quoted locations in the
process sweep). Recommendation: state the Register resolution once next to
the rule and stop loading the kit file that says the opposite (§ 5, step 4).

### 4.5 What the evidence says about repeated human correction

The brief asks why some work needed repeated correction. The evidence supports
three causes, in this order of weight, and rules out one:

1. **Rules were not at the point of use.** Spacing/divider ownership, symmetric
   insets, header alignment, and semantic surfaces were already accepted, but
   they lived in the reference and decisions, not in a recipe or lint. The
   postmortem's E-class (18 of 41) and its "central finding" say exactly this.
2. **No rendered pass was required before human review.** Overflow, overlap,
   clipped actions, misaligned step numbers (postmortem 27–30) and the lab
   defects in S3 are visible in any screenshot. Nothing in the loop produced or
   required one.
3. **Product evidence was reconstructed from summaries.** Buy/Sell tabs, close
   control, quote-search animation, signed delta (postmortem 7, 8, 39, 40) were
   lost because the audit document, not the render tree, was the source.
   The later "direct-source" passes fixed this and it did not recur.

Ruled out: **insufficient model capability** is not supported. The same agents
produced the strong Automated Mint workspace once they had direct product
evidence and a geometry recipe. **Excessive component complexity** is not
supported either; the components are small (35 modules, 4,470 lines). What the
evidence does show is that the *response* to correction added documentation
faster than it added enforcement, so each new composition started from the
same position.

The Manual Mint rejections of 2026-09-07/08 are different in kind: three
successive human rejections of hierarchy proposals. That is ordinary design
iteration on a genuinely new composition (J/M classes). It should be made
cheaper (faster review packets, side-by-side comparison with Automated), not
prevented by rules.

### 4.6 Simplification candidates (systemic)

- Collapse `status` into `designAuthority`; drop the `defined` progress gate.
- One feedback-classification taxonomy; one migration-disposition wording;
  rename the five `provisional`s (`review: provisional-composition`,
  `dependency: retained-provisional`, `conformance: declared-provisional`, …)
  or, better, reduce the axes: a component needs *authority* (undefined /
  exploratory / accepted / superseded), *implementation* (none / specimen /
  reusable), *adoption* (none / opt-in / in-use), and *review* (none /
  ready / blocked). Six axes with 25 values can become four with 13.
- Delete `templates/design/candidate.md` and `synthesis.md` (never used) or
  fold their one useful idea (human gates) into the brief.
- Merge `design-system-context-routing.md` into the plan's history and delete
  it.
- Move the plan's transaction sections (L198–L559: provisional contract,
  pressure register, hardening disposition, upstream reconciliation,
  engineering register) into `transaction-system-audit.md` or a new
  `transaction-checkpoint.md`; the plan returns to ~200 lines.
- Retire `candidateSemanticRoles` into `v1SemanticRecipes` (or the reverse)
  and keep one name.

### 4.7 Local cleanup (new unless marked)

- L1. Auto-scroll on load from `transaction-contained-modal.tsx:25` — guard the
  mount focus behind an "opened by user" flag.
- L2. "StakeRSR" label — `transaction-composition-stake.tsx:264` (put the space
  outside the span or use `gap`).
- L3. Table specimen clips at 375px; components index overflows 16px at 375px.
- L4. Missing `foundation-detail-radius` baselines; stale baselines; suite not
  in CI.
- L5. `--data-positive`/`--data-negative` undefined; performance hex in
  `chart-performance-colors.ts` and `performance-value.tsx` (known backlog
  item: "Tokenize the performance text colors").
- L6. `comment-block` red flag referenced in `CLAUDE.md` does not exist in
  `scope.mjs`; either add it or remove the claim.
- L7. `--muted-secondary: 0 0 80%` malformed triplet; `--accent-inverted`,
  `--theme-ui-colors-*`, `--container-foreground`, `--legend-foreground`
  referenced but undefined; `ProposalAlert.tsx` uses `var(--primary)` without
  `hsl()`.
- L8. Focus ring spelled six ways; `cand.focus.onContent` and
  `containedSelectionRecipe.state.focusOnTrack` are static rings (copy-paste
  hazard).
- L9. Hard-coded English in Pagination, SearchField, PresetOrCustomField,
  TransactionAssetPickerOption, PerformanceValue, TransactionRequirementRow
  while CopyableValue uses Lingui; `MobileUtilityPanel` demands 17 strings.
- L10. Canonical Button loading spinner and TransactionAssetPickerTrigger
  chevron ignore reduced motion (Button is a known follow-up).
- L11. `Metric.role` and `LifecycleStatusPill.role` shadow the ARIA attribute.
- L12. `DrawerSurface` (lab preview helper) exported from the production
  module; `DrawerContent` renders no close affordance.
- L13. `current-review.ts` conformance area `component-dependencies` is not a
  `FoundationId`.
- L14. `design-system-reference.md` token section is wrong on two counts (S14).
- L15. The Metric page's "loading dependency provisional" skeleton and the
  Dropdown-menu page render only closed triggers; the state a reviewer needs
  (open popup) requires interaction and is not in any screenshot.

---

## 5. Recommendations, ordered by value and dependency

Each step names what it replaces, the main risk, and how success is verified.
Steps 1–3 are mechanical and do not change any accepted visual decision.

**Step 1 — Put the accepted foundations into code (1 week).**
Merge the two role objects; wire every token into `tailwind.config.ts`;
define every V1 token in both `:root` and `.dark` explicitly; add
`--data-positive/negative` (light/dark) and retire the hex; add three
elevation tokens and three radius role tokens; extend `typography.ts` to the
accepted ten roles and make the lab consume it (delete
`typography-review-contract.ts` class strings). Add a lint (oxlint custom
rule or a `scope.mjs` red flag that *fails* the lab gate) for hex, palette
classes, `bg-[var(--`, and `text-[Npx]` outside the token files, scoped to
`src/components/design-system-v1/**`, `src/components/{button,…}/**`, and
`src/views/internal/design-system/**`. Replaces: prose rules in reference and
foundation pages. Risk: touching tokens is an engineer-review surface (already
registered); do it as one reviewed change. Verify: lint green with zero
allow-listed exceptions; the Color/Typography foundation pages read their
values from the token source instead of hand-maintained data files
(`color-foundation-data.ts` today duplicates values).

**Step 2 — One vocabulary for size and tone (2–3 days).**
Export `V1Size = 'micro' | 'compact' | 'default'` and
`V1Tone` from one file; map each component's supported subset; align
IconButton defaults with Button or document the difference at the prop; make
`Dialog` use `default` not `standard`. Generate a "sizes and tones" table into
the lab from the types. Replaces: per-component unions. Risk: renames in the
lab only (no production consumers). Verify: typecheck; the generated table
matches the state sheets.

**Step 3 — Make each component self-describing and shrink the catalog (1–2
weeks).** Add a small typed `usage` block per reusable component (one file
next to it, or JSDoc on the export): what job, when not to use it (the
existing "Related contracts" notes), sizes/states supported, three do/don't
lines, and the decision anchor. Render it in the lab and have the catalog
*import* it instead of restating it. Cap `statusDetail` and `review.scope` at
~300 characters; move history into the decision ledger; require a `decision`
link for every `accepted` component (test it); type `review.dependencies` as
component ids. Collapse the status axes as in § 4.6. Replaces: 85k characters
of catalog prose and most of the router's "route by task" section. Risk: the
catalog tests pin today's shapes; rewrite them to check the invariants
(every accepted entry has a decision; every path exists) rather than a list of
ids. Verify: an LLM reading only the component folder can answer the four
traced questions in § 8 correctly (part of experiment E1).

**Step 4 — Cut the reading path to what a task needs (2–3 days).**
Move the plan's transaction sections out (§ 4.6); return the plan to goal,
precedence, current state, frontier, risks. Replace the router's prose routes
with three task-shaped entry lists ("refine a component: read A, B, C";
"compose a new surface"; "adopt into production"), each under ten files.
Remove `CLAUDE.md:29`'s blanket "read the plan before acting" for lab work.
Put the Register resolution next to each contradicted kit rule and stop
loading `skills/design.md` for Register design tasks (or override it with a
Register-specific `skills/design-register.md`). Delete or merge the orphan
docs and unused templates. Fix the `comment-block` claim. Replaces: the
current load order. Risk: a rule loses its only owner when prose is cut —
mitigated by Step 3 (rules move to components) and by keeping the reference
as on-demand. Verify: word count before code for the three traced tasks
drops below ~8,000; experiment E3 measures retrieval.

**Step 5 — Make the rendered check a command and a packet (1 week).**
Add `pnpm design-system:review <route-or-testid>` that produces light/dark ×
desktop/phone screenshots of the changed specimen and its states (the
evidence folder's `capture-script.mjs` is a working starting point). Map the
design-system Playwright config into `llm-workflow.config.json` for lab paths
and print a `verify-gap` when lab files change without a browser run. Fix the
radius baseline and either recapture baselines on every accepted change or
replace most pixel baselines with relational assertions plus a few
"golden" screenshots that a human accepts. Add the postmortem's seven-pass
checklist as `src/views/internal/design-system/CLAUDE.md` (there is no area
guide today) and require the agent to state, per pass, what it looked at.
Add one lab-vs-production comparison per composition (mount the production
component beside the lab candidate, as the Home card review already does).
Replaces: prose "routed browser review". Risk: capture time; keep the default
scope to the changed specimen. Verify: the S3 defects are caught by the
command on the current branch before any fix is applied.

**Step 6 — Validate the page shape before any migration (1–2 weeks, needs
designer time).** Take one real golden screen (Overview or Discover), render
it inside the lab with V1 foundations applied (square regions, seams, type
roles, table/row candidate), side by side with production, in both themes and
at 375px. Decide square-vs-rounded and dark surface separation there. Define
Table/Row from that screen (the "Canonical anatomy in context" specimen and
the rich-record review are the starting material). Replaces: nothing; this is
the missing workstream. Risk: reopening the radius decision; the alternative
is discovering the problem during adoption. Verify: an accepted decision with a
screenshot pair attached.

**Step 7 — Adoption mechanism (after 6).** Pick one production slice (the
Portfolio header, or the Earn filter row) and migrate it with the inventory
→ disposition → proof loop the router already describes, using Step 5's packet
as the proof. Make the legacy `ui/` twins re-export the V1 module behind an
opt-in prop or a codemod list, so imports by proximity stop defeating the
system. Verify: the slice ships; the row/table candidate survives real data.

**What to stop doing.** Do not add more variants, pressure rows, or template
sections until Steps 1–5 land. Do not build Storybook or a dependency
platform (the plan already says so; I agree). Do not write a Figma
representation before Step 1; it would encode the unwired tokens and the
four-role type scale.

**What is not worth doing.** A universal transaction controller or shell (the
plan's non-goal, confirmed by the evidence); a per-foundation doc split (the
plan defers it; Step 3 makes it unnecessary); a scoring system for evidence
roles.

---

## 6. Before the next substantial component or composition work

**Must happen first:** Steps 1, 2 and 5 (tokens/typography/elevation in code
with lint; one size/tone vocabulary; a runnable rendered check with the seven-
pass checklist in the lab folder). Without these, the next composition will
re-derive the type scale by hand and ship the same class of visual miss.

**Should happen first for anything table- or page-led:** Step 6.

**Can wait:** Step 3's catalog restructure can proceed in parallel and does not
block lab work; Step 4 can be done incrementally; Step 7 waits for Step 6.

**Not worth doing before adoption:** breadcrumbs (agreed with the catalog),
further Zapper/Vote-lock pressure tests, more transaction states.

---

## 7. Proposed bounded fresh-agent experiments

Each experiment uses a fresh agent with no conversation history, the current
routing, and a fixed rubric scored by one human and one independent agent.
Run each once on the current branch (control) and once after the relevant
step lands (treatment).

- **E1 — Component refinement.** "Refine the Select disabled state so a
  disabled trigger keeps its value readable and matches the Field disabled
  treatment." Measure: files read and words before the first edit; whether
  the agent finds the accepted decision (2026-08-19 Select baseline) and the
  disabled recipe; whether it hand-writes any colour or geometry; whether its
  own rendered check (if any) catches the difference between the Field and
  Select disabled surfaces. Tests S6/S7/S12 and Step 3.
- **E2 — Small new composition.** "Add a settings row with a Switch, a label, a
  help tooltip, and supporting copy to the Settings page candidate." Measure:
  rule violations found by the agent's self-review versus by a human (spacing
  owner, 44px target, help affordance, type roles); whether the agent asks for
  copy rather than inventing it. Tests S16 and Step 5.
- **E3 — Retrieval and explanation.** Twenty questions a designer or developer
  would ask ("Why are inputs fully rounded?", "Is the 28px Lifecycle Status
  accepted?", "Which spacing between a section title and its first row?",
  "What colour is a negative 30-day change?"). Score each answer for
  correctness and for correctly labelling it as established / default /
  judgement / unresolved. Tests S12–S14 and Step 4.
- **E4 — Adoption slice.** "Migrate the Portfolio page header to the V1 type
  roles without changing behaviour." Measure: whether the agent produces the
  state inventory the router asks for, preserves copy, and uses tokens; count
  human corrections. Tests S10/S18 and Step 7 readiness.
- **E5 — Defect detection.** Give the agent the Stake lab route and the seven-
  pass checklist with the rendered-check command; measure whether it reports
  L1–L3 unprompted. Tests Step 5 directly.

Success thresholds should be set before running (for example: E3 ≥ 16/20
correct with correct labelling; E1/E2 zero hand-written colours and at least
two rule violations caught by self-review before human review).

---

## 8. Diagnostic traces (four ordinary tasks)

**T1 — "Show a warning above the amount input in the Vote Lock lab when the
lock delay applies."** Path: `CLAUDE.md` → plan → router → catalog `alert`
entry → `inline-message.tsx`. The system supplies a good answer (compact
summary presentation with an optional tooltip, accepted 2026-09-01) and a
governing pressure row (`TX-P14` places the acknowledgement beside the action).
Two stops are hidden in the "ordinary" task: the copy rule requires an
evidenced owner for new wording, and the pressure register implies the
placement is already decided. Word count before code: ~27,000 minimum.
Verdict: answerable, expensive to find, and the copy stop is correct.

**T2 — "Refine the Select disabled state."** The catalog entry has no
`contextSources`; the accepted decision exists (2026-08-19 "Bounded-value
Select baseline accepted") but is found only by grepping `decisions.md`. The
implementation uses `roles.disabled.control`; the state sheet shows "Disabled ·
value retained". Verdict: the answer is right and consistent across three
files, but the typed route does not lead to it.

**T3 — "Colour a positive/negative 30-day change in a table cell."** The Color
foundation page shows performance roles with hex values marked "nearest
current value"; the tokens are not in `app.css`; the catalog has no performance
entry (the Chart entry mentions it as future work); the only implementation is
`PERFORMANCE_TEXT_CLASSES` with hex. Product code uses `text-green-500`/`text-red-500`
in 38 places. Verdict: the documented answer is not implemented; a fresh agent
will copy whichever pattern it sees first. Genuine gap (S6, L5).

**T4 — "Which class is a page title?"** Typography foundation: 32/38/300.
`typography.ts` has no such role. The lab uses `text-[32px] leading-[38px]`
(`typography-review-contract.ts:20`), which the reference's "arbitrary values
only for measured/chart geometry" rule forbids. Verdict: the agent must choose
between violating a rule and matching the accepted scale (S6, S18).

---

## 9. Coverage, limitations, unresolved questions

**Inspected (rendered):** Foundations index and all nine foundation pages
(light); Components index (light 1400, dark, 375); 42 component detail pages
(light, first 1–4 viewport tiles), of which Input, Alert, Dialog, Global
navigation, Select, Badge, Table also in dark and Input, Global navigation,
Dialog, Table, Typography, Studies also at 375px; Studies and Screens and
Status pages; transaction lab: Zapper 12 lifecycle states, 5 review variants,
outcome attachment and Sell; Automated Mint 13 states; Stake 12 states;
Vote-lock 10 states; Manual mint 13 states (see the addendum below for the
states reviewed after the main pass); paired comparison and reference
sections; selected states in dark and at 375px. Production: Home, Discover,
LCAP (Base) Overview / Issuance / Governance / Settings, Earn, Portfolio
(disconnected), Overview at 375px and in dark.

**Not inspected:** hover states and open popovers/menus beyond what the state
sheets render statically; keyboard focus rings live (relied on the e2e
assertions and the Accessibility page); real wallet, RPC, or package dialogs;
the yield-DTF legacy views; the `e2e/` product suite's behaviour; the
`master` branch.

**Limitations:** the preview is assumed to serve commit `adef9ee76`; console
noise from blocked third-party hosts was ignored; screenshots were taken with
reduced motion, so the quote-search artwork and outcome motion were not judged;
the token and catalog counts come from scripts run by sub-agents and were
spot-checked (radius baseline, `comment-block`, `--data-positive`, performance
hex, CI workflows), not re-derived in full.

**Unresolved questions for the team:**
1. Square structural regions vs production's rounded cards — decide on a real
   page (Step 6).
2. Dark-theme surface separation without borders — the Color page's own open
   item.
3. Who owns the Zapper package's visual language, and on what cadence does it
   move to V1?
4. Should accepted rules with no code owner (divider ownership, one owner per
   gap) become a lint or a recipe, or stay prose with a checklist? My
   recommendation is recipe + checklist, with lint only for tokens and
   arbitrary values.
5. Whether the 28px Lifecycle Status trial and the 448px flow widths are
   accepted; both are still "trial" after weeks and block a clean
   `Size` vocabulary.

---

## Addendum — transaction states reviewed in the final capture batch

Reviewed after the main pass, at 1400px light unless stated (evidence folder
holds the representative images):

- **Stake / Unstake / Delegate** (12 states): amount, approval gate with
  "Approve RSR · Step 1 of 2", approval signing with the ordered stepper and
  lifecycle pills, processing, completed (organic surface), unstaking
  initiated (pending withdrawal, 13d 23h countdown, next action), current
  delegate, delegate ready, delegate failed, stake failed, wallet disconnected.
  Coherent with Zapper; the only visible defect is the "StakeRSR" label (L2),
  which also appears at 375px.
- **Vote-lock / Unlock / Delegate** (10 states): lock amount, approval, lock
  processing, locked, unlock amount, unlock initiated, delegated to you
  (read-only two-role view), delegate ready (editable full addresses in mono),
  fast failed (partial-success recovery with "Retry fast delegation" and a
  Complete/Failed stepper), invalid address. The view/edit distinction and the
  partial-failure recovery are clear. At 375px the full addresses are clipped
  inside the fields, which is acceptable for a text input but worth a
  deliberate shortened display.
- **Manual Mint / Redeem** (13 states): mint requirements, redeem preview, mint
  empty, wallet disconnected (dash placeholders plus Connect Wallet), basket
  loading, insufficient collateral (danger summary beside the amount and
  per-asset "Insufficient balance"), approvals signing, partial approval
  failure ("Approval failed: USDT" with "Retry 1 approval"), mixed approval
  progress, mint ready, mint confirming, mint outcome, redeem outcome. The
  three-section left column with the approvals ledger on the right is the
  strongest dense composition in the lab.
- **Subjective observation, not a defect:** the shared "no-shrink outcome
  minimum" makes the Manual and Automated outcome surfaces fill the 736px
  workspace, leaving a large empty blue gradient above the result. It is a
  deliberate continuity tradeoff (decision 2026-09-01); it is worth one human
  look at whether the outcome could keep height while carrying more of the
  ledger.
- **Paired comparison and reference legend:** the side-by-side Zapper/Vote-lock
  comparison works well as a review tool. The reference legend introduces a
  sixth label vocabulary (Current baseline / Retained current / Proposed
  candidate / Flow-owned / Upstream-owned / Deferred) that overlaps the catalog
  badges; fold it into the vocabulary consolidation (§ 4.6).
- **Dark theme:** Stake processing, Manual mint ready, Vote-lock delegate,
  Zapper outcome and Automated orders all read correctly; the organic outcome
  surface and lifecycle pills adapt well. No dark-only defects were found in
  the transaction family.
- **375px:** Zapper review, Stake approval, Manual mint ready, Vote-lock
  delegate and Automated orders (single column with an opt-in "View orders"
  button) all fit without horizontal overflow, which matches the mobile
  responsive audit's claims.
