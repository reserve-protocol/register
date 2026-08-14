---
title: Design System
updated: 2026-08-14
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

The active contract is [design-system-v1](../../plans/design-system-v1.md). The contained `/internal/design-system` route is a routed capability map: Foundations, Components, and real-product Screens are direct top-level destinations, while the full tracker lives under the quieter Project Status route. Their landing pages own discovery; dropdowns do not duplicate the same catalogs. Expected foundation and component slots remain visible and navigable before audit or implementation; each detail page explains the capability, its current evidence/status, the decisions still open, and why no lab output exists yet. A listed slot is a question to resolve, not a commitment to build or preserve it.

Real local golden screens are the canonical composition-testing surface; deterministic fixtures supplement live data for repeatable edge states. Foundation evidence still documents the existing system, while the Button state sheet now renders the actual reusable V1 candidate. The component catalog is product-shaped: established interaction-system references such as shadcn and Radix inform its vocabulary, but Register's audited needs decide what v1 defines, combines, or marks not needed.

Foundation detail pages separate three layers: current evidence, a provisional candidate system, and the accepted v1 definition. Current evidence must name its audit method and limits; hand-picked token samples are not an audit. Candidate systems render expected semantic roles and their status alongside the source-review rationale, so an open exact value cannot look accepted merely because its structural role is proposed. Color is the first implemented pattern: audited surface usage, a rendered surface hierarchy, role tables, and separate feedback versus financial-movement semantics. Multi-value treatments such as chart gradients must show their stops, markers, text, theme variants, and derived fills before a smaller candidate mapping is proposed; one swatch is not complete evidence. A candidate may earn a rendered `proposal` status while every definition slot remains open; never translate that status into approval. When an inherited color fails text contrast, render it as a labeled swatch and state the limitation rather than presenting inaccessible text as a viable candidate.

Color now also has a partial reviewed V1 definition. White owns page-canvas and
ordinary-content roles; beige is a structural substrate revealed by 2px major
and 1px subsection seams. Gray chrome stays contained in white. Feedback uses
vivid success, warning, danger, and information colors with dark icon
foregrounds and quiet derived backgrounds; information derives from the brand
blue hue. The existing positive/negative performance colors and gradients are
preserved and remain semantically separate from feedback. V1 begins with
primary and supporting neutral foreground roles. Generic categorical colors are
deferred because the current `chart-1`…`chart-5` variables have no product
consumer. Exact opaque light/dark values and detailed feedback-indicator usage
remain open.

Component-family work consumes these reviewed distinctions through the
lab-only `candidate-semantic-roles.ts` map while values remain provisional. It
names content, structural substrate, neutral control fill, selected surface,
floating surface, divider, control line, focus, disabled structure, and
feedback surface/foreground roles without changing production tokens. This
prevents candidates from choosing legacy aliases ad hoc; production
tokenization remains a later explicit migration.

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

Across V1, do not invent states, screens, flow steps, or component families to
fill theoretical system slots. Standardize and facelift evidenced product jobs;
add a new category only when a demonstrated functional gap cannot be served by
an accepted pattern.

The first product-facing preparation pass keeps three recurring jobs distinct:
dense comparable data rows, rich navigable records, and compact metric
compositions. They may share Entity identity, Metric, Status, Copyable value,
and table-cell anatomy, but V1 must not hide their different behavior inside a
universal `Row` prop matrix. Metric regions own inline, headline-stacked, and
outcome-summary compositions; their parent owns framing and layout rather than
Metric becoming another Card primitive.

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
and `EmptyState`. Button owns the accepted action hierarchy, 28/32/44px scale,
icon spacing, focus, disabled, and loading behavior while leaving pressed and
long-label behavior open. Metric owns accepted inline and centered-headline label/value
anatomy; horizontal peers remain 16px/300, right aligned, and tabular. Its
parent owns framing, grids, help, and responsive composition. Outcome-summary
icon treatment and emphasis remain a visual decision, so that role is not yet
in the canonical API. Empty state owns only quiet versus user-resolvable absence
hierarchy; parent regions own height and framing, while bespoke illustration is
reserved for later review of meaningful evidenced states. A realistic
divider-free Index slice composes Entity identity with Metric values without
introducing a universal Row component.

Persistent product navigation is a Register extension, not a Button variant.
The Index DTF rail and its constrained-screen menu consume one route/current/
disabled model while composing it differently for available space. Generic
Link semantics remain intact. Review starts from faithful collapsed and
hover-expanded states of the real rail, not invented alternative directions.
The designer owns visual refinement while accepted foundation rules constrain
spacing, color, shape, icon, motion, and accessibility. The category exists
because repeated real product use demonstrates the contract, not because a
generic component catalog expects it.

The contained lab is designer/developer working metadata and remains English-only. This is not an exemption for migrated product UI: any copy that reaches product users follows the repository's Lingui and es/ko/zh translation rule.

Keep Tailwind, Radix, CVA, and local shadcn-style primitives as the implementation base. Storybook is deferred until the in-app lab demonstrates a concrete unmet need. Progress gates are independent: catalog maturity, rendered output, reusable implementation, production adoption, individual definition decisions, review, and verification must not collapse into one status. In particular, a rendered proposal may be only a specimen; the catalog must say whether a reusable canonical candidate actually exists and whether any product consumer has adopted it. Missing capabilities use explicit statuses and subdued styling, never disabled navigation, because their detail pages are part of the planning surface.

Composition review readiness is a separate gate. A composition is ready for
canonical V1 review only when every visually meaningful dependency is either a
reusable V1 candidate or an explicitly retained domain/behavior primitive.
Otherwise label the composition provisional, blocked, or exploration-only,
state exactly what the reviewer may judge, and list the unresolved dependency.
A canonical child inside hand-built framing does not make the parent
composition canonical.

The minimal canonical interaction kernel now includes `Button`, a 20px square
binary `Checkbox`, a named compact 32px `IconButton`, and a Radix-backed
`Dialog` shell. Checkbox promotion covers checked, unchecked, focus-visible,
and disabled states only; indeterminate, invalid, and rich label/help rows stay
open. IconButton promotion covers the dialog/header action role only; tooltip,
toggle/selected, and invisible hit-target contracts stay open. Dialog provides
384px compact and 432px standard shells, the 24px content axis, anchored
header/body/footer regions, compact close action, and non-dismissible behavior.
Final elevation, consequential outcomes, illustration, and constrained-screen
adaptation remain provisional. These candidates are lab-only and have no
production adoption.

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
- Tabs use foreground text for the active item and supporting text for inactive
  items rather than primary blue. The text-only candidate follows the recent
  Index overview timespan treatment without an underline or wrapper, at 14px
  compact and 16px default sizes.
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
