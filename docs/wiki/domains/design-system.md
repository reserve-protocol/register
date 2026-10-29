---
title: Design System
updated: 2026-10-28
type: domain
sources:
  - .storybook/**
  - src/stories/**
  - src/components/design-system-v1/**
  - src/components/button/**
  - src/components/icon-button/**
  - src/components/dialog/**
  - src/app.css
  - tailwind.config.ts
---

# Design System

Run `pnpm storybook` to browse the internal component library. Storybook replaces
`/internal/design-system` and the standalone lab. It renders real components with
local example data, without the product's wallet, RPC or analytics startup.
Examples are English-only; production UI remains localized.
Inline Docs specimens restore the app's Lausanne font stack at `.sb-story`;
Storybook's unstyled marker excludes element resets but does not stop inherited
Docs fonts. Surrounding documentation retains its own type. Keep this boundary
aligned with the font stack in `src/app.css`, so embedded and standalone views
have matching typography.

## Design authority

For V1 work, accepted Storybook examples and their canonical owners are the
visual source of truth. This hierarchy ranks appearance, not product safety,
copy permissions, SDK contracts or financial behavior. Resolve appearance in this order:

1. The user's current scoped direction and accepted decisions in [[decisions]].
2. The accepted Components/Patterns example and the reusable owner it imports.
3. [[design-system-reference]] for current consumption rules and pilot summaries
   below for their accepted scope.

Acceptance is scoped: rendering a story, an Explorations study or an in-progress
transaction pattern does not approve its design or product flow. Accepted pilot
feedback revises the contract for its stated scope; it does not approve every
pilot detail or production integration. Historical studies and existing app
styling are context, not competing V1 specifications.

Canonical primitives and semantic tokens do not by themselves make a composite
V1-compliant. Product references supply anatomy, data and wording; copying their
legacy visual treatments requires explicit user direction.

If a canonical implementation drifts from its accepted contract, correct that
owner when the task includes it. Do not preserve the defect as an alternate
presentation; a variant needs an evidenced distinct use. Preserve unrelated
consumers and production behavior; shared-default integration still requires
Engineer review. A story alone never authorizes production adoption.

Load this contract before generic design, UI, taste or coding skills. The project
overrides their house-card, financial-monospace and other generic style defaults.
Those skills supply workflow and quality checks, not another visual theme.

## Use a component

1. Find its story under `src/stories/` and import the same canonical module.
2. Check the exported props and the accepted decisions in [[decisions]].
3. Use the [consumer reference](design-system-reference.md) for visual semantics.
4. Keep production adoption scoped: an example is not approval to change product
   copy, money logic, permissions, shared defaults or SDK contracts.

Storybook is a demonstration host, not a second component implementation. Keep
fixtures small and local. Do not add review dashboards, status catalogs or
transaction simulators. Existing production `ui/` components retain their APIs
until their callers are explicitly migrated.

## Semantic tokens

Semantic Tailwind colors map to HSL CSS variables:

- Surfaces: `background`, `card`, `container`, `popover`, `muted`, `secondary`, `accent` — each with a `-foreground` pair.
- Brand/intent: `primary`, `success`, `destructive` (+ `-foreground`); `warning` (no foreground pair).
- Lines/inputs: `border`, `borderSecondary`, `input`, `ring`.
- Data viz: `legend`, `tvl`, and the proposed ordered data series `series-1`…`series-6` (`bg-series-1`, or `hsl(var(--series-1))` in chart fills). `--chart-1`…`--chart-5` are unvalidated legacy variables with no Tailwind mapping; new charts use the series slots.
- V1 semantic roles (feedback, performance, substrate, recessed content, disabled structure, brand, hover/pressed and status tokens) live in `src/app.css` and are consumed through `design-system-v1/semantic-roles.ts`; prefer the role over the raw token.

`container-foreground` and `legend-foreground` are mapped in Tailwind but their
CSS variables are undefined; do not rely on them until both themes define them.

Overview stories import the real price/candlestick bodies and shared pure chart
helpers. Other chart families retain their original local presentation sources.
Storybook aliases chart atoms and the token-logo icon atom to local fixtures,
avoiding wallet startup through application state. Do not copy production chart
calculations into stories.
Automatic React prop extraction is disabled because its parser fails on the
application's generic state graph; supported controls use explicit args/argTypes.

## Sources

| Need                                      | Owner                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Component examples and interactive states | `src/stories/`                                                          |
| Reusable implementation                   | The canonical module imported by its story                              |
| Accepted design rationale                 | [[decisions]]                                                           |
| Consumer guidance                         | [[design-system-reference]]                                             |
| Semantic colors and theme values          | `src/app.css` and `tailwind.config.ts`                                  |
| Typography and semantic relationships     | `src/components/design-system-v1/typography.ts` and `semantic-roles.ts` |
| Layout relationships                      | `src/components/ui/v1-layout-recipes.ts`                                |
| Browser behavior checks                   | `e2e/storybook/`                                                        |
| Production-flow coverage                  | `e2e/TEST_MAP.md`                                                       |

When sources conflict, repository safety rules and accepted decisions take
precedence over examples. Preserve accessible names, focus, keyboard behavior,
reduced motion and contrast. Use semantic tokens; compositions own width and
placement. Financial values use Lausanne/tabular numerals, with `Amount`/`bigint`
retained through money logic. Monospace is for machine identifiers.

## Patterns and adoption

Navigation, table and chart stories preserve the original compositions and edge
states. They do not define a universal page, row or chart API. The repository
coverage map, `src/stories/COVERAGE.md`, maps removed design areas to current stories.
Auction groups use lifecycle names: Active and upcoming auctions, and Completed
and expired auctions. The alternative detail workspace stays under Explorations.
Foundation/layout studies and historical modal alternatives remain browsable.
Foundation spacing guidance distinguishes 20px ordinary mobile sections, 24px
desktop sections and 16px nested content. The responsive inset study demonstrates
each with equal padding on all four sides; narrowing a section alone does not
make it a nested-content context.
The Control geometry grid consumes canonical Button, IconButton, TextInput,
SearchField, Select and SegmentedControl owners at their supported sizes. It
demonstrates the current components rather than maintaining copied control CSS.
TextInput and SearchField have no compact specimen because their API exposes
only the default size.
Keep Storybook copy brief: an import path and useful usage notes. Migration records
and coverage tables belong in the repository, not the Storybook interface.
Keep Storybook-only state labels outside the framed specimen. A caption above
the preview distinguishes documentation from text owned by the component.
Transaction modal stories use a simple reopen button after dismissal when no
approved surrounding product context exists. Do not invent launch cards to keep
the modal accessible for repeated inspection.
Transaction Docs put their state control directly above the preview it updates.
The primary state appears once; separate story entries show the other selected
examples.

Use Docs for usage guidance and source, Controls for supported props and fixture
states, and Accessibility for axe results. The sidebar separates canonical
components, product compositions and explorations. Automated scans supplement
manual keyboard and visual review; they do not certify accessibility.
Story names use sentence case with acronyms kept (`name: 'Staked RSR'`); set
`name` rather than renaming the export, so story ids stay stable. Every component
Docs lede starts with its module path and states its usage rules. In dark theme,
Docs canvases paint the dark background so inherited text stays readable on the
light docs page, and the interactive "Show code" bar sits below the canvas.
Button, Icon button and Action group lead Docs with static system examples. Their
Controls belong to the following Interactive example, so changing a prop updates
that example while the system overview stays fixed. Those supporting stories are
docs-only; each component has one sidebar entry. Button Docs also records the
canonical size and spacing values alongside brief behavior guidance.
Other component Docs with a first Playground story show that story once as an
Interactive example with its Controls directly above the preview. Distinct state stories
follow under Examples. The editable story remains addressable for direct tests
but stays out of the sidebar.
Default Docs and custom interactive pages put Controls directly above the
preview they change. Portfolio tables Docs shows one short desktop example;
its width control switches between desktop and phone, and its family and state
controls replace repeated full lists. Individual state stories remain available.
Standalone portfolio stories retain the full fixtures and row expansion; only
the Docs specimen uses the shorter sample.
Long pattern Docs for Holdings, Earn, Governance, chart states and families,
completed auctions, and the exploratory auction workspace likewise show one
connected preview. Their standalone stories keep the full state catalog.
Holdings Docs samples three rows while its standalone stories retain the full
fixture. The preview selectors sit above the result they change and only offer
states that affect the selected family or layout. Fixture caveats for the
alternative auction workspace sit in Docs instead of inside its specimen.
Discover Docs opens a short desktop table with width and state controls directly
above it. The width control exposes compact cards and phone layouts; the
separate Table story keeps the full fixture. Discover itself switches to cards
below a 1152px container width. The separate Feature Cards story uses the
Home featured card with its transcript, video action and full launch chart;
the rounded production presentation receives square V1 framing only in the
Storybook specimen.
Focused loading, missing, inactive and long-content stories show only the
relevant one or two records.
Focused pattern stories use a neutral substrate to reveal card boundaries.
They fill and center the standalone preview, while Docs examples stay
content-height so one short specimen does not add a viewport of scrolling;
wide page compositions remain top-aligned.
Manual and automated mint Docs use that same neutral substrate with even
24px space around the two-column workspace at desktop widths. The workspace
fills the available width inside the Storybook surface instead of stopping
at a narrower specimen cap.
Wide pattern Docs opt into a 1440px content cap through the neutral story surface
or `data-wide-docs`. Market table Docs can opt into a 1152px minimum preview
width for desktop examples, with horizontal scrolling inside the preview when
the Docs pane is narrower. Their explicit compact and phone examples remain
narrow. The standalone Discover Table story also keeps its table layout within
an internally scrollable preview; other standalone stories remain responsive.
These scoped Storybook host overrides give wider compositions their intended
layout without widening component Docs.
The desktop navigation specimen has no mock Overview body. Its destinations
move into More as its container narrows, and its taller product rail determines
the Docs example height.
The mobile navigation specimens likewise show only the actual header or bottom
controls over an empty substrate. Their closed previews stay compact and expand
to show the full menu when opened; fabricated page headings and cards are not
part of these specimens. Header preview hosts reserve a content-box viewport
canvas while a utility region is mounted, matching its viewport-bounded panel
and allowing the frame border outside that height. Connected, transparent and
narrow variants use the same rule; closing utilities restores the compact host.
Short screens scroll inside the utility panel so the last language option remains
reachable. Canonical header/utility behavior and pilot geometry are unchanged.
Closed outer desktop and mobile global headers own their surface without a gray
bottom border or pseudo-element separator. The desktop composition separates that
surface from the product region with the major beige substrate seam from
`v1LayoutRecipes`. Interior menu and overlay dividers keep their own roles.
Global and product destinations use their surface hover cue without underlining
the label; keyboard focus remains visibly outlined. These are accepted system
rules in [[decisions]], enforced by rendered light/dark regression checks. Do not
reintroduce the gray separator or hover underline as a fallback/default.

## Reuse in screen pilots

Use the complete reviewed composition when one exists, including identity,
controls and state coordination. Extract it for both lab and pilot when hosts
need different positioning. Canonical primitives can cover an interaction when
no complete pattern exists. Page experiments stay local until accepted.

The user accepted 20px ordinary mobile section insets in both axes, including
header control frames. The pilots apply this below 1024px. Their 32px header
controls sit inside a 72px header plus 1px seam. Desktop ordinary content retains
24px. The pilot root supplies --screen-content-inset from spacing.5; pattern
owners consume it with a spacing.6 fallback. Standalone defaults and the shared
ordinary-content recipe are unchanged. See [[design-system-reference]].

The final mobile/accessibility pass
keeps ordinary-size geometry while allowing native controls to wrap with larger
default fonts. The fixed header's measured spacer grows with it; its height also
bounds utilities and content focus clearance. The overview measures floating-frame
height for bottom content/focus clearance, including wrapped controls. Dialogs
restore persistent triggers and drawers remember the clicked opener rather than
assuming Safari focused it. Responsive headline line-height ratios preserve
default values while avoiding overlapping enlarged text. The focused accessibility
spec runs in Chromium and mobile WebKit; physical Safari/VoiceOver, native keyboard
and safe-area acceptance remain unverified. The user's palette-preservation
direction leaves the named contrast findings in that report for color review.

`screen-pilot-layout.ts` owns viewport observation, capped frame fit, responsive
navigation and support-column thresholds for both pilots. ScreenPilotHeader
composes the canonical navigation and drawers; mobile drawers close when desktop
navigation replaces their triggers, and desktop overflow closes on the reverse
transition. Dismissal returns focus to a visible equivalent. Overview preserves
its beige-at-top/card-on-scroll phone header below 640px; tablets and desktop
keep the card header. Earn uses the card surface.
Neither presentation changes production navigation.

`product-navigation-patterns.tsx` owns the shared desktop product rail and phone
drawer content. `mobile-product-controls.tsx` owns the complete native 44px
floating composition: 14px action text, 60px frames, 8px padding/insets, and 44px
mark/circular cue with a 2px switcher gap. It measures canonical full/short action
buttons against available space: Buy / Sell becomes Trade before chat hides.
English keeps its reviewed 360/336px minimum breakpoints; longer labels adapt
earlier. Invisible non-focusable probes reserve no layout/scroll area. Resize
and font/translation width changes remeasure the same owner.

Patterns / Navigation / Mobile Product retains compact controls. Mobile Product
44 demonstrates the pilot composition with English/Spanish/Korean/Chinese action
labels and real drawer interactions. Other fixture copy stays English. Shared
message descriptors in `product-navigation-messages.ts` keep both approved labels
owned by translation extraction. Existing catalog translations are preserved.
The Reserve wordmark still compresses before account identity: Connect uses
320px of inner space and the connected-wallet example uses 352px.

## Current pilot summaries

Application page identities and hero metrics use neutral foreground; the landing
hero keeps brand blue. These separate headline roles are described in
[[design-system-reference]] and do not change section titles or type sizes.

- Index DTF overview: PHOTON
  chart, Holdings, reviewed navigation and embedded CMC20 zapper reference.
  The chart keeps its gradient; rail and zapper surfaces remain square. Expanded
  rail shadow, temporary blank scroll regions and support geometry stay local.
- Participate and Earn: current
  category copy, white phone hero with paragraph facts, intrinsic stable hero
  height, intersecting filters and full-width Index/Yield compact sorting.
  Field-like DTF/sort triggers use the same control boundary as search/Select.
- Compliance corrections: field-trigger geometry, sort title/value anatomy and
  Holdings panel association. PopupFieldTrigger now owns the canonical
  field presentation; MultiSelectFilter now uses it as its sole default.
  HoldingsTable owns canonical TabsContent and the visible trigger association.

A Button dependency geometry audit
found no further inherited sizing regression beyond the corrected filter and
later sort composition. Its separate stale-reference and mobile-utility preview
findings were corrected through canonical study controls and open-state host
containment. `e2e/storybook/control-geometry.spec.ts` guards rendered dimensions
and unclipped panel/last-option access; native sizes alone do not prove visibility.

Both pilots use historical fixtures and static reference actions where execution
is deferred. Earn duplicates fixtures only for density. Neither pilot establishes
live financial truth, production navigation, account behavior or transaction/chat
integration. Their Docs controls carry selected state to Open full screen, above
a contained desktop-width preview. Detailed remaining compositions and fixture
boundaries live in the current summaries rather than successive trial notes.

## Overview layout proposal

The overview page geometry is proposed under Explorations / Screen layouts /
Index DTF overview. Its region diagrams compare frame width, outer gutters,
support width, reading order and expanded navigation. Keep it separate from
approved foundation relationships and existing component behavior until the
designer reviews the proposal. A partial screen pilot now tries the recommended
settings without approving them. Exact column widths and seams are illustrated;
section heights are not a chart or page-height contract.

## Toast and pending component explorations

Toast is accepted under Components / Feedback and overlays. Its Storybook
example calls the same `src/components/ui/sonner.tsx` host as the app. The
legacy exploratory story ID remains for existing deep links. The shared host
uses a compact status surface, a 44px inside close target, and one top-center
placement with two visible toasts. Sonner applies the limit per position, so a
new placement needs an explicit stack review. The host uses a five-second
default. Detailed errors use eight seconds; existing explicit
per-toast durations remain authoritative. Sonner pauses while hovered or the
page is hidden; keyboard focus alone does not pause dismissal. Hidden stacked
toasts are removed from keyboard focus. Toasts announce transient results;
errors requiring action or sustained attention remain inline. Action/retry
toasts are not part of the accepted contract.

Activity chart (Dashboard (unreviewed), with an Overview page) proposes the first
dashboard pieces: `ChartPanel`, `ChartLegend` and `useChartInspection` in
`design-system-v1/chart-panel.tsx`, and `CategoryBarChart` with pure data helpers.
The panel keeps the Market chart idiom: the header and legend show the period total,
and pointer, tap or arrow-key inspection shows one bucket instead, announced in a
polite live region. Inspection clears when the bucket count or the caller's reset
key (data identity or state) changes. It owns insets (20px, 24px from 1024px) and loading, empty and
unavailable states, not a surface. Bars stack categories in series-slot order with
2px gaps (dropped below 6px bars; dense ranges close the gaps between bars), square
ends, an axis fitted to the tallest stack and a lighter partial current bucket; diverging layout draws
chosen categories below a baseline from the same data.

Data contract: one `CategoryBucket` per UTC day (`start` in unix seconds, `values`
keyed by category, `partial` on today). `bucketsForPeriod` keeps up to 90 daily
buckets and groups longer periods into weeks ending on the latest day;
`formatCompactValue` gives $13.6M and 12.4K; headers and legends receive formatted
values, so units stay the caller's. Display values are numbers aggregated off-chain.
`headline="panel"` sets the 20px panel headline inside a page; the default `page`
suits a chart that is the page's main figure. Dashboard (unreviewed) / eUSD
activity layout composes the pieces: one page-level period control scoping both
panels, content regions on the structural substrate's 2px seams as in the screen
pilots, and a map placeholder. Open decisions: withdrawals stacked or below the
baseline, time ranges, cards or flat regions, and the countries map.

Slider and Progress indicator remain under Explorations / Component proposals
for review, separate from accepted Components. Their examples reuse canonical
Slider, TextInput, Progress and Spinner owners with product wording already in
use; new proposal work does not change those shared owners. The shared Slider uses a neutral muted 6px
track and a blue circular thumb separated from the filled rail by a 2px
card-surface gap. Its hover shadow remains subtle, and its disabled state dims
the control. The Progress specimen uses the same track color inside its white
example surface. The shared Progress primitive retains its existing default.
Neither exploration is an accepted V1 component contract.

Slider now proposes optional exact entry using the canonical 44px TextInput.
Both controls share the example's 0–100 bounds and configurable positive step,
defaulting to 1. The Stepped example opts into 5; fractional increments are also
supported. These bounds and percent units are fixture context, not restrictions
on the shared Slider. Invalid
drafts retain the last valid value and display the browser's connected validation
message below the complete control; it does not separate the input from its
track. Changing entry mode resets that draft and feedback. Its story-local
React specimen owns live value changes because Storybook’s lower Docs Examples
force initial args. Keep preview hooks in the story render and live React state
in its child; changing a number must also move the actual thumb. Range selection,
marks and arbitrary financial precision are excluded. The local percentage is
not on-chain math. Slider Docs uses numeric value/step controls, hides callback
rows, and shows an invalid-entry fixture without taking focus or scrolling.
Progress proposes a meter for quorum, a counted progress bar
for measured work, and Spinner for unknown duration. A closed threshold preserves
its supplied value; the illustrative Orders filled fixture declares four total
orders. Failures require inline feedback and the last known reading, not a reset
or fabricated percentage. Signing/confirmation remain transaction-owned steps.
Progress Docs now leads with a story-local Index proposal-details voting card:
quorum, majority support, For/Against and Abstain, composed from canonical
Progress, Skeleton, V1 typography and semantic colors. Proposed bar tracks and
fills, including unavailable/loading rails, are 4px with square ends; transitions
honor reduced motion. The composition uses flat
white groups with one substrate seam between criteria and vote totals (the
Current/Final votes heading sits inside the first group on the content inset), and plain
16px/1.5-stroke Lucide icons, following
the accepted icon treatment; legacy icon tiles and rounded outer borders are
excluded. For, Against and Abstain share one row from a 32rem card width and two
equal columns below it, each label/value pair on one line, matching the other
statistics, without a vertical divider. Spacing separates
rows inside each group; loading mirrors this grouping. Criterion headers use a
shared 24rem card-width boundary: below it both labels sit above left-aligned
readings; at/above it labels and readings share one line. Loading follows the
same transition. This is local proposal geometry, not a global breakpoint. Decorative vote icons are omitted when the
composition is narrower than 22rem so labels, values and 20px insets remain intact.
Scenario fixtures cover
no votes, partial/reached/over-target quorum, opposition, ties, abstain-only,
missing target and loading, plus 1%/99% quorum, 51% support, unanimous opposition
and zero-challenge boundaries. Current/Final phase is independent of the tallies.
Known quorum fill caps at 100% while actual amounts stay visible; unknown targets
retain the known current amount with explicit Target unavailable wording and no
fabricated meter; no directional votes shows a dash with real
screen-reader explanation text. Majority fill and visible percentage always
represent For among directional votes, including opposition and zero support.
Explicit fixture outcomes distinguish supported/opposed/tied independently of
rounded percentages. Supported readings use success, opposed readings use danger,
and tied readings use a visible neutral fill with Tied and 50% For. Standalone
and contextual quorum use one local status-tone selector: current unmet is
informational, reached is success, final unmet is danger.
Optimistic proposals have separate challenge-only snapshots: known zero is
neutral, positive challenge is adverse, and unknown targets stay distinct. Static preformatted display fixtures
do not calculate SDK state or imply an overall proposal outcome. Mobile groups
retain equal 20px padding. This is a review proposal, not production adoption. The rejected title/description page example
was removed; review stays focused on the voting card and its states. Surrounding
page layouts require their own accepted design-system composition.
The generic Progress proposal does not replace governance proposal-list lifecycle
indicators. ProposalStatusBar remains their owner in production and the governance
Storybook pattern, preserving its distinct stages and stage progress. Existing
simple Progress uses include proposal-detail timelines and Yield DTF quorum and
majority statistics. The Orders filled count exists in async mint, but the
four-order bar here is illustrative, not an approved insertion into that flow.
Unknown waiting reuses the Loading story’s Spinner and Loading balances wording.
It is a generic specimen, not the Zapper quote-loading UI. The Zapper reference
keeps its animation, stage pill and timer; production uses the packaged Zapper
widget. Specialized transaction/rebalance progress remains owned by its pattern. There is no blanket progress-indicator migration.
These are proposals, not accepted component contracts. A browser check found that the shared Progress wrapper
had omitted the value it received from the accessible Radix root; the wrapper
now passes it through. The shared Slider forwards its accessible name to the
focusable thumb.

Transaction compositions remain exploratory. Distinct issuance, zap, staking and
vote-lock mechanics stay product-owned. Story states never certify protocol
behavior, source freshness, financial calculations or production adoption.
Their Docs proposes a shared presentation hierarchy for input, commitment,
recovery and outcome while keeping each family separate. Zapper's Bounded dialog
proposal composes the existing reference inside canonical Dialog for focus,
dismissal and viewport scrolling. Only its opt-in `dialog` presentation lets the
Dialog own the 8px frame inset; default modal and embedded geometry stay intact.
The proposed host uses standard 432px Dialog width; the original 448px reference
is retained. Core states scroll content above a fixed action area; advisory and
outcome attachments retain whole-composition scrolling. It starts from a simple
Open Zapper button and restores that opener.
Dialog Docs documents three allowed header compositions: title with a quiet
close action; a meaningful topic icon opposite a quiet close action, then a 16px
gap before the title; and the existing transaction control row with matching
32px bordered close action. The close action matches its row, so non-transaction
dialogs keep the quiet close. Static header-only illustrations are inert; the
empty close-only row is separately labelled Avoid and is not a task variant.
Each example separates documentation in a bordered annotation panel from its
white, inert header specimen on a neutral stage. The Avoid annotation has a
destructive-tone outline, heading and crossed-circle marker; those review cues
stay outside the product header and do not establish error-state dialog styling.
The working liquidity task has title-row and topic-icon examples sharing
`dialog-task-header.tsx`, composed from canonical Header/Title/Description and
IconButton. No shared default or transaction owner was changed.
Dialog Docs now leads with the real basket-builder liquidity-simulation task,
composed from canonical Dialog regions, Button/IconButton, TextInput and Slider.
Its $10,000 default, $10–$100,000 range, step-100 slider, exact integer entry and
blur clamping come from the current task. Draft edits are local; dismiss discards,
Simulate applies the setting and closes, and reopening restores the applied value.
It does not run the simulation engine. Only width is an authoring control for
this dismissible form. Eligibility uses the canonical standard 432px desktop
width; the 544px trial is superseded. Attestation dividers remain removed.
The form groups use an explicit 20px vertical gap with content-sized rows;
body edge padding is separate. Checkbox centers align with the first text line
using the canonical checkbox at its native size. The topic-icon row leaves
16px before the title. The jurisdiction disclosure remains secondary: a native
quiet 32px muted chevron centers against the full statement, with foreground
hover/focus. It now points down and rotates when expanded. The checkbox stays
first-line aligned; the blue underlined link still opens external documentation.

Jurisdictions now expand inline beneath their statement, superseding the
separate-view/back-button and one-country-per-row trials. Complete entries flow
as semicolon-separated inline list items at the existing supporting-text size;
internal commas and policy wording remain unchanged. The expanded label and list align
with their statement's text column using the 40px checkbox-target-plus-gap indent.
The full-width trial is superseded: restoring the indent preserves the grouping
of these details with their confirmation.
There is no inner height cap, scroller or fade: canonical DialogBody handles any
short-screen overflow while header and confirmation regions remain stable.
The disclosure preserves checkbox selections and retains focus on toggling.
Accepted 2026-10-28 as the V1 eligibility presentation ([[decisions]]); it is not a
production policy change.
Existing copy, text sizes and shell insets are retained. Eligibility hides width controls because its current
review uses one fixed width. Both eligibility specimens remain non-dismissible and
have no in-dialog close icon; Close preview in the Storybook manager toolbar
closes them externally and restores their opener. That review-only control is
limited to Dialog Docs and the two eligibility stories; it is not product UI.
No policy or transaction geometry is changed.

Dialog Docs also includes two accepted informational examples ([[decisions]] 2026-10-28). Whitepapers
use the app's actual CFB v2/v1 labels, October 2025 publication date, nine change
entries and PDF URLs, captured in a local fixture. Each flat version row groups
its title and supporting detail opposite the PDF action. Both version rows stay
together (16px apart) and the change summary follows 16px below, so expanding it
never hides a PDF action. It uses canonical V1 Collapsible with its native
48px/16px trigger, chevron, focus, content padding and motion, plus the Show/Hide
cue so the row reads as expandable rather than as a third version. Body spacing
counts the trigger's own 12px padding. Entries sit 8px apart, and the dialog is capped
at 640px so the expanded log scrolls in the body. While expanded, the
product-navigation 32px overflow fade softens the clipped edge, and 24px end padding
keeps the last entry clear of it. Its surrounding container extends by the same 16px
as the control-owned inset, aligning disclosure text with version rows without
overriding component geometry. This supersedes both the inset Accordion and
custom InlineAction/raw-Collapsible trials. Expanded entries share the version
text column. The retained unstyled behavior wrapper in eligibility is a scoped
exception, not a general alternative to the accepted Collapsible owner. Canonical Link supplies the external arrow and
new-tab announcement; the accessible action name identifies the version. Only
the body scrolls and there is no submission footer. Asset information now leads with the same NVIDIA/Ondo content as the product
reference, sourced from captured Discover asset metadata and provider snapshots.
The BTCB/Bitcoin and BSC Bridge variant remains separately available. This
supersedes the all-left stack, narrow label/value grid and 256/320px body trials.
Reference and held-token regions have group labels and full-width canonical
EntityIdentity rows with the same two-line anatomy. Right-side context chips are
removed: the native exchange/chain already appears in its supporting line, and the
held token uses the canonical chain badge with chain name and inline neutral
CopyableValue as supporting text. The dialog title names the held asset; the
provider is named once, in its own group, with the same 14px label role as the
other groups. Spacing uses the layout recipes: related content (8px) from label to
content, complete groups (24px) between groups. The supporting-line separator
stays with the copy action when it wraps, as in Holdings.
Provider explanation precedes docs/risk actions rather than being moved to the
dialog header or omitted. The continuous white body uses whitespace between content groups. The beige
hairline trial is rejected: structural substrate is not a decorative divider
inside this dialog. Legacy rounded cards are not copied. Group labels use
14px/20px, with 16px/24px item-title identities below, as separate vertical roles.

Canonical Tabs, identity, copy and Link owners retain native geometry. Stock
reference names/tickers and Ondo destinations follow the source's exchange branch.
The local task header may omit a description; these two examples explicitly omit
the Dialog's description association in that case. Ordinary description-bearing
tasks are unchanged. Tab content uses normal canonical mount/unmount behavior. The active panel
determines natural content height; DialogBody owns any viewport overflow. A
co-located invisible-panel trial created blank scroll space and was removed.
Read about risks selects/focuses Risks, and reopening restores Overview. Header
and tabs remain reachable while scrolling either panel.
These remain source-grounded proposals, not live holdings, provider status, shared
default changes, visual acceptance or production adoption. Snapshot text stays
aligned with its source. The shell's own 8px frame plus 16px inner geometry is
retained, separate from ordinary page/mobile insets.
The proposal checks run in Chromium and mobile WebKit.
The intro-call outcome attachment preserves a historical scheduling design and
its old reference URL locally; scheduling is retired from the current product.
It must not restore the removed production scheduling helper or integration.

Transaction-only keyframes and container rules stay in the preserved story owners’
`transaction-presentation.css`; importing production `app.css` is insufficient.

Third-party package internals are not a styling surface. Scoped exceptions are
the `.rc-*` overrides for `@reserve-protocol/dtf-chat` (documented in
[[project]] § Active Risks) and `.sbdocs-content` in Storybook's own preview CSS,
which lifts its fixed 1000px Docs cap only for wide pattern examples. AppKit uses
its supported `themeVariables` API; see [[wallet-connect]].

## Verification

- `pnpm storybook:build` creates the static library.
- `pnpm storybook:test` exercises the library in Chromium using its own server on port 6008; the dev library stays on 6007.
- `pnpm typecheck`, `pnpm lint` and focused component tests cover source changes.
- Product integration also runs the relevant existing Playwright product specs.

Inspect default and relevant edge states, mobile/desktop and both themes when
presentation changes. Use semantic behavior assertions rather than class lists,
source-code string checks or documentation-copy snapshots. Browser artifacts live
under ignored `test-results/`; they are not design approval or pixel baselines.
Engineer review is required for shared defaults, routing and the other integration
surfaces listed in [[project]].
