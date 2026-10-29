---
title: Design System Reference
updated: 2026-10-29
type: domain
sources:
  - docs/wiki/decisions.md
  - tailwind.config.ts
  - src/app.css
  - src/components/design-system-v1/**
  - src/stories/**
---

# Design System consumer reference

Follow [[design-system]] § Design authority: accepted Storybook examples and
their canonical owners define V1 appearance under the user's scoped direction
and accepted decisions. This page summarizes current consumption rules; it does
not turn historical studies or unaccepted previews into a second specification.

## Foundations

### Color and surfaces

Semantic tokens are the only styling authority. The theme boundary owns light
and dark values; components consume the same semantic alias in both themes.

- White is the ordinary content/page surface.
- Beige is structural substrate, revealed through deliberate seams between major
  white regions. The parent composition owns the gap that reveals it; section
  borders do not imitate that seam. It is not a generic component background.
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

Application page headlines and hero metrics use the neutral
`v1SemanticRoles.text.pageHeadline` role, including the Earn hero, overview DTF
name and Portfolio total. Reserve brand-blue `text.landingHeadline` for the
landing-page hero. The blue app-title trial was withdrawn. Section/panel titles,
subtitles, ordinary values and performance colors retain their existing treatment.
Color follows the content's role, not its heading level or type size. Production
adoption remains separate from the V1 examples.

Use the named roles in `src/components/design-system-v1/typography.ts`.
Financial values use Lausanne with tabular numerals. Monospace is reserved for
machine identifiers such as addresses and hashes. Inline label/value pairs share
size and line height. Choose a type role for the whole row before styling either
side; use weight or color for emphasis. Do not combine the 14px `label` role
with a 16px value on one horizontal row. A distinct larger lead and smaller
supporting text is an explicit composition, not the default for ordinary paired
data. Vertically stacked field labels and values retain their separate roles.

### Spacing and layout

Use the intent-named relationships in
`src/components/ui/v1-layout-recipes.ts`. Equal pixel values do not make two
relationships interchangeable.

Ordinary mobile sections use 20px outer padding in both axes. Align the global
mobile header to that same inset around its control frames. The reviewed pilots
apply this below 1024px; desktop keeps 24px ordinary-content insets. Internal
content gaps, full-bleed plots and floating-control surrounds retain their own
relationships. This accepted direction is implemented in the pilots; existing
shared defaults require a separate adoption pass.

The accepted structural language favors flat semantic surfaces, square content
regions, substrate reveals, and explicit separators. Rounded cards, borders, and
elevation appear only when the component role calls for them. Radius roles are
0 for structural regions, 8px for floating surfaces and messages, 4px for nested
items inside them (menu rows, options, the checkbox mark, chain badges), and full
for pills and round controls. Floating surfaces use `shadow-sm`; dialogs and
drawers use `shadow-lg`. Component-owned geometry, such as the 12px checkbox label
gap or the 12px gap after a 32px identity mark, is not off-scale.

Width is normally composition-owned. A component should fill a container only
when that is part of its role; documentation should use a realistic maximum
width rather than stretching every specimen into newly available space.

### Motion and accessibility

Use motion to communicate state or continuity, never as decoration required to
understand the result. Durations are 120ms for feedback and hover transitions,
180ms for small overlays (menu, popover, select) and 240ms for dialogs and
drawers. Overlays ease out on enter; dialogs, drawers and disclosure ease in on
exit. Reduced motion removes overlay
entrance and exit animation. Because the animation plugin scopes its enter/exit
rules to `data-[state]`, durations and reduced-motion overrides must use the same
state scope (`data-[state=open]:duration-180`,
`motion-reduce:data-[state=open]:animate-none`), or they silently lose. Icons
inside controls (Button, IconButton, Menu, Checkbox) use a 2px stroke. Preserve visible focus, keyboard
operation, semantic names, target sizes, and contrast in both themes. Items
inside a contained track (Tabs, contained Segmented control, Single choice) use
an inset focus ring, because the scrolling track clips an offset ring.

Visible control size and interactive target size are separate. Preserve the
accepted 28/32/44px component geometry; generic 44px touch-target guidance does
not authorize scaling controls or enlarging their visible styling. Assess and
verify hit areas in the actual composition. Deferred target expansion remains
accessibility work before production adoption, not an exemption or a completed
check.

## Core component rules

### Button and ActionGroup

Button tones are primary, secondary, quiet, and destructive. Sizes are micro
(28px), compact (32px), and default (44px). Only use sizes and variants exposed
by the canonical API.

Buttons are intrinsic width by default. Compact/micro actions remain at their
natural width in dense horizontal groups. A deliberately vertical default-size
action group normally shares the available width. Do not stretch compact actions
merely to align them with a container.

Loading keeps the action's hierarchy, tone and height stable, shows a leading
spinner, prevents repeat activation, and uses truthful operation language; the
width follows the loading label. Destructive confirmation pairs
the destructive action with an explicit safe exit.

### IconButton

Use only the sizes and treatments exported by the canonical IconButton. Do not
invent matching sizes merely because Button supports them. Every icon-only action
requires an accessible name; tooltip text is supplementary, not the name.
A square icon action uses IconButton rather than an icon-only Button with copied
sizing (Pagination's previous/next follow this). A close action matches its row:
quiet beside a title or icon, bordered beside bordered controls.

### Checkbox

Checkbox is an independent yes/no choice, usually submitted with a form; an
immediate on/off setting uses Switch. One label element wraps the 28px target and
its text, 12px apart. Single-line labels center on the box. A wrapping label
start-aligns the row and pads its 16px/24px text by 2px so the box centers on
the first line. The unchecked box uses the muted-foreground border so it stays
visible (at least 3:1). Disabled boxes keep their label and state visible.

### Field, TextInput, and Textarea

The canonical Field owns label, control, help/error, read-only, disabled, and
adornment anatomy. Labels and supporting text align with the control edge.
Business validation and multi-field composition remain consumer-owned.
Error messages use the danger feedback foreground so they clear 4.5:1 in both
themes; the destructive fill colour is too light for 14px text.

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
return, and destructive-item treatment. Destructive items use the danger
feedback foreground (text contrast at least 4.5:1) after a separator. The caller
owns action wording and availability. Do not use a menu to hide the primary task.
A single-choice menu aligns to the start of its field and marks the selected
option with a trailing check.

### Minimal Popover shell

Popover presents supporting content anchored to a trigger. It is not a Dialog
replacement. Use the canonical surface, focus, dismissal, and collision behavior;
the caller owns content structure and gives it an accessible name. The shell has
no padding of its own and caps width at 320px. Text content uses the 16px
nested-content inset; option lists use the 8px popup inset with their own rows.

### Dialog

Dialog is the only V1 modal: centered on desktop and attached to the bottom edge
on phones. Do not use a desktop Drawer or slide-out; Drawer is limited to the
mobile navigation panels and closes at the desktop breakpoint ([[decisions]]
2026-10-27). The V1 Drawer follows the same rule as Dialog: a bottom sheet on phones
and a centered 432px modal, at most 640px tall, from 640px. Long menus scroll under
the 32px navigation overflow fade. Its panel header uses the quiet close. Long content scrolls in the body while
header and action regions remain stable. Dialogs do not nest. Routine reversible
tasks need one completion action when shell dismissal already cancels;
destructive confirmation adds an explicit safe exit.

Simple dismissible tasks put the title and quiet close action in one row. Long
titles wrap beside the control. When a relevant topic icon helps recognition,
place it opposite the quiet close action and leave 16px before the title below.
Transaction headers keep their contained controls and matching 32px bordered close
action. The close action matches its row: quiet beside a title or topic icon,
bordered beside bordered controls. A bordered close beside a title or icon is the
row's only heavy shape; do not use one style for every dialog. Do not leave a close action alone in an empty row immediately above the
title, or add a topic icon solely to fill space. Dialog Docs shows allowed header
compositions in separate documentation/specimen frames. The inert Avoid
illustration has a destructive-tone annotation outline, heading and crossed-circle
marker outside the header; these are documentation cues, not dialog styling. The working
liquidity examples reuse one story-owned composition of canonical primitives;
shared DialogHeader defaults and transaction owners are unchanged.

Within the asset-information dialog's continuous white body, separate content
groups with whitespace. Tabs below a dialog title sit 16px under it and 16px above
the content they switch; equal boxes read as an even rhythm because the large
title's line spacing already adds visible space. A long disclosure inside
a dialog uses the Collapsible Show/Hide cue and may cap the dialog height so the
body scrolls instead of the dialog growing to full height, with the product-navigation
32px overflow fade over the clipped edge. Do not imitate structural substrate with beige hairline
dividers across that surface.

Example dialog bodies do not define approved product flows. Consume the shell
with the product-owned content and actions.

### Metric anatomy

Metric presents a label and formatted value; its parent owns grid, alignment,
and surrounding surface. Inline peers use consistent typography. Headline metrics
may use stronger hierarchy when the canonical variant names it. Missing, loading,
zero, and stale values must remain semantically distinct; loading uses a Skeleton
bar, not a Spinner. `MetricValue` is the shared seam for formatted numbers (tabular
numerals). Table facts stack their label over it, and auction records pair label
and value in a description list. Never set a 14px label beside a 16px value on the
same row.

### EntityIdentity

EntityIdentity pairs a mark, a name and an optional supporting line. It never grows
past its container: long names end in an ellipsis unless `wrapName` is set. A 32px
mark is the large size (`ChainBadgedLogo` xl or `data-entity-logo-size="xl"`) with
a 12px gap; smaller marks use 8px. Table rows use `nameLeading="compact"`
(16px/20px). Compact density pairs a 14px name with a 24px mark. Loading reuses the
table identity skeleton.

### PerformanceValue

PerformanceValue shows a signed percentage, with direction in both sign and colour
and a hidden spoken label. Colours come from the `performance-positive` and
`performance-negative` text tokens. Positive is deeper than the chart line, so
text clears 4.5:1 on every light content surface, including row hover and the
beige secondary surface; both light tones are deeper than their chart lines.
Navigation and compact rows keep the 14px label size; table and card cells set it
to body. Do not rebuild it by hand.

### Lifecycle Status

Status text describes lifecycle truth, not visual tone alone. Keep compact pills
intrinsic width and use only accepted states. Wallet/network eligibility,
transaction lifecycle, order lifecycle, and financial performance remain
separate concepts.

### Copyable Value

Display a readable shortened identifier while copying the full value. Keep the
copy action associated with the value and announce success without replacing
consequential workflow feedback.

### Toast

Use the shared Sonner host for brief success or error feedback. Keep a simple
result to one line; add a description only when it conveys useful context.
Center the status icon and dismiss control against the full text block when a
description wraps.
Keep the title at its text line height with a 4px gap to the description; a
minimum title row height makes short two-line toasts look unnecessarily loose.
App feedback uses the shared top-center position. Sonner shows at most two
toasts per position and keeps hidden older toasts out of keyboard focus;
introducing another placement requires a stack review. Brief notifications
dismiss after five seconds, while errors with a description use eight seconds.
An explicit caller duration remains in force.
Sonner pauses on hover and while the page is hidden; keyboard focus alone does
not pause dismissal. Feedback needed for recovery or an action belongs inline
instead of disappearing as a toast.

### Skeleton and Spinner

Skeleton preserves the geometry of content that has not resolved, so nothing
shifts when it arrives. Size each bar to the line it replaces: a single-line value
fills its line box (24px for 16px/24px text). When lines stack, or a bar shares
its line with visible text, the bar takes the text size and is centered in its line
(16px in 24px, 12px in 20px), so lines stay separate. Table loading reuses the table's own cell skeletons, and every
placeholder in a row shares one vertical alignment. Spinner belongs to an active
operation. Do not replace a real structured loading state with explanatory prose
or use a spinner for an unknown-duration empty result.

### EmptyState

EmptyState covers a true absence, a filter with zero matches and a search with
no results. Its title names the cause, and it offers the relevant next action
when one exists (Clear filters, Explore DTFs). Quiet suits an expected absence
inside a region; tables pass it through DataTable `noResults`, without an icon,
instead of the generic "No results." default. Loading uses Skeleton.
Unavailable, permission-blocked and error states use Inline message, not
EmptyState; Holdings shows "Holdings unavailable" with Try again, because a DTF
always has a basket. A page whose sections all hide when empty shows one
EmptyState at `size="page"`: a section-title heading (h2 by default) and actions
that stack full width on phones. A filtered-to-zero state offers Clear filters.

## Complex patterns

### Navigation

Use GlobalNavigation and ProductNavigation from
`src/components/design-system-v1/navigation.tsx`. Preserve
their different jobs, responsive behavior, overflow, focus return, and current
context. Documentation hosts should use neutral/empty page regions rather than
fabricating approved product content.
Closed outer desktop and mobile global headers do not draw a gray bottom border
or a gray pseudo-element separator. Their host owns the structural seam; the
desktop composition uses the major beige seam. Preserve surface-appropriate
separation in the existing mobile beige/card header composition. Interior menu
and overlay dividers keep their own roles.

Navigation destinations use their surface treatment for hover and a visible
focus ring for keyboard focus; their labels do not gain a text underline. This
rule is specific to navigation, not a global reset of ordinary content Links.
The accepted appearance is recorded in [[decisions]] and guarded by rendered
light/dark seam and hover regressions.

The reviewed 44px floating product-navigation composition uses native 14px button
text, matching 60px frames and 8px surrounds. Preserve the circular switcher cue.
When space runs out, shorten Buy / Sell to Trade before hiding chat; measure
actual labels so translations adapt without shrinking controls. The compact
example keeps its defaults. Mobile/desktop transitions close overlays whose
triggers disappear and transfer focus to a visible navigation equivalent.

### Tables

Use the existing DataTable API and product-owned columns. The accepted visual
baselines cover Portfolio, Holdings, Discover, Earn, governance and auction
records, now preserved under Storybook Patterns / Market with their original
loading, missing, long-content and lifecycle states. These examples do not define
a universal Table/Row API.

HoldingsTable owns canonical TabsContent and binds it to the visible active tab
across its two responsive tablists. Hosts supply the Tabs root, not a second raw
panel wrapper. Preserve that name/control association when changing projection.

Keep comparable records full-width within their realistic content container.
Do not put active and historical tables side-by-side merely to save vertical
space. Sorting, filtering, selection, and pagination are opt-in DataTable jobs.

PopupFieldTrigger composes canonical Button and the popup geometry/chevron for
field-shaped Menu or Popover triggers: fixed 44px, 16px/300 text, and the same
20/18px text/chevron insets as Select. An optional context label sits left and the
selected value sits next to the right chevron; the whole field remains one button.
It does not change Menu/Popover semantics into a Select. Callers own accessible
names and wording. MultiSelectFilter always composes this field trigger; there
is no action-style alternative or presentation selector. Selection geometry must
not inherit action-only Button padding or content-driven height changes; use
the field owner even though its underlying interactive element is a button.

The Earn pilot's compact sort trigger uses this full-width labeled field;
SortMenu retains field/direction selection and focus behavior.
Field-like filter/sort triggers consume the same control-boundary role as search
and Select. Ordinary action controls retain their own semantic boundary.

For introductions that change above a table, reserve the tallest text slot at
the current width to avoid moving the filters. Keep inactive introductions out
of accessibility and mount only the selected table; this is a composition rule,
not a new fixed height or Tabs default.

### Charts

Use the actual Overview, Home, Discover, Yield and Portfolio renderers;
Storybook preserves each family under Patterns / Market / Charts. Preserve
truthful axes, units, source cadence, interaction,
keyboard inspection, range semantics, loading/empty behavior, and accessible
summaries. Never infer or alter financial calculations from visual similarity.
Multi-category charts assign the data series slots in order and never cycle; a
seventh category folds into Other. Colour marks identity only: values, labels and
legends stay in text colours, and a legend with values is always shown.

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
