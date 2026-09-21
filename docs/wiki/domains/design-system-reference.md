---
title: Design System Reference
updated: 2026-09-18
type: domain
sources:
  - docs/wiki/decisions.md
  - tailwind.config.ts
  - src/app.css
  - src/components/design-system-v1/**
  - src/stories/**
---

# Design System consumer reference

Use this page only when the Storybook library and canonical owner
do not already answer the question. It summarizes durable consumption rules; it
does not preserve project chronology or review evidence.

## Foundations

### Color and surfaces

Semantic tokens are the only styling authority. The theme boundary owns light
and dark values; components consume the same semantic alias in both themes.

- White is the ordinary content/page surface.
- Beige is structural substrate, revealed through deliberate seams between major
  white regions. It is not a generic component background.
- Neutral gray belongs to control or documentation chrome, not structural page
  borders.
- Feedback colors communicate success, warning, danger, and information.
- Positive/negative performance colors communicate financial movement and are
  separate from feedback severity.
- `interactive-content-hover` is opt-in for a whole actionable record. Static
  rows, nested controls, selected surfaces, and navigation keep their own roles.

Story canvas colors distinguish the specimen from its host. They do not prescribe
the component's production background.

### Typography

Use the named roles in `src/components/design-system-v1/typography.ts`.
Financial values use Lausanne with tabular numerals. Monospace is reserved for
machine identifiers such as addresses and hashes. Inline label/value pairs share
size and line height unless the component API names a stronger hierarchy.

### Spacing and layout

Use the intent-named relationships in
`src/components/ui/v1-layout-recipes.ts`. Equal pixel values do not make two
relationships interchangeable.

The accepted structural language favors flat semantic surfaces, square content
regions, substrate reveals, and explicit separators. Rounded cards, borders, and
elevation appear only when the component role calls for them.

Width is normally composition-owned. A component should fill a container only
when that is part of its role; documentation should use a realistic maximum
width rather than stretching every specimen into newly available space.

### Motion and accessibility

Use motion to communicate state or continuity, never as decoration required to
understand the result. Respect reduced motion. Preserve visible focus, keyboard
operation, semantic names, target sizes, and contrast in both themes.

## Core component rules

### Button and ActionGroup

Button tones are primary, secondary, quiet, and destructive. Sizes are micro
(28px), compact (32px), and default (44px). Only use sizes and variants exposed
by the canonical API.

Buttons are intrinsic width by default. Compact/micro actions remain at their
natural width in dense horizontal groups. A deliberately vertical default-size
action group normally shares the available width. Do not stretch compact actions
merely to align them with a container.

Loading keeps the action's hierarchy and geometry stable, prevents repeat
activation, and uses truthful operation language. Destructive confirmation pairs
the destructive action with an explicit safe exit.

### IconButton

Use only the sizes and treatments exported by the canonical IconButton. Do not
invent matching sizes merely because Button supports them. Every icon-only action
requires an accessible name; tooltip text is supplementary, not the name.

### Field, TextInput, and Textarea

The canonical Field owns label, control, help/error, read-only, disabled, and
adornment anatomy. Labels and supporting text align with the control edge.
Business validation and multi-field composition remain consumer-owned.

### Select, Combobox, and MultiSelectFilter

Select chooses one item from a bounded list. Combobox adds search or creation.
MultiSelectFilter represents a set of active filters and must expose applied,
empty, disabled, open, keyboard, and long-label behavior.

Use the canonical trigger and popup composition. Keep selected values visible or
summarized truthfully, preserve removal and clear-all semantics, and do not make
the closed trigger the only way to discover applied filters.

### Link

Link is navigation. Buttons perform actions. External destinations must be
visibly and accessibly identified by the caller. Dense inline field actions use
the canonical inline-action treatment rather than a visually stripped Button or
Link.

### Action Menu

Use the canonical menu trigger, balanced item row, keyboard navigation, focus
return, and destructive-item treatment. The caller owns action wording and
availability. Do not use a menu to hide the primary task.

### Minimal Popover shell

Popover presents supporting content anchored to a trigger. It is not a Dialog
replacement. Use the canonical surface, inset, focus, dismissal, and collision
behavior; the caller owns content structure.

### Dialog

Only bounded shell behavior is accepted. Long content scrolls in the body while
header and action regions remain stable. Dialogs do not nest. Routine reversible
tasks need one completion action when shell dismissal already cancels;
destructive confirmation adds an explicit safe exit.

Example dialog bodies do not define approved product flows. Consume the shell
with the product-owned content and actions.

### Metric anatomy

Metric presents a label and formatted value; its parent owns grid, alignment,
and surrounding surface. Inline peers use consistent typography. Headline metrics
may use stronger hierarchy when the canonical variant names it. Missing, loading,
zero, and stale values must remain semantically distinct.

### Lifecycle Status

Status text describes lifecycle truth, not visual tone alone. Keep compact pills
intrinsic width and use only accepted states. Wallet/network eligibility,
transaction lifecycle, order lifecycle, and financial performance remain
separate concepts.

### Copyable Value

Display a readable shortened identifier while copying the full value. Keep the
copy action associated with the value and announce success without replacing
consequential workflow feedback.

### Skeleton and Spinner

Skeleton preserves the geometry of content that has not resolved. Spinner
belongs to an active operation. Do not replace a real structured loading state
with explanatory prose or use a spinner for an unknown-duration empty result.

### EmptyState

EmptyState explains a true absence and offers a relevant next action when one
exists. Loading, unavailable, permission-blocked, filtered-to-zero, and error are
different states and must not collapse into EmptyState.

## Complex patterns

### Navigation

Use GlobalNavigation and ProductNavigation from
`src/components/design-system-v1/navigation.tsx`. Preserve
their different jobs, responsive behavior, overflow, focus return, and current
context. Documentation hosts should use neutral/empty page regions rather than
fabricating approved product content.

### Tables

Use the existing DataTable API and product-owned columns. The accepted visual
baselines cover Portfolio, Holdings, Discover, Earn, governance and auction
records, now preserved under Storybook Patterns / Market with their original
loading, missing, long-content and lifecycle states. These examples do not define
a universal Table/Row API.

Keep comparable records full-width within their realistic content container.
Do not put active and historical tables side-by-side merely to save vertical
space. Sorting, filtering, selection, and pagination are opt-in DataTable jobs.

### Charts

Use the actual Overview, Home, Discover, Yield and Portfolio renderers;
Storybook preserves each family under Patterns / Market / Charts. Preserve
truthful axes, units, source cadence, interaction,
keyboard inspection, range semantics, loading/empty behavior, and accessible
summaries. Never infer or alter financial calculations from visual similarity.

### Transactions

The transaction pattern is exploratory and paused. Zapper, Manual issuance,
Automated issuance, Stake/Unstake, and Vote Lock/Delegation keep distinct product
mechanics and information volume. Reusable components may standardize their
presentation, but no universal flow controller or production migration is
accepted.

Each transaction family exposes its original states through the state control.
Story controls are demonstration controls, not approved product actions. Keep
step navigation stable, preserve
entered values where the flow promises continuity, and distinguish wallet,
submission, confirmation, recovery, durable queue, and outcome states.

## Adoption checklist

- The relevant accepted decision covers the target scope.
- A canonical component or explicitly bounded product owner exists.
- The consumer imports the owner instead of copying a specimen.
- Product copy, data, money, permissions, and transaction behavior are preserved.
- Width and page placement remain composition-owned.
- Default, interaction, loading, empty/error, disabled, and responsive states are
  covered where relevant.
- Keyboard, focus, accessible naming, reduced motion, and both themes are checked.
- Production adoption and any engineer-review surface are explicitly approved.
