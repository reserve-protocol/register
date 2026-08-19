---
title: Design System
updated: 2026-08-19
type: domain
sources:
  - tailwind.config.ts
  - src/app.css
  - src/components/ui/**
  - src/views/internal/design-system/**
  - e2e/design-system/**
  - playwright.design-system.config.ts
---

# Design System

Source of truth: `tailwind.config.ts` (tokens) + `src/app.css` (CSS variables, `:root` + `.dark`). Dark mode is class-based — prefer `dark:` utilities over JS theme branching.

## Active v1 project

The active contract is [design-system-v1](../../plans/design-system-v1.md). The contained `/internal/design-system` route is a visual-review workspace: Foundations renders the current system as compact specimens, and Components renders reusable V1 candidates with acceptance and adoption shown separately before provisional compositions and a compact remaining inventory. Screens remains a reference to unchanged production routes; it cannot validate an unadopted candidate. Detail pages lead with visual output and local readiness; evidence, dependencies, definition slots, and history are progressively disclosed. Studies contains only unresolved alternatives and active pressure tests. Project Status owns the typed Current Review queue plus the deeper registry-derived tracker and work queue. Expected missing slots remain navigable, but they do not receive large overview cards or imply a commitment to build.

V1 work is canonical-first. Reuse the audits, synthesize the strongest complete
candidate from accepted owners and strong product evidence, self-review it, and
only then surface the meaningful judgment that remains. Resolve a visually
meaningful prerequisite before its parent review rather than recreating it
locally. After feedback, classify the correction as local, component,
pattern/composition, foundation, or reusable heuristic and update the most
reusable justified owner immediately. Unrelated consumers, documentation, and
baselines may wait for the next synchronization pass. The full nine-principle
operating model and source precedence live at the top of the active plan;
chronological plan sections are evidence, not competing workflow authority.

Real local golden screens are the canonical composition-testing surface; deterministic fixtures supplement live data for repeatable edge states. Foundation evidence still documents the existing system, while the Button state sheet now renders the actual reusable V1 candidate. The component catalog is product-shaped: established interaction-system references such as shadcn and Radix inform its vocabulary, but Register's audited needs decide what v1 defines, combines, or marks not needed.

Foundation detail pages separate current evidence, an exploratory direction,
and the current authoritative baseline. Current evidence must name its audit
method and limits; hand-picked token samples are not an audit. Rendered output
is tracked separately from design authority, so a visible specimen cannot imply
that its contract is the current baseline. Color is the first implemented
pattern: audited surface usage, a rendered surface hierarchy, role tables, and
separate feedback versus financial-movement semantics. Multi-value treatments
such as chart gradients must show their stops, markers, text, theme variants,
and derived fills before a smaller candidate mapping is proposed; one swatch is
not complete evidence. When an inherited color fails text contrast, render it
as a labeled swatch and state the limitation rather than presenting inaccessible
text as a viable candidate.

Color now also has a partial reviewed V1 definition. White owns page-canvas and
ordinary-content roles; beige is a structural substrate revealed by 2px major
and 1px subsection seams. Gray chrome stays contained in white. Feedback uses
vivid success, warning, danger, and information colors with dark icon
foregrounds and quiet opaque derived surfaces. Those surfaces and borders match
their former alpha appearance on white cards without mixing with tinted parent
surfaces; information derives from the brand blue hue. The existing
positive/negative performance colors and gradients are
preserved and remain semantically separate from feedback. V1 begins with
primary and supporting neutral foreground roles. Generic categorical colors are
deferred because the current `chart-1`…`chart-5` variables have no product
consumer. Cross-theme information-blue tuning and detailed feedback-indicator
usage remain open.

Component-family work consumes these reviewed distinctions through the
lab-only `candidate-semantic-roles.ts` map while values remain provisional. It
names content, structural substrate, neutral control fill, selected surface,
floating surface, divider, control line, focus, disabled structure, and
feedback surface/foreground roles without changing production tokens. This
prevents candidates from choosing legacy aliases ad hoc; production
tokenization remains a later explicit migration.

Before a product-facing composition is presented as reviewable, run a
foundation-conformance pass over its spacing, typography, color, radius, and
component dependencies. Raw utilities are not evidence: every value must map
to an accepted foundation or be labeled as an unresolved exception before the
human visual review. Add focused computed-geometry checks for the composition's
important foundation claims so later edits cannot silently reintroduce an
off-scale value. This conformance pass precedes aesthetic judgment; the user
should not have to discover basic rule violations while reviewing composition.
Accepted layout relationships live behind the intent-named
`src/components/ui/v1-layout-recipes.ts` map. Every typed item in
`current-review.ts` must record all five conformance areas and declare any
provisional dependency; registry tests reject missing areas while routed
browser tests verify the composition's important computed geometry.

Canonical product-facing candidates use the narrower production-consumable
`src/components/ui/v1-semantic-recipes.ts` bridge. It currently exposes
canvas/content/structural surfaces, primary/supporting text, matching
surface-separation recipes, and the proven focus and disabled-control recipes.
These still alias existing semantic tokens; they do
not change global token values or production consumers. Add a recipe only when
a canonical component proves the role is needed rather than speculating about
the complete system in advance.

The V1 Button hierarchy is partially accepted. Primary actions use the blue
brand fill; secondary actions use white content-surface fill with the neutral
control border; quiet actions remain visually bare until interaction; and
destructive actions use red only for destructive consequences. Neutral gray
fill is control chrome, not another secondary-action variant. Micro, compact,
and default actions use the reviewed 28px, 32px, and 44px geometry. Ordinary
asynchronous work uses a progress verb; a wallet-required state uses a direct
instruction; and a submitted transaction uses lifecycle status. Those states
preserve the control's width, size, hierarchy role, placement, and spinner and
prevent repeat activation. Destructive confirmation pairs a red,
consequence-specific action with an outlined Cancel action. Pressed and
long-label behavior remain open. A separate reusable candidate lives at
`src/components/button/` and is consumed by the lab; the legacy production
Button API and its consumers have not been migrated or marked complete.

Button width is owned by composition, not by the size variant. Buttons are
intrinsic/content-width by default. Compact buttons primarily serve dense
horizontal toolbars, inline actions, and small secondary controls; stretching a
compact button across a parent usually makes its height and label feel
under-proportioned. Action groups should prefer a horizontal intrinsic-width
arrangement when space allows. A narrow vertical action stack should use equal
widths—usually full-width default 44px actions—rather than a ragged stack of
differently sized content-width buttons. Full-width compact actions remain an
evidenced exception, not a default pattern.

The V1 Dialog behavior contract is partially accepted. Ordinary reversible
tasks use one visible completion action when shell dismissal already cancels;
destructive confirmation adds an explicit safe exit. Long content scrolls in
the body while header and action regions remain anchored. Dialogs never nest;
supporting popovers, menus, and selectors may still appear within them. During
progress, the anchored action communicates the current operation while complex
workflow bodies may update. Recoverable failures preserve inputs and show
contextual recovery; V1 does not define a standalone failure-dialog pattern
without a real product requirement. Routine non-blocking completion uses a
toast, while consequential outcomes that require detail or a next action remain
in the dialog. Routine outcomes use a semantic framed icon; meaningful
milestones may earn bespoke illustration. Exact outcome composition and
illustration style remain open, and no production Dialog default has been
migrated.

Passive semantic icons use a fixed invisible slot by default rather than
button-like chrome. The reviewed Dialog lead uses a 32px slot with a 20px glyph
so alignment remains stable while the icon stays clearly non-interactive. A
visible frame must communicate meaning or identity, or solve alignment across a
repeated stack; position above text alone does not earn a frame.

The canonical V1 Lifecycle Status candidate owns its frame and therefore uses unframed 14px
indicators: an active dot, clock, arrow, spinner, check, x, or no icon. Evidenced
domain phases may replace the default role indicator with an approved semantic
one: a ballot for active voting or shield-alert for an active challenge.
Proposal qualifiers remain bare neutral medium-weight metadata at the title
edge rather than becoming another pill family. Current proposal progress uses
brand blue; historical progress uses neutral completed segments, while
green/red outcome meaning stays in status. A short neutral divider may separate
quorum from vote distribution inside a white record without touching the
structural beige seam. In this compact evidence row, 14px icon/value pairs use
4px and adjacent vote units use 8px. The divider separates distinct quorum and
vote regions, so it retains the 16px internal-region relationship.

Across V1, do not invent states, screens, flow steps, or component families to
fill theoretical system slots. Standardize and facelift evidenced product jobs;
add a new category only when a demonstrated functional gap cannot be served by
an accepted pattern.

Deterministic fixtures may fictionalize names, values, and dates only within an
evidenced product state. They must not invent mechanics or imply unsupported
relationships such as a known total for a dynamically repeated process.
Lab-authored wording is not a product-copy source: migration preserves
source-evidenced meaning unless a copy change receives explicit approval.

The first product-facing preparation pass keeps three recurring jobs distinct:
dense comparable data rows, rich navigable records, and compact metric
compositions. They may share Entity identity, Metric, Status, Copyable value,
and table-cell anatomy, but V1 must not hide their different behavior inside a
universal `Row` prop matrix. Metric owns inline and headline-stacked anatomy.
Auction selector operational and outcome rows reuse inline anatomy, while their
parent may apply one consistent value emphasis to the group. Full-view outcome
summaries may use headline anatomy when their composition warrants it. Parents
own alignment, optional icons, framing, and layout rather than Metric becoming
another Card primitive.

Entity identity is the first canonical product-facing candidate. The lab
directly renders the shared `EntityIdentity`, `ChainBadgedLogo`, and
`TokenLogoStack` implementations from `src/components/entity-identity/` rather
than lab-only replicas. The badge follows the strongest recent Index treatment;
its 16px xl and 14px lg chain marks include the separating border rather than
growing around it. The lg mark uses an optical floor because the fixed 2px
separator otherwise overwhelms the visible chain symbol. The stack owns overlap
order and surface-colored separation. Long names,
deterministic logo fallback, account marks, and a dense 32px Index holdings
composition now pass in the lab. Production consumers and the two legacy stack
implementations are intentionally unchanged until an explicit adoption slice.

The canonical product kernel now also includes `Button`, `Metric`/`MetricValue`,
`EmptyState`, and `LifecycleStatusPill`. Button owns the accepted action
hierarchy, 28/32/44px scale, icon spacing, focus, disabled, and loading behavior
while leaving pressed and long-label behavior open. Metric owns accepted inline
and centered-headline label/value anatomy. The headline treatment preserves the
strong Home source's 16px/300 label and 16px/500 value; horizontal peers remain
16px/300, right aligned, and tabular. Its parent owns framing, grids, help, and
responsive composition. Outcome-summary groups do not add a Metric role or icon
API; centered versus parent-owned start alignment remains a visual composition
decision. Empty state owns only quiet versus user-resolvable absence hierarchy;
parent regions own height and framing, while bespoke illustration is reserved
for later review of meaningful evidenced states. A realistic divider-free Index
slice composes Entity identity with Metric values without introducing a
universal Row component.

Lifecycle Status owns the reviewed 24px lifecycle roles, standardized
indicators, opaque semantic tones, subtle countdown pairing, and processing-only
motion. Category labels, counts, qualifiers, removable chips, proposal progress,
and outcome-detail composition remain separate work. Its implementation lives
in `src/components/lifecycle-status/` and consumes the shared V1 semantic-role
map from `src/components/design-system-v1/`; no product consumer has adopted it
yet.

Card usage does not support one universal migration target. The 50 shared Card
imports are dominated by legacy Yield consumers, while the Index imports mostly
frame structural Overview regions. The production primitive's rounded-3xl,
20px-padding, and title defaults conflict with accepted V1 foundations and stay
unchanged evidence. Structural regions already resolve to square white surfaces,
an ordinary 24px content axis, layout-owned substrate corners, and no nested-card
default. The Home Index feature card is the authoritative source for a later
media-rich interactive-card shell; its hierarchy and detailed behavior are not
being redesigned. The accepted preservation-first review applies a square
shell, an 8px shell inset and contained-media radius, 24px primary and
supporting-row axes, 16px between internal regions, and 8px between directly
related title/market content. Title spacing is measured from the complete top
row rather than the logo alone, so Discover naturally accounts for its taller
chart without a new spacing value. Full chart/launch, ticker, transcript/video,
chain, and interaction behavior remain protected; Discover is supporting
compact adaptation evidence. Reusable extraction remains queued and production
is not adopted.

Persistent product navigation is a Register extension, not a Button variant.
The Index DTF rail and its constrained-screen menu consume one route/current/
disabled model while composing it differently for available space. Generic
Link semantics remain intact. Review starts from faithful collapsed and
hover-expanded states of the real rail, not invented alternative directions.
The designer owns visual refinement while accepted foundation rules constrain
spacing, color, shape, icon, motion, and accessibility. The category exists
because repeated real product use demonstrates the contract, not because a
generic component catalog expects it.

The contained lab is designer/developer working metadata and remains English-only. This is not an exemption for migrated product UI: any copy that reaches product users follows the repository's Lingui and es/ko/zh translation rule. Current Review contains only a nearly complete candidate that has reached the boundary of what Codex can confidently resolve and still needs genuine human visual judgment (`visual decision`, `canonical review`, or `real-screen validation`). It is not a list of unfinished slots. Autonomous component work and evidence preparation stay in the registry-backed Project Status work queue.

Keep Tailwind, Radix, CVA, and local shadcn-style primitives as the implementation base. Storybook is deferred until the in-app lab demonstrates a concrete unmet need. Progress gates are independent: catalog maturity, design authority, rendered output, reusable implementation, production adoption, individual definition decisions, review, and verification must not collapse into one status. In particular, rendered exploratory work may be only a specimen; the catalog must say whether a reusable component or recipe exists, whether its contract is the current baseline, and whether any product consumer has adopted it. Missing capabilities use explicit statuses and subdued styling, never disabled navigation, because their detail pages are part of the planning surface.

Composition review readiness is a separate gate. A composition is ready for
canonical V1 review only when every visually meaningful dependency is either
accepted for the contract the parent relies on or an explicitly retained
domain/behavior primitive. A reusable but exploratory candidate may be reviewed
as part of the parent only when that scope is explicit; it cannot be silently
excluded from judgment merely because an implementation exists. Otherwise
label the composition provisional, blocked, or exploration-only, state exactly
what the reviewer may judge, and list the unresolved dependency. A canonical
child inside hand-built framing does not make the parent composition canonical.

The minimal canonical interaction kernel now includes `Button`, a 20px square
binary `Checkbox` centered in a transparent 28px alignment slot, a named compact
32px `IconButton`, and a Radix-backed
`Dialog` shell. Checkbox promotion covers checked, unchecked, focus-visible,
and disabled states only; indeterminate, invalid, and rich label/help rows stay
open. IconButton promotion covers the dialog/header action role only; tooltip,
toggle/selected, and invisible hit-target contracts stay open. Dialog provides
384px compact and 432px standard centered shells from 640px upward. Below 640px
the same semantic Dialog becomes a full-width, bottom-flush sheet with a
viewport-capped scrolling body, anchored header/footer, safe-area padding, and
no implied drag or swipe dismissal. Both presentations share the 24px content
axis, accepted 4px title-to-description relationship, header-owned compact close
action, and non-dismissible behavior. Final elevation, consequential outcomes, and
illustration remain provisional. These candidates are lab-only and have no
production adoption.

Human review accepted the interaction kernel in the real eligibility
composition. This does not define every dialog layout: consequential outcomes,
illustration, and final elevation remain composition-level work that must be
earned by real product evidence.

Verification is also phase-aware. A bounded candidate edit gets focused type,
behavior, and rendered checks for its current seam; a coherent canonicalization
batch gets the broader design-system suite and reconciliation pass; repository
smoke/full gates begin when work reaches production or another genuinely global
boundary. Interactive browser review may reuse the running lab, but committed
Playwright evidence continues to use its controlled E2E environment.

The component-work queue and design-decision queue are independent. Component
work tracks audit, faithful states, V1 design/update, system alignment, stress
testing, and migration readiness. The decision queue contains only genuine
ambiguities that require designer judgment. An unfinished or visually dated
component is work to perform, not automatically a question to ask; apply accepted
rules and correct clear inconsistencies before escalating a specific unresolved
choice.

Registry terminology is deliberately literal and split across independent
axes. Design authority is `undefined`, `exploratory`, `current-baseline`, or
`superseded`; current baseline means authoritative now, not final forever.
Rendered output records only whether the lab shows the item. Implementation is
`none`, `specimen`, `reusable-recipe`, or `canonical-candidate`; only the latter
two name an authoritative source under `src/components`. Adoption remains
`none`, `opt-in`, or `in-use`. The Components overview may show reusable work
before it becomes the current baseline, but it must expose that distinction and
never imply that implementation or production use settled the design.

## Color tokens (semantic — never hardcode hex/hsl)

Every color is an HSL CSS variable exposed as a Tailwind color:

- Surfaces: `background`, `card`, `container`, `popover`, `muted`, `secondary`, `accent` — each with a `-foreground` pair.
- Brand/intent: `primary`, `success`, `destructive` (+ `-foreground`); `warning` (no foreground pair).
- Lines/inputs: `border`, `borderSecondary`, `input`, `ring`.
- Data viz: `chart-1`…`chart-5`, `legend`, `tvl`.

A new color means adding the CSS var in **both** `:root` and `.dark` in `src/app.css` first — never a one-off hex.

## Type, radius, layout, motion

- Font: TWK Lausanne — only three weights exist: `font-light`/`font-normal` → 300, `font-medium`/`font-semibold` → 500, `font-bold` → 700. 400/600 collapse to these.
- Radius: `rounded-sm/md/lg` derive from `--radius` (0.5rem); `rounded-3xl` (1.25rem) and `rounded-4xl` (1.5rem) for cards/dialogs/drawers.
- V1 radius candidate: atomic one-row controls—including buttons, ordinary
  inputs, search, and select triggers—are fully rounded. Composite amount
  panels, multiline fields, menus, popovers, and thumbnails use the restrained
  8px contained-object role. Structural surfaces remain square by default and
  selective layout-owned corners reveal the substrate.
- Control typography candidate: default entered/selected values are 16px/300;
  compact values are 14px/300; action labels are 14px/500. Intent, selection,
  focus, validation, disabled, and async lifecycle are combinable state axes,
  so shared primitives define supported and prohibited pairings instead of one
  exclusive state list.
- Spacing relationships use 4px for tight text pairs—including inline evidence
  labels and values—8px for directly related content, 16px between internal
  regions, and 24px for ordinary content insets and complete groups. Semantic
  layout recipes own these relationships in reviewable compositions.
- Tabs use foreground text for the active item and supporting text for inactive
  items rather than primary blue. The text-only candidate follows the recent
  Index overview timespan treatment without an underline or wrapper, at 14px
  compact and 16px default sizes.
- A contained single-selection strip uses one shared visual language regardless
  of whether its eventual semantics are Tabs, a segmented mode control, or a
  submitted radio value: a fully rounded neutral track, 2px track inset, no
  additional inter-item gap, a subtly elevated white selected item, 14px/500
  labels, and size-category horizontal padding (12px compact, 20px default).
  Hover uses a quiet neutral fill; focus separates against the neutral track;
  disabled items retain structure at 50% opacity. Semantics, keyboard behavior,
  overflow, and content-panel relationships remain owned by each component.
  This visual contract is the current baseline and its compact/default
  treatment lives in `src/components/design-system-v1/contained-selection.ts`
  so related controls can consume it without reconstruction. The accepted
  text-only and contained Tabs presentations are rendered from
  `src/components/design-system-v1/tab-presentation.ts`. Tabs still has no
  complete reusable V1 component: presentation roles, panel semantics,
  overflow, counts, deep linking, and its final API remain open, while the
  current production Tabs primitive remains retained behavioral evidence.
- Layout: centered `container` capped at 1400px. Standard spacing utilities; arbitrary values only for measured/chart geometry.
- Motion: reuse predefined animations in `tailwind.config.ts` (`animate-fade-in`, `animate-slide-up`, `animate-spin-slow`, `animate-shimmer`, accordion/dialog) — don't write keyframes for standard motion.

The V1 layout candidate is role-led rather than page-specific: one shared outer
frame, a separately measured stable Index navigation rail, and table-led
content-plus-support, balanced-split, or focused-column templates. Overview is
approximately 1.45:1 at the current maximum shell; its primary column absorbs
width to protect dense tables and stacks before their useful minimum is lost.
Current measurements remain evidence, not approved values. The provisional
modal grammar uses 432px for Zapper and other substantial task dialogs and
384px for genuinely brief confirmations. A workflow keeps one width across its
states. The real Zapper completion state stays in the 432px role because it can
contain transaction details and contact or scheduling content. Long primary
amounts use a deliberate display-precision limit; full precision belongs in
details or a copy affordance rather than widening the dialog.

Before component contracts are frozen, route families map to five task-led
archetypes: Browse + inspect, Progressive workflow, Primary + support, Context

- regions, and Data index. These describe composition roles, not a universal
  `PageLayout` API. Current audit calls: replace the centered Auctions list/detail
  islands with browse-and-inspect in V1, recomposing the opened auction for its
  wider workspace rather than stretching the current card; retain Governance's
  current composition during the compressed V1 migration and defer its promising
  proposal-summary direction; retain automated mint's compact-to-paired expansion
  as the progressive-workflow reference. A full-width lead above split regions is valid
  only for shared state or actions that govern every region below. The lab
  studies remain hypotheses until human review and must not become production
  wrappers prematurely.

V1 accessibility is a pragmatic shared-primitive baseline. Shared controls and
overlays own keyboard behavior, visible focus, targets, names, non-color
meaning, dialog focus management, and reduced motion; product compositions own
truthful labels, messages, and reading order. Verify representative primitives
and states rather than imposing a bespoke accessibility ceremony on every
screen.

## Components (never rebuild)

shadcn/ui primitives in `src/components/ui`: Dialog, Drawer, Modal, Card, Button, Input, Select, Multiselect, Checkbox, Switch, Tabs, Accordion, Collapsible, Tooltip, HoverCard, Popover, DropdownMenu, Command, Table/DataTable/legacy Table, Progress, Slider, Skeleton, Spinner, Sonner — plus blockchain-aware `TransactionButton`, `Transaction`, `Swap`, `CopyValue`. Shared composites (token logos, tables, icons) in `src/components`.

**`DataTable` / legacy `Table` are used app-wide — never change their defaults; add behavior via opt-in props.** (One deliberate exception recorded in [[decisions]]: 2026-07-02 pagination unification.)

## Package-style containment

Third-party package internals are not a styling surface. The one live exception (`.rc-*` overrides for `@reserve-protocol/dtf-chat` in `src/app.css`) is documented in [[project]] § Active Risks with upstream work backlogged.
