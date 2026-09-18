# Design-system documentation human-review remediation

Planned 2026-09-18 after the first human visual review of the implemented
scroll-first documentation pass. This is the active repair contract for the
documentation experience. It preserves the verified work recorded in
`design-system-documentation-visual-reconciliation.md`, but supersedes that
document's claims that component depth, specimen surfaces, Product navigation,
and transaction framing are ready for acceptance.

## Goal

Make the design-system documentation work as a complete visual reference rather
than a catalog of previews. A designer or engineer should be able to scroll the
main pages—or jump with one compact left navigation—and understand what the
system contains, which variants and states are supported, how components size
and behave, and what is accepted versus still being explored. Detail pages
remain useful for guidance and implementation depth, but they must not hide the
ordinary system.

Repair the lab framing at the same time: every result must have a deliberate
width, backdrop, padding, and alignment that clearly separates documentation
framing from the component or pattern under review. A lab backdrop may support
contrast and natural presentation, but it never defines the implementation
inside it.

## Current state

- One persistent left navigation and scroll/hash tracking exist, but the
  sidebar is visually too padded and active rows look like filled controls.
- The right-side table of contents has been removed, but the left hierarchy can
  become substantially denser without losing hierarchy or keyboard access.
- Button is the only ordinary component whose overview begins to describe the
  actual system. Most of the other accepted components still show one or two
  teaser examples and require `Open details` for basic comprehension.
- Icon Button shows only one compact secondary example and a disabled state. It
  does not expose the accepted Compact system clearly enough, but documentation
  must not add sizes that have not been included in the design system.
- Action Group omits the complete accepted horizontal/vertical recipes and the
  Button width rules they consume.
- Dialog presents an invented Proposal Simulation composition whose title,
  subtitle, close relationship, and footer actions have not been accepted. The
  real, more-developed Eligibility candidate is hidden in the detail page and
  displayed too narrowly there.
- Product navigation is framed as a tiny object floating in a large beige mock.
  The desktop host does not express the accepted rail-and-content geometry, and
  the mobile specimen removed real Buy/Sell, Chat, page-menu, and conditional
  Portfolio actions.
- Transaction controls are improved but still expose unclear labels, unstable
  specimen heights, separated Previous/Next actions, fabricated launcher cards,
  inconsistent width use, and incorrect lab backdrops.
- Some fluid workspaces and tables remain artificially narrow; some separate
  examples are placed side by side even when that makes both unreadable.
- Surface assignment was generalized incorrectly. Some isolated components
  received beige, while centered transaction/page states that genuinely float
  on an exposed beige page remained on white.
- Typography samples remain too narrow, and foundation/component descriptions
  still lean on internal terms where plain examples such as “buttons, tabs” or
  “tooltips” would convey usage faster.
- The one-word documentation status treatment can still be mistaken for a
  component specimen in sensitive contexts such as Button.

## Non-goals

- Do not change design authority, accepted component meaning, tokens, shared
  defaults, production adoption, product mechanics, transaction math/data, or
  public product copy.
- Do not promote implementation capability into accepted design meaning. When
  implemented capability exceeds accepted scope, show the distinction
  explicitly.
- Do not invent product compositions to make a component example feel complete.
- Do not translate the internal documentation. Existing public UI translations
  remain untouched; internal documentation continues to fall back to English.
- Do not make every result full-width because the right rail is gone. The
  documentation body stays capped and each specimen declares its own honest
  width behavior.
- Do not force Charts, Tables, Navigation, Transactions, or ordinary components
  into the same axes. They share documentation grammar, not content structure.
- Do not resolve open owner-level questions such as Global Navigation portal
  containment or production Product-navigation divider ownership by silently
  changing the component.
- Do not stop, restart, or reconfigure the user's preview on port 3055. Do not
  commit, push, stash, reset, or discard unrelated changes.

## Locked interpretation of the human feedback

### Overview versus details

The main Components page answers **“What is the system?”** for every accepted
component. It directly shows the meaningful accepted:

- variants or presentations;
- sizes and density settings;
- default plus important states;
- anatomy when the component is structural rather than variant-driven;
- width/layout behavior when that is part of correct use;
- short, human-readable examples of where the component is used.

`Open details` answers the next questions: when to use it, Do/Don't guidance,
accessibility and interaction guidance, rare combinations, API/implementation,
evidence, and history. A reader must never need details merely to discover an
ordinary supported size, state, or variant.

Do/Don't blocks are added selectively when they prevent a likely misuse. They
are not repeated as empty ceremony on every component. Button owns the
intrinsic-versus-fill width rule; Action Group demonstrates how it consumes that
rule.

### Truthful authority

- `Accepted` describes only the accepted owner and scope.
- `Exploring` is visible beside real in-progress examples such as the
  Eligibility composition.
- Do not present a generic Dialog shell as accepted until its title/subtitle,
  close-action relationship, footer/action behavior, and width rules have been
  reviewed clearly enough to support that claim.
- Not started, Not planned, Superseded, and Exploring entries remain compact and
  truthful. They do not receive invented examples or full-height empty canvases.
- Status styling is documentation metadata: plain compact text/pill treatment,
  no Button-like border, fill, hover, or control silhouette.

### Canvas and backdrop taxonomy

The lab backdrop is documentation presentation, not part of the documented
component's contract. Its job is to make the focus of the section legible and
clearly distinguish “the lab” from “the thing being inspected.” A backdrop may
also resemble a natural environment for the specimen, but it does not claim
that the component requires, owns, or should implement that background.

1. **White lab backdrop** — used when the specimen already has enough edge,
   structure, or contrast to remain easy to judge.
2. **Neutral light-gray lab backdrop** — the normal contrast aid for white
   components, isolated surfaces, phone/viewport frames, and width
   demonstrations. Dark theme uses the corresponding neutral semantic role.
3. **Beige lab backdrop** — available when a centered white card, modal, or
   pattern is easier to judge against the product's familiar warm substrate and
   that setting looks natural. This is still lab framing, not component styling
   or proof of a production host requirement.
4. **Real composed context** — used only when the specimen deliberately shows a
   complete or cropped page relationship. In that case, the actual white
   regions, beige seams, and layout geometry belong to the composition being
   demonstrated.
5. **Full-canvas workspace** — a page/workspace result that owns the specimen
   area; it does not receive decorative padding that changes its geometry.

When beige is part of a real composed context, preserve the existing structural
rule: 2px between major white regions and 1px between subsections where that
relationship applies. When beige is merely a lab backdrop, do not infer seams,
padding, border behavior, or implementation requirements from it.

### Width, padding, and stability

- The overall documentation column remains centered and capped.
- Intrinsic controls retain natural width; fluid records use the full padded lab
  width; real workspaces use their accepted host cap rather than the browser
  edge.
- Micro and Compact Buttons remain intrinsic, grouped or standalone. Default
  Buttons may fill a layout-owned track, especially in vertical task actions.
- Contained isolated specimens receive visible token-based padding on every
  side. A component must not touch the dashed lab boundary unless it genuinely
  owns the full canvas.
- Modal-like results remain centered within a stable canvas with breathing room.
  Shorter/taller states do not move the controls below them.
- Previous and Next remain adjacent. Ordered navigation supplements, but never
  replaces, direct state selection.
- Two examples stack vertically whenever side-by-side placement makes either
  example narrower than its realistic host.

### Navigation hierarchy

- One full-height left sidebar remains the only persistent documentation
  navigation and uses its available height for an independently scrolling list.
- All high-level categories and their children remain visible/expanded so the
  library's extent is scannable.
- Hierarchy is expressed with type, weight, indentation, and compact spacing.
  Subsection links form a tight text list with minimal vertical padding and no
  row background. Resting, hover, and active states are communicated through
  text color and weight.
- Links retain a usable transparent hit target and visible focus even though
  their visible text rows and inter-item gaps become denser.
- The exact visible child and its ancestors stay synchronized while scrolling.
  Clicking scrolls to the section; direct links, reload, Back, and Forward
  restore it.
- Transactions remains a Pattern with its truthful Paused status. Workbench is
  for exhaustive engineering/review tooling, not the primary human route.

## Complete component inventory contract

The implementation cannot close on a few corrected screenshots. Before editing,
build a machine-readable coverage record for all 45 catalog entries with:

- authority and implementation state;
- overview structure used;
- accepted variants/sizes/states/anatomy exposed;
- default explicitly present or a reason it has no default axis;
- width, padding, alignment, lab backdrop, and overflow disposition;
- detail-only guidance retained;
- direct source/owner used and any human gate.

### Actions

| Component          | Main-page result                                                                                                                                                                          | Detail/guidance boundary                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Button             | Tone × Micro/Compact/Default matrix; important available, disabled, and loading states; width behavior demonstrated                                                                       | Do/Don't for intrinsic Micro/Compact versus composition-owned Default fill; label/icon/accessibility and rare states              |
| Icon Button        | Integrated with the Button family at the single Compact 32px size currently included in the system; show its accepted tones and important states without inventing Micro or Default sizes | Accessible naming, recognizable-icon, tooltip, toggle, and visible-geometry versus hit-target guidance; open scope stays explicit |
| Action Group       | Three accepted recipes directly visible: related Compact horizontal/intrinsic; destructive Default horizontal; narrow-task Default vertical/full-track                                    | Composition selection, wrapping avoidance, and examples; width rules link back to Button                                          |
| Transaction system | Pattern pointer with Paused/Exploring truth; no tiny component teaser                                                                                                                     | Complete primary presentation under Patterns; exhaustive fixtures remain review tooling                                           |

### Fields

| Component           | Main-page result                                                                                                              | Detail/guidance boundary                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Text input          | Default, filled, focus-visible demonstration, disabled, read-only, invalid and valid where accepted; label/help/error anatomy | Validation/accessibility combinations and API                                              |
| Textarea            | Same accepted field anatomy with realistic multiline width and resize/disabled behavior                                       | Long-content, validation, and API guidance                                                 |
| Select              | Default and Compact triggers; resting/open/selected/disabled coverage; leading identity where accepted                        | Popup behavior, keyboard use, bounded-value rule, and exclusions                           |
| Multi-select filter | Empty, applied, open/options, and disabled/clear behavior at realistic width                                                  | Selection workflow and filter-specific guidance                                            |
| Search field        | Empty, query, clear, focus, disabled, and no-results relationship                                                             | Search behavior, empty-result guidance, synonyms/token coverage when separately authorized |
| Combobox            | Compact Not planned treatment with relationship status; do not direct people to an unavailable replacement                    | Reopen condition only                                                                      |
| Amount field        | Compact Exploring treatment linked to transaction evidence without implying a generic accepted field                          | Transaction-local evidence and open decisions                                              |
| Asset picker        | Compact Exploring treatment that distinguishes implemented transaction-local selection from a generic component               | Local evidence, package/product ownership, and open standalone scope                       |

### Selection

| Component         | Main-page result                                                                                           | Detail/guidance boundary                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Checkbox          | Unselected, selected, focus-visible, disabled-off and disabled-on if supported; label relationship         | Eligibility-specific use and richer anatomy remain guidance/evidence |
| Radio group       | Default group with selected, peer, disabled, keyboard direction, intrinsic/full-width behavior if accepted | Rich choice-card exclusions and form semantics                       |
| Switch            | Off/on, focus-visible, disabled-off/on in one labeled state system                                         | Immediate-action semantics and pending exclusions                    |
| Segmented control | Contained/text-only × Compact/Default matrix plus selected/unavailable state                               | Mode-versus-action guidance and narrow overflow                      |
| Slider            | Compact Not started treatment                                                                              | Open requirements only                                               |

### Navigation components

| Component          | Main-page result                                                                                               | Detail/guidance boundary                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Global navigation  | Pattern pointer that reaches the real result; no dead-loop detail page                                         | Complete system under Navigation Patterns                                  |
| Product navigation | Pattern pointer that reaches the real result; no miniature teaser                                              | Complete desktop/mobile system under Navigation Patterns                   |
| Link               | Inline, standalone, and return treatments with visible hover/focus/visited/unavailable coverage where accepted | Navigation-versus-action and accessibility guidance                        |
| Tabs               | Compact/Default × intrinsic/full-width system, real panels, selected/available/disabled                        | Overflow, panel semantics, and when Segmented Control is the correct owner |
| Pagination         | Default result plus first/middle/last and constrained-width behavior; counts explained in human language       | Large-count and accessibility guidance                                     |
| Stepper            | Compact Exploring treatment tied to flow-local evidence; do not imply a generic accepted component             | Open ownership and transaction-local evidence                              |
| Breadcrumb         | Compact Not started treatment                                                                                  | Reconsideration conditions only                                            |

### Overlays

| Component | Main-page result                                                                                                                                                                                                         | Detail/guidance boundary                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog    | Remove the generic Proposal Simulation example and do not show a generic shell as Accepted yet; show the more-developed Eligibility collapsed and expanded compositions stacked at realistic width and labeled Exploring | Use detail/review material to resolve title/subtitle/close geometry, footer actions, widths, dismissal, focus, and responsive behavior before asserting a generic accepted shell |
| Drawer    | Compact Exploring treatment with its real bounded ownership; no promotion through Product navigation examples                                                                                                            | Interaction evidence and unresolved generic scope                                                                                                                                |
| Popover   | Accepted popup behavior represented by a real accepted consumer without implying that consumer anatomy belongs to Popover                                                                                                | Positioning, dismissal, focus, and ownership guidance                                                                                                                            |
| Menu      | Trigger plus open menu, disabled/destructive rows only where accepted, and keyboard focus                                                                                                                                | Placement and action-menu guidance                                                                                                                                               |
| Tooltip   | Resting trigger and visible tooltip at readable size; explain use in plain language                                                                                                                                      | Accessible-name rule, delay/placement, and touch exclusions                                                                                                                      |

### Feedback

| Component          | Main-page result                                                                                                    | Detail/guidance boundary                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Inline message     | Information/success/warning/danger with title, description, and optional action/compact presentation where accepted | Choosing persistent versus transient feedback and recovery guidance |
| Toast              | Compact Not started treatment; do not manufacture a toast system                                                    | Existing evidence and open decisions                                |
| Progress indicator | Compact Not started treatment; transaction progress does not silently become a generic component                    | Open decisions                                                      |
| Spinner            | Supported size system and representative inline/control/page use                                                    | Accessible labels and when Skeleton is preferable                   |
| Skeleton           | Text, control, identity, and real row/card geometry—not generic bars only                                           | Loading-layout fidelity guidance                                    |
| Empty state        | Quiet and actionable presentations at realistic width, including action hierarchy                                   | Empty-versus-error/no-results guidance                              |

### Data display

| Component           | Main-page result                                                                                                                | Detail/guidance boundary                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Lifecycle status    | Complete accepted semantic role set with human usage examples; docs `Accepted` metadata remains visually distinct               | Lifecycle mapping and misuse guidance                         |
| Entity identity     | Density, mark, supporting text, stacks/fallback, and constrained-name behavior in a structured matrix                           | Source/fallback/accessibility guidance                        |
| Metric              | Inline/headline roles, positive/negative/neutral only where accepted, and long-value pressure                                   | Financial typography and truncation guidance                  |
| Card/content region | Truthful source-bound feature-card example or compact scope explanation; never claim a generic Card/pattern that does not exist | Structural-region guidance and explicit generic-Card non-goal |
| Table               | Pattern pointer that reaches the full accepted families                                                                         | Complete result under Table Patterns                          |
| Data table          | Compact Exploring treatment; no universal API claim                                                                             | In-composition evidence and open API decisions                |
| Chart               | Pattern pointer that reaches the full accepted families                                                                         | Complete result under Chart Patterns                          |
| Copyable value      | Default/inline treatments, copied feedback, constrained long value                                                              | Machine-identifier scope and accessibility guidance           |

### Disclosure

| Component   | Main-page result                                                                                               | Detail/guidance boundary                               |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Accordion   | Resting/expanded and multi-item rhythm if accepted; interactive states understandable without discovery clicks | Single/multiple behavior and content guidance          |
| Collapsible | Resting/expanded with truthful cues and realistic content width                                                | Cue wording, ownership, and bespoke-trigger exclusions |

## Foundations and human-readable language

- Widen Typography specimen columns so Display, Lead, and body roles render at a
  useful reading measure instead of wrapping into misleading narrow stacks.
- For every foundation and component, add a concise “used for” phrase when the
  current label is primarily internal language. Prefer recognizable examples:
  “buttons and tabs,” “tooltips,” “form labels,” “page headings,” and similar.
- Preserve accurate technical terms as secondary detail rather than deleting
  them when they remain useful to implementers.
- Keep Color and other long foundation sections navigable through the unified
  left sidebar and scroll tracking; do not reintroduce a right rail.

## Complex-family repair contracts

### Product navigation

#### Desktop

- Render a larger realistic application frame, not a tiny rail in a decorative
  beige field.
- The product rail begins at the left edge and spans the frame's full height.
- The remaining width is occupied by two empty white content regions using the
  accepted primary/supporting relationship. Both match the rail height.
- Use the established page grammar as evidence: separate 220px rail; Overview's
  approximate 1.45:1 primary/supporting relationship at the reviewed desktop
  frame. Do not present these historical measurements as newly accepted global
  layout tokens.
- Reveal beige only as the structural substrate: 2px between major regions and,
  where needed, a thin outer inset that makes the substrate legible. No large
  random beige gutters and no gray line terminating against beige.
- Keep the rail readable at realistic scale and exercise collapsed, expanded,
  identity/switcher, active, and public-activity states through visible controls.
- The host body remains empty structural regions. Do not fabricate charts,
  metrics, buttons, or Index details.

#### Mobile

- Use a taller white 390px phone canvas inside neutral light-gray lab framing.
- Preserve the real accepted action cluster: page-menu trigger, Buy/Sell (or the
  truthful eligibility/Sell variant), Chat/Ask Reserve AI, and conditional
  Portfolio action where applicable.
- Keep the detached DTF mark and the complete action cluster visible; provider-
  free fixtures may freeze state but may not delete real controls.
- Show Resting, Pages drawer, and Switcher drawer states directly at readable
  phone width. Important drawer state must not rely on accidental clicking.
- Keep the page body empty rather than inventing content. Neutralizing the host
  removes fake page content, not navigation functionality.
- Clearly separate low-level ProductNavigation ownership from the complete
  accepted mobile shell composition it participates in.

### Global navigation

- Present the actual desktop and constrained systems at readable scale and in a
  host that contains every opened menu.
- Do not let an overflow menu visually escape into the next documentation
  section.
- Keep accepted destinations and account/connection states visible without
  overloading one canvas. Use the shared direct-state controls rather than
  requiring discovery clicks.
- Size each documentation host to keep its real opened content reachable and
  contained. Do not turn host height into a new Global Navigation component
  rule.

### Transactions

- Keep five flow families as separate Pattern sections: Zapper, Automated
  Mint/Redeem, Manual Mint/Redeem, Vote Lock, and Stake.
- Use human controls: flow/family, operation, phase, and state. Replace internal
  fixture language with task language; each control label must be understandable
  without knowing the lab implementation.
- Direct state selection remains available. Adjacent Previous/Next supports fast
  sequence review, stays in one stationary row, and does not move when the
  result height changes.
- Give each family a stable breakpoint-specific stage. Tall states scroll inside
  that stage rather than pushing controls around.
- Replace fake Stake and Vote-lock launcher cards with centered documentation
  buttons. They initiate specimen state only and must not look like approved
  product UI.
- Center modal-like Zapper, Stake, and Vote-lock states with generous padding.
  Where the actual visible context is an otherwise empty beige page, the entire
  specimen stage is beige and the white flow floats within it.
- Automated's narrow centered configuration uses a beige lab backdrop when that
  gives the centered white task a natural, legible contrast. This does not make
  the backdrop part of the transaction implementation. Its later two-column
  workspace uses the full real workspace geometry and its 1200px host cap; it is
  not wrapped in modal padding.
- Manual Mint/Redeem uses the full available accepted workspace width rather
  than a smaller arbitrary preset.
- Preserve amount/state continuity and declared reset defaults. Presentation
  repair must not alter transaction behavior.
- Audit every family for fixed narrow widths that came from lab defaults rather
  than real use. Auctions and other page workspaces should generally consume
  their realistic container; charts and bounded dialogs should not be blanket
  stretched.

### Tables and records

- Use full padded documentation width for fluid table families so the accepted
  desktop projection can actually render.
- Current and historical governance/auction examples stack vertically rather
  than sharing two compressed columns.
- Keep direct controls consistent with the shared lab grammar while retaining
  table-specific axes such as family, state, and viewport.
- Preserve real loading skeletons, scenario labels, row destinations, and narrow
  horizontal access. Do not replace owner output with explanatory sentences.
- Cap the overall documentation measure even though individual table canvases
  are fluid within it.

### Charts

- Preserve source-faithful chart dimensions and live owners. Do not zoom a
  desktop image and label it Phone 390.
- Use the same visual control grammar as Tables and Transactions, but retain
  chart-specific choices such as family, range, and genuine host width.
- Choose a representative overview result large enough to communicate the
  accepted baseline. A human decision remains required if multiple accepted
  owners are equally truthful.
- Phone presentation must be a genuine narrow render or an explicitly labeled
  natural-size scroller, never a scaled screenshot pretending to be responsive.

## Slices

### Slice 1 — Authority inventory and regression contract

Blocked by: none.

1. Generate the 45-entry coverage record from the typed catalog.
2. Map each accepted entry to its canonical implementation, accepted decision,
   current overview, and detail-only content.
3. Record every invented composition, missing axis, hidden ordinary state,
   unclear label, fixed-width mismatch, and backdrop/padding mismatch.
4. Add failing behavior tests for the locked contracts: complete accepted
   coverage, compact status metadata, no invented Proposal Simulation example,
   Button/Icon Button/Action Group coverage, Eligibility Exploring visibility,
   and pattern destination reachability.
5. Capture a pre-change visual index at ordinary viewport height; full-page
   images remain supplemental.

Produced interface: one typed/documented coverage record that the overview and
tests consume. No component or product authority changes.

### Slice 2 — Compact unified navigation and shared documentation grammar

Blocked by: Slice 1 coverage record.

1. Compact sidebar row rhythm, subsection spacing, and indentation.
2. Replace active fills with text color/weight only while retaining
   focus-visible and usable transparent hit areas.
3. Preserve scroll-spy, ancestor state, active-item containment, mobile drawer,
   and history semantics.
4. Refine `DocumentationSpecimenCanvas` so documentation backdrops distinguish
   white, neutral-gray, beige contrast, real composition, and full workspace
   without implying that the backdrop belongs to the component implementation.
5. Make width, padding, alignment, stable height, and overflow explicit and
   testable. Remove presentation labels that expose implementation taxonomy.
6. Introduce only the smallest family-agnostic matrix/anatomy/state layout
   helpers. No helper may branch on a component name.

Primary ownership: `documentation-navigation.tsx`,
`documentation-specimen-canvas.tsx`, `documentation-specimen-layout.tsx`, and
their focused tests.

### Slice 3 — Complete ordinary component reference

Blocked by: Slice 2 grammar.

1. Rebuild Actions first: Button/Icon Button as one legible family, the complete
   Action Group recipes, and selective Button Do/Don't guidance.
2. Rebuild Fields and Selection from accepted axes, including open/selected and
   valid/invalid states where authority supports them.
3. Rebuild Navigation components, Overlays, Feedback, Data display, and
   Disclosure using the inventory tables above.
4. Remove the invented Dialog composition and withhold a generic Accepted shell
   example until its anatomy is reviewed. Show the real Eligibility candidate
   labeled Exploring; stack collapsed/expanded states at realistic width.
5. Ensure every accepted entry satisfies the coverage record and every
   non-accepted entry remains compact and truthful.
6. Make descriptions human-readable and keep technical scope as secondary
   guidance.

The detail route remains operational throughout. Ordinary system coverage moves
to the overview before any corresponding detail-only duplicate is removed or
reorganized.

### Slice 4 — Product and Global navigation reconstruction

Blocked by: Slice 2 canvas grammar.

1. Rebuild the desktop Product host to the rail/full-height/two-region geometry.
2. Restore complete mobile actions from the accepted/source composition.
3. Expose important states through explicit documentation controls.
4. Repair Global constrained host containment and state access.
5. Confirm every specimen uses real owners and no fabricated product body.

Primary ownership stays in `documentation-pattern-navigation.tsx`; canonical
navigation implementations and production call sites are read-only evidence
unless a separately approved owner fix becomes necessary.

### Slice 5 — Transaction, Table, and Chart convergence

Blocked by: Slice 2 canvas grammar. May proceed alongside Slice 3/4 only after
shared contracts stop changing.

1. Apply the transaction backdrop/width/stability/sequence/launcher contract to
   all five families, not only the reported screenshots.
2. Audit all complex results for arbitrary fixed-width defaults and classify
   each as intrinsic, fluid, host-constrained, or full workspace.
3. Make Table families fluid within the capped document; stack active/history
   and other peer examples that lose fidelity side by side.
4. Preserve chart-native sizing while unifying only the lab control chrome.
5. Verify state reset, typed amount retention, direct state links, and existing
   owner mechanics after presentation changes.

### Slice 6 — Foundations, language, and system-wide recurrence audit

Blocked by: Slices 3–5.

1. Widen Typography samples and add concise human usage examples across
   foundations/components where current labels are opaque.
2. Search every documentation canvas consumer for the same backdrop, padding,
   width, alignment, and side-by-side compression mistakes.
3. Search every overview/detail pair for ordinary accepted information still
   hidden in details.
4. Confirm internal documentation remains English-only and no public locale
   translation was overwritten.
5. Remove stale receipts/claims or mark them historical; update the active
   design-system router and progress pointer once the implementation is actually
   verified.

## Execution topology

One coordinator owns the shared tree, coverage contract, navigation/canvas
primitives, final reconciliation, and verification. Parallel implementation is
admitted only after Slice 2 stabilizes:

- Packet A: Actions, Fields, and Selection specimen files.
- Packet B: Navigation components, Overlays, Feedback, Data display, and
  Disclosure specimen files.
- Packet C: Product/Global Navigation patterns.
- Coordinator: shared files, Transactions/Tables/Charts convergence, foundations,
  integration, and final evidence.

Packets may not edit `documentation-specimen-canvas.tsx`,
`documentation-specimen-layout.tsx`, `documentation-presentation.ts`, or the
typed coverage record. If a packet needs a shared change, it reports the need to
the coordinator. Unexpected overlap collapses the remaining work back to the
coordinator. Worker reports are claims until inspected and rerun in the current
tree.

## Test seams

- Catalog-derived coverage tests prove that all 45 entries have a deliberate
  overview disposition and that every accepted entry exposes its ordinary
  system directly or reaches its complete Pattern result.
- Component documentation tests prove each family's accepted axes, default,
  truthful status, and absence of invented or unaccepted specimens.
- Navigation projection and section-observer tests prove the complete compact
  hierarchy, text-only active treatment, active ancestry, click-versus-scroll
  history, direct-load restoration, and active-link containment.
- Specimen-canvas tests prove explicit width, lab backdrop, padding, alignment,
  overflow, and stable-height ownership without treating the backdrop as part
  of the documented component.
- Pattern-specific tests prove source-faithful Navigation, Transaction, Table,
  and Chart states while retaining each family's own axes and owners.
- Routed browser tests at the crossed breakpoints prove actual scroll,
  interaction, focus, containment, and ordinary viewport composition in both
  themes. Static DOM assertions do not substitute for rendered inspection.

## Acceptance evidence

### Navigation

- Desktop sidebar uses its full available height and displays the complete
  hierarchy at materially higher density. Subsection links are a tight text
  list with no filled active rows; text color/weight, focus, and click targets
  remain usable.
- Exact child and ancestor state tracks real scrolling on Foundations,
  Components, Patterns, Workbench, and Records.
- Clicking, direct loading, reload, Back, and Forward restore the intended
  section; the anchor does not drift after late layout.
- Active links remain visible inside the independently scrolling sidebar.
- The same hierarchy is available in one mobile drawer; there is no right TOC or
  duplicate inline navigation.

### Component completeness

- Automated coverage asserts all 45 entries have a disposition.
- Every one of the 34 accepted entries either renders its complete ordinary
  accepted system on the Components page or directly reaches its complete
  Pattern result.
- Every accepted component names or visibly identifies its default.
- Icon Button and Action Group no longer require details to discover their
  system.
- Dialog contains no invented Proposal Simulation composition. Eligibility is
  visible, realistic, and labeled Exploring.
- Non-accepted entries never masquerade as accepted output.

### Canvas truth

- Every canvas consumer declares width, lab backdrop, padding, alignment, and
  overflow disposition in the coverage record.
- Lab backdrops remain explicitly documentation-owned and never define the
  implementation inside them. White or neutral gray is the default contrast
  frame; beige may support a naturally centered white specimen. Only a real
  composed context asserts actual substrate seams.
- Contained specimens have visible breathing room; full workspaces do not gain
  fake padding.
- Modal-like state changes do not move adjacent controls.
- No ordinary component or explanatory prose stretches simply because the right
  rail was removed.

### Complex families

- Desktop Product navigation reads at realistic scale with a full-height left
  rail, two full-height white regions, and thin beige structural seams.
- Mobile Product navigation retains page menu, truthful Buy/Sell or eligibility
  action, Chat, and conditional Portfolio behavior inside a taller white phone
  frame.
- Important navigation states are directly selectable and every open overlay is
  contained by its host.
- Transaction launcher controls are neutral documentation buttons; centered
  white flows use an intentional contrasting lab backdrop without inheriting
  it as component styling; workspaces use realistic full width; labels are
  human-readable; Previous/Next are adjacent and stationary.
- Tables use realistic fluid width and current/history examples do not compress
  each other.
- Charts retain source-faithful geometry and phone labels never describe a
  scaled desktop image.

### Visual and accessibility matrix

- Inspect 1400, 1024, 768, 390, and 320 widths in light and dark where crossed.
- Use ordinary 900px-tall viewport captures plus real scrolling/interactions;
  full-page screenshots are secondary evidence.
- Cover default and at least one pressure state for each changed family: open
  overlay, long text, disabled/loading, tall transaction state, table overflow,
  and mobile navigation drawer.
- Check keyboard order, visible focus, accessible names, overflow, clipping,
  contrast, and no-results behavior.
- Focused unit/browser suites, application and E2E type-check, scoped lint,
  locale extraction/compile, `git diff --check`, and wiki lint pass after the
  final source edit.
- The known unchanged native watcher failure, if reproduced, remains reported
  separately and is never presented as green.

## Human review boundary

The implementation should be delivered as one coherent visual-review pass, not
as repeated requests to approve each small repair. Automated and independent
review should remove clear defects first. Human review then focuses on:

- overall sidebar density and hierarchy;
- whether each component overview feels complete without becoming exhausting;
- the visual balance of the realistic Product navigation hosts;
- the reversible beige/neutral lab-backdrop choices;
- the chart representative where more than one accepted owner is honest;
- any owner-level question that cannot be answered from accepted authority.

Human review is not required to confirm obvious omissions such as missing real
mobile actions, invented Dialog content, absent default sizes, white transaction
hosts that were explicitly requested beige, or arbitrary narrow widths.

## Unresolved decisions

- Icon Button remains Compact 32px in the documentation. Other sizes are not
  shown unless a later human decision explicitly includes them in the system.
- Eligibility remains Exploring. The generic Dialog shell is not presented as
  Accepted until title/subtitle/close geometry, footer actions, widths, and
  interaction behavior are reviewed more clearly.
- Exact outer inset around the Product-navigation composition should reuse the
  established 1/2px structural substrate rule; if the current accepted owner
  contradicts that geometry, stop at the host boundary and present the conflict
  for human review.
- The chart overview representative requires final visual judgment after the
  obvious fidelity repairs.
- Dark documentation link contrast remains a docs-shell/token-ownership question.
  A docs-local semantic treatment is preferred; changing a shared application
  token requires separate authority.

## Strongest case against this plan

Showing every meaningful state on one scrollable page can become an exhausting
specimen wall and make the documentation slower or harder to scan. The answer is
not to return to teasers. Use compact, labeled matrices; show ordinary accepted
coverage directly; keep rare permutations and guidance in details; and keep
unresolved entries small. If a component section cannot explain the system
without mounting an exhaustive combinatorial fixture set, choose the smallest
representative matrix that covers each accepted axis once and state which
cross-products remain in details.

## Implementation receipt — 2026-09-18

State: **implementation-verified; human-review-required** against fixed point
`8812f4969`.

The completed pass implements the locked interpretation above:

- one compact, always-expanded, scroll-synchronized left hierarchy replaces
  the duplicate and right-side navigation systems;
- all 45 catalog entries have a machine-readable overview disposition, canvas
  contract, detail boundary, authority owner, and human gate;
- ordinary accepted components expose their supported variants, sizes, states,
  defaults, and important width behavior on the Components page, while details
  retain deeper guidance;
- Icon Button remains Compact 32px only, Action Group shows its three accepted
  recipes, and Dialog shows the Eligibility work as Exploring without promoting
  the rejected generic shell;
- Product and Global Navigation use truthful, directly controllable hosts;
  Transactions is a Paused Pattern with stable, adjacent sequence controls and
  deliberate neutral/beige documentation framing; Tables and Charts retain
  realistic owner geometry;
- standalone documentation is explicitly English-only even when a public
  product locale is stored, without removing or changing public translations.

The final correctness repair retires the legacy current-table `current=` alias
whenever the reader explicitly selects a state or resets the specimen. The
retained alias is still readable for old links, and unrelated query state and
the active anchor remain intact.

Fresh final evidence after that repair:

- focused Table RED reproduced `permissionless` after selecting the default;
  the corrected implementation passes 14/14;
- the integrated affected documentation suite passes 18 files and 149/149
  tests;
- the isolated desktop browser check passes the real full-width Tables and
  natural-size Overview route;
- the prior final browser matrix passes 42 checks with two intentional capture
  skips, including Components, shell, Patterns, light/dark and responsive
  coverage; the component-focus/no-results matrix and English-under-es/ko/zh
  checks each pass 1/1;
- application and E2E TypeScript, lint, the 4,019-module standalone build, wiki
  lint, and whitespace validation pass;
- the last complete repository run reached 1,541/1,542. Its sole failure is the
  unchanged native filesystem watcher, reproduced three times before the stop
  condition; it was not retried as evidence for this lab-only closeout.

Independent Intent review passed with no findings. Final Engineering Risk
re-review passed after the legacy-alias repair, with no remaining finding. The
work changes no production component, shared default, design token, transaction
mechanic, authority status, or production adoption.

Human review should now judge the sidebar density and hierarchy, component
completeness without overload, Eligibility's Exploring framing, Product
Navigation desktop/mobile geometry, transaction framing and stable controls,
Table widths, Chart natural-size behavior, and light/dark plus 390px balance.
Hosted-preview policy and publication remain separate decisions.
