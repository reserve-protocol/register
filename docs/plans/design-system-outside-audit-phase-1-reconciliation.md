# Design system outside audit — phase 1 reconciliation

**Status:** independent follow-up to `design-system-outside-audit-phase-1.md`;
not design-system authority. It reconciles that report with a counter-review
that checked several of its principal claims against the repository. It does
not modify the original report, and nothing in it promotes, accepts, or adopts
any lab output.

**Inspected for this reconciliation (read-only):** branch `design-system-v1`
at `adef9ee76`, clean tree apart from the two untracked audit paths. Fresh
checks run for this document: the composition of the `human-review-required`
rows in `docs/wiki/progress.md` against `docs/wiki/decisions.md`; the commit
that introduced the Stake mode-label markup (`git log -S'max-[359px]:hidden'`)
and the ledger row for that stage; the labelling of the performance-colour
proposal in `color-performance-data.ts`, `color-performance-candidate.tsx`, and
`foundation-catalog.ts`; the design-system mapping in
`llm-workflow.config.json`; which `app.css` tokens exist only in the light
block and whether they are `color-mix()` formulas; the theme coverage of
`color-contrast-review.tsx`; and a script that enumerated every combination of
the catalog's eight status axes across the 45 component entries.

---

## 1. Reconciliation of the disputed points

| Point | Verdict | What the repository shows |
| --- | --- | --- |
| The 53 "human-review-required" ledger rows | **Corrected** | Six of the 53 rows are unrelated product stages (browser locale audit, cmd-k navigation, DTF settings confirm button, vlRSR vaults, chain switching, the master merge). Of the 47 design-system rows, at least eight have subjects that `decisions.md` already records as accepted while the ledger row still reads `human-review-required`: "accept accordion and prepare collapsible" (Accordion baseline accepted 2026-08-21), "design-system-v1-link-accordion-preparation" (Navigation Link baseline accepted 2026-08-21), "Design-system V1 safe-autonomy frontier" (Tabs, Segmented Control, Textarea, Switch, Pagination accepted 2026-08-19/20), "design-system safe-autonomy frontier" (Select and SearchField accepted 2026-08-19/20), "CopyableValue inline treatment" (2026-08-31), "contained inline message icon" and "Inline message transaction qualification" (2026-09-01), and "standalone link icon spacing" (recorded in the plan's engineering register). Roughly 35 further rows are transaction stages that the 2026-09-08 checkpoint folded into one paused Current Review item; that checkpoint states explicitly that it "does not mark earlier human-review-required design stages as accepted". The narrower finding the evidence supports: the ledger's acceptance state is not reconciled with the decision ledger, so a fresh agent reading `progress.md` cannot tell what is actually awaiting review. That is an inconsistency between two sources the router names as authoritative, not a 53-item queue. I withdraw the "bottleneck" wording. |
| No production views import V1 modules | **Narrowed** | The separation of lab definition from production adoption is deliberate and documented in the plan, the router, and the 2026-08-14 decision. The absence of adoption is therefore not a failure. What stands is a sequencing risk: the inventory → disposition → proof loop the router describes has never been run once; eight same-named legacy twins in `src/components/ui/` are what proximity imports (`ui/select` 8 files, `ui/tabs` 20, `ui/button` 232); and divergence is compounding through the installed Zapper package's own visual language and each merge of `master`. The correct statement is "an untested migration capability with growing divergence", and the correct response is to run one adoption slice inside the current window rather than after every component is finished. |
| Whether rendered review is required | **Corrected, and the underlying finding gets sharper** | The requirement exists. The plan's bounded review loop names "affected live rendering"; the router requires rendering one representative happy-path state plus one structurally different pressure state before applying a composition to its state matrix; `skills/ui-ux.md` and `skills/stage.md` require inspection of the actual rendered UI at default plus one edge state and every crossed breakpoint. 64 of the 84 design-system ledger rows since 2026-08-04 self-report mounted, visual, or live checks. The Stake mode-label markup (`Stake<span className="max-[359px]:hidden"> RSR</span>`) entered in commit `72f7f72e3` (2026-09-04) alongside the "transaction mobile responsiveness audit" stage, whose ledger row claims "all states 320/390 · 639/767/1023/1024 + light/dark" and whose own next step reads "Review dense 320px mode headers". The check was performed and missed the defect in the very area it flagged. Revised diagnosis: the rendered check is self-reported, its scope (which states, viewports, and themes) is undefined, its artifacts are written to `/tmp` and discarded (the regression report says so), and the workflow tooling does not know the suite exists (`llm-workflow.config.json` maps only `playwright.config.ts`). The remedy changes from "add a rendered step" to "define the scope per changed specimen, retain the evidence with the stage, and make `scope.mjs` aware of the design-system suite". |
| The undefined performance-token names | **Corrected** | `--data-positive`, `--data-positive-emphasis`, and `--data-positive-foreground` (and the negative set) are generated in `color-performance-data.ts` as `V1_PERFORMANCE_TOKEN_GROUPS` with `nearestCurrentValue` fields, and the lab renders them under the heading "Smaller V1 performance candidate". They are an explicit proposal. The accepted rule (decision 2026-09-04, "Transaction metrics resolve meaning before color") says realized movement "uses the existing financial performance palette", which is the hex constant set in `src/utils/chart-performance-colors.ts` consumed by `performance-value.tsx`. So no accepted implementation consumes an undefined token, and the original T3 verdict ("the documented answer is not implemented") was wrong. What remains, stated separately: `foundation-catalog.ts` lines 33–34 mark the "Intent and interaction colors" slot `defined` with the text "Feedback, performance, selection, focus, hover, and disabled roles have reviewed working rules", while the Studies page labels meaning colours "Values open"; and the accepted palette is untokenised, which the backlog already records ("Tokenize the performance text colors"). A fresh agent's retrieval risk is real but modest: it must find `PERFORMANCE_TEXT_CLASSES` rather than the 38 palette-class usages in product code. |
| Claims about the causes of repeated errors | **Narrowed** | Demonstrated, from the postmortem's own classification of 41 correction clusters: 18 violated a rule that already existed, and 15 depended on product evidence that had been reconstructed from an audit summary rather than the render tree. Plausible but not demonstrated: that rules being far from the point of use, and the absence of a scoped rendered pass, were contributing causes. Requiring a controlled test: model capability and context load, which the evidence neither confirms nor excludes. My original sentence "insufficient model capability is not supported" was too strong; a good result after correction does not exclude capability or context effects. The remedies proposed do not depend on which cause dominates, and they are also what would make a capability test interpretable. |

The findings the counter-review agrees with stand unchanged: accepted typography
roles must be directly reusable rather than reconstructed from lab-only class
strings; the two semantic-role maps create ambiguity; the normal instruction
path is too heavy, especially where unrelated work absorbs transaction history;
automatic verification does not reliably enforce the rendered review the
documentation promises; the reported rendered defects need correction and
regression coverage; and accepted components need clearer links to their
authoritative definitions and decisions.

## 2. The strongest arguments against the counter-review

Three of the corrections above make the underlying criticism stronger rather
than weaker.

1. **A requirement met by self-report is not a control.** The rendered-review
   requirement exists, 64 of 84 rows claim to have met it, and the Stake
   defect shipped through a stage that inspected that exact region at six
   widths in both themes. Until the scope is defined and the artifacts are
   retained, "mounted light/dark visual" in a verifier column carries no more
   information than its absence.
2. **Eight ledger rows contradicting the decision ledger is worse for a fresh
   agent than a large honest backlog.** A queue is a fact an agent can work
   with; an inconsistency between the two sources the router names as
   authoritative forces a judgement call on every read, and the precedence
   rules do not say which of the two wins.
3. **"Untested capability" is the risk, and it compounds.** Every merge of
   `master`, every package release, and every new legacy consumer widens the
   gap the first adoption slice must close. Treating adoption as a later phase
   rather than as the test of the system's central promise defers the one
   measurement that would tell the team whether the approach works.

Two further points where the disagreement does not change the plan, only the
confidence language: capability cannot be excluded as a cause, but the proposed
remedies are cause-agnostic; and formula-derived tokens do re-resolve under
`.dark`, but nothing verifies the result, so the finding stands as "unverified"
while the remedy changes from duplication to verification.

## 3. Recommendations revisited

### 3.1 Universal size and tone types — narrowed

A shared vocabulary is justified only where components share a physical scale.

- **One `ControlSize`** (`micro` 28px, `compact` 32px, `default` 44px) fits the
  components that already sit on the accepted control-geometry scale: Button,
  IconButton, Select trigger, Tabs, Segmented Control, SingleChoice, TextInput,
  SearchField, and Pagination. Each component declares its supported subset in
  the type (for example `Extract<ControlSize, 'compact' | 'default'>` for
  Select), so the type says what is allowed instead of a prose note. The
  Lifecycle Status 24px/28px trial is the one outlier a shared scale would
  force a decision on.
- **Distinctions the shared type must preserve:** Dialog width (384/432/wide)
  is a surface role, not a control height, and keeps `DialogWidth`; Spinner
  sizes (14/16/24) are glyph sizes; Inline Message and Entity Identity
  `density` describe content rhythm (padding and line height), not control
  height; Navigation Indicator's 8px/16px dot is not a control. Forcing these
  into `ControlSize` would imply equivalences that do not exist.
- **Tones must not merge.** `ActionTone` (primary / secondary / quiet /
  destructive) and `FeedbackTone` (information / success / warning / danger)
  are different concepts, and the Lifecycle Status roles (waiting / active /
  actionable / processing / success / unsuccessful / closed) are states, not
  tones. The concrete fixes are naming discipline and one default: `tone`
  always means `ActionTone` on actions and `FeedbackTone` on feedback; other
  concepts get other prop names (Copyable Value `primary | neutral` becomes
  `emphasis`, Organic Brand Surface `default | deep` becomes `depth`,
  Transaction Amount Object `default | inverse` becomes `contrast`); and
  IconButton's `compact`/`secondary` defaults are either aligned with Button's
  `default`/`primary` or documented at the prop.

**Concrete benefits:** fewer decisions per use, safe swaps between Button and
IconButton, and a sizes-and-tones table generated from the types into the lab
instead of maintained by hand.

### 3.2 Arbitrary-value restrictions — revised

The counter-review is right: `bg-[var(--feedback-warning-surface)]` is token
usage. The real problems are (a) tokens that are not wired into Tailwind, so
the same token has two spellings; (b) raw hex, rgb, hsl literals and Tailwind
palette classes; and (c) hand-typed type sizes that should be roles. Enforce
approved values and valid references rather than banning a syntax:

- Flag hex/rgb/hsl literals and Tailwind palette classes (`text-red-500`,
  `bg-yellow-500/10`, and so on) in the design-system directories
  (`src/components/design-system-v1/**`, the canonical component directories,
  `src/views/internal/design-system/**`).
- Flag `[var(--x)]` where `x` is not a defined token (typo guard), and where a
  wired utility exists, normalise to it (autofixable once every token is wired).
- Flag `text-[Npx]` and `leading-[Npx]` outside the typography source file.
- **Exceptions:** Radix positioning variables (`--radix-*`); scoped custom
  property definitions such as `[--inline-message-surface:var(--feedback-…)]`;
  measured chart geometry files; and `calc()`/`min()` expressions built from
  tokens.
- **Scope outside the design system:** in product directories, ratchet the
  count (the baseline must not increase) rather than fail, matching the repo's
  existing grandfathered-warnings practice.

### 3.3 Explicit definitions in both themes — revised

Fourteen tokens exist only in the light block: `--disabled-structure`, the
eight `--feedback-*-surface` and `--feedback-*-border` tokens,
`--status-neutral-surface`, `--status-neutral-border`, `--substrate-subtle`,
`--surface-recessed-content`, and `--radius`. All but `--radius` (which is
theme-independent) are `color-mix()` formulas over base tokens that are
redefined in `.dark`, so they re-resolve correctly, and the dark screenshots
confirm the feedback tints render as intended. Duplicating them would be wrong.

What is missing is verification: `color-contrast-review.tsx` covers only the
warning-foreground calibration and asserts in prose that the structure "already
works across light and dark themes". Recommend instead:

- a computed-value test that evaluates every surface/foreground and
  border/surface pair in both themes and fails below a stated contrast
  threshold;
- one derivation-policy line in `app.css` stating that an absent dark
  redefinition means "derived from the formula", and deleting the fifteen
  verbatim dark copies (`--primary-hover`, `--brand-surface`, the four
  `--feedback-*-foreground` tokens, `--destructive-action*`, and others) so
  that "redefined in `.dark`" reliably means "tuned";
- correcting the two wrong sentences in `design-system-reference.md` ("every
  color is an HSL CSS variable exposed as a Tailwind color"; "add the CSS var
  in both `:root` and `.dark`").

Tokens that genuinely need separate definitions are those with theme-specific
intent, and they already have them: `--supporting-foreground` (collapses to
`muted-foreground` in dark), `--brand-surface-deep` (differs only in dark),
`--tvl`, and `--ring`.

### 3.4 Reducing the status axes — defended with data, refined to five

A script over the real catalog shows the 45 component entries occupy 19
distinct combinations of the eight axes (`status`, `designAuthority`,
`implementationStatus`, `outputStatus`, `review.status`, `adoptionStatus`,
`auditStatus`, `priority`). The 29 entries that are accepted, reusable,
rendered, and unadopted are spread across six combinations that differ only by
the vestigial `status` (`evidence-found` vs `defined`), by `auditStatus`
(`mapped` vs `partial`, one entry), and by `priority`.

Proposed schema (five axes plus a tag and a flag):

| Axis | Values | What it decides |
| --- | --- | --- |
| `authority` | undefined · exploratory · accepted · superseded · not-needed | What new work may inherit |
| `implementation` | none · specimen · recipe · reusable | What can be imported |
| `output` | none · rendered · in-composition | Where to look |
| `adoption` | none · opt-in · in-use | Whether production is affected |
| `review` | none-pending · prepared · in-review · deferred (with reason) · blocked (with named dependency) | Whether human attention is owed, and why not |
| `priority` (tag) | v1-core · v1-conditional · product-extension | Planning only; not a status |
| `evidencePartial` (flag) | true on the five `partial` entries | Provenance caveat |

Demonstration that no decision-relevant information is lost:

- `status` folds entirely into `authority`: `defined` appears only on five
  entries that are already `current-baseline`; `not-needed` (Combobox)
  becomes an `authority` value; `evidence-found` carries no decision.
- `review: ready` on 31 accepted entries duplicates `authority: accepted`;
  under the new schema those entries read `review: none-pending`, and
  `output: rendered` already records that a specimen exists.
- `not-started` (Toast, Progress, Data table, Slider, Chart) and `deferred`
  (Breadcrumb, Combobox) stay distinct as `prepared`-less `none-pending` versus
  `deferred` with its recorded reason; `blocked` keeps its named dependency.
- `exploration` (Amount field, Asset picker, Stepper, Drawer) is carried by
  `authority: exploratory` plus `output` (`in-composition` or `rendered`) with
  `review: none-pending`.
- `provisional` on Card (accepted delta review, specimen only) and Table
  (exploratory specimen) is already carried by `authority` plus
  `implementation`; the scope of the accepted delta belongs in the decision
  link, not in a status value.
- The one genuinely in-review item (`transaction-action`: exploratory,
  specimen, rendered, paused in Current Review) becomes the only entry with
  `review: in-review`, instead of being indistinguishable from 31 accepted
  "Reviewable" entries.

The progress dashboard's `defined` and `design-reviewed` gates, which are the
same predicate for every current row, collapse to one.

### 3.5 Additional guidance files — narrowed to "relocate only if it replaces"

The single owner of the review procedure should be the lab area guide
`src/views/internal/design-system/CLAUDE.md`. The root load order already says
"read the area guide before changing a view", and no such guide exists for the
lab today. It should carry the seven-pass checklist from the postmortem, the
review-capture command, and the status vocabulary. In exchange:

- the router's "Review a realistic composition" section becomes a pointer;
- the plan's operating-model items 6 and 10 become pointers;
- the generic rendered-check wording in `skills/ui-ux.md` and `skills/stage.md`
  is left as kit guidance but is no longer the thing a lab task reads;
- the postmortem keeps only its diagnostic role.

Net effect: one new file, three duplicated passages removed, one owner.

### 3.6 Prerequisite work — narrowed to four items

Before tables/rows or another composition:

1. Merge the two role objects and put the ten accepted type roles into
   `typography.ts`, with the lab consuming them. Mechanical; guarded by a
   before/after computed-style snapshot of the lab in both themes showing zero
   visual change.
2. The scoped rendered-review command with retained artifacts, plus the area
   guide checklist, so row and table work is judged on rendered output at
   375px and 1400px in both themes.
3. The page-shape decision (square structural regions with seams versus
   production's rounded cards), because row and table anatomy depends on its
   container.
4. The four small rendered-defect fixes with regression coverage (auto-scroll
   on load, the Stake label, the clipped table specimen, the missing radius
   baseline).

Independently useful and able to run in parallel: the `ControlSize` and tone
naming work (rows will exercise micro and compact anyway), the catalog
restructure, the lint, and the document tiering.

## 4. Revised recommendation on the depth and timing of foundational work

**Choose B: substantial restructuring of five specific areas.** Not a
coordinated rewrite (C), and not targeted hardening alone (A). The visual
decisions, the component implementations, and the transaction compositions are
sound; nothing below reopens them.

**Where local fixes suffice (A-level work):** the rendered defects; the missing
radius baseline; the false `comment-block` claim in `CLAUDE.md`; IconButton
defaults; the silent no-op props; the hard-coded English strings; the eight
stale ledger rows; the reference's wrong token sentences; the foundation
catalog's overstated "performance … reviewed working rules" slot.

**Where local fixes are false economy:** adding lint on top of two role
objects (merge first, then lint); adding decision links by appending more
catalog prose instead of changing the entry shape; duplicating tokens into
`.dark` instead of verifying computed values; committing more pixel baselines
without changing what "green" means; relocating prose without deleting the
copies it replaces.

**The five restructured areas:**

1. The token and role layer: one role object, every token wired, verified
   computed values in both themes, elevation and radius roles, the performance
   palette tokenised.
2. Typography roles in code and consumed by the lab.
3. Verification tooling and evidence retention: the design-system suite mapped
   into the workflow config, a `verify-gap` when lab files change without a
   browser run, scoped review captures retained with the stage.
4. Document tiering and catalog shape: the plan returned to its 2026-08-27
   size with the transaction sections moved to the transaction documents;
   catalog entries reshaped around the five axes with a required decision
   link for every accepted component.
5. Ledger and status semantics reconciled with the decision ledger.

**What each approach disturbs:**

- A disturbs nothing and leaves the retrieval and enforcement problems in
  place; every later composition inherits the same reading path and the same
  self-reported check.
- B touches tokens, an engineer-review surface already listed in the plan's
  register (guard: the computed-style snapshot in both themes before and
  after); rewrites the catalog tests that pin today's id lists (replace them
  with invariant checks: every accepted entry has a decision, every path
  exists); edits routed documents (wiki-lint and link integrity protect them);
  and reconciles ledger rows (documentation only). It does not touch accepted
  visual decisions, component defaults beyond the IconButton alignment, or
  transaction behaviour.
- C would put accepted decisions and the reviewed compositions back in play
  and is not warranted by any evidence gathered.

**Timing.** This window is the right one for B: transaction work is paused,
no adoption has started, the examples exist, and every later composition would
otherwise inherit the same retrieval path. One adoption slice belongs inside
this window rather than after it, because it is the only test of the system's
central promise and the only way to exercise the inventory → disposition →
proof loop before it is relied on.

## 5. Experiments needed to settle consequential uncertainty

Each experiment fixes its rubric before any run, uses a fresh agent with no
conversation history, and is scored by a human blind to the arm plus one
independent agent.

- **X1 — Rules at the point of use versus better routing.** Three arms on two
  tasks (the Select disabled-state refinement and one small new composition):
  (a) the current documents; (b) the same prose relocated behind a lighter
  router with no code changes; (c) typed usage cards plus wired tokens. Arm (b)
  tests the counter-review's hypothesis that routing alone suffices; arm (c)
  tests mine. Measures: words read before the first edit, hand-written colours
  or sizes, and rule violations caught by the agent's self-review versus by the
  blind scorer.
- **X2 — Rendered-review scope.** Three arms on the Stake lab route: (a) the
  current instructions; (b) the seven-pass checklist as prose only; (c) the
  checklist plus the capture command. Detection is scored against the three
  known defects plus three defects seeded by a third party in a scratch copy of
  the branch, so the test cannot simply confirm the defects the auditor already
  reported.
- **X3 — Capability and context load.** X1's control arm run with two models
  and under two context conditions (fresh, and with the transaction history
  loaded). This is the only design that separates model capability from
  context load from documentation quality, and it can falsify the audit's
  diagnosis as readily as confirm it.
- **X4 — Page shape.** A designer decision rather than an agent test: one
  golden screen (Overview or Discover) rendered both ways by the same agent
  (square regions with seams; rounded cards), in both themes at 375px and
  1400px, side by side with production.

## 6. Immediate next step

Capture the control baselines for X1, X2, and X3 on the current branch before
any structural change lands, because that measurement cannot be taken
afterwards. In parallel, fix the four rendered defects with regression
coverage, since they are zero-risk and independent of every other decision.
Then begin the role-object and typography merge under the computed-style
guard, followed by the review-capture command and the lab area guide.
