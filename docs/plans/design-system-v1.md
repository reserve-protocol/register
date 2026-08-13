# Design system v1

## Goal

Create and introduce a cohesive new visual system for Register over four weeks. The work should produce a release candidate by the end of week three, leaving week four for product-wide stress testing, team use, refinement, documentation, and handoff.

The system should provide strong foundations and small reusable primitives while keeping complex product compositions flexible. It is explicitly allowed to change existing screens substantially and should raise the visual quality bar rather than normalize every legacy pattern.

## Current state

- Register uses Tailwind CSS 3, semantic CSS variables in `src/app.css`, local shadcn-style primitives in `src/components/ui`, Radix primitives, CVA, and `cn()`.
- Color and radius are partially tokenized. Typography, spacing, elevation, motion, and control geometry are less systematically expressed.
- The product and its design files contain years of inconsistent patterns. Some recent surfaces represent a stronger quality bar.
- The contained `/internal/design-system` lab now provides routed Foundations, Components, real-product Screens, and Project Status surfaces. Its expected slots, current-foundation evidence, provisional source-review layer, and complete current Button API/state baseline are ready for design work and targeted audit evidence.
- `pnpm design-system:capture` and `pnpm design-system:verify` own a pinned local Vite server and capture the lab in light/dark at desktop/mobile sizes. An external base URL remains available for host-browser capture when a dev container cannot run Chromium reliably.
- The existing design-system facts remain in `docs/wiki/domains/design-system.md`. This plan is the active project contract; durable decisions belong in `docs/wiki/decisions.md`.
- A previous branch, `codex/ui-standardization`, contains useful process ideas but stale implementation. Reuse concepts selectively; do not merge or cherry-pick the branch wholesale.
- The first source review compared that branch with the current Home, Discover, and Index DTF overview. Candidate directions now distinguish what to carry forward, adapt, leave behind, and validate next; none of those recommendations are accepted values yet.
- The first focused Color audit now replaces the lab's hand-picked swatches with an explicit source snapshot. It maps current surface frequency and observed roles, renders a provisional semantic surface hierarchy, and keeps role decisions separate from exact light/dark values.
- The provisional golden-screen set is Home/Discover, Index DTF overview, swap/automated mint, governance/proposals, Portfolio, and Earn. Deploy is a secondary overlap route for form patterns. Portfolio needs deterministic holdings fixtures; the instant Zapper widget needs an explicit upstream boundary.

## Non-goals

- Storybook unless the in-app lab proves insufficient for a concrete need.
- A large manual inventory of obvious components before design work begins.
- Preserving every legacy visual pattern or treating current frequency as a design mandate.
- Migrating the whole product before foundations and representative screens have been pressure-tested.
- Replacing Tailwind, Radix, or the local shadcn-style component model during this project.
- Upgrading Tailwind or introducing another comprehensive component framework.
- Making product-level compositions rigid merely to increase reuse.
- Localizing designer/developer-only lab metadata. Any copy migrated into product UI still follows the repository's Lingui and translation rules.

## Acceptance evidence

- `docs/plans/design-system-v1.md` remains an accurate contract with the active slice, explicit decisions, and the next unblocked work.
- `/internal/design-system` provides an in-app lab that can show foundations, complete component states, progress, migration mapping, and unresolved gaps without duplicating product screens.
- The lab uses direct routed navigation for Foundations, Components, Screens, and Project Status; the category landing pages expose the relevant catalog without duplicating it in dropdowns or one long scrolling document.
- Expected foundation and component slots remain visible before they are audited or defined. Every slot explains its purpose, expected decisions, current evidence, maturity status, reason for any missing output, and next action.
- Unavailable slots remain navigable and keyboard-accessible rather than using disabled controls; subdued styling and explicit statuses distinguish them from implemented lab surfaces.
- Catalog maturity, rendered lab output, and individual definition-slot completion remain independent so a slot can fill incrementally without implying review, adoption, or verification.
- The full project tracker lives under Project Status, while category and detail pages show only the local status needed to guide the next design decision.
- The lab exposes separate progress for definition, implementation, design review, adoption, and visual verification; provisional inventory is visibly labeled.
- A repeatable Playwright command captures stable light/dark and desktop/mobile lab screenshots using deterministic fixtures.
- Automated audit artifacts identify style-value frequency, component and route usage, exceptions, migration hotspots, and candidate stress-test screens. Audit output informs priorities but does not dictate the new visual direction.
- One coherent visual direction is developed iteratively through the same foundations, component states, and real local golden screens.
- The direction is expressed through a provisional foundation source and component families: actions, fields, selection, overlays, navigation, feedback, and data display.
- Four to six representative golden screens demonstrate the system across realistic data, edge states, themes, and supported breakpoint bands.
- A release candidate exists by the end of week three with explicit remaining gaps, migration coverage, and review status; week-four feedback can be incorporated without rebuilding the system architecture.
- Final handoff includes current guidance, durable decisions, verification commands, migration aids that proved necessary, and a clear list of unresolved product or engineering decisions.

## Test seams

- The lab route is exercised through Playwright, the highest stable seam for rendering, theme, breakpoint, and screenshot behavior.
- Lab registries and audit transforms use focused Vitest tests only when they contain non-trivial derivation; static display data uses typecheck and rendered assertions.
- Existing product migrations retain their domain-owned unit and E2E seams. Visual capture supplements those tests and does not replace behavioral assertions.
- Each UI slice is inspected in the real rendered lab or target screen with realistic default and edge states and every breakpoint band crossed by the change.

## Working cadence

Use three levels of verification so active designer–Codex iteration stays fast without weakening meaningful checkpoints:

1. **Fast lab loop — default during active review.** Implement the smallest visible proposal, run focused lint or type checks for the touched surface, and inspect the changed desktop light view. Check dark mode only when color or theming changed. Do not regenerate stable screenshots, run the full test suite, request independent review, update multiple project records, or verify the lab on mobile unless the change specifically affects those concerns.
2. **Checkpoint batch — after several accepted iterations or when the designer steps away.** Reconcile the accepted work, update durable project context, run relevant type and behavior tests, refresh stable screenshots when the UI is sufficiently settled, and perform the appropriate independent review once for the batch.
3. **Release or migration gate — before shared product foundations, product migrations, a commit/PR, or stage completion.** Run the repository workflow gate, inspect affected real golden screens and supported product breakpoints, verify accessibility and theme behavior, complete required review, and close out progress and documentation.

Keep a design-system stage active across provisional lab turns. A lab edit is not a stage closeout, and static explanatory copy does not need bespoke assertion tests. Mobile support remains a product requirement, but routine mobile verification of the designer-only lab is deferred unless its layout becomes part of the decision being reviewed.

## Progress model

The lab tracks foundations, component families, and representative screens. Inventory may begin as `provisional` and become `audited` only after code and visual inspection.

Each item has independent gates so “implemented” cannot be mistaken for “done”:

1. `inventoried` — the item and its relevant scope are known.
2. `defined` — the intended direction and required states are explicit.
3. `lab` — the current proposal is implemented in the lab.
4. `applied` — it is used in at least one real golden screen or product screen.
5. `design-reviewed` — the designer has explicitly accepted or returned it for revision.
6. `in-use` — production consumers have migrated to it.
7. `verified` — applicable states, themes, data extremes, and breakpoints have evidence.

The dashboard should favor a small “Next 3” queue, weekly targets, completed gates, and recent progress. It should not collapse the project into one misleading completion percentage or add points, streaks, animations, or decorative rewards.

## Focused Color audit — 2026-08-11

Method: token-boundary semantic background-utility matches in product TSX, including opacity variants and excluding `src/views/internal/design-system/**`, plus direct inspection of `src/app.css`, `tailwind.config.ts`, the recent Home/Discover/Index performance implementation, Portfolio performance, and the previous branch's color proposal. Counts are implementation evidence, not design votes. Reproduce the surface count from the repository root with:

```sh
rg -o --pcre2 '\bbg-(card|muted|background|secondary|accent|popover|container)(?:/[0-9]+)?(?=[^A-Za-z0-9_/-]|$)' src -g '*.tsx' -g '!src/views/internal/design-system/**' | sed 's/.*://' | sed -E 's#/.*##' | sort | uniq -c | sort -nr
rg -o --pcre2 '\btext-(destructive|warning|success)(?:/[0-9]+)?(?=[^A-Za-z0-9_/-]|$)' src -g '*.{ts,tsx}' -g '!src/views/internal/design-system/**' | sed 's/.*://' | sed -E 's#/.*##' | sort | uniq -c | sort -nr
```

- Surface usage: `card` 266, `muted` 191, `background` 153, `secondary` 110, `accent` 20, `popover` 9, `container` 0. The familiar beige wrapper is `secondary`; `container` has no exact product TSX match and currently matches `background` in light mode.
- Current surface names collapse different jobs. `background`, `card`, and `muted` are each used across page, nested content, control, state, and overlay contexts. The candidate therefore starts from explicit page-canvas, grouping, content, inset, floating, and selected roles rather than preserving names blindly.
- Feedback coverage is inconsistent: the product source contains 130 destructive, 41 warning, and 38 success token-boundary text-utility matches, alongside dozens of raw red, green, amber, and yellow utilities.
- The current success and destructive values do not both meet normal-text contrast in light and dark themes. Until replacement values are reviewed, the candidate presents them as labeled color chips rather than inaccessible colored text.
- Recent Home, Discover, and Index overview work already shares a purpose-built positive/negative/neutral performance palette through `src/utils/chart-performance-colors.ts` across 10 consumer files. It is separate from `success`/`destructive`; Portfolio performance still uses those feedback tokens.
- The shared implementation is a family rather than one green and one red: line gradients, dot/fill values, accessible text values, neutral, and pre-launch treatments. A separate `darkSurface` set is defined in the utility but has no product consumer; current dark-theme charts keep the default set. The lab renders both actual usage and the unused alternatives explicitly instead of reducing everything to a single swatch.
- Candidate rule pending human review: success/danger feedback and positive/negative financial movement remain separate semantic roles. They may share a visual ramp or exact values, but components should not encode “price down” as an error or “price up” as task success.
- Provisional V1 simplification pending visual review: three stable aliases per positive/negative direction—main, emphasis, and foreground. Gradient = emphasis plus main; dots, icons, and translucent fills derive from main; foreground owns accessible text; dark mode overrides the same aliases rather than exposing a second palette. Token names and exact values remain open.
- No product token or consumer migration is part of this slice. Exact V1 light/dark values remain open until the rendered role structure is visually reviewed.

## Provisional color grammar — 2026-08-11–12

Human-reviewed working rules from the lab studies; these remain provisional until integrated and real-screen pressure tests:

- The light page canvas and ordinary content sections share the same white value while retaining separate semantic roles.
- Beige is a bounded structural substrate revealed between white regions, not general component chrome. Use a 2px seam between major regions and 1px between subsections within one region.
- Beige separates adjacent surfaces but does not automatically outline their outer perimeter. The page canvas may continue beyond open left, right, or terminal edges.
- Gray component chrome must remain contained within white; a gray line or fill never terminates directly against beige.
- Default tables are open and divider-free. Tables that genuinely need stronger scanning structure may use a contained gray row-and-column grid. A table header remains white by default; a filled neutral header must earn a functional role.
- On white, the current light neutral fill remains a viable tab/control-track candidate with a white active item. On beige, prefer a text-only treatment or adjust the local composition rather than placing gray chrome directly on beige.
- Neutral fill and neutral divider remain separate semantic roles. The experiment using the lighter fill value for both was too weak for a structured grid; exact divider value remains open.
- Structural gray borders are not a default card treatment. Control, selection, focus, feedback, and floating-surface borders will be decided with their own component/state studies.
- A neutral gray hover layer is allowed only when visually contained within white. The interactive hit target may remain full-size while an inset visual layer or white edge buffer prevents gray from touching beige.
- Interactive content directly on beige does not receive a gray surface hover; use text, icon, opacity, or another component-appropriate emphasis instead.
- The selected-surface candidate uses a softened version of the current blue accent over white, with a stronger primary-colored indicator. Its exact value remains open.
- Keyboard focus uses a two-color construction: a context-matching inner separation prevents the outer focus ring from visually colliding with a component border. The accessible outer-ring color remains open and should be tested calmer than the current saturated blue.
- Disabled controls preserve their structure and readable surface while muting
  content and icons. Do not apply blanket opacity; remove interactive state
  treatments and state the unavailable reason when it is not obvious. Exact
  values remain open.
- Feedback uses a vivid success, warning, danger, and information family with
  dark icon foregrounds and quiet derived backgrounds. Information is a
  brighter relative of the deeper brand/action blue; the roles remain
  semantically separate even where they share a hue family.
- Preserve the reviewed positive and negative performance colors and gradients;
  do not mute, fade, or darken them without a concrete problem. Performance
  aliases remain separate from feedback aliases.
- V1 foreground hierarchy starts with primary and supporting neutral roles.
  Disabled content may reuse supporting foreground until component studies
  demonstrate a need for a consistently quieter alias.
- Generic categorical colors are deferred. The existing `chart-1`…`chart-5`
  variables have no product consumer, so a future real multi-series need should
  determine the number and character of categorical colors.

## Provisional typography grammar — 2026-08-12

Working candidate under human review:

- Use Lausanne 300 for spacious hierarchy and reading: display, page and
  section titles, lead copy, body copy, ordinary values, and supporting text.
- Use Lausanne 500 for compact structure and emphasis: panel titles, labels,
  actions, selected controls, repeated-item titles, and emphasized values.
- Keep 700 parked with no V1 role unless a real composition demonstrates a
  rare need. Do not buy another weight until the 300/500 system exposes a
  concrete gap.
- The six candidate sizes are 48, 32, 24, 20, 16, and 14px. Restrict 12px to
  genuinely auxiliary chart or dense metadata cases rather than treating it as
  a normal hierarchy tier.
- Use 24px/300 for major page regions such as Transactions, Governance, or
  Recent proposals when it owns the primary content area.
- Use 20px/28px at 300 for prominent supporting copy beneath a hero or major
  page introduction. This is the lead role: larger and more open than default
  body copy, without competing with the title.
- Use 20px/500 for contained supporting panels, especially subordinate cards
  in a secondary column.
- Use 16px/500 for repeated item titles such as proposal names, assets, and
  transactions. This is a semantic item-title role even when it shares the same
  visual treatment as other body emphasis.
- Use 16px/300 for ordinary body copy and values; use 14px/300 for supporting
  copy and 14px/500 for labels and compact actions.
- Numeric text inherits its contextual role and adds tabular numerals. Long
  readable content targets roughly 65 characters per line.
- Horizontally aligned peer content uses the same text size. Table headers
  across one header row share a size and weight; values aligned within one data
  row do not change size merely because one is semantic or emphasized. Use
  weight and color for meaning without creating a broken baseline. The same
  rule applies to inline label/value pairs; stacked layouts may use different
  sizes because they no longer compete on one horizontal line.

## Shape study — 2026-08-12

Current evidence and first candidate under human review:

- Product TSX currently uses at least nine named radius utilities. Exact-match
  counts outside the design-system lab are: `rounded-full` 360,
  `rounded-3xl` 243, `rounded-xl` 222, `rounded-2xl` 90, `rounded-lg` 81,
  `rounded-md` 61, `rounded-4xl` 42, `rounded-none` 16, and `rounded-sm` 9.
  These counts demonstrate inconsistency and migration scope; they are not a
  vote for preserving the current scale.
- The emerging candidate has three shape roles. Page regions, cards, panels,
  table groups, and selection rows remain square by default. A composition may
  selectively round inward-facing corners where a major beige substrate seam
  begins, ends, or intersects; this reveal radius belongs to the layout, not
  the shared Card component.
- Compact standalone controls—buttons, segmented tabs, badges, icon controls,
  avatars, switches, and handles—use a full radius.
- This early study grouped inputs and selects with menus, popovers, and
  thumbnails under a restrained symmetric radius. The later control-geometry
  decision supersedes that classification for ordinary one-row inputs and
  select triggers: those are atomic controls and use the full radius. The
  restrained role now covers composite amount panels, multiline fields, menus,
  popovers, and thumbnails. A thumbnail keeps all four corners coherent even
  when only one approaches a selectively rounded outer corner; only
  edge-bleeding media inherits individual outer corners.
- The working pair is 16px for substrate-reveal corners and 8px for contained
  objects. Both values remain provisional until the overview composition and a
  mint or Zapper flow are pressure-tested together.
- Geometry and control height are related but separate decisions. The
  provisional scale and padding rules are recorded in the control-geometry
  checkpoint below; real component and screen use must validate them before
  they become accepted V1 tokens.
- No radius token or product consumer migration is part of this study.

## Control geometry study — 2026-08-12

Provisional candidate after lab review:

- Use three visible-height categories: micro at 28px, compact at 32px, and
  default at 44px. There is no separate prominent-action height; ordinary
  fields, buttons, selects, and primary actions share the default category.
- Micro is for embedded controls such as Max actions and segmented-control
  items, not ordinary standalone fields. Compact is for dense toolbars and
  secondary icon actions. Default is the normal product control height.
- Micro controls use 14px icons. Compact and default controls use 16px icons.
- Symmetric horizontal padding is provisionally 10px for micro, 12px for
  compact, and 20px for default. On a side containing an icon, reduce that
  side by 2px for optical balance; keep an 8px text-to-icon gap except where a
  micro composition requires the tighter 6px gap.
- Atomic one-row controls remain fully rounded. Composite financial input and
  output objects use the restrained 8px contained-object radius instead of
  inheriting the atomic-control shape.
- Visible compact and micro controls may need larger invisible production hit
  areas. Interaction target size and visible geometry are separate concerns.
- Align an icon glyph with the surrounding surface's content inset. The chosen
  button size determines its outer placement; a surface does not have to use a
  compact button merely to preserve alignment. In the current Zapper study,
  32px header icon buttons place their 16px glyphs on the same 24px inset as
  the amount content below.
- These values are good enough to carry into component-family work but remain
  provisional until representative product use shows that the scale holds.

## Targeted spacing evidence — 2026-08-12

Method: direct source inspection and desktop browser measurement of the recent
Home/Discover and Index DTF overview surfaces, governance proposal forms, and
the prior `codex/ui-standardization` branch. This evidence checks whether the
lab's candidate relationships cover real product needs; legacy frequency does
not select the new values.

- The strongest recent-screen evidence supports a 24px ordinary desktop
  content axis. Index overview section headers, chart/content regions, About,
  Transactions, and supporting right-rail cards repeatedly use 24px outer
  insets. The prior branch also deliberately converged Overview governance,
  creator notes, and basket regions on 24px outer padding.
- The prior branch's basket table isolated a useful nested-gutter pattern:
  24px at the table's outer edges and 16px around middle cells, with a 48px
  header band. This supports the lab hypothesis that 16px is a contained or
  nested inset while 24px owns the surrounding section axis; it does not imply
  that every table cell must use those exact values.
- Governance proposal forms already demonstrate a coherent vertical relation:
  8px within a field stack and 24px between complete field groups. This is
  stronger evidence for the lab's default form rhythm than raw spacing counts.
- Broad page regions sometimes use 32px or more, especially page-level grids
  and introductions. Treat 32px as separation between distinct regions, not as
  the default content inset for an ordinary card or section.
- A universal 40px/48px table-row pair would be too rigid. Single-line data
  rows, two-line asset identity rows, rows containing icon controls, and rich
  Discover rows have materially different intrinsic heights. The table study
  should compare density through vertical cell padding and minimum target
  height, then allow content to determine the final row height. A 40px dense
  and 48px standard single-line baseline may still be useful, but a rich-row
  case must pressure-test the rule before it is accepted.
- No production spacing token, shared primitive default, or product consumer
  changed during this audit.

## Overnight foundation decision prep — 2026-08-13

Purpose: prepare decision-ready visuals and a short review path so the next
human session can finish the provisional foundation kernel without waiting for
new audits or lab scaffolding. This work remains lab-only: no product consumer,
shared primitive default, or production token changed.

Repository evidence gathered for the remaining foundations:

- Iconography: 369 source files import Lucide. Recent navigation and header
  work commonly overrides Lucide to a 1.5px stroke, while legacy code includes
  1, 1.2, 1.5, 1.8, and 2px treatments. This supports standardizing ordinary
  UI icons around Lucide and 1.5px while explicitly excluding logos, asset and
  chain marks, and bespoke product diagrams.
- Elevation: product code outside the lab contains 29 generic `shadow` uses,
  13 `shadow-md`, 12 `shadow-lg`, 10 `shadow-sm`, and isolated other values.
  The count identifies migration scope, not a preferred scale. The lab now
  compares a simpler three-role model: flat structural content, quiet floating
  overlap, and stronger temporary modal layers.
- Motion: outside the lab, 199 source occurrences use transitions. Named
  durations cluster around 150ms and 200ms (13 each), 300ms (12), and 500ms
  (9), with additional 100ms and 700ms cases. Existing Tailwind animations
  already use 200ms for several accordion/dialog transitions but also contain
  400–500ms fades and slides. The lab therefore exposes a restrained candidate
  instead of preserving current frequency.

Primary guidance consulted and the resulting recommendation:

- [Atlassian spacing](https://design-system-docs-proxy.services.atlassian.com/foundations/spacing)
  uses a limited 8px-base relationship scale and distinguishes small component
  internals, medium grouping distances, and larger layout separation. Combined
  with the Register screen evidence above, the lab recommends 8px within one
  relationship, 16px for nested or narrow insets, 24px for ordinary desktop
  section insets and complete field groups, and 32px+ between distinct page
  regions. Structural beige seams remain a separate 1/2px system.
- [Atlassian elevation](https://atlassian.design/foundations/elevation/)
  pairs surface and shadow and limits meaningful raised/overlay levels. For
  Register, the candidate keeps sections and cards flat; only objects that
  visibly overlap their source surface float, with a stronger but still quiet
  treatment for dialogs and temporary task layers.
- [Carbon icon guidance](https://carbondesignsystem.com/elements/icons/usage/)
  favors consistent 16px productive icons, with nearby sizes used deliberately,
  icon color following text, and centered icon/type pairing. Register's
  candidate is 14px for micro controls, 16px for compact/default controls, and
  20px when an icon is itself content, all at a 1.5px default stroke.
- [Material motion guidance](https://m1.material.io/motion/duration-easing.html)
  places simple desktop transitions around 150–200ms, uses ease-out for entry
  and ease-in for exit, and lengthens larger spatial changes. Register's lab
  exposes 120ms immediate feedback, 180ms ordinary component transitions, and
  240ms spatial entrances. These are provisional values inferred from that
  guidance and the product audit, not copied tokens.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines a 24px AA target minimum
  with spacing exceptions and a 44px enhanced target, and requires visible
  keyboard focus. The candidate keeps 44px as the ordinary visible control,
  permits 28/32px dense geometry only with sufficient target area/spacing, and
  retains the reviewed two-color 2px focus construction. Meaning is always
  reinforced by text, icon, or structure rather than color alone.

The spacing study was expanded from abstract values into direct decisions:

- 16px versus 24px ordinary section insets with identical content.
- direct 24px alignment versus an 8px wrapper plus 16px nested inset.
- complete contained and focused-tool form compositions using the same title,
  fields, help, action, and vertical rhythm.
- 24px normal versus 16px narrow responsive section insets without changing
  internal control geometry.
- dense and standard single-line rows plus a content-driven rich row, avoiding
  one fixed height for every table/list composition.

## Spacing and form composition decision — 2026-08-13

Accepted as the provisional foundation direction after visual comparison:

- Ordinary desktop sections and contained forms use a 24px content and control
  edge. A heading and its supporting explanation use a tight 4px gap; distinct
  relationships such as label/control/help use 8px, and complete field groups
  use 24px.
- A normal contained form is the default for settings, governance, deploy, and
  general card forms. Labels describe the complete control, so they align with
  its outer edge rather than its internal value text.
- An 8px outer shell with 16px internal padding is a surface-composition mode,
  not an Input or Button variant. Use it consistently across a focused control
  tool such as Zapper, where the control shells and primary action intentionally
  reach toward the surface edge while their contents retain the 24px axis.
- A contained form may include an occasional subsection that reaches to the
  8px shell and uses 16px internal padding. That exception communicates real
  containment; it does not pull the form's ordinary controls or final action
  off their 24px edge.
- Prefer headings and natural vertical rhythm over nested background boxes.
  The current Index DTF deployer overuses visible subsection containers; its
  existing geometry is evidence to simplify, not a reason to make the focused
  8px mode the default.
- Row density remains a component-family pressure test rather than a blocker
  for accepting the core spacing foundation.
- A 48px baseline is the default for ordinary single-line rows. A 40px baseline
  is an explicit whole-table dense-data mode for scan-heavy, single-line data;
  it is not chosen row by row. Rich identity, secondary text, and action rows
  expand from their content rather than sharing one forced height.
- One owner controls each visible gap. A section owns its outer inset; a list
  owns spacing between borderless items; a structured table owns row-internal
  geometry and runs edge-to-edge in its allotted region. Do not accumulate
  section padding, list padding, and last-row padding to produce the same gap,
  and do not require screen-level last-row exceptions. Exact table/list
  implementation remains deferred to the Data display component-family pass.

## Elevation decision — 2026-08-13

Accepted as the provisional foundation direction after visual comparison:

- Keep ordinary page regions, cards, and structural surfaces flat. Color,
  substrate seams, and layout carry their hierarchy; shadow does not indicate
  general importance or card-ness.
- Use one quiet floating recipe for menus, popovers, tooltips, and white bars
  that visibly overlap content. Use one broader and stronger modal recipe for
  dialogs and temporary task layers. Both share a soft, low-opacity character
  rather than a compact, dark Material-style edge.
- Sticky and overlapping actions place the floating treatment on a padded white
  wrapper, not on the button itself. The wrapper uses the shape role appropriate
  to its composition; a compact action wrapper is fully rounded.
- Floating self-contained objects follow the previously reviewed contained
  shape and spacing rules: popovers use the provisional 8px radius and an 8px
  gap from their trigger; atomic one-row triggers remain fully rounded.
- Exact shadow values remain deliberately provisional. When menus, mobile
  navigation, Home's overlapping stats bar, or dialogs expose a problem, first
  revise the shared floating or modal recipe—or clarify which role applies.
  Do not add screen-specific shadow values as exceptions.
- In dark mode, stronger surface contrast must carry more separation because
  shadows become less effective. Final dark-theme recipes will be validated
  through real overlay components rather than adding another elevation level.

## Iconography decision — 2026-08-13

Accepted as the provisional foundation direction after visual comparison:

- Start without an icon. Add one only when it improves recognition or scanning,
  communicates state, direction, or disclosure, represents a meaningful entity,
  or provides a familiar repeated utility. Omit icons that merely decorate a
  heading/card, duplicate obvious text, use an unclear metaphor, or force
  arbitrary sibling icons for consistency.
- Use one coherent source for ordinary interface icons. Lucide at a 1.5px
  working stroke is the current candidate because it dominates existing usage,
  but it is not a permanent library commitment. Compare alternative libraries
  later on real component and screen surfaces where the source can be swapped
  while preserving the semantic icon contract.
- Use 14px icons in micro controls, 16px in compact/default controls, and 20px
  when the icon itself is content. Fixed layout slots—not raw SVG bounds—own
  alignment. Exact one-line row slot geometry remains a list/menu/navigation
  component-family pressure test.
- If an icon describes only the primary line of a stack, keep it inline with
  that line and return supporting copy to the item's main left edge. If it
  describes a complete two-line item, use a fixed passive leading slot centered
  against the full text block. The current candidate is a ghost 32px slot with
  a 20px icon and 12px gap to text.
- A visible 32px icon well with a 16px glyph is reserved for a passive icon
  above a vertically stacked, left-aligned block, where the circle establishes
  a real optical edge. Do not place a bare glyph above such a stack.
- Passive icon wells have no interaction states. Icon buttons are named
  controls with border/fill treatment, adequate hit targets, and complete
  hover/focus/active/disabled behavior. Item-level icon actions sit at the
  trailing edge; leading icon buttons belong to toolbars, navigation, or
  isolated control groups rather than preceding item content.
- Disclosure/navigation icons generally sit at the trailing edge. Repeated rows
  reserve the same leading slot across the set; if only one arbitrary row would
  receive an icon, omit it rather than breaking the shared text axis.
- Brand marks, token and chain identity, and bespoke product diagrams remain
  explicit exceptions rather than being forced into the ordinary UI icon
  language.

## Motion decision — 2026-08-13

Accepted as the provisional foundation direction after visual review:

- Use a restrained three-duration grammar: 120ms for immediate feedback such
  as hover, press, color, and opacity; 180ms for ordinary component changes such
  as disclosure or tab state; and 240ms for dialogs, drawers, and meaningful
  spatial entrances.
- Enter with ease-out and leave with ease-in. Reserve linear movement for
  continuous progress such as a spinner; it is not a general transition curve.
- Motion explains state, hierarchy, or spatial continuity. It must not delay
  navigation, gate interaction, decorate every surface, choreograph page load,
  or add pulses and movement without functional meaning.
- Reduced-motion behavior preserves the state change while removing
  non-essential translation, scale, sweep, and pulse. A short opacity change or
  an instant state is preferred when spatial movement is unnecessary.
- Exceptional product moments may later use purpose-built motion when they have
  a concrete narrative or functional reason. They remain isolated experiences,
  not additions to the ordinary global motion scale by default.
- When real components expose a timing problem, revise the shared duration or
  easing recipe—or clarify the semantic role—instead of adding a screen-local
  duration exception.

The morning review path is now visible at the top of the Studies page:

1. Spacing and density.
2. Elevation and floating surfaces.
3. Iconography.
4. Motion, including a replayable three-duration comparison.
5. Cross-foundation accessibility guardrails.
6. An Actions-family starting matrix combining the provisional foundations.

The Actions matrix is preparation, not acceptance or migration. It shows four
candidate hierarchy roles, all three control sizes, optical icon padding,
icon-only geometry, and default/hover/focus/loading/disabled states together.
Use it only after the remaining foundation pass to expose contradictions in the
kernel before implementing product components.

## Core component review board — 2026-08-13

The Components landing page now leads with a compact, lab-only review board.
It is the primary place to compare the emerging component language before any
candidate changes a shared production primitive:

- One scale matrix aligns compatible controls to the accepted 28px micro, 32px
  compact, and 44px default heights. A dash is shown when a size has no clear
  semantic use instead of creating a complete Cartesian product of variants.
- Actions, icon actions, text fields, search, select, checkbox rows, segmented
  tabs, and text tabs share the same columns so shape, padding, type, icon, and
  alignment errors are visible across families rather than only in composed
  examples.
- Separate dense boards compare action hierarchy and loading/disabled states;
  checkbox, radio, and switch states; field states; value/loading/placeholder
  support; and semantic feedback anatomy.
- Intent, selection, focus, validation, disabled, and async lifecycle are
  combinable state axes. The board renders only high-risk pairings—selected +
  focus, selected + disabled, destructive + loading, and variant + disabled—
  instead of treating these dimensions as mutually exclusive or generating
  every permutation.
- Candidate components consume one lab-only semantic role map for content,
  structural substrate, neutral control fill, selected surface, floating
  surface, divider, control line, focus, disabled structure, and feedback
  surface/foreground. It aliases existing tokens while exact V1 values remain
  provisional and does not migrate production tokens.
- Default entered and selected control values use 16px/300. Compact values use
  14px/300, while ordinary action labels remain 14px/500 at both compact and
  default sizes.
- Tab variants use foreground text for the active item and supporting text for
  inactive items rather than turning selection into a primary-blue action.
  The text-only candidate follows the recent Index overview timespan treatment
  without an underline or wrapper, at 14px compact and 16px default sizes.
- Selection marks keep one 20px visual size across densities. The switch
  candidate is 36×20px with a 16px thumb; its surrounding row or label owns the
  larger interaction target rather than enlarging the visible track.
- Status pills use one compact 24px geometry and a role vocabulary grounded in
  governance: neutral pending/inactive outcomes, active lifecycle, attention,
  completed success, and unsuccessful outcomes. Fast and Contested are shown
  separately as qualifiers rather than being confused with lifecycle states.
- Slider and progress tracks use contained neutral chrome on white. Beige is
  never an unfilled control track; it remains reserved for structural substrate
  revealed between regions.
- Explanatory copy is deliberately short. The board is for visual comparison,
  while real modals and golden screens remain the pressure-test seam for
  behavior, composition, and exceptions.
- Menus/popovers, dialogs/drawers, tables/pagination, and tooltips/toasts follow
  as behavior boards. Their contracts cannot be judged faithfully from a
  single thumbnail and must stay connected to real source-grounded examples.

Everything on this board remains a working candidate. Rendering an item here
does not mark its component definition, design review, adoption, or product
verification complete.

## Instant Zapper modal evidence — 2026-08-12

Read-only inspection of the real overview modal and the installed
`@reserve-protocol/react-zapper` 2.8.0 package:

- Register mounts one modal-mode `ZapperWrapper` from
  `index-dtf-container.tsx`; overview controls call `useZapperModal()` to open
  it. The one-Zapper-per-route rule remains binding because package state uses
  shared module-level atoms.
- The package inherits Register's semantic CSS color variables, but its public
  `ZapperProps` exposes no theme, class, slot, or token API. Modal structure,
  spacing, radii, and control geometry are compiled into the package's own
  Tailwind classes.
- Desktop modal evidence was captured from the real overview route in default,
  token-menu, and quote-ready states using existing DTF, wallet, RPC, and quote
  fixtures. The modal is 448px wide at the desktop breakpoint and uses an 8px
  outer content inset.
- Current amount input/output surfaces use 16px internal padding, 12px radii,
  and a 2px gap. The primary action is 44px high with a 12px radius; top icon
  controls are 34px square with a 12px radius. Token selectors and the Max
  action use full radii.
- The quote-ready state adds a full-width quote-details row between the amount
  stack and primary action. The token selector opens a package-owned floating
  menu over the top amount surface. Both states must be included in any
  spacing/shape redesign; the empty shell alone is insufficient evidence.
- The lab uses one focused quote-ready modal reconstruction to judge the
  emerging foundations together. It deliberately excludes the overview-page
  backdrop, automated/manual mint variants, and other issuance compositions.
- `react-zapper` 2.8.0 now also attempts direct CoW quote requests. The existing
  deterministic `mockZapperRoutes` helper blocks but does not model that host,
  so future committed capture coverage must add an exact CoW boundary rather
  than enabling `allowUnmocked`.
- A faithful redesign should happen in a linked sibling checkout of the
  `react-zapper` source, then publish and repin an exact package version. Do not
  edit `node_modules` or recreate the widget inside Register. Prefer adding a
  small package-owned styling contract for the confirmed design-system roles
  over Register-side selectors against compiled internals.

## Layout, modal geometry, and pragmatic accessibility — 2026-08-13

The missing layout layer is now explicit and intentionally small. It governs
outer alignment, a few page templates, supporting-region behavior, and
responsive order; it does not standardize the composition inside every page
region.

Read-only source evidence:

- The application shell currently caps its centered container at 1400px. The
  Index DTF shell adds a stable 220px desktop navigation rail.
- Governance, settings, and proposal surfaces commonly use a 1.5:1 split;
  deploy, manage, and permissionless deploy use 2:1; overview uses a fluid
  primary region with a fixed 480px rail at its largest breakpoint.
- Focused product and workflow regions cluster around 408–480px. This includes
  the 420px issuance surface, the 448px default Radix `sm:max-w-md` dialog and
  Zapper, 468–476px async-mint states, and 480px rebalance or overview regions.
- These measurements identify current drift and useful clusters. They do not
  approve the existing 1400px cap, any column ratio, or a modal width.

Candidate page grammar now shown in the lab:

1. **Table-led content plus support:** fluid primary content with one stable
   supporting rail. At the current 1400px shell, Overview is approximately a
   1.45:1 content split after the separate 220px navigation rail. The main
   region absorbs width because its information-dense tables need it; stack
   before those tables compress below their useful minimum.
2. **Balanced split:** one shared 3:2 relationship for two substantial peer
   regions. Do not select it merely because two cards happen to fit.
3. **Focused column:** one centered readable task or form column. Add a peer
   region only when the workflow genuinely requires simultaneous context.

The navigation rail is shown separately from every Index content split; it is
not part of the left content column. The outer frame owns header, navigation,
and route alignment. On narrow
screens, supporting regions follow the primary task in reading order rather
than shrinking component geometry to preserve a desktop split. Exact outer
cap, gutters, column widths, and breakpoint behavior remain open for design
review.

The provisional modal grammar uses two content roles. Zapper and other
substantial task dialogs use 432px; genuinely brief acknowledgements use 384px.
A workflow keeps one width through input, pending, error, and success states.
The real Zapper success state therefore stays 432px: package inspection shows
received amount, USD used, transaction or order link, collapsible details, and
optional contact or scheduling content rather than a short completion message.
Forms, warnings, transaction detail, or multiple decisions promote a dialog to
the 432px role. A separate wide role remains open only for content that
structurally needs multiple regions or substantial comparison data.

Amount layout is part of the Zapper width contract. Primary display values use
grouping separators and a deliberate significant-digit limit so ordinary
values remain readable; full precision belongs in details or a copy affordance
rather than forcing the modal wider. The lab now includes a long-value stress
case, but the final formatting policy must be implemented and verified in the
upstream `react-zapper` package.

Accessibility is accepted provisionally as a pragmatic shared-primitive
baseline:

- Shared buttons, fields, dialogs, menus, feedback, and motion recipes own
  keyboard behavior, visible focus, sufficient targets, accessible names,
  non-color meaning, dialog focus management, and reduced-motion behavior.
- Dialog focus enters the task, remains contained while open, closes
  predictably, and returns to its trigger. Icon-only actions require meaningful
  names; errors and statuses use readable language, structure, or symbols in
  addition to color.
- Product compositions remain responsible for truthful labels, messages, and
  reading order. V1 does not create a formal certification project, exhaustive
  screen-reader matrix, or bespoke manual checklist for every modal. Verify
  shared primitives and representative component states; expand only when real
  evidence exposes a usability problem.

## Component definition preparation — 2026-08-13

The Components catalog is now a typed working registry rather than a generic
list copied from a library. It can be updated independently of visual token
values, then drive state sheets after the foundation kernel is accepted.

Read-only source evidence used for initial prioritization:

- Shared primitive imports outside the lab are led by Button 229, Skeleton 73,
  Card 50, Separator 49, TransactionButton 40, Input 38, Spinner 29, base Table
  27, Checkbox 22, Tooltip 21, Tabs 20, DataTable 18, Alert 18, ToggleGroup 16,
  and legacy Table 13. Counts identify reach and audit priority; they do not
  select the new visual direction.
- Three table layers coexist: 27 base Table imports, 18 DataTable imports, and
  13 legacy Table imports. Table/Data table therefore needs an early behavior
  and migration-boundary audit rather than a cosmetic state sheet alone.
- Raw product controls still exist outside `src/components/ui`: 57 raw buttons,
  13 raw inputs, two raw selects, and four raw tables. These are potential
  exceptions or migration hotspots, not proof that a new shared variant is
  needed.
- Register-specific repeated contracts were missing from the generic catalog:
  Transaction action, Amount field, Asset picker, Entity identity, Metric,
  Chart patterns, and Copyable value. They are now explicit product extensions
  that compose core primitives instead of forcing blockchain behavior into
  Button, Input, Select, Card, or Table.
- TokenLogo appears in 78 product consumer files and TransactionButton in 40,
  making identity and transaction lifecycle first-class product primitives.
  The imported Zapper and local issuance flows supply specialized Amount field
  and Asset picker evidence but should not be collapsed into ordinary text
  fields or reimplemented inside Register.

The registry currently contains 42 contracts: 32 V1 core, seven Register
product extensions, and three conditional capabilities. Conditional slots stay
visible but should be marked not-needed when product evidence fails to justify
them; inclusion is not a commitment to build.

Every component contract now records:

- V1 core, conditional, or Register-extension priority.
- Mapped, partial, or pending source-audit status.
- Current implementation and product evidence.
- The exact questions to resolve before defining it.
- Shared family states plus component-specific lifecycle states.
- Foundation dependencies so lab proposals can update after tokens change.
- Relationships to easily confused contracts, such as Button versus Link,
  Tabs versus Segmented control, Select versus Menu, and Dialog versus Drawer.
- One next action that moves the slot from inventory to complete state sheet.

Recommended working order after foundations:

1. Actions: Button, Icon button, Action group, then Transaction action.
2. Fields and Selection: shared anatomy first, then Amount field and Asset
   picker as product extensions.
3. Overlays and Feedback: elevation, focus, dismissal, motion, and lifecycle
   states together.
4. Data display: Entity identity and Metric before Table/Data table and Chart.
5. Navigation and Disclosure: resolve Tabs versus Segmented control early;
   build conditional patterns only after repeated use is demonstrated.

## Modal family audit and first grammar — 2026-08-13

Read-only source inspection found nineteen direct product dialog
implementations across the Radix `Dialog` and legacy `Modal` shells, plus the
package-owned Zapper surface. Six product drawer consumers are related overlay
evidence but are not being forced into the modal grammar. Current visual
variation is not treated as design intent: the audit retains only product jobs,
required content, states, and constraints.

Those jobs collapse to review/commit, configure, select/search,
attest/acknowledge, explain/reference, and report an outcome. Media remains a
separate overlay shell because the media itself owns the geometry. Drawers
remain a separate shell for edge-attached or persistent contextual work.

The initial lab attempt prematurely illustrated a shared-shell/two-composition
hypothesis with invented review and outcome content. That was rejected because
fictional examples cannot prove which components, states, or content constraints
the real product requires. The fake specimens were removed rather than retained
as design evidence.

The corrected workflow starts with source-faithful current reconstructions,
applies the already reviewed foundations without removing behavior, refines the
components exposed by each case, and only then extracts the smallest grammar
that survives several different flows. The first comparison is the real Index
DTF eligibility gate. Both sides preserve its exact three attestations,
expandable jurisdiction detail, disabled-action rule, privacy support, legal
links, and intentional lack of dismissal. The candidate applies the 432px task
width, square structural shell, 24px content axis, provisional typography,
contained white-only dividers, and pill action. This first pass is ready for
human visual review, not accepted.

The pressure-test sequence is Eligibility, the existing real Zapper evidence,
Liquidity simulation configuration, and real transaction pending/success/error
states. Selection and dense reference cases follow only if those first cases do
not exercise their required structures. Modal compositions and illustration
rules remain unresolved until the real cases earn them. No production modal or
shared default changed.

Eligibility review exposed two application rules that the horizontal-axis
study had not made explicit enough. A passive semantic lead that begins a
surface uses the ordinary 24px content inset from both adjacent edges; the
Zapper rule that places an interactive icon button closer to an edge so its
glyph reaches the content axis does not apply. Modal rhythm must also be
reviewed as one vertical sequence rather than as independent wrapper padding:
this candidate uses 8px from subtitle to the attestation group and 12px from
the group to its action. Separators belong to the list/group container, not to
individual rows, so a row wrapped by `Collapsible` retains a consistent top and
bottom boundary. The focused lab check now measures these relationships rather
than verifying only presence and overflow.

## Layout architecture audit — 2026-08-13

Goal: prevent legacy page composition from dictating the component contracts
that v1 defines. This is a structural audit and lab-study slice only; it does
not migrate product routes or introduce a universal `PageLayout` component.

Acceptance evidence:

- A source-grounded route map names the current structure, primary task,
  provisional archetype, retain/rework/discard call, and component contracts
  affected by the decision.
- The lab compares current and candidate structures for Auctions and
  Governance, demonstrates the accepted progressive-workflow behavior from
  automated mint, and states when a full-width context region may precede a
  split workspace.
- The archetype set remains small and role-led. Responsive behavior and
  selection behavior are visible without pretending that the studies are
  finished product designs.
- Focused lab Playwright covers the new section on desktop and phone; typecheck,
  lint, existing design-system assertions, wiki-lint, and diff hygiene remain
  green.

Strongest case against this slice: page-level studies could become speculative
design work and delay useful components. The boundary is therefore strict:
audit only high-value route families, make no production changes, and visualize
only choices that alter component anatomy or persistent information hierarchy.

Slices:

- Slice: audit Auctions, Governance, proposal creation/detail, automated mint,
  deploy/manage/settings, Overview, Discover, and Earn at the structural source
  seam; blocked by: none.
- Slice: render the route map and the unresolved Auctions, Governance,
  progressive-workflow, and full-width-context comparisons in the lab; blocked
  by: structural audit.
- Slice: record the provisional archetypes and component implications, verify
  the lab, and hand the remaining visual choices to the human; blocked by: lab
  comparisons.

Unresolved decisions:

- The useful minimum width of the auction list region and the breakpoint where
  browse-and-inspect becomes route-to-detail navigation.
- How the opened auction should use its substantially wider workspace without
  preserving the cramped detail card's composition or inventing abstractions
  before real auction states are inspected.
- Whether proposal-type selection eventually stays as a focused opening step
  or joins a persistent proposal-workflow shell.

Audit findings and provisional grammar:

- Five role-led archetypes cover the audited needs without proposing a single
  universal page component: Browse + inspect, Progressive workflow, Primary +
  support, Context + regions, and Data index.
- Auctions is the clearest discard case. Its separate 706px list and 480px
  detail islands make one browse-and-act task feel like unrelated pages. V1
  will replace them with a persistent list beside the active auction and route
  to detail when the viewport cannot preserve both regions usefully. The opened
  auction must be recomposed for the wider workspace rather than merely
  stretching its current 480px card.
- Governance's browse-and-summary direction remains useful, but is explicitly
  deferred beyond the compressed V1 scope. Keep its current composition during
  migration and improve foundations, components, spacing, and hierarchy. If
  revisited later, a selected proposal panel is a deliberately complete summary
  with a clear full-view action—not a truncated miniature proposal page.
- Automated mint is the reference retain case: its 476px focused opening earns
  a 1200px paired workspace only when two simultaneous regions become useful.
  Consistency means stable roles and transitions, not identical geometry on
  every step.
- Proposal detail may keep a full-width lead above split regions only when it
  carries shared identity, lifecycle, deadline, or actions that change how all
  content below is interpreted. It is not a generic hero pattern.
- Deploy/manage support regions must update with the current step, prevent an
  error, or provide a meaningful preview. Otherwise the form should receive the
  useful width. Overview/settings and Discover/Earn retain their current role
  distinctions while outer alignment, minimums, and responsive behavior are
  normalized later.

Evidence boundary: these calls combine static inspection of the route and view
layout seams with local rendered review of the BSC CMC20 Auctions and
Governance routes. The lab comparisons are deliberately schematic. No
production route, shared component, or token changed in this slice.

The lab overview renders this work map from the same registry. Component detail
pages expose evidence, dependencies, states, questions, relationships,
definition slots, and next action. Future state sheets should read the same
metadata rather than introduce a second checklist. No product component,
shared default, or production token changed during this preparation.

## Slices

- Slice: Establish the project contract and a contained, lazy-loaded `/internal/design-system` lab with a provisional progress dashboard, current-foundation reference, Button state sheet, and deterministic desktop/mobile light/dark capture; blocked by: none.
- Slice: Restructure the lab into routed category and detail pages with direct category navigation, an expected-foundation template, a component capability catalog, navigable missing-state explanations, golden-screen links, and a quieter Project Status page; blocked by: initial lab.
- Slice: Generate a current-code audit baseline covering dependencies, component/route usage, CSS and utility value frequency, duplicates, exceptions, and candidate golden screens; blocked by: initial lab and progress schema.
- Slice: Develop and refine one visual direction against the same foundation samples, Button states, and real local golden screens; blocked by: initial lab and golden-screen selection.
- Slice: Record its provisional aesthetic kernel across color, typography, spacing, radius, elevation, motion, icon treatment, and control geometry; blocked by: initial direction review.
- Slice: Iterate through actions, fields, selection, overlays, navigation, feedback, and data-display families, applying each to real golden screens and retaining only pressure-tested abstractions; blocked by: provisional kernel.
- Slice: Apply the system to four to six golden screens with realistic deterministic data and use the gap inbox for screen-specific exceptions; blocked by: relevant component families.
- Slice: Produce the week-three release candidate with migration helpers, verification coverage, adoption reporting, and an explicit gap list; blocked by: golden-screen validation.
- Slice: Run week-four team use, adversarial stress testing, refinement, documentation housekeeping, and handoff; blocked by: release candidate.

## Unresolved decisions

- The final token values, exact layout measurements, wide-modal role, and the
  first real-component pressure-test refinements. Typography, spacing, elevation,
  iconography, motion, and pragmatic accessibility have provisional reviewed
  rules but remain open to correction through real use.
- Whether the six provisional golden-screen families should be narrowed after the first foundation and component pressure test.
- Which legacy primitives should be evolved, replaced in parallel, or retired after usage analysis.
- Whether any concrete need eventually justifies Storybook; no current need does.
- Which migration metrics are reliable enough to automate versus requiring human review.
- Whether feedback and financial-movement roles should share the same underlying visual ramps, diverge only in exact values, or diverge visually as well; their semantic aliases remain separate in the current candidate. The three-role performance structure is provisional, including the `--data-*` naming.

## Active slice

Use the dense core component board to resolve the shared primitive language,
then use real modal families as the first composed pressure test against the
accepted foundation kernel. Auctions is the one committed structural migration:
prepare its browse-and-inspect implementation as a separate real-screen slice
after the relevant components are ready. Governance retains its current
composition for V1. Do not turn the five layout archetypes into a universal
production wrapper.
