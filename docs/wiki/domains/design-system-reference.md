---
title: Design System Reference
updated: 2026-09-09
type: domain
sources:
  - tailwind.config.ts
  - src/app.css
  - src/components/ui/**
  - src/views/internal/design-system/**
  - e2e/design-system/**
  - playwright.design-system.config.ts
---

# Design System detailed reference

> On-demand detailed guidance and evidence preserved from the former mandatory
> domain page. Start with the concise [design-system router](design-system.md).
> This reference explains accepted rules and prior evidence, but current source
> precedence, project state, and task routing live in the router and active
> plan. Dated sections remain evidence and must not override a newer accepted
> decision, typed catalog entry, or canonical implementation.

Current maturity, readiness and adoption belong to the typed catalogs, not
status lists here. Retain scoped acceptance rationale and dated evidence where
the catalog routes to it; those records do not grant broader acceptance.

Token implementation truth lives in `tailwind.config.ts` plus the semantic CSS
variables in `src/app.css` (`:root` and `.dark`). Canonical V1 components consume
the same semantic alias in both themes; the theme boundary owns the light/dark
values. Existing product-level `dark:` utilities remain migration evidence,
while JavaScript theme branching is not a styling owner.

## Active v1 project

The active contract is [design-system-v1](../../plans/design-system-v1.md).
The contained `/internal/design-system` route is a visual-review workspace;
Components and detail routes share their state sheets. Project Status renders
the typed inventory and Current Review queue. Screens links unchanged product
routes, which cannot prove adoption of a lab baseline. Detail pages lead with
visual output; evidence, dependencies and history are progressively disclosed.
Expected missing slots remain navigable without implying a commitment to build.

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

Color has a reviewed V1 working baseline. White owns page-canvas and
ordinary-content roles; beige is a structural substrate revealed by 2px major
and 1px subsection seams. The opaque `substrate-subtle` role provides shallower
attached depth between card and beige without becoming a grouping fill. Gray
chrome stays contained in white. Feedback uses
vivid success, warning, danger, and information colors with semantic
foregrounds and quiet opaque derived surfaces. Those surfaces and borders match
their former alpha appearance on white cards without mixing with tinted parent
surfaces; information derives from the brand blue hue. The existing
positive/negative performance colors and gradients are
preserved and remain semantically separate from feedback. V1 begins with
primary and supporting neutral foreground roles. Feedback foregrounds retain
65% of their semantic hue and mix 35% of the active theme foreground. The light
supporting role mixes 8% ordinary foreground into the legacy supporting value,
while dark retains its existing supporting value. The filled destructive action
uses an 88% / 80% / 72% default-hover-pressed ramp mixed with black. Generic
categorical colors remain deferred because the current `chart-1`…`chart-5`
variables have no product consumer.

Clickable neutral content rows/cards use the accepted opaque
`interactive-content-hover`: light mixes 65% card with 35% secondary for pale
ivory against beige seams; dark mixes 95% card with 5% foreground for subtle
lightening. Consumers opt into `interaction.contentHover`, with
`contentGroupHover` only for a child following that same content link. Existing
chart/ticker fade masks must end in the hovered card color without recoloring
the chart or loading skeleton. This is a solid fill, not a directional gradient
or reuse of structural `substrate-subtle`. Apply only when the whole record is
actionable; static rows, loading states, embedded controls, selections, navigation
chrome and intent-filled cards retain their own roles. The
[rollout inventory](../../plans/design-system-content-hover-trial.md) covers V1
lab consumers. Shared legacy table defaults and production screens are unchanged;
engineer review remains required before production adoption.

Transaction metrics resolve phase, meaning, and severity before choosing one
of those roles; numeric sign alone never selects a color. Settings, limits, and
routine estimates stay neutral, warning and danger belong to preflight risk,
and only meaningful realized financial movement uses performance color.
Superseded estimates become supporting and struck through when the actual
value is shown. Materiality thresholds remain owned by the product flow.

The recorded Color closure comparison preserves that structure and documents
the three corrected contrast gaps: semantic foregrounds on quiet feedback
surfaces, the light-theme destructive filled action, and supporting text on a
light muted surface. Existing surfaces, borders, radii, spacing, and hues stay
unchanged. Heavier filled status surfaces and neutral text with token color
reduced to a small cue remain rejected comparisons. This is V1 authority for
new candidates, not authorization to restyle legacy production consumers.

Component-family work consumes these reviewed distinctions through the
shared V1 semantic-role and recipe owners. They
names content, structural substrate, neutral control fill, selected surface,
floating surface, divider, control line, focus, disabled structure, and
feedback surface/foreground roles without changing legacy production tokens. This
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
The presence of a prose conformance row is not evidence by itself. A `conforms`
claim must consume the named reusable owner where one exists and be pinned by a
focused assertion for the important value; if an accepted rule exists only in
prose and workers would otherwise recreate it locally, first expose the
smallest reusable recipe. Current Review specimens consume those same owners so
the review surface cannot silently present a different foundation value.
Accepted layout relationships live behind the intent-named
`src/components/ui/v1-layout-recipes.ts` map. Every typed item in
`current-review.ts` must record all five conformance areas and declare any
provisional dependency; registry tests reject missing areas while routed
browser tests verify the composition's important computed geometry.

Canonical candidates and lab compositions share the production-consumable
`src/components/design-system-v1/semantic-roles.ts` owner. It exposes
canvas/content/structural surfaces, primary/supporting text, matching
surface-separation recipes, and the proven focus and disabled-control recipes.
These still alias existing semantic tokens; they do
not change global token values or production consumers. Add a recipe only when
a canonical component proves the role is needed rather than speculating about
the complete system in advance.

Import `v1SemanticRoles` from that owner. Focus names deliberately distinguish
`staticOnContent` (persistent demonstration ring), `visibleOnContent` (keyboard
focus), `visibleInset`, and `withinGroup`; do not substitute one for another.
Accepted surface/feedback/neutral/disabled aliases are wired in Tailwind to the
unchanged theme variables. The prior UI recipe map and lab proxy are removed.
The performance palette retains its existing `src/utils/chart-performance-colors.ts`
owner; this consolidation does not invent elevation tokens or promote candidate
palette values. `v1LayoutRecipes` remains the separate owner of accepted spacing
relationships (insets, stacks, clusters and seams). Retain its live consumers;
use a recipe only for the matching relationship, not merely an equal pixel value.
IconButton's compact/secondary defaults differ from Button's default/primary;
see its [API guide](../../../src/components/icon-button/README.md). Both defaults stay unchanged.

Pagination proves that unavailable quiet actions must remain bare and muted;
they do not inherit the bordered disabled-control recipe used by structured
controls. This distinction is owned by the shared Button/semantic recipe rather
than a Pagination-local override.

Switch pressure-testing established one accepted disabled-state role in that
owner: `disabled-structure` is an opaque neutral mixed 60/40 between
`muted-foreground` and the quiet `muted` surface. Stateful disabled controls
may invert quiet and strong structure to preserve their stored value without
reusing active color, blanket opacity, borders, or elevation. The role is
recipe-owned rather than a Switch-local color.

The V1 Button baseline is accepted. Primary actions use the blue
brand fill; secondary actions use white content-surface fill with the neutral
control border; quiet actions remain visually bare until interaction; and
destructive actions use red only for destructive consequences. Neutral gray
fill is control chrome, not another secondary-action variant. Micro, compact,
and default actions use the reviewed 28px, 32px, and 44px geometry. Ordinary
asynchronous work uses a progress verb; a wallet-required state uses a direct
instruction; and a submitted transaction uses lifecycle status. Those states
preserve the control's width, size, hierarchy role, placement, and spinner and
prevent repeat activation. Destructive confirmation pairs a red,
consequence-specific action with an outlined Cancel action. Filled primary and
destructive actions use opaque theme-derived colors darkened 8% on hover and
16% on press. Pressing also scales the visible control to 0.98 around its
center over 120ms without shifting layout; reduced-motion users receive no
scale. Persistent toggle selection is a separate control contract. Labels stay
concise, intrinsic, and single-line by default; a
composition shortens copy, gives the action its own/full-width row, or stacks
actions before overflow. Only unavoidable localized copy may deliberately wrap
to two centered lines on a default-size button; compact labels never wrap, and
buttons never truncate, scroll, or shrink their type. A separate reusable candidate lives at
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

Compact Button inset is 14px on a text-only side. A leading or trailing icon
reduces only its own side to 12px, preserving the accepted 2px optical
correction. This is a Button-family rule: compact Select/Menu triggers,
contained-selection items, and icon-only controls retain their independently
reviewed geometry.

Default Button inset is 24px on a text-only side. A leading or trailing icon
reduces only its own side to 22px, preserving the same 2px optical correction
while giving the 44px primary-action geometry a more deliberate horizontal
measure. Micro Button remains 10px text-only and 8px on an icon side. These
Button values do not change independently reviewed Field or selection-trigger
geometry.

Dense financial-field accessories use the bounded `InlineAction` member of the
Button family rather than Link or a locally stripped Button. It is a semantic
button with 14px/20px medium primary text, no visible container or layout
padding, and a transparent 28px interaction target. Hover underlines, active
color, focus, and disabled treatment remain visible without increasing the
owning row's 20px layout height. This role is limited to terse actions such as
Max or Use inside an already-labeled field; ordinary actions retain the shaped
28/32/44px Button treatments, and navigation retains Link.

The table-family candidate adds opt-in `treatment="contextual"` to Link and
InlineAction: neutral foreground, body 16px/24px light type, hover underline and
the owner's existing keyboard focus. Use Link for destinations and InlineAction
for opening local details, with an external arrow or chevron respectively.
Supporting mobile placement uses the existing supporting type role (14px/20px),
not a dense-table variant. This contextual extension is a lab trial, not a change
to accepted standalone/default treatment. The [table brief](../../plans/design-system-table-family-first-slice.md)
owns its column-spacing and responsive button-sizing scope.
Table action columns may reserve space, but their individual Buttons remain
content-sized with canonical padding. A spinner or changed label can change
button width; keep the right edge and height stable rather than adding a local
minimum width to make all states identical. Explicit full-width action groups
remain a separate composition choice.

The withdrawal-table trial combines countdown, available action and execution
feedback in one column. Use this approach when status and action are alternate
phases of one job; keep independent status and actions when users can modify or
cancel something while it remains active, or when recovery/partial progress
must stay visible. Visual combination must not merge lifecycle and wallet/network
eligibility in the data model. The [table brief](../../plans/design-system-table-family-first-slice.md#combined-withdrawal-column)
owns this trial; it is not a universal Table contract.

The [position/withdrawal checkpoint](../../plans/design-system-table-family-evidence/checkpoint.md)
owns the current table trial and its retained evidence. Its optional DataTable
toolbar uses the same sorting instance as desktop headers; a render limit is
applied after sorting, not to source data. Narrow projections retain the active
sort metric and keyboard focus. Do not infer production adoption, dense-table
typography, rich-record approval or accepted header spacing from this checkpoint.

`ActionGroup` is an [accepted reusable composition baseline](../decisions.md#2026-08-19--actiongroup-composition-baseline-accepted):
horizontal peers use the accepted 8px gap without wrapping; a deliberately
vertical group makes its actions share full width. Button still owns size,
tone and state. The state sheet demonstrates those relationships, not accepted
completion actions, copy or transaction lifecycle. Production adoption remains
separate; consume `src/components/design-system-v1/action-group.tsx`.

Independent [Field/TextInput anatomy is accepted](../decisions.md#2026-08-19--field-and-textinput-baseline-accepted),
including empty, filled, adorned, invalid, read-only and disabled states. Consume
`src/components/design-system-v1/field.tsx` for its 44px fully rounded control,
20px ordinary and 18px adorned inset, and 8px label/control/help relationship.
Labels and supporting text align with the control's outer edge. Business
validation, repeated compositions and production adoption are separate;
Textarea has its [own later acceptance](../decisions.md#2026-08-20--textarea-baseline-accepted).

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

Directional icons use one cross-component semantic map. Ordinary routes omit
icons by default and may use a trailing ArrowRight when directional emphasis
helps; return navigation uses a leading ArrowLeft; external or new-tab
destinations use ArrowUpRight unless a more specific outcome icon applies; real
file/resource outcomes use Download;
navigable rows and cards use a far-trailing ChevronRight; and ChevronDown owns
in-place disclosure rather than navigation. Clear labels do not receive an
icon merely for decoration.

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
Lab-authored wording is not a product-copy source. Product-facing copy is
preserved verbatim from its evidenced source—including in lab specimens:
agents have no authority to edit visible wording, labels, placeholders,
accessibility names, or lifecycle/status language unless the user explicitly
approves that specific copy change. Copy concerns and alternatives may be
reported separately, but must not be silently implemented. This includes
apparent typo and clarity corrections. If a new UI has no evidenced copy owner,
stop and request the copy rather than inventing it.

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
directly renders the shared `EntityIdentity`, `ChainBadgedLogo`,
`ChainLogoStack`, and `TokenLogoStack` implementations from
`src/components/entity-identity/` rather than lab-only replicas. `EntityIdentity`
retains the accepted 8px mark-to-text baseline, with a user-requested 12px trial
for a direct 32px ChainBadgedLogo (`data-entity-logo-size="xl"`). Smaller,
stacked and unclassified custom marks keep 8px. EntityIdentity owns the gap;
consumers do not add table-specific spacing. This trial is not yet accepted. A
host may reserve a larger fixed slot to establish an alignment axis, but must
not add a second arbitrary gap between that slot and the identity copy. The
default copy stack uses the 16px/24px item-title role over 14px/20px
supporting text; compact identity uses the 14px/20px label role over the same
14px/20px supporting role. The two lines add no separate vertical margin.
Compact transaction selector rows are a narrower exception: when both lines
are forced single-line metadata, they use 14px/16px for a tighter row stack;
ordinary compact identity and multiline support remain 14px/20px.
Ordinary entity context is not a use of the restricted 12px auxiliary
exception. The
badge follows the strongest recent Index treatment;
its 16px xl, 14px lg, and 12px md chain marks include the separating border
rather than growing around it. The 2026-09-09 user-authorized optical trial uses
a 2px surface-colored border for xl and 1.5px for sm/md/lg. The outer badge
extends by the border width below and the border width plus 1px right, keeping
the colored interior nominally flush below and 1px right. The logo layout box
is unchanged; the separate identity-gap trial is described above. Evaluate visible artwork, not only border-box
overhang. This is a shared candidate trial, not production adoption.
Headless Chromium can round the 1.5px border to 1px even with scale-2 emulation;
allow the resulting 0.5px extra optical overhang. The live Chrome preview was
measured at the intended 1.5px/2px borders and exact nominal offsets.
Overlapping logo stacks retain their separate 2px cutout geometry. Badges
use the 4px rounded-square role rather than `rounded-md`, which became
effectively circular at md. Chain and token stacks
share one frame recipe: requested size always describes the artwork, the 2px
surface-colored separator wraps outside it, and the stack compensates for that
separator so the first artwork retains the same leading axis as a singular
mark. Chain frames preserve proportional rounded-square geometry while token
frames remain circular. The stack owns overlap order and surface separation.
Long names,
deterministic logo fallback, account marks, and a dense 32px Index holdings
composition now pass in the lab. Production consumers and the two legacy stack
implementations are intentionally unchanged until an explicit adoption slice.

The 2026-08-19 safe-autonomy pass rechecked this boundary against the strongest
recent sources: `basket-overview/exposure-table-rows.tsx` for 32px Index
identity, `highlighted-dtfs/feature-card.tsx` for badged DTF marks, and
`earn/views/index-dtf/components/table-filters.tsx` for overlapping marks and
surface separation. The existing shared candidate already matched those
requirements at that checkpoint, so no entity code or production consumer
changed then. The later Select pressure test corrected only the reusable stack
frame geometry described above; production consumers remain unchanged.

The first popup-related candidate now isolates explanatory HelpTooltip from
accessible action naming and transient copy feedback. It consumes the existing
Radix-backed Tooltip behavior with a bare inline trigger and explicit click or
touch persistence. Its accepted floating surface is content-sized rather than
fixed-width: short explanations stay compact, longer explanations wrap at a
collision-aware 340px maximum, and collision padding preserves an 8px viewport
boundary.
The accepted Select popup may eventually supply presentation recipes to
Combobox and Menu, but bounded value choice, searchable entity choice, and
immediate actions retain distinct behavior. Long help copy and responsive
popover-versus-drawer behavior still require evidence; Combobox and Menu do not
inherit authority from Select merely because some visual anatomy may match.

The bounded-value Select is an accepted reusable Radix-backed V1 baseline. Its
ordinary trigger inherits the accepted 44px Field
geometry, 16px/300 value, 20px inset, full radius, semantic control line, and
focus treatment. A real pagination requirement adds a 32px, 14px/300 compact
trigger rather than another general control scale. The floating list uses an
8px offset and radius; its 40px, 14px/300 option surfaces use a nested 4px
radius within the popup's 4px inset. A neutral highlighted surface and a
persistent right-side check for the committed value keep focus and selection
distinct. Its down chevron uses the shared labeled-popup trigger indicator and
rotates on open; option content and its trailing check retain the trigger's
leading value and trailing-indicator axes. Temporary option focus consumes the
same
subtle foreground-at-5% interaction recipe as contained Tabs and SingleChoice
rather than the stronger neutral-control fill. A source-grounded chain fixture
supports a 16px direct leading mark beside 14px option text while using the
canonical `ChainLogoStack` for the `All chains` composite summary. Direct brand,
token, and chain marks preserve their authored geometry rather than inheriting
an interface-control radius. Trigger width and visible-label treatment remain
composition-owned: form fields may use an external label, self-describing
filters may use the trigger alone with an accessible name, and an internal
context label may be added only when a real ambiguous-value composition needs
it. Compact bounded utilities reserve space for their widest known option rather
than resizing with the selected value; the current pagination fixture remains
70px wide. Text-only compact popup triggers use 14px leading and 10px trailing
padding around their 8px text-to-chevron relationship. This transfers the
existing 2px optical adjustment across the control, balancing the text edge
against the chevron sidebearing without introducing a new spacing token. This
does not turn searchable or
multi-value results into Select variants. Combobox, Menu, native-select policy,
mobile drawer substitution, and production adoption remain separate.

Default 44px selection triggers use a 12px gap between the submitted value or
summary and their chevron, with 20px leading padding and 18px on the trailing
Lucide-chevron side. Compact 32px triggers retain the tighter 8px relationship
and their accepted 14px-leading/10px-trailing optical padding. This distinction
belongs to popup-trigger geometry rather than to MultiSelectFilter alone;
content identity logos do not trigger the chrome-icon adjustment.

The rendered Select, Menu, and MultiSelectFilter rows currently share a
provisional balanced-inset candidate prompted by review of their visible hover
surfaces. The popup uses 8px padding on both axes and each item uses 12px padding
on both axes. A provisional 14px/16px single-line popup-label role produces a
40px ordinary Select/Menu row while 20px identity or selection controls keep
MultiSelect rows at 44px. The balancing rule is accepted; the exact resulting
density and line-height treatment remain under visual review and must not
compound as authority yet.

The source-grounded `SearchField` is an accepted current baseline. Source inspection
corrected an earlier audit assumption before implementation: the app does not
currently demonstrate one recurring generic Combobox job. Global DTF search is
navigation Command, Earn and governance filters are multi-select, and token
selection is a drawer-based Asset picker. Those jobs remain separate rather
than lending speculative authority to a Combobox.

The transaction Asset-picker candidate keeps those selection semantics
composition-owned. Its popup uses the accepted 8px outer inset, each rich row
uses a symmetric 12px inset and 4px sibling gap, and selection is carried by
the row surface plus `aria-pressed` rather than a trailing checkmark column
that reserves empty space in every unselected row. Compact popup identities
use 14px/20px label and supporting roles; a full task/drawer selector promotes
only the primary name to the existing 16px/24px item-title role. Balance copy
stays 14px/20px and includes the asset symbol. This remains a provisional
transaction composition, not a generic Select or production adoption.

`SearchField` composes the accepted `TextInput` and `IconButton`. It
inherits the 44px fully rounded field, 16px/300 query text, semantic focus and
disabled treatment, and adds a 16px search mark, optional clear action with
focus return, and a non-interactive loading indicator. Search results, grouping,
no-results recovery, Command navigation, asset selection, compact sizing, and
responsive substitution remain composition-owned. One 44px size covers the
current evidence; compact sizing waits for a real dense-toolbar requirement.
The accepted state sheet includes standalone states and a real Discover-style
Search plus Select alignment test; no production consumer changed.

When the established application search results live in a separate dialog,
`SearchFieldLauncher` consumes the same field frame, icon, typography, and inset
recipe with truthful button and `aria-haspopup="dialog"` semantics. It avoids a
read-only input pretending to accept a query and is not a compact SearchField
variant.

### Action Menu

The source-grounded action `Menu` is an accepted current baseline. It retains Radix
keyboard and dismissal behavior, consumes canonical Button/IconButton triggers,
and reuses the accepted popup surface, item geometry, and subtle interaction
recipe without inheriting Select semantics. Real authority comes from Index
contract-address actions, About and external-market links, and the header Search
invocation. Chart type, time range, language, theme, and social-channel choice
commit values and therefore remain selection evidence. The baseline covers
ordinary, external-link, disabled, and destructive action anatomy;
the destructive role is semantically correct but its exact cross-theme
foreground value remains dependent on the provisional feedback palette.
Labeled Menu and Select triggers consume one shared down-chevron indicator:
opening rotates it 180 degrees over the 120ms immediate-feedback duration,
while reduced-motion removes the transition. Icon-only triggers do not add it.
Menu separators cross the 4px popup inset and meet the inside of its border,
clearly separating action groups rather than aligning to the item-content axis.
The labeled compact Menu trigger consumes the same 14px-leading/10px-trailing
text-and-chevron recipe as compact Select; ordinary action-icon Buttons do not
inherit it automatically.
Grouped header panels, selection items, shortcuts, submenus, responsive
substitution, and production adoption remain separate.

### Minimal Popover shell

The baseline classifications for Menu, minimal Popover and MultiSelectFilter
already appear in checkpoint `9c40640d5` and this reference. Their direct
human-approval provenance has not been independently recovered; the following
records those existing contracts, not a new approval. Density/elevation trials
and adoption remain separate.

The minimal V1 `Popover` shell is accepted by consequence of the Select and
Menu reviews: it owns the shared 8px trigger offset and shell radius, collision
inset, semantic floating surface, restrained elevation, and retained Radix
focus/dismissal behavior. Width, padding, scrolling, and inner anatomy belong
to the hosted composition.

### MultiSelectFilter

`MultiSelectFilter` is an accepted current baseline derived from the real Earn
DTF and governance filter jobs; its approval emptied the prior Current Review.
It preserves staged Apply behavior while replacing Switch-based set membership
with canonical Checkbox rows. Its 44px summary trigger composes Button geometry
but uses the accepted 16px/300 selection-value role, a 12px summary-to-chevron
gap, and 20px-leading/18px-trailing optical padding. Rows retain the same 8px
popup and 12px item insets as Select and Menu. A 20px leading identity mark
balances the canonical 20px Checkbox mark without changing identity sizing
elsewhere; the Checkbox's 28px transparent target overlaps 4px into the
row-owned inset. The provisional 14px/16px single-line role and those 20px marks
retain a 44px row. The no-divider footer consumes horizontal ActionGroup with
compact secondary Clear and primary Apply actions grouped right at an 8px gap,
20px horizontal and bottom insets, and 8px top padding. Search, large-list
loading and empty states, token-result density, mobile drawer substitution, and
production adoption remain separate.

The accepted Typography baseline defines nine core
semantic jobs across six core sizes, the restricted 12px auxiliary exception,
the 300/500 weight split, 16px/24px ordinary reading, 14px/20px supporting text,
Lausanne tabular financial values, monospace identifiers, natural wrapping, and
a 48px-to-40px responsive display. The sustained 14px comparison is a
stress test rather than authorization for long-form supporting copy. Application
role defaults remain stable; the later user-approved
`v1TypographyVariants.responsivePageTitle` opts into 24px/30px below `sm`
(640px), 32px/38px from 640px, at weight 300. Use it for page identity or a
top-level focused title, not hero/display, subordinate sections, cards, or
transaction amounts. It preserves the fixed `v1Typography.pageTitle` default
and adds no size to the scale. The earlier study's stable-role examples remain
default-role evidence, not a ban on this opt-in. Real usage may justify
evidence-based refinement, but approval authorizes no production migration.
Current Review is routed separately; this historical sequence is not its queue.
The September 15 chart completion provisionally reuses the 24/32px scale for
a dated Portfolio financial total (a paragraph, not a heading) and adds the
20px/26px weight-300 `lightPanelTitle` only for Home's chart-context name.
These are unaccepted chart candidates, not general financial or card-title
policy; shared role defaults remain unchanged. See the
[completion boundary](../../plans/design-system-next-charts/completion/README.md).
Human review accepted Global and Product navigation as
separate current baselines after judging them together in a realistic shell.
Human review accepted the Radius role taxonomy so it
does not block subsequent work: structural surfaces, contained objects, atomic
controls, and separately layout-owned structural reveals. The current 0 / 8 /
full mapping is a revisitable working baseline; complex screens may justify
tuning its values without reopening the semantic categories. The earlier 16px
reveal remains unapproved until real composition evidence identifies both its
value and its reusable owner. Color is not being restarted; exact brand/accent
values and final dark-theme coverage remain separate follow-up work. Inline
Message remains Yellow until realistic surrounding composition evidence is
ready; production adoption remains unchanged.

Drawer owns an 8px structural edge and body scrolling, not one universal body
inset. Ordinary headers, footers, and body compositions add 16px to reach the
accepted 24px content axis. Dense input/output flows such as Zapper may remain
on the 8px edge without creating a Drawer variant or local spacing exception.
This anatomy is retained evidence, not current V1 authority: existing
right-side desktop Drawers are generally migration surfaces, and new modal
tasks should use the accepted centered-desktop Dialog that becomes a
bottom-attached sheet on phones. Existing Drawer uses are evaluated against
that Dialog pattern one at a time. Drawer returns to canonical review only if a
concrete flow cannot migrate without meaningful loss.

The canonical product kernel includes `Button`, `Metric`/`MetricValue`,
`LifecycleStatusPill`, and `EmptyState`. Button owns the
accepted action hierarchy, 28/32/44px scale, icon spacing, focus, disabled,
loading, label-fit, semantic interaction colors, and momentary press behavior.

### Metric anatomy

Metric owns accepted inline and centered-headline
label/value anatomy. The headline treatment preserves the
strong Home source's 16px/300 label and 16px/500 value; horizontal peers remain
16px/300, right aligned, and tabular. Its parent owns framing, grids, help, and
responsive composition. Outcome-summary groups do not add a Metric role or icon
API; centered versus parent-owned start alignment remains a visual composition
decision. Empty state owns only quiet versus user-resolvable absence hierarchy;
parent regions own height and framing, while bespoke illustration is reserved
for later review of meaningful evidenced states. A realistic divider-free Index
slice composes Entity identity with Metric values without introducing a
universal Row component.

Lifecycle Status owns the reviewed lifecycle roles, standardized indicators,
opaque semantic tones, subtle countdown pairing, and processing-only motion.
The lab currently reopens exact compact geometry through one 28px intrinsic
trial, with increased icon-aware side inset, so status and micro actions can be
judged on a common control axis; the earlier 24px geometry remains the accepted
decision until that visual review resolves. It does not fill a parent grid or
flex axis by default. Category labels, counts, qualifiers, removable chips, proposal
progress, and outcome-detail composition remain separate work. Its
implementation lives in `src/components/lifecycle-status/` and consumes the
shared V1 semantic-role map from `src/components/design-system-v1/`; no product
consumer has adopted it yet.

Card usage does not support one universal migration target. The 50 shared Card
imports are dominated by legacy Yield consumers, while the Index imports mostly
frame structural Overview regions. The production primitive's rounded-3xl,
20px-padding, and title defaults conflict with accepted V1 foundations and stay
unchanged evidence. Structural regions already resolve to square white surfaces,
an ordinary 24px content axis, layout-owned substrate corners, and no nested-card
default. The Home Index feature card is the authoritative source for a later
media-rich interactive-card shell; its hierarchy and detailed behavior are not
being redesigned. The accepted preservation-first review applies a square
shell, a 4px shell inset with square inner media, 24px primary and
supporting-row axes, 16px between internal regions, and 8px between directly
related title/market content. Title spacing is measured from the complete top
row rather than the logo alone, so Discover naturally accounts for its taller
chart without a new spacing value. Full chart/launch, ticker, transcript/video,
chain, and interaction behavior remain protected; Discover is supporting
compact adaptation evidence. Reusable extraction remains queued and production
is not adopted. The September 14 highlighted-card refinement supersedes the
earlier 8px/rounded-media delta; the chart excerpt reflects it, while the earlier
full-card study retains historical framing. Gradient and surround belong to
highlighted-card context, not to the reusable chart.

Persistent product navigation is a Register extension, not a Button variant.
The Index DTF rail and its constrained-screen menu consume one route/current/
disabled model while composing it differently for available space. Generic
Link semantics remain intact. Review starts from faithful collapsed and
hover-expanded states of the real rail, not invented alternative directions.
The designer owns visual refinement while accepted foundation rules constrain
spacing, color, shape, icon, motion, and accessibility. The category exists
because repeated real product use demonstrates the contract, not because a
generic component catalog expects it.

Global navigation is a separate application-level system. Its desktop header
owns primary destinations, grouped resource overflow, and application actions;
its constrained-screen form recomposes the same source-owned destinations into
full navigation regions. The accepted coordinated shell renders it above the
Product rail so their simultaneous hierarchy remains visible, but each baseline
keeps its own contract and neither may compound from the other's choices. Both
consume accepted Link, popup, identity, Button/IconButton, semantic theme, and
motion owners. Route taxonomy, destination copy, analytics, account behavior,
and production adoption remain outside.

Product Navigation's accepted baseline includes one generic metadata
seam rather than governance-, auction-, or market-specific component props.
Small public-state dots may distinguish an active phase (information) from a
notable or time-sensitive phase (warning); counts and connected-account state
remain outside until product evidence justifies them. The detached mobile page
trigger does not aggregate activity; indicators appear only on the specific
destination rows after the drawer opens. Collapsed rail placements use the
compact dot while labeled destination rows retain the 6px dot inside the
default 16px slot. Its 8px collapsed-rail slot starts at 32px and ends at the 40px row edge,
keeping the dot on the icon's horizontal centerline, subordinate to the icon,
and inside the clipped rail rather than in a notification-badge position. DTF
switcher rows may use that trailing seam for signed 30-day performance, reusing the accepted
financial color roles and replacing—not accompanying—the navigation chevron.
The 256px expanded rail stays fixed across page and switcher modes so the DTF
label and performance keep separate readable columns. The period remains accessible even though only the percentage is visible.
These are unadopted candidate behaviors and are not authority for production
data sourcing or domain logic.

The common desktop application-control cluster represents Search, theme,
language, and Account/Connect. A contact-team bell may appear conditionally for
eligible accounts, but it is not a permanent Notifications destination and is
not part of the default cluster specimen. The lab provides deterministic
disconnected and connected fixtures; the connected account keeps the current
chain identity plus shortened-address model without requiring a wallet session
or approving the account menu behavior. Desktop and constrained account
controls use the existing 14px micro chain mark and 4px relationship gap. The
constrained header may shorten the visible address further (`0x71…2A6C`) while
retaining the longer short form in its accessible identity. The active comparison uses a 40px
rounded toolbar shell around outlined 32px compact controls, with equal 4px
horizontal/vertical inset and a matching 4px sibling gap. This aligns the
cluster with the global-route silhouette without introducing a 40px Button
tier. Disconnected Connect uses the accepted primary action tone to establish a
clear cluster endpoint. The connected chain-and-address control returns to the
secondary outline treatment because it becomes identity/menu access rather
than a connection CTA.

The constrained application header is a separate 56px composition owner. It
keeps the existing decision to group Search, theme, and language under one
utility trigger, while canonical compact Button/IconButton controls provide
32px visible geometry. Its surface is a header-owned composite disclosure, not
an action Menu:
the SearchField-family launcher opens the existing search dialog, default
contained Segmented Control owns theme, and a 44px summary row expands only the
alternative language choices inline. The summary and alternatives form one
connected outlined control, so the current value is not repeated. The utility
surface grows in place and selecting a language collapses the inline list; it
does not open a second popup. The panel and its language disclosure inherit the
header's `card` surface in both themes rather than introducing structural
`secondary` or separate `popover` surfaces; only row interaction states create
emphasis. The three resting controls therefore share 44px geometry. The panel begins at the
56px header boundary and spans the header's full width, which is the viewport
width in product use and the simulated phone width in the lab. The header owns
that geometry rather than deriving it from the narrow utility trigger.
The ordinary 44px mobile form/action size does not transfer into dense,
persistent navigation chrome. The closed header uses a 16px outer inset and 4px
between its controls; the grouped three-icon trigger uses the existing 14px
micro glyph scale, a 4px internal gap, and an 8px horizontal inset. Connected
headers retain the chain mark and shortened address rather than collapsing to
an icon-only account. The full Reserve wordmark remains when the header content
box can preserve both its intrinsic width and its gap to the controls; narrower
headers switch to the existing square brand mark first. The 390px fixture
retains the full wordmark; the 360px and 320px fixtures expose the square-mark
fallback without creating a smaller wordmark size.
Default and transparent header surfaces are shell choices,
not alternate control recipes. The current owner is an unadopted lab candidate;
search closes the utility panel before opening its dialog. Production state
wiring, account-menu behavior, analytics, and migration remain separate. The
opened Global navigation composition is now part of the coordinated navigation
Current Review and owns its own focus-entry/return behavior.

The contained lab is designer/developer working metadata and remains English-only. This is not an exemption for migrated product UI: any copy that reaches product users follows the repository's Lingui and es/ko/zh translation rule. Current Review contains only a nearly complete candidate that has reached the boundary of what Codex can confidently resolve and still needs genuine human visual judgment (`visual decision`, `canonical review`, or `real-screen validation`). It is not a list of unfinished slots. Autonomous component work and evidence preparation stay in the registry-backed Project Status work queue.

Keep Tailwind, Radix, CVA, and local shadcn-style primitives as the implementation base. Storybook is deferred until the in-app lab demonstrates a concrete unmet need. Progress gates are independent: catalog maturity, design authority, rendered output, reusable implementation, production adoption, individual definition decisions, review, and verification must not collapse into one status. In particular, rendered exploratory work may be only a specimen; the catalog must say whether a reusable component or recipe exists, whether its contract is the current baseline, and whether any product consumer has adopted it. Missing capabilities use explicit statuses and subdued styling, never disabled navigation, because their detail pages are part of the planning surface.

For routine component discovery, `getComponentContextRoute(id).disposition`
answers five questions: design authority (with scope sources), implementation
owner, rendered output, production adoption, and review scope/readiness. It is
derived from the existing catalog, not another registry. Priority and evidence
completeness remain separate metadata; `not-needed` retains its explicit basis.
The older maturity field remains for foundation/dashboard compatibility, not
as an approval shortcut. Component badges omit its redundant summary and show
actual partial/pending/mapped evidence separately. Current Review schedules work;
neither those badges nor the historical progress ledger create acceptance.

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
- V1 semantic calibration: `supporting-foreground`, the four
  `feedback-*-foreground` roles, and the `destructive-action` interaction ramp.
- Lines/inputs: `border`, `borderSecondary`, `input`, `ring`.
- Data viz: `chart-1`…`chart-5`, `legend`, `tvl`.

A new color means adding the CSS var in **both** `:root` and `.dark` in `src/app.css` first — never a one-off hex.
Components consume the same semantic alias in both themes; only the theme
definition may map that alias to different raw values. The V1 supporting role
is intentionally separate from legacy `muted-foreground`, so adopting the
baseline does not silently restyle older screens.

The transaction outcome review provisionally exposes `brand` as a persistent
inverse-content surface derived from `primary` in both themes. It is a lab
candidate, not a current-baseline replacement for `primary` or an interaction
state such as `primary-hover`/`primary-pressed`.

## Type, radius, layout, motion

- Font: TWK Lausanne — only three weights exist: `font-light`/`font-normal` → 300, `font-medium`/`font-semibold` → 500, `font-bold` → 700. 400/600 collapse to these.
- Radius: `rounded-sm/md/lg` derive from `--radius` (0.5rem); `rounded-3xl` (1.25rem) and `rounded-4xl` (1.5rem) for cards/dialogs/drawers.
- V1 radius candidate: atomic one-row controls—including buttons, ordinary
  inputs, search, and select triggers—are fully rounded. Composite amount
  panels and loading or other state layers that replace their content use the
  restrained 8px contained-object radius. Multiline fields, menus, popovers,
  and thumbnails use the same restrained radius role. Structural surfaces
  remain square by default and selective layout-owned corners reveal the
  substrate.
- Control typography baseline: default entered/selected values are 16px/300;
  compact values are 14px/300; action labels are 14px/500. Intent, selection,
  focus, validation, disabled, and async lifecycle are combinable state axes,
  so shared primitives define supported and prohibited pairings instead of one
  exclusive state list.
- All 14px typography uses the accepted 20px line height by default, regardless
  of weight or whether the text happens to wrap. A component may use a tighter
  line box only when a reviewed geometry requires an explicit exception, such
  as the provisional single-line popup-option treatment; that exception never
  becomes the starting point for ordinary supporting copy. Longer reading
  content should move to the appropriate body role rather than widening 14px
  text to 24px.
- Human-readable financial values use Lausanne with contextual size/weight and
  tabular numerals; comparable numeric columns align right and use consistent
  precision. Monospace is reserved for machine identifiers. Meaningful titles
  wrap, while only known-width machine cells truncate. Ordinary readable copy
  targets roughly a 65-character measure.
- An eyebrow or kicker above a title is not a current V1 default. Add one only
  when it contributes necessary category or location context, then review its
  typography and its relationship to both title and supporting copy as one
  composition. Do not use a generic label to decorate an otherwise complete
  heading.
- Spacing relationships use 4px for tight text pairs—including inline evidence
  labels and values—8px for directly related content, 16px between internal
  regions, and 24px for ordinary content insets and complete groups. Semantic
  layout recipes own these relationships in reviewable compositions.
- When a fully rounded container embeds a smaller rounded action at its edge,
  the action keeps the same visible cushion from that edge as it has above and
  below. Text and icons may retain their normal content axis; the trailing
  control inset is an object relationship, not a replacement content inset.
- A divider marks one owned boundary; it is not a spacing mechanism. Attach it
  directly to that boundary and give the adjacent regions matching semantic
  insets unless their hierarchy intentionally differs. Do not place a parent
  gap on only one side and then add unrelated row padding on the other. When
  spacing or surface contrast already communicates the grouping, omit the
  divider rather than preserving decorative structure. At a bordered
  region-to-action seam, the bordered region owns equal top and bottom inset;
  an attached footer starts at zero additional top inset. A separated footer
  may add its own gap only when the preceding region does not already own it.
  In compact transaction task shells, a divider-separated facts group uses the
  16px internal-region inset on both boundaries and 8px only between related
  fact rows.
- Off-grid edge values used for optical sidebearing correction are not general
  spacing tokens and must not justify new component-specific relationship
  gaps. A deferred reconciliation will recheck the existing Button icon-side
  and compact/default Select/Menu trigger inset pairs for convergence on the
  accepted scale or one shared icon-aware recipe; existing recipes remain
  current until that focused review.
- Tabs use foreground text for the active item and supporting text for inactive
  items rather than primary blue. Genuine content-panel Tabs use the contained
  selection treatment in compact and default sizes; intrinsic/full width are
  layout settings rather than variants. The prior text-only proposal is not an
  active V1 Tabs presentation because its strongest assumed uses are immediate
  Segmented Control behavior. Its reviewed unframed compact/default treatment
  is retained by the Segmented Control candidate rather than discarded. A real
  quiet panel-navigation need may justify revisiting text-only Tabs later.
- A contained single-selection strip uses one shared visual language regardless
  of whether its eventual semantics are Tabs, a segmented mode control, or a
  submitted radio value: a fully rounded neutral track, 2px track inset, a
  matching 2px inter-item gap, a subtly elevated white selected item, 14px/500
  labels, and size-category horizontal padding (12px compact, 20px default).
  The default track and items are intrinsic-width. When a composition explicitly
  needs the track to fill its parent, every peer item grows equally with it;
  when those peers cannot fit without compressing or wrapping their accepted
  geometry, the full-width track preserves intrinsic peer width, scrolls
  horizontally, and reveals the selected option. This is an overflow fallback,
  not another ordinary mixed-width layout mode.
  Hover uses a quiet neutral fill; focus separates against the neutral track;
  disabled items retain structure at 50% opacity. Semantics, keyboard behavior,
  overflow, and content-panel relationships remain owned by each component.
  This visual contract is the current baseline and its compact/default
  treatment lives in `src/components/design-system-v1/contained-selection.ts`
  so related controls can consume it without reconstruction. SingleChoice
  consumes only the default 44px treatment until a real product use justifies
  a compact or micro size. Segmented Control owns immediate mode changes and
  exposes the accepted unframed text-only compact/default treatment alongside
  the shared contained compact/default treatment. Text-only is intrinsic in
  ordinary contexts and full width for the evidenced compact mobile DTF chart
  range, where peers distribute across the available width. Tabs bind the
  accepted contained treatment through
  `src/components/design-system-v1/tab-presentation.ts`. The reusable
  Radix-backed component in `src/components/design-system-v1/tabs.tsx` adds
  compact/default size and intrinsic/full width while root, trigger, and
  content remain Radix-compatible and panel spacing stays composition-owned.
  Text-only presentation, tiny sizing, counts, route navigation, deep linking,
  and any new overflow policy remain outside the current contract; production
  adoption is unchanged.
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

## Accepted independent primitives and composition boundaries

Acceptance chronology: [2026-08-20](../log.md#2026-08-20) records Copyable Value
and Skeleton; [2026-08-21](../log.md#2026-08-21) records Spinner and EmptyState.
Later extensions retain their own decision links below.

Segmented Control is a controlled immediate
mode switch and cannot depend on Tabs; Textarea inherits Field's 20px ordinary
horizontal inset, uses a 16px multiline vertical inset, and does not add
rich-text or character-count APIs; Switch is 36×20 with a 16px thumb and no
async lifecycle; Pagination refines the approved DataTable evidence into a
table-independent 1-based contract without importing TanStack Table or changing
DataTable defaults.

### Copyable Value

Accepted Copyable Value owns its clipboard action, 14px monospace
machine-value typography, and two-second copied state. Addresses use deliberate
product shortening by default rather than CSS truncation; when a full value is
shown, its composition must provide enough room without a trailing ellipsis.
The default treatment keeps the formatted value beside the canonical micro
copy control. Dense aligned facts may opt into an integrated treatment where
the value and copy/check icon form one 20px action: 14px value, 14px icon, and an
8px internal relationship gap. Its expanded interaction target, hover, focus,
and click behavior belong to the whole action. Success swaps to the same-sized
check without moving the row. The integrated treatment does not replace the
default and does not own its parent list or grid geometry.

The full copied value remains accessible, and transient Tooltip feedback is
separate from explanatory `HelpTooltip`: the resting copy prompt uses the
accepted neutral Tooltip presentation, while confirmed copy feedback uses the
existing semantic success surface and border with readable foreground copy and
a success-colored check indicator. Success appears only after the clipboard
write resolves and is announced politely. The open surface stays mounted across
that state change, ignores pointer dismissal during the two-second confirmation
interval, remains Escape-dismissible, and uses the accepted 120ms color
transition without replaying Tooltip entrance motion.

### Skeleton and Spinner

Skeleton uses the existing border neutral for a quiet fill that is darker than
light surfaces and lighter than dark surfaces. It has no built-in size or shape:
the host owns truthful width, height, radius, repetition, and loading boundaries.
The recently refined Index overview and Home feature-card loading compositions
remain authoritative product evidence; migration may replace primitive material
and motion only while preserving their geometry, and must audit consumers that
relied on the legacy primitive's default radius. Spinner is restricted to short
indeterminate work: 14px inside the Lifecycle Status pill, including its current
28px geometry trial, 16px for
inline/control use, and 24px for a local region. It inherits currentColor so
each canonical host owns tone; standalone instances supply an accessible label,
while contexts with visible status copy may hide the redundant mark. It must
escalate to Skeleton or informative progress when duration or content shape is
known.

### EmptyState

EmptyState is accepted for two evidenced jobs: quiet title-only absence and
actionable absence with description and canonical ActionGroup actions. The
candidate uses 4px for its tight title/description pair, 8px for icon/title and
action peers, and 16px between the message and its internal action region.
Quiet titles remain 16px/300 supporting copy; actionable titles use 16px/500
primary copy above a 14px/300 description. Centered descriptions use the
established 384px (`max-w-sm`) measure so routine empty-state copy remains a
cohesive message rather than spanning a dialog-width line.
Action size remains composition-owned: the token-picker evidence uses compact
text-only secondary support actions at intrinsic width, while the basket
evidence uses one compact primary action. Compact EmptyState actions do not
stretch to equalize long labels. EmptyState accepts arbitrary action content;
it does not hardcode picker destinations. An optional decorative bare icon uses
a 20px glyph in a 24px slot with 8px before the title; actionable icons use
primary neutral foreground, while quiet icons use supporting foreground.
Icon presence is independent of mode and action count. Routine absence does not
require one, and the component adds no button-like frame. Visible frames remain
reserved for semantic outcomes, identity, or a repeated-stack alignment need.
Host framing, exact request-channel copy, bespoke milestone artwork,
loading/error states, and production adoption remain outside it.

Copyable Value owns only one inline value, its copy action, and transient
feedback. A shortened address plus a paired explorer action is a composed
address-action pattern. Native/bridged address presentation additionally owns
chain identity, list or popup anatomy, and per-chain copy/explorer actions.
Product Navigation now exercises one drawer-specific composition with a group
label and chain-led Native/Bridged rows, but that composition is not approved
indirectly through Copyable Value.

### Button interaction and label fit

Button has an accepted momentary active treatment: opaque filled-action
hover and pressed colors are derived from the theme's primary or destructive
token by mixing 8% and 16% black, respectively, so they do not blend with the
host surface. The pressed color is paired with a centered 0.98 transform over
120ms, while reduced-motion users receive no scale and focus remains
independent. Persistent `aria-pressed` selection is outside the ordinary Button
contract.
Button labels are concise, intrinsic, and single-line by default. Constrained
compositions shorten copy, give the action a full-width row, or stack actions;
only unavoidable localized copy may deliberately wrap to two centered lines on
a default-size button. Compact labels never wrap, and labels never truncate,
scroll, or shrink. EmptyState's quiet and actionable hierarchy is an accepted,
unadopted baseline; bespoke milestone artwork and host-specific absence
compositions remain outside that authority.

Popup-row transfer remains a shared provisional recipe rather than a separate
review item. Select and Menu both produce 40px text rows from 12px item insets
and a 16px line box. MultiSelectFilter reaches 44px from the same inset because
its 20px leading identity and Checkbox marks determine content height. This is
consistent application, not evidence for a universal fixed row height.

## 2026-08-21 — Link, Accordion, and disclosure boundaries

Link is an accepted, unadopted current baseline for navigation only. Inline
links inherit reading typography and remain underlined; standalone links use
the compact 14px medium role with a 4px label-to-destination-icon relationship.
Standalone links gain an underline on hover without a background or geometry
change; the existing keyboard-focus indicator remains.
The evidenced return-navigation pattern remains unframed and supporting-neutral,
uses the 14px light supporting role and the same 4px arrow-label relationship,
and moves to primary with an underline on hover or focus. It is not a universal Back
default: use the named return link when identifying the parent improves
orientation, and use the canonical framed IconButton in compact headers where
the parent is already obvious. Native and Router anchors retain their semantics,
external resources merge secure new-tab rel tokens and pair the visible icon
with caller-owned localized announcement copy, and button-shaped routes compose
canonical Button through `asChild`. That semantics-only Button seam preserves
all accepted visual defaults; unavailable/loading `asChild` controls suppress
focus and activation defensively, while unavailable destinations remain
non-anchors in the Link contract. Current and visited state, Product
Navigation, Tabs, breadcrumbs, analytics policy, and production adoption stay
outside the contract. Human review accepted recognition and hierarchy across
prose, standalone, return, external-resource, and button-shaped navigation;
real product compositions may still pressure-test that baseline before adoption.

Accordion is an accepted, unadopted baseline only for coordinated informational
FAQ and product-detail sets. It retains Radix single/multiple expansion and
keyboard behavior, owns a stable 16px row/content axis, 48px minimum trigger,
8px expanded title/body relationship, 20px body-to-next-title rhythm, and
14px/20px supporting content, and explicitly excludes task progress,
validation, editing, and actions. Callers must choose behavior explicitly:
multiple is the ordinary informational recommendation because independent
answers remain available for comparison; single is reserved for mutually
substitutive or unusually long regions. One standalone disclosure uses
Collapsible instead of an Accordion with one item.

The nine-source Collapsible audit confirms a separate one-region disclosure
job. Bridge and eligibility use subordinate help; auctions use optional bid or
configuration regions; dev-mode rebalance exposes raw diagnostics; governance
repeats executable-code revealers. None needs Accordion set semantics. The
accepted baseline retains controlled Radix behavior and consumes the
accepted Accordion trigger/content presentation plus 180ms motion rather than
recreating it. When resting-state discoverability needs help, its trigger may
render a caller-owned closed/open cue beside the chevron. Trigger copy must
identify the hidden subject and cue copy must truthfully describe the reveal;
the component defines no product-language defaults. Cue and chevron stay muted
at rest and become primary on hover or keyboard focus. Below the small
breakpoint the cue text hides, leaving the nearby chevron and clear subject
label. Host framing, revealed content anatomy, native `details`, bespoke
triggers, and production adoption remain outside.

Inline Message is an accepted, unadopted candidate for
persistent contextual feedback. It consolidates eighteen shared Alert importers and repeated local
warning/error banners into information, success, warning, and danger tones
using the existing opaque semantic feedback surfaces and borders. Semantic
color is concentrated in the standard 16px icon while title and body retain
the normal foreground hierarchy. Default messages use 16px inset; compact
full messages use 12px. The compact one-row summary uses the accepted 44px
atomic-row geometry with full radius, 16px horizontal inset, and 8px vertical
inset; icon/title and action-peer relationships use 8px;
title/body uses 4px. In the full default presentation, the icon shares only the
first row with the title and the explanatory body returns to the full content
axis below it, avoiding a dead icon column. The opt-in summary presentation
centers icon and title on one row. Current Zapper action qualifiers compose that
summary with Help Tooltip for supporting explanation; the high-impact
acknowledgement replaces the redundant tone icon with a leading Checkbox and
makes the adjacent title its label. The title group grows while the row-level
Help Tooltip anchors to the trailing inset, keeping the action associated with
the whole summary instead of an individual word. Material instructions or
recovery truth stay visible in the full presentation. The root is semantically
neutral by default because
visual danger and announcement urgency are separate concerns. Hosts opt into
`status` or `alert` only when insertion timing requires it. The primitive owns
no generic close action: routine transient confirmation belongs to Toast, and
transaction recovery remains a later lifecycle composition.
The isolated tone grid proves implementation anatomy but is not independently
a canonical review surface. Zapper supplies source-grounded compact-summary
context. Only supporting explanation may move into its Help Tooltip; material
decision, action, recovery, or lifecycle truth remains visible. Production
adoption stays explicit and product-owned, while form and policy use still
needs its own surrounding evidence.

Existing desktop Drawers remain migration evidence, not authority. Stake,
vote-lock, token-selection, and deploy flows should each pressure-test the
accepted centered-desktop/bottom-phone Dialog while preserving their own tabs,
draft state, scroll, reset, validation, and transaction lifecycle. Zapper keeps
its package-owned compact modal and dense 8px edge. Mobile navigation remains a
separate Red production-migration surface. No Drawer exception is justified until
a named flow demonstrates meaningful context or usability loss under Dialog.

## 2026-08-23 — Coordinated Global and Product navigation review

Global and Index DTF Product navigation were accepted through one coordinated
review because they appear at the same time, not because they are one
component. The Global baseline covers the non-wrapping 1200px-and-wider
desktop route row, bounded anchored grouped overflow, application-action
separation, and a full-region constrained-screen
composition. The Product baseline covers DTF identity, a current-route model
with small public activity indicators, the collapsed and hover/focus-expanded
40px rail, and the separate
constrained-screen pages menu. The shared realistic shell uses current Index DTF
and application-header evidence; legacy Yield DTF presentation is not authority.

The lab also renders the actual reusable owners before their complete
compositions: top-level global route, single-line global destination row,
Product identity, and Product destination row. Global bar destinations use
meaningful 16px icons with labels and the selected-surface role instead of an
active underline. Top-level destinations use a 2px sibling gap so adjacent
hover and selected pills retain distinct silhouettes. On the application home
route, none of these destinations is current; the shared owner renders a
neutral route row rather than selecting a fallback. The More popup and
constrained global navigation share one destination-row owner and content
anatomy without forcing one density into both hosts. Constrained navigation
uses the outlined 48px drawer recipe shared with DTF page navigation; desktop
More retains the outlined pill treatment in its 40px popup expression. Both
surfaces carry the complete current inventory: four primary destinations,
three internal tool destinations, and five external resources. Group headings
replace per-row subtitles on mobile. Internal rows end in a chevron, while
external rows replace it with the external-link indicator. Product rail
identity and route icons retain one 40px leading axis through expansion, while
the constrained menu uses its own 24px content-led identity slot so a rail
alignment correction cannot shift the mobile mark. Product route interaction
targets also remain 40px. Collapsed routes use one 40px circle; expansion
reveals a 40px outer pill and contracts the icon circle to 36px, transferring
the contained-selection system's 2px inset relationship without treating 36px
as a new standalone control size. The rail uses a 6px structural gap to retain
8px between the visible circle and label, keeps foreground content above its
translucent state layers, and fills the height supplied by its page host.
The constrained Product menu shares the rail's semantic selected, hover, focus,
icon, and 14px/500 label language, but keeps an explicit 48px full-width touch
row independent of optional icon content. Its state is one fully rounded surface with a 4px sibling gap; it
uses symmetric 12px outer inset, a 24px alignment slot containing the 16px
glyph, and the accepted 8px slot-to-label relationship. The constrained menu
uses a Product-Navigation-owned one-line identity trigger rather than the
two-line asset-row `EntityIdentity` anatomy. Its constrained 24px mark slot
shares the route-icon centerline and its DTF name begins on the route-label
axis. Chain context remains available through the expanded or constrained
canonical badged mark and navigation region label. The desktop rail keeps its separate 40px alignment
slot and the same 6px structural gap as its route rows. When collapsed, the
trigger shows only a plain 24px token logo inside an outlined 40px clickable
container—no chain badge or separate switch cue. The outline follows the full
clickable region through expansion, changing from the 40px collapsed circle to
the complete identity pill. Expansion restores the badged logo and places the
ordinary chevron at the far edge when labels are visible;
the constrained trigger retains its 20px badged logo. That 16px chevron is centered in an invisible 24px trailing slot,
adding optical inset without framing it as a separate control. The menu does
not inherit the rail's nested route-icon circle because it never collapses.

That identity row now opens a complete lab-only DTF-switcher submode, so users
need not return to Discover merely to change DTF. Activation pins the desktop
rail open and replaces page routes with DTF-logo-and-name rows; choosing a DTF
restores page navigation and updates the surrounding fixture. The constrained
menu uses the same transition. The identity trigger remains the current-context
owner, so the open switcher excludes that DTF and lists alternatives only. The
desktop rail keeps its 16px resting gap below the identity divider inside the
scroll viewport; rows therefore clip at the divider itself rather than at an
apparently arbitrary boundary below it. Pointer or focus exit dismisses both
the expanded rail and switcher submode, restoring the current DTF's ordinary
page navigation.
On mobile, switching moves to a detached 82 × 48px pill with an unbadged 32px
DTF token logo and a separate 32px ghost switch cue. Its 8px outer inset matches
the adjacent mobile action cluster, while the related logo and cue use the
established 2px contained-control gap. The 16px switch glyph is centered in its
control. Hover, focus, and open feedback reveal the ghost cue rather than
recoloring the entire floating surface; press reuses the accepted centered 0.98
button transform. A separate
48px right-hand floating cluster owns
page navigation plus contextual actions. Both open one full-width bottom-drawer
presentation: the long switcher grows and scrolls, while the page list remains
content-led. Both consume the canonical Drawer header's equal 24px top/right
action axis, and navigation row content aligns to the same 24px axis. Drawer
headers use the existing 16px/500/24px item-title role and a compact secondary
close control. The visible header-control-to-first-row gap matches the 24px
drawer-top-to-header-control inset. Drawer rows place the 16px trailing chevron inside a 24px slot
matching the leading icon wrapper, then use one 12px leading-slot-to-label gap
across both switcher and page-navigation rows. Popup-menu rows retain their bare 16px
trailing treatment. The current drawer-row review experiment uses an 8px outer
shape inset, 16px horizontal/12px vertical padding, a visible default outline,
and a 4px sibling gap. The active row reuses the established `primary/30`
selected-pill outline rather than dropping the edge or inventing a new blue.
This preserves the 24px content axis and returns the row height to 48px.
Supplementary content starts after a 16px section gap rather than inheriting the
4px sibling-row rhythm. The drawer shell alone owns the final 8px bottom inset
so the last row shape sits the same distance from the bottom and horizontal
edges; supplementary content does not add a second bottom pad. This does not
change the accepted balanced popup-row recipe. Drawer presentation
omits the menu recipe's identity and supplementary dividers, relying on spacing
and outlined rows for grouping. Page-drawer token contracts are not
de-emphasized footer metadata or nested cards. A single-chain DTF uses one
non-navigation row with the canonical badged DTF mark and “DTF on Chain” copy.
A multi-chain DTF uses a wrapping “{ticker} token addresses” group label and
chain-led rows with a 16px chain mark centered in the shared 24px leading slot
plus muted Native/Bridged roles, so a repeated or long ticker does not crowd
each address. Both forms keep each shortened address and
accepted `CopyableValue` action together while copying the full value. Both
triggers use 8px internal and sibling relationships. The global mobile entry point
is reviewed in a different phone specimen: a 56px application top bar opens the
global destination menu, so the lab does not imply that global and DTF controls
are one composition. The rail pins that identity while its remaining height scrolls, and the
constrained menu bounds its item viewport at 288px. The scroll viewport reaches
the owning surface's bottom edge rather than ending at its former outer inset.
A 32px surface-colored bottom fade signals continuation; equal end padding lets
the final row scroll fully clear of it. A static 16-item set from the captured
Discover snapshot pressure-tests density and overflow; it does not decide
production sourcing or ranking. List
sourcing, search threshold, current-subroute preservation, analytics, and
production adoption remain unresolved. The mobile trigger composition is still
an unadopted proposal; the current production logo-to-overview link remains
evidence rather than authority.

Both candidates consume the accepted Link contract directly, including
caller-owned accessible external-window copy, and use accepted popup, spacing,
typography, color, radius, motion, Button/IconButton, and identity owners. The
review deliberately excludes dormant generic subitems, route information
architecture, account behavior, analytics, and production
migration. Both are reusable, unadopted current baselines with separate owners;
acceptance of either does not merge their component contracts.

The mobile Product surface now uses the canonical Radix-backed Drawer behavior,
including focus containment, Escape/outside dismissal, and focus return to the
specific DTF-switcher or page-navigation trigger that opened it. A caller may
provide a contained portal host for a realistic lab frame without recreating
Drawer semantics. The Drawer shell owns its title and token-address region;
only destination rows sit inside the Product navigation landmark. The mobile
Global menu likewise moves focus to its close action on open and restores the
opening trigger on close. Utility language alternatives use explicit 44px touch
targets, and utility copy is caller-owned so production adoption cannot bypass
Lingui.

## 2026-08-25 — Transaction composition evidence routing

The transaction-system review treats
`src/views/internal/design-system/zapper-modal-study.tsx` as the strongest
earlier visual-composition study and
`src/views/index-dtf/components/zapper/zapper-wrapper.tsx` as the discoverable
real package-host seam. They are strong evidence for input/output pairing,
financial hierarchy, asset identity, balance and Max context, compact task
framing, and one dominant action. Neither is canonical authority: accepted V1
foundations and components retain that role, and package-owned controls remain
upstream-owned rather than copied into Register.

The exploratory transaction compositions must preserve or improve those
successful qualities while adding the audit's stronger lifecycle truth,
transaction-versus-order identity, scoped recovery, consequential outcomes,
and durable delayed-settlement semantics. A visible predecessor-transfer
contract names both source paths and records the reason for intentional
departures, including the evidence-backed decision not to force atomic, RFQ,
transparent-staged, and delayed work into one universal shell. Any later
removal of an important successful predecessor quality must name the stronger
evidence or product constraint that replaces it. These rules do not promote
the transaction candidates, change accepted foundations, restyle the package,
or authorize production adoption.

The installed Zapper's quote-search overlay is part of that product evidence:
progressive search language, elapsed time, and an animated output surface
communicate a genuinely longer upstream operation. The lab exposes a bounded,
persistent `Quote search` review state (and also enters it through Refresh) so
it can be found and inspected without racing a timer, and keeps its reviewed
animation in motion rather than presenting a still reconstruction. The package
continues to own its latest exact animation, timing, quote mechanics, and
production implementation; after the 2.10.5 reconciliation the lab must not
claim pixel or speed parity without a same-build comparison. Review and quote
search preserve one geometry: input selection,
Max, quote-details trigger, and action remain mounted; unavailable controls are
disabled rather than removed; an open details region replaces uncertain values
with equal-height skeleton rows. Only the output region materially transforms,
so the shell, amount pair, and collapsed or expanded details retain their
dimensions across the transition.

The follow-up synthesis treats state as composition hierarchy rather than an
appended footer. Review keeps financial intent first. Zapper execution preserves
that composition and expresses route-specific progress in the stable action
slot; recovery and outcome may lead when they become the user's current job.
The relevant amounts, requirements, orders, and queue context remain present.
The Amount candidate keeps a 4px paired seam, widened from the predecessor's
current 2px during human review, plus explicit direction, primary editable
input value, and one 20px footer relationship for fiat, balance, and the bounded
InlineAction. A submitted read-only amount preserves geometry but moves from
neutral control fill and primary text to the content surface and foreground
text. Accepted Metric anatomy
handles ordinary financial facts. Requirement values align into comparable
columns; truthful lifecycle steps use a quiet connected sequence; durable queue
rows remain open; and outcomes lead with the consequential result instead of a
nested generic success card. These are provisional transaction-composition
decisions, not changes to accepted lower-level baselines.

Direct current-flow reconciliation is now a required evidence layer for this
board. Production Manual issuance supplies its editable amount, approval-to-mint
action slot, and persistent requirement region as evidence. The current Manual
lab deliberately separates desired amount, approvals and final Mint; this is a
flow-local review trial, not an inherited production requirement. Automated mint retains its
narrow configure step, later widening into the flow-owned order workspace,
scoped retry, final-mint boundary, and dedicated outcome. Delayed unstake
retains separate input-page, confirmation-Dialog, and durable-queue surfaces.
Installed Zapper retains one package-owned interaction and result boundary.
Accepted V1 owners standardize the presentation inside those structures; the
audit supplies shared lifecycle requirements but cannot authorize a replacement
flow architecture. Any deliberate structural improvement must be labeled as
such, with larger product redesign kept outside this review.

The correction pass removed three false system signals. Audit explanations do
not become task copy unless they change the user's decision; dense financial
tasks use the accepted 8px shell edge rather than inheriting the ordinary 24px
Dialog content axis; and outcome similarity is not evidence for a reusable
layout until independently composed families converge. Manual requirements retain
individual approval/revoke actions alongside the aggregate approval-to-mint slot. Automated
configuration keeps its real fixed USDC input and one visually continuous
three-step surface. Delayed confirmation states cooldown timing once, then
dismiss the task shell and move the durable queue ahead of the old input form.
RFQ, automated, and delayed outcomes share semantic ingredients but retain
family-specific composition. Manual outcomes are a review trial using submitted
shares and explicitly expected basket values; receipt-derived result truth remains
engineering-owned. Max/Use fixtures update every visibly dependent value so the
lab does not teach stale financial relationships.

The Manual/Automated outcome review now borrows Zapper's flexible brand-region
spacing, default-sized footer actions and received-DTF bookmark. These are
local composition refinements, not a universal outcome controller: Automated
retains order and funding evidence, while Manual keeps its estimated basket
and explicit explorer simulation without fabricating a transaction hash.

Transaction access follows its job, not one universal placement. Manual and
Automated outcomes use a default-sized secondary View transaction footer action
beside primary View DTF. For one final transaction, the footer is sufficient:
Automated omits its former labeled hash/copy row, while Manual keeps its honest
explorer simulation without fabricating a hash. Both page-based outcomes keep
a compact secondary New mint / New redeem action in the header because they
have no modal close-to-form path. Automated restarts with an empty amount,
preserving operation and chain while clearing the completed session's funding
choices and order inspection. Simple Zapper, Vote-lock
and Stake outcomes retain their explorer/Done footer arrangement. Multiple
transactions stay associated with their respective result rows through labeled
text links, as in two-role Delegation. Do not duplicate an explorer destination
between facts and footer or confuse a collateral order with the final transaction.

An active primary action keeps its primary tone while loading, whether it is
an approval, collateral authorization/execution, or the final transaction.
Spinner, busy semantics and disabled repeat clicks communicate waiting;
secondary styling is not a prerequisite-status code. A separate upcoming action
remains neutral and disabled until its prerequisites are satisfied. Zapper's
Sign order specimen represents an already-open wallet request and uses the
existing “Pending, sign in wallet” loading treatment, not an actionable prompt.
These are lab composition choices; shared Button defaults and transaction
preparation remain unchanged.

Dense identity rows must not pair padded ghost copy/explorer buttons merely to
match nominal control sizes: invisible circular insets distort the visible gap
and trailing alignment. Use the accepted inline Copyable Value for compact copy
jobs, and a labeled Link when navigation belongs to a specific result row.
Check visible glyph alignment as well as interaction targets; do not repair
alignment by shrinking or overlapping targets. Shared Button defaults remain
unchanged. The rejected twin-micro-control experiment is not precedent.

The Manual Mint/Redeem proof started with two anchors, then expanded to a
29-state lab lifecycle. Mint
keeps one high-level share task beside a five-asset requirement ledger with
independent Approved, Approve, and Revoke boundaries plus the retained
unlimited-approval control. Redeem reuses the amount and ledger geometry but
removes every approval and order affordance. The ledger is flow-owned; only its
amount, identity, status, and action primitives are shared candidates.
Transaction controls drive simulated wallet/chain states; navigation previews
remain explicitly non-executing. No wallet or production writes occur.
Input, Max and dependent fixture requirements remain interactive and consistent;
Mint capacity is basket-limited while Redeem Max comes from held DTF shares.
The ledger stays visible on narrow screens because its permission rows can be
required work, not merely optional order detail. The readiness brief owns the
exact geometry measurements and deferred production/engineering boundaries;
[the lifecycle contract](../../plans/manual-issuance-lifecycle-lab.md) owns
current state coverage. Approval progress is independently tracked per token,
not one batch signature. USDT's aggregate reset mismatch remains visible.
Manual's current row proposal stays asset-led and flow-local. Mint places
identity/explorer and approval above a Required/Balance comparison; an
insufficient balance replaces the balance label without adding a row. Redeem
places expected quantity and USD value beside identity, without redundant
comparison labels. Standard-density identity names and primary amounts share
16px/24px typography; supporting addresses, labels, and USD values stay 14px/20px.
Existing 32px marks, 28px actions/statuses and 24px content
axes remain; 12px vertical row padding gives 24px between assets without separators or
individual cards. Unlimited uses a plain checkbox labeled “Approve unlimited
token amounts” within the left Token approvals section, with 24px from its
supporting row to the setting and 16px to the aggregate action on the 24px text axis.
The first two left regions consume the amount primitive's light label, prominent
value/progress and smaller supporting row. The final region instead pairs a
16px Mint label with the approval count's responsive light headline scale
(22px/28px below 360px, 28px/32px below 640px, then 32px/38px), the existing 32px CMC20 mark
and a 14px explanation of exchanging basket tokens for CMC20. “Approvals needed,”
“Ready to mint” and “Mint in progress” summarize the step; the button alone owns
exact amount and wallet/chain phase. Empty, unavailable or insufficient states
do not claim readiness. Automated's distinct numeric output summary stays.
Manual and Automated share a lab-local stage-emphasis recipe: primary label and
main value/count for the current task, readable neutral completion and muted
upcoming labels. `aria-current="step"` identifies the same stage. Structural
arrows and card surfaces do not encode completion. A small green check uses
normal-foreground supporting text. Manual's neutral inactive input retains its
focus ring; shared amount defaults are unchanged. Insufficient collateral is
explained near that input, while production-supported approvals remain available.
Sufficient allowances are not sufficient balances: Mint stays blocked until both
are satisfied. Manual's summary shares the label-to-headline spacing, 24px content axis and label top inset.
Its explanation sits 24px above the ordinary action, or 16px above a recovery
message followed by an 8px message/action gap. Only the current stage's label
and readiness text use primary emphasis; financial values are not repeated.
Separate-request explanation is available in
the approval summary's factual help. Switch to Zapper belongs to the top amount
section. Both boundaries consume Automated's connected arrow treatment through
the local TransactionStageBoundary owner. A middle-section button needs 24px
bottom clearance to avoid the arrow circle; a terminal button keeps its 8px edge.
The final Mint action remains below the second boundary, unavailable
until requirements are met. Redeem's direct input/action gap is 8px. The default and policy
are unchanged. Preserve token explorer links and Revoke help.

Transaction review canvases isolate their local layers below the sticky lab
navigation. Stake/Vote Lock backdrop hosts fill the unpadded stage; their
contained modal layer participates in a single grid cell so tall content can
grow the canvas. Zapper uses the same 680px minimum review height rather than
its obsolete 980/760px fixed preview heights. These are lab framing rules, not
production modal sizes. Intentional narrow task and page maximum widths remain.

Manual's authorized refinement replaces the approval controls with a readiness
message when allowances suffice, removing their old geometry while retaining the setting for later
requirement edits. Progress counts sufficiently approved tokens outside the
button, including existing allowances, rather than counting this attempt's
transactions. The final readiness headline and explanation remain mounted;
the explanation/action gap is 24px. Ready, signing and confirming share this
geometry for single-line headlines, without duplicating wallet/chain phase copy.
Longer translations wrap naturally. Failure summaries name affected assets and mark their
existing action slots. Known wallet rejection is informational; transaction
failure remains danger. Outcomes state completion once, identify basket assets
used/received and explicitly qualify fixture amounts as estimated. A transaction
footer action previews the final record without inventing a hash; New mint / New
redeem in the header and View DTF retain reset and continuation roles. These remain Manual composition trials, not
new shared behavior or production error/receipt contracts.

Manual's desktop lab host matches Automated's 1200px maximum review width and 736px height; both columns fill that
height and scroll at their outer edges when needed. This simulates a stable page
workspace, not a production height requirement. Task contents remain top-grouped
at their natural height. Spare white space belongs
below that group; beige is the 2px column seam, not an accidental cutout beneath
the task. Mobile stays natural-height. Outcome height measurements use task
contents, not the stretched surface.

The Zapper pressure test now distinguishes review qualification from outcome
follow-up. The current production-derived capacity, market-hours, and
unavailable notices remain dismissible and preserve their product copy, but the
lab places them in a compact region revealed directly below the current action.
A 2px card-color frame owns the assembled task, the card-colored task surface
casts slight depth over the region, and the region uses the accepted opaque
`substrate-subtle` attached-surface role. Its uniform 24px content inset is
composition-owned. The warning title and a local 20px bare dismiss action share
one horizontal axis. The dismiss action expands its pointer target to 44px
without making that target part of the row's layout geometry; it is exploratory
pressure on the still-open Icon Button hit-target question, not an accepted
Icon Button variant. The former status pill is intentionally removed so the
attached region does not spend a second row restating warning semantics. It
shares only approved frame, substrate, and depth geometry with transaction
progress; the two regions keep separate semantic and content owners and do not
establish a generic grouping-surface component.

One separately labeled lab fixture retains the former `Try CoW Swap` large-order
recommendation and uses an exploratory secondary `Open CoW Swap` micro CTA
solely to pressure-test an advisory action without competing with the primary
Zapper action. It is retired product evidence, not a current Zapper state: since
`react-zapper` 2.7 the package quotes CoW Swap and PancakeSwap X itself, so the
current production prompt removed every redirect-for-price variant and CTA.
The distinct high-price-impact fixture keeps the eventual transaction action
primary but disables it until explicit acknowledgement; its `Buy anyway` /
`Sell anyway` copy carries the accepted consequence instead of introducing a
new warning-colored Button tone.

Outcome follow-ups remain optional additions after completion rather than
qualifications of the current action, but no longer use a responsive sidecar.
They mount with the outcome at every width as one full-width attached
`substrate-subtle` region beneath the result, with 24px text and 8px control
axes. The combined outcome-plus-attachment frame owns the no-shrink minimum so
the main result card can remain content-height. A persistent close action makes
Done redundant; Schedule or Subscribe is the one primary continuation, while
the explorer action fills the result footer. The Organic Brand `deep` tone adds
depth only in dark mode; light mode retains the ordinary result surface. The
attachment tone, composition, and entrance remain lab-only: production
`LargeMintPrompt` has not adopted them, and the historical CoW redirect copy is
not restored.
