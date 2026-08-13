---
title: Design System
updated: 2026-08-13
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

Real local golden screens are the canonical composition-testing surface; deterministic fixtures supplement live data for repeatable edge states. The lab's current evidence and Button state sheet document the existing system, not an approved new direction. The component catalog is product-shaped: established interaction-system references such as shadcn and Radix inform its vocabulary, but Register's audited needs decide what v1 defines, combines, or marks not needed.

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

The contained lab is designer/developer working metadata and remains English-only. This is not an exemption for migrated product UI: any copy that reaches product users follows the repository's Lingui and es/ko/zh translation rule.

Keep Tailwind, Radix, CVA, and local shadcn-style primitives as the implementation base. Storybook is deferred until the in-app lab demonstrates a concrete unmet need. Progress gates are independent: catalog maturity, rendered output, individual definition decisions, review, adoption, and verification must not collapse into one status. Missing capabilities use explicit statuses and subdued styling, never disabled navigation, because their detail pages are part of the planning surface.

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
