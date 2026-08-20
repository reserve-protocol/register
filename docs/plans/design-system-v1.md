# Design system v1

## Goal

Create and introduce a cohesive new visual system for Register over four weeks. The work should produce a release candidate by the end of week three, leaving week four for product-wide stress testing, team use, refinement, documentation, and handoff.

The system should provide strong foundations and small reusable primitives while keeping complex product compositions flexible. It is explicitly allowed to change existing screens substantially and should raise the visual quality bar rather than normalize every legacy pattern.

## Current state

- Register uses Tailwind CSS 3, semantic CSS variables in `src/app.css`, local shadcn-style primitives in `src/components/ui`, Radix primitives, CVA, and `cn()`.
- Color and radius are partially tokenized. Typography, spacing, elevation, motion, and control geometry are less systematically expressed.
- The product and its design files contain years of inconsistent patterns. Some recent surfaces represent a stronger quality bar.
- The contained `/internal/design-system` lab provides routed Foundations, Components, real-product Screens, Studies, and Project Status surfaces. Components renders reusable V1 candidates with acceptance and production adoption kept separate; Current Review holds only the next nearly complete confidence-boundary candidate.
- `pnpm design-system:capture` and `pnpm design-system:verify` own a pinned local Vite server and capture the lab in light/dark at desktop/mobile sizes. An external base URL remains available for host-browser capture when a dev container cannot run Chromium reliably.
- The existing design-system facts remain in `docs/wiki/domains/design-system.md`. This plan is the active project contract; durable decisions belong in `docs/wiki/decisions.md`.
- A previous branch, `codex/ui-standardization`, contains useful process ideas but stale implementation. Reuse concepts selectively; do not merge or cherry-pick the branch wholesale.
- The first source review compared that branch with the current Home, Discover, and Index DTF overview. Candidate directions now distinguish what to carry forward, adapt, leave behind, and validate next; none of those recommendations are accepted values yet.
- The first focused Color audit now replaces the lab's hand-picked swatches with an explicit source snapshot. It maps current surface frequency and observed roles, renders a provisional semantic surface hierarchy, and keeps role decisions separate from exact light/dark values.
- The provisional golden-screen set is Home/Discover, Index DTF overview, swap/automated mint, governance/proposals, Portfolio, and Earn. Deploy is a secondary overlap route for form patterns. Portfolio needs deterministic holdings fixtures; the instant Zapper widget needs an explicit upstream boundary.

## Authoritative operating model

This section governs day-to-day V1 work. Later dated sections preserve product
evidence and decisions, but any superseded workflow or queue in that history is
not active guidance.

1. Reuse the existing audits and product evidence before gathering the same
   requirements again.
2. Synthesize the strongest complete candidate first from accepted foundations,
   reusable components and recipes, and strong source UI. Triage only the
   meaningful judgment that remains afterward.
3. Preserve product jobs, behavior, content constraints, and strong existing
   design. Consolidate accidental legacy variation rather than mirroring it.
4. Resolve a visually meaningful lower-level prerequisite before asking for
   judgment on its parent. If no baseline exists, resolve it; if a current
   baseline exists but is not consumable, promote that baseline into the
   smallest justified reusable component or recipe; if it is consumable, use
   it directly. A reusable but unreviewed candidate remains visible as a
   candidate rather than becoming authoritative by implication.
5. Self-review and correct consequences of accepted rules before human review.
   Current Review contains only a nearly complete candidate at the boundary of
   what Codex can confidently resolve.
6. Classify meaningful feedback as local, component, pattern/composition,
   foundation, or reusable heuristic. Update the most reusable justified owner
   so subsequent work starts from the correction.
7. Let realistic compositions pressure-test and, when evidence warrants it,
   revise lower-level decisions instead of creating local exceptions.
8. Keep rendered output, reusable implementation, human acceptance,
   verification, and production adoption independent and truthfully labeled.
9. Verify at the owning seam and in proportion to blast radius. Update the
   accepted owner immediately; batch unrelated consumers, documentation,
   baselines, and broader reconciliation until a synchronization boundary.

Source-of-truth precedence for this project:

1. Repository safety and engineering rules in `CLAUDE.md` and `skills/`.
2. Accepted design decisions in `docs/wiki/decisions.md`.
3. Current synthesized design-system guidance in
   `docs/wiki/domains/design-system.md`.
4. Typed registries for design authority, rendered output, implementation,
   review readiness, verification, and adoption state.
5. This plan for project goal, active slice, unresolved risks, and pending
   synchronization.
6. Lab output, which must be derived from the sources above and never override
   them by appearance alone.

`current-baseline` means the designer-reviewed contract is authoritative for
new work today and remains revisable when realistic evidence justifies an
owner-level change. `canonical-candidate` means a reusable V1 component exists;
`reusable-recipe` means only the named shared treatment is consumable. Rendered
output and production adoption are separate. A candidate may be useful evidence
without being authoritative, and a dependency may be treated as settled outside
the parent review only when its relevant contract is the current baseline or it
is explicitly retained product/domain behavior.

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
- Catalog maturity, rendered lab output, reusable implementation, production adoption, and individual definition-slot completion remain independent so a specimen cannot masquerade as a consumable component and a candidate cannot imply product use.
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

1. **Bounded component loop — default during active review.** Verify the files and behavior changed in the current iteration, not the entire accumulated dirty design-system diff. Run formatting/lint or type checking as relevant, the focused component or registry assertion, and an affected desktop browser check against realistic states. Check dark mode only when color or theming changed; check another breakpoint only when layout behavior crossed it. Do not regenerate unrelated snapshots, run broad route suites, request independent review, or reconcile every downstream artifact after each judgment.
2. **Canonicalization sync/checkpoint — after a coherent batch, at a dependency boundary, when the designer steps away, or before a design-system checkpoint commit.** Reconcile accepted candidates and source-of-truth records, run typecheck plus affected unit/behavior tests, run the broader design-system Playwright suite, refresh only intentional stable baselines, and review the batch once. A lab-only checkpoint does not by itself require the full repository smoke gate.
3. **Repository integration gate — before production adoption, a shared/global primitive or token change, a release/PR, or another milestone whose plausible blast radius extends beyond the lab.** Run the repository workflow gate, inspect affected real golden screens and supported product breakpoints, verify accessibility and theme behavior, complete required review, and close out progress and documentation.

During the bounded loop, an old fixed point that includes already-reviewed dirty
design-system work is not a useful verification boundary. Record the current
iteration's touched seam and run explicit focused checks; use `scope.mjs` on the
accumulated fixed-point diff at synchronization or integration boundaries. A
failure outside the changed seam is reported but does not automatically expand
the iteration into repository debugging.

Reuse the already-running lab for interactive inspection and focused browser
assertions when the assertion does not depend on the pinned E2E environment.
`DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3005` is the existing supported seam
for that reuse. The canonical design-system Playwright checkpoint keeps its
owned clean Vite process and `VITE_E2E` configuration; never run it concurrently
with another Playwright suite on port 3005. TypeScript remains project-wide
because the repository has no trustworthy per-component typecheck, but it is a
fast structural check rather than a reason to invoke unrelated route tests.

Keep a design-system stage active across provisional lab turns. A lab edit is not a stage closeout, and static explanatory copy does not need bespoke assertion tests. Mobile support remains a product requirement, but routine mobile verification of the designer-only lab is deferred unless its layout becomes part of the decision being reviewed. This exception applies only to lab presentation: before a product component becomes canonical-review-ready, determine whether a constrained viewport materially changes its anatomy, composition, or interaction. If it does, define and verify that adaptive contract as part of the component rather than carrying it as an unspecified follow-up.

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
  dark icon foregrounds and quiet opaque derived surfaces. The opaque surfaces
  and borders match the former alpha treatments on a white card but no longer
  mix with selected or otherwise tinted parent surfaces. Information is a
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
- A text-only compact popup trigger with one persistent trailing 16px chevron
  transfers that 2px optical adjustment rather than simply removing it: use
  14px leading and 10px trailing padding with the same 8px gap. This preserves
  the 24px compact padding budget while balancing the text edge against the
  chevron's internal sidebearing. Composition-owned widths remain unchanged;
  the pagination Select stays fixed at 70px.
- Default 44px selection triggers use a 12px value-to-chevron gap; compact 32px
  triggers retain 8px. Default triggers pair 20px leading padding with 18px on
  the trailing Lucide-chevron side, following the accepted 2px icon-side
  optical adjustment. The larger relationship prevents a rich selected-value
  summary from visually collapsing into its disclosure indicator.
- Atomic one-row controls remain fully rounded. Composite financial input and
  output objects use the restrained 8px contained-object radius instead of
  inheriting the atomic-control shape.
- Visible compact and micro controls may need larger invisible production hit
  areas. Interaction target size and visible geometry are separate concerns.
- Parent layout owns control placement. In an ordinary padded region, align the
  visible boundary of a framed control with the parent's content inset rather
  than absolutely positioning it against the shell. A composition may instead
  align a glyph to another content axis only when that relationship is explicit;
  the current Zapper study does this for 32px header icon buttons and the amount
  content below. Keep that exception in the composition rather than turning it
  into a self-positioning component default.
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
- Inline evidence label/value pairs use the same tight 4px relationship so
  `Quorum` and `Reached` read as one phrase. Separate evidence groups use 16px,
  while an icon and the value it directly describes retain the related 8px gap.
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
- Passive semantic icons use a fixed invisible slot by default. The current
  dialog candidate uses a 32px slot with a 20px glyph, preserving the parent
  content axis without introducing control-like chrome. Add a visible frame
  only when it communicates semantic meaning or identity, or materially
  improves alignment across a repeated stack—not merely because the icon sits
  above text.
- Passive icon slots have no interaction states. Icon buttons are named
  controls with visible or interactive treatment, adequate hit targets, and
  complete hover/focus/active/disabled behavior. Item-level icon actions sit
  at the trailing edge; leading icon buttons belong to toolbars, navigation,
  or isolated control groups rather than preceding item content.
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

## Superseded core component review board — 2026-08-13

Historical evidence only. The board and its Studies-first review path were
replaced by the visual-first Components catalog, actual reusable candidates,
and Current Review. The rules recorded below remain evidence where they were
subsequently accepted, but this section does not define the active review order.

The 2026-08-19 reconciliation corrected an over-broad deletion from that
transition: accepted rows must be extracted before a mixed-authority board is
removed. The Components landing page now shows every family directly, renders
all available candidates/specimens/recipes, and lists unresolved capabilities
without invented UI. Accepted compact/default text-only and contained Tabs are
again visible; unresolved Product navigation remains inventory for the later
navigation-family review.

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
- Selection marks keep one 20px visual size across densities. Checkbox marks
  sit inside a transparent 28px alignment slot, using the accepted micro-control
  rhythm to provide a 4px optical inset without adding visible chrome. The
  switch candidate is 36×20px with a 16px thumb; its surrounding row or label
  owns the larger interaction target rather than enlarging the visible track.
- Status pills use one compact 24px geometry and a role vocabulary grounded in
  governance: neutral pending/inactive outcomes, active lifecycle, attention,
  completed success, and unsuccessful outcomes. Fast and Contested are shown
  separately as qualifiers rather than being confused with lifecycle states.
- Status pills provide the frame, so their 14px indicators use unframed glyphs:
  an active dot, clock, arrow, spinner, check, x, or minus according to role.
  Evidenced domain phases may replace the default role glyph with an approved
  semantic indicator: a ballot for active voting or shield-alert for an active
  challenge. Icons inherit the semantic foreground rather than adding color.
- Proposal qualifiers remain bare, neutral 14px medium-weight icon/text
  metadata at the title edge. They do not become lifecycle pills; Fast uses a
  bolt and Contested a calm shield so neither competes with the state below.
- Slider and progress tracks use contained neutral chrome on white. Beige is
  never an unfilled control track; it remains reserved for structural substrate
  revealed between regions.
- Current proposal progress uses brand blue; historical proposal progress uses
  neutral completed segments. Outcome color remains in status rather than
  turning the lifecycle bar green or red. Quorum evidence is separated from
  vote distribution by a short neutral divider contained inside the white row.
  Within that evidence cluster, 14px icon/value pairs use the 4px tight-text
  relationship and adjacent vote units use 8px. The divider separates distinct
  quorum and vote regions, so it keeps 16px internal-region spacing.
- Explanatory copy is deliberately short. The board is for visual comparison,
  while real modals and golden screens remain the pressure-test seam for
  behavior, composition, and exceptions.
- Menus/popovers, dialogs/drawers, tables/pagination, and tooltips/toasts follow
  as behavior boards. Their contracts cannot be judged faithfully from a
  single thumbnail and must stay connected to real source-grounded examples.

Everything on this board remains a working candidate. Rendering an item here
does not mark its component definition, design review, adoption, or product
verification complete.

### Residual design-decision triage — 2026-08-13, superseded 2026-08-19

This lane model applies only after the authoritative canonical-first synthesis
and self-review above. It is not a question-first runway. Capture and broad
propagation remain separate operations:

1. Record each accepted decision in `docs/wiki/decisions.md` and update the
   reusable owner immediately, including scope and important exclusions.
2. Classify the feedback as local, component, pattern/composition, foundation,
   or reusable heuristic, then decide whether the next visual judgment depends
   on seeing that choice
   applied. If it does, update only the smallest candidate or fixture needed to
   make that judgment reliable. If it does not, continue to the next decision.
3. Add unrelated affected consumers, documentation, fixtures, baselines, and
   product implementations to the pending sync queue below. Never defer the
   accepted owner or a dependency required for the next review.
4. Run a synchronization pass after a useful decision batch, before product
   migration, or whenever another decision depends on the affected surfaces.
   Reconcile the queue, verify the synchronized result, and then clear it.

Before building a new visual comparison, triage the decision into the cheapest
reliable lane:

- **Lane 1 — high-confidence recommendation:** accepted rules, strong product
  evidence, usability/accessibility constraints, or avoiding a needless special
  case strongly imply one answer. Present the recommendation, reasons,
  confidence, and expected value of seeing alternatives; do not render by
  default.
- **Lane 2 — lightweight choice:** several answers are legitimate but their
  tradeoff can be understood from concise descriptions or an existing lab or
  product reference. Offer the smallest useful A/B/C choice.
- **Lane 3 — visual decision:** alternatives are genuinely competitive or the
  choice materially shapes identity, composition, visual quality, or product
  character. Build only the lowest-cost visual evidence that can settle it.

Conventional safety is not grounds to fast-track an identity-shaping choice.
Conversely, a consequence of an accepted rule does not earn a new specimen just
because it can be illustrated.

For an existing product-defining component whose behavior and visual character
already provide a meaningful baseline, do not invent competing directions by
default. Reconstruct its real default, interaction, and relevant edge states
faithfully; identify specific mismatches with accepted foundations; then let the
designer direct the refinement. A/B alternatives are appropriate only after a
real unresolved choice emerges from that review. This preserves designer control
without exempting the component from logical spacing, color, shape, icon, motion,
and accessibility constraints.

Every canonical visual property must trace to either an accepted foundation role
or the named strongest source implementation. Record that provenance in the
component evidence. A deliberate deviation in type size, weight, line height,
spacing, color, shape, or control geometry remains provisional and must be shown
as a human judgment before documentation can call it accepted. Generic design-
system convention is not sufficient provenance when strong product evidence
exists.

This provenance gate is not grandfathered. Before a previously marked
canonical candidate is shown for another human review, used as a canonical
dependency, or described as dependency-complete, recheck its rendered type,
spacing, color, shape, and geometry against the accepted foundations and named
source evidence. A mismatch returns the affected property or composition to
provisional until it is corrected or explicitly reviewed.

Recurring product components belong in the ordinary component grid/catalog,
not in a permanent decision queue. Show what the product actually has, along
with accepted candidate attributes where already decided. Request designer input
only when inspection reveals a specific broken rule, unresolved visual choice,
or meaningful facelift opportunity; otherwise reconcile straightforward system
consequences without turning them into review prompts.

Component work and design decisions are separate queues:

- **Component work queue:** components and product patterns that still need
  source audit, faithful state coverage, canonical V1 design, system alignment,
  stress testing, or eventual production migration. An item can require
  substantial design/update work without presenting a decision to the designer.
- **Design decision queue:** only unresolved questions where accepted rules and
  product evidence do not determine the answer and human visual judgment would
  materially affect the result. Each prompt must name the actual choice or rule
  conflict; the existence of an unfinished component is not itself a decision.

Codex should move component work forward autonomously through evidence gathering,
rule application, state completion, and obvious corrections. It should surface a
decision only at a real ambiguity or identity-shaping judgment, then return the
accepted answer to the component work rather than treating the component itself
as resolved.

V1 standardizes and visually improves product states demonstrated by real
requirements. It does not invent a new state, screen, flow step, or component
family merely to make the system appear complete. A new category requires an
evidenced functional gap that existing product behavior and accepted patterns
cannot satisfy. Audits preserve jobs, content, behavior, and constraints; they
do not elevate every legacy implementation detail or hypothetical state into a
design-system contract.

Deterministic lab fixtures may use fictional names, values, and dates to expose
an evidenced state, but their copy must not imply unsupported product or
protocol behavior. Product-mechanics language must trace to product source or
domain documentation. Lab-authored copy is review metadata, not migration copy;
production migration preserves evidenced product meaning unless a copy change
is separately and explicitly accepted.

An accepted decision recorded here overrides any unsynchronized exploratory
specimen. A stale specimen is evidence awaiting reconciliation, not a new design
question. Intentionally deferred work and component decisions not yet reached
do not enter the queue until an accepted decision actually creates downstream
work.

**Historical synchronization note:** the canonicalization batch described
below was synchronized on 2026-08-14. It is not the current queue.
The Button dependency boundary is synchronized: the accepted candidate is a
reusable component, active Button sheets/boards and EmptyState consume it, and
the catalog separately reports specimen, canonical-candidate, and adoption
status. Unrelated exploratory studies and product consumers remain untouched.
The accepted 32px dense two-line identity now passes long-name, fallback,
account-mark, and realistic Index-row pressure tests. The review board renders
the canonical centered headline metric and faithful collapsed/hover-expanded
navigation baseline. Decisions 03–10 remain synchronized across the lab-stage
Dialog contract, affected catalogs, canonical guidance, and modal studies.
Product migration remains intentionally out of scope; it will be planned from
the accepted contract rather than treated as leftover propagation.

### Superseded product-facing preparation queue — 2026-08-14

Historical prioritization only. The typed registry and Active slice below own
current work; this section remains product evidence rather than an active queue.

The reviewed foundations and basic component work are sufficiently mature to
design the next product-facing layer without substantial expected rework.
Surface/substrate roles, type hierarchy, spacing axes, shape roles, control
geometry, icon usage, elevation, motion, and core action behavior constrain the
work meaningfully. Remaining exact neutral values, pressed treatments, and
field-specific anatomy should be resolved when real compositions expose a
problem rather than blocking this layer in advance.

Prioritize recurring product anatomy by reach, visual impact, foundation
readiness, and how much it pressure-tests the system:

1. **Repeated information rows.** Use real Index overview asset rows,
   transaction rows, and governance proposal rows to define shared identity,
   title/supporting text, status, metric alignment, truncation, density, and row
   action rules. Do not force these different jobs into one universal Row
   component; extract only the anatomy that survives the comparison.
2. **Metric blocks.** Compare Overview, Governance, Home, and Earn label/value/
   trend compositions to define stacked and inline roles, units, supporting
   comparison, help/actions, missing values, and loading without inventing a
   universal card wrapper.
3. **Product navigation items.** Start with the persistent Index DTF rail and
   related section navigation because they appear across high-value routes and
   materially shape the product identity. Preserve route semantics while
   reviewing current, hover, disabled, expanded, and long-label states. The
   current rail item configuration has no nested navigation; dormant generic
   `subItems` support is not product evidence and does not create V1 scope.

Cards/content regions, contained form rows, action groups, and empty-state
recipes follow this first batch. Consequential dialog completion remains valid
visual work but no longer automatically outranks these higher-reach product
surfaces. Real product source and realistic content are the evidence base;
canonical candidates remain lab-only unless a deliberately named route
integration experiment becomes necessary.

### Product-facing preparation audit — 2026-08-14

The first preparation pass reviewed source and live BSC CMC20 Overview,
Governance, and Auctions surfaces. It confirms that this phase should extract a
small anatomy layer rather than introduce universal product wrappers:

- **Comparable data rows** occur in the Overview holdings and transaction
  tables and are stress-tested by Discover and Index Earn. They need entity
  identity, sortable headers, aligned/tabular numeric cells, secondary values,
  long names/tags, basket counts, governed-entity overflow, APR/APY units,
  performance meaning, row actions, loading, and overflow. Their default remains
  divider-free inside white content regions.
- **Rich navigable records** occur in Governance proposals and Rebalance
  history. They need long titles, lifecycle/status, optional progress, several
  metrics, qualifiers, provenance, and whole-item navigation. They should share
  lower-level identity/status/metric anatomy with tables but remain a separate
  composition rather than a universal `Row` variant.
- **Metrics** have two reusable anatomies: inline key/value pairs in Overview,
  Governance, and Auction selectors, plus headline stacked values used on Home.
  Standardize label/value/units/loading/missing anatomy; parent regions continue
  to own alignment, consistent group emphasis, optional icons, grids, and
  framing.
- **Product navigation** is an evidenced Register extension missing from the
  earlier generic registry. The persistent Index DTF rail combines DTF identity,
  icon-led routes, current/hover/focus/disabled states, hover expansion, and a
  constrained-screen recomposition. It is now cataloged separately from generic
  Link and Button contracts while preserving one route model. Although the
  generic item component contains `subItems` support, no current navigation item
  supplies it, so nested navigation is excluded from V1 evidence.

The next visual runway in the Components lab is intentionally compact. It uses
real CMC20 labels and values to prepare asset-row identity/density and Index
navigation state-language judgments while canonicalizing source-faithful Metric
anatomy without manufacturing an outcome-specific role.
The cards are candidates, not decisions, and no product component or route was
changed.

The first information-row judgment accepts a 32px identity mark for dense,
two-line asset rows. This preserves the scale already used by the current Index
DTF Overview exposure table (`TokenLogo` `xl` = 32×32px) and gives the asset
name/symbol pair enough visual presence beside aligned numeric columns. The
decision does not make every entity mark or every table-row icon 32px; compact
single-line rows and other entity jobs keep their own evidenced geometry. The
canonical candidate now survives a long asset name, deterministic fallback,
account mark, and aligned weight/performance/market-cap peers in a realistic
divider-free Index slice.

Headline protocol metrics remain center aligned. This is a composition-specific
consequence of the one established headline-metric strip, not a general Metric
primitive setting: inline key/value metrics and outcome summaries keep the
alignment required by their own layouts. The discarded left-aligned comparison
did not represent a meaningful product alternative and should not have entered
the visual-decision lane.

Decision triage for this layer:

- **Lane 1:** numeric alignment, tabular numerals, equal sizing for horizontal
  peers, two Metric anatomies across three product compositions, the framed icon slot in the
  persistent vertical rail, page region versus repeated-card criteria, the
  accepted contained-form axis, and quiet-versus-actionable empty-state logic.
- **Lane 2:** always-visible versus revealed row actions, missing/stale/loading
  metric language, expanded navigation-label behavior, and routine action-group
  ordering. These should use source evidence before new comparisons are built.
- **Lane 3:** dense asset-row identity/density, rich navigable-record hierarchy,
  Index navigation current/hover-expanded state,
  interactive card/media character, complex repeated form groups, and the
  small set of meaningful illustrated empty states.

Prepared order after the first three reviews: cards/content regions, contained
form rows, action groups, and empty states. The audit source map lives in
`product-facing-component-audit.ts`; it names source evidence, decision lane,
migration seam, and the abstraction to avoid for each family. This lets a later
migration plan group consumers by stable seam instead of translating legacy
class combinations one by one.

The first focused component decision loop accepted Button hierarchy and intent:

- Primary actions use the blue brand fill.
- Secondary actions use a white content-surface fill with the neutral control
  border. The rejected neutral-filled alternative is not retained as another
  secondary variant; neutral gray remains contained control chrome.
- Quiet actions are visually bare until interaction. Destructive actions use
  red only when the consequence is destructive, not merely because the label
  says cancel or remove.
- The reviewed micro, compact, and default action geometry remains 28px, 32px,
  and 44px with 14px medium labels and size-matched icons.
- This is a partial Button definition, not production migration. Pressed and
  long-label behavior remain open; destructive confirmation is defined below.
- The accepted contract is implemented as the reusable lab candidate in
  `src/components/button/`. Active Button matrices and dependent canonical lab
  output import it directly; the production `src/components/ui/button.tsx`
  component and its consumers remain unchanged.

The decision was pressure-tested with the real Async Mint completion pair (`New
mint` / `View DTF`) and the real Governance simulation follow-up (`View on
Tenderly`).

The second focused decision accepted state-led loading communication:

- Ordinary asynchronous work uses a progress verb such as `Simulating…`.
- When the user must act in a wallet, the control uses a direct instruction
  such as `Confirm in wallet`; it does not call that waiting state `pending`.
- After submission, transaction-aware controls use lifecycle status such as
  `Transaction pending`. These are Transaction Action states, not extra visual
  Button variants.
- Width, size, hierarchy role, placement, and spinner remain stable; repeat
  activation is disabled.

Current source evidence mixes `Pending, sign in wallet`, `Sign in your wallet`,
`Waiting for confirmation`, and `Confirming`. That is a later reconciliation
target, not a reason to preserve all four as V1 vocabulary. That decision led
to the dialog action comparison using the real Liquidity Simulation
configuration requirements.

The third focused decision accepted one visible completion action for a
reversible task dialog:

- Liquidity Simulation uses one full-width primary `Simulate` action.
- Close, Escape, and outside dismissal already provide cancellation, so the
  footer does not duplicate that behavior with an outlined `Cancel` action.
- This does not apply to destructive confirmations, non-dismissible gates, or
  flows where leaving has a distinct consequence that needs explicit wording.
- This rule is synchronized in the lab-stage Dialog contract. Product migration
  remains a later explicit stage.

The fourth focused decision accepted body-owned scrolling for long dialog
content:

- When content exceeds the available viewport, the dialog header and action
  region remain anchored while the body owns vertical scrolling.
- This keeps task context and the required action available while users inspect
  long legal or reference detail.
- Ordinary short dialogs do not gain fixed regions or visible scroll chrome;
  this rule changes behavior only at an actual overflow boundary.
- The real expanded eligibility jurisdiction list was the pressure case. The
  rule is synchronized in the lab-stage Dialog contract.

The fifth focused decision accepted an explicit safe exit for destructive
confirmation dialogs:

- Pair a red destructive action with an outlined `Cancel` action. Shell close,
  Escape, and outside dismissal retain the same cancellation behavior.
- Name the destructive action for its consequence, such as `Delete proposal`,
  rather than using a generic `Confirm` label.
- This is a risk-specific exception to the one-visible-action rule for ordinary
  reversible task dialogs, not a second general footer layout.
- Dialog and Button guidance now reflects this rule; production migration
  remains a later explicit stage.

The sixth focused decision prohibited nested blocking dialogs:

- Do not open a dialog on top of another dialog. Continue the task within the
  current shell or replace its content when a blocking subtask is required.
- Popovers, menus, and selectors may appear within a dialog when they are
  supporting controls rather than separate blocking tasks.
- This keeps focus ownership, dismissal, and elevation unambiguous without
  creating another overlay-shell variation.
- Dialog and related overlay guidance now reflects this rule.

The seventh focused decision kept the action region stable during in-progress
dialog states without freezing the dialog body:

- The anchored action stays in the same location and at the same width, becomes
  non-repeatable, and communicates the current operation using the accepted
  state-led loading vocabulary.
- Ordinary asynchronous tasks keep their content stable. Complex workflows may
  update the body with steps, progress, transaction detail, or partial results
  while the action continues to communicate the active operation.
- The shell should not resize or reorganize for incidental loading changes. A
  deliberate transition to a meaningfully different workflow stage may change
  the composition.
- Dialog and Transaction Action guidance now reflects this rule.

The eighth focused decision preserved task context and user input after a
recoverable dialog failure:

- Keep the dialog open and retain entered values. Place the error near the
  affected content and use the anchored action for a consequence-specific
  recovery such as `Try again`.
- Do not create a standalone failure-dialog pattern. Only an evidenced product
  flow that genuinely cannot continue in its current composition may justify a
  full-surface failure state.
- This distinguishes recoverable validation or operation failure without
  inventing another modal category.
- Dialog, Transaction Action, and error-feedback guidance now reflects this
  rule.

The ninth focused decision accepted a tiered use of outcome illustration:

- Routine success and error outcomes use a semantic framed icon rather than a
  bespoke illustration.
- Meaningful product milestones may earn purpose-made illustration when it adds
  emotional or explanatory value. Illustration is not required merely because
  a transaction finished.
- This creates a deliberate role for Reserve illustration without making
  routine confirmations visually excessive or dependent on an ever-growing
  asset set.
- Exact illustration style and composition remain a later visual decision.
  Dialog outcome and illustration guidance reflects the accepted usage rule.

The tenth focused decision tied outcome presentation to consequence and
required attention:

- Keep completion in the dialog when users need confirmation details, a next
  action, recovery information, or assurance for a consequential operation.
- Use a toast when the result is routine and non-blocking and users can safely
  continue without inspecting it.
- This prevents empty success dialogs and keeps the feedback component aligned
  with the amount of attention the result actually requires.
- Dialog and Toast guidance now reflects this boundary.

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
- Entity identity also includes two recurring visual primitives that the first
  lab grid omitted. `TokenLogoWithChain` already has repeated Portfolio consumers,
  while recent Index surfaces locally rebuild DTF logo + chain badge with
  different size, offset, and background-border choices. Overlapping asset logos
  are implemented by two `StackTokenLogo` files whose names differ only by case,
  and consumers such as Discover add the separating surface-colored borders
  themselves. Both belong in the component grid. V1 should consolidate each
  recipe rather than asking the designer to rediscover its existence or
  preserving every local variation.
- The first canonical product-facing candidate now lives in
  `src/components/entity-identity/` and is consumed directly by the lab. It
  separates `ChainBadgedLogo`, `ChainLogoStack`, `TokenLogoStack`, and the
  identity text composition so rows can reuse the same marks without a
  universal Row prop matrix. The badge recipe follows the strongest recent
  Index treatment. Both stack types now use one frame recipe in which requested
  size describes the artwork, the 2px surface-colored separator wraps outside
  it, and optical leading compensation aligns the first artwork with a singular
  peer. Existing production consumers and the two legacy stack files remain
  unchanged until an explicit migration slice.
- `src/components/ui/v1-semantic-recipes.ts` is the deliberately small first
  bridge from reviewed semantic roles to consumable candidate components. It
  exposes canvas/content/structural surfaces, primary/supporting text, matching
  surface-separation recipes, and focus/disabled-control recipes proven by the
  canonical Button. Extend it only when the next canonical component
  demonstrates a real need; do not prebuild a second token system.

The registry currently contains 43 contracts: 32 V1 core, eight Register
product extensions, and three conditional capabilities. Conditional slots stay
visible but should be marked not-needed when product evidence fails to justify
them; inclusion is not a commitment to build.

Every component contract now records:

- V1 core, conditional, or Register-extension priority.
- Mapped, partial, or pending source-audit status.
- Whether its rendered output is only a specimen or a reusable canonical
  candidate, separately from whether production adoption has begun.
- Whether the composition is ready for canonical V1 review, provisional,
  blocked, or exploration-only; the exact review scope; and the status of each
  visually meaningful dependency.
- Current implementation and product evidence.
- The exact questions to resolve before defining it.
- Shared family states plus component-specific lifecycle states.
- Foundation dependencies so lab proposals can update after tokens change.
- Relationships to easily confused contracts, such as Button versus Link,
  Tabs versus Segmented control, Select versus Menu, and Dialog versus Drawer.
- One next action that moves the slot from inventory to complete state sheet.

Historical initial working order after foundations (superseded by the active
registry queue and Active slice):

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

### Canonical product kernel — 2026-08-14

The first unattended canonicalization batch establishes real shared candidates
instead of lab-only copies:

- `EntityIdentity`, `ChainBadgedLogo`, and `TokenLogoStack` share geometry while
  leaving token resolution and account-avatar domain logic in their existing
  specialized primitives. The corrected chain badges are 16px at xl and an
  optically floored 14px at lg, including their surface-separating borders.
- `Metric` owns inline and centered-headline label/value anatomy. The headline
  treatment follows the strong Home source with a 16px/300 label and 16px/500
  value, while
  `MetricValue` gives comparable data cells the same 16px/300 tabular baseline.
  Parents continue to own cards, grids, help, and responsive composition.
- The Table lab composes those seams in a realistic divider-free Index holdings
  slice. This is deliberately not a universal Row abstraction and is not a
  production Table-default migration.
- `EmptyState` distinguishes quiet absence from a user-resolvable absence while
  leaving region size, surface, and illustration outside the primitive.
- `Button` is a real reusable candidate rather than repeated lab markup. It
  implements the accepted four tones, 28/32/44px scale, optical icon padding,
  two-color focus, structured disabled state, and state-led loading. Pressed
  and long-label behavior remain explicitly open.

The lab directly imports every component above. Existing production badge,
stack, metric, table, and empty-state consumers remain unchanged until a named
opt-in adoption experiment. Auction selector groups reuse inline Metric with
consistent parent-owned value emphasis; full-view outcomes remain a separate
composition question, while icons stay outside the Metric API. The next genuine
visual judgments are Index rail refinement,
interactive-card character, complex repeated form groups, and the small set of
states that may earn illustration. Rich proposal and auction records remain
separate reviewed compositions rather than entering a universal Row API.

The next bounded dependency pass adds only the interaction seams needed by a
real dialog composition: a 20px square binary Checkbox in a transparent 28px
alignment slot, a compact named
IconButton built on Button, and a minimal Radix-backed Dialog shell. Their open
variants remain explicit rather than being completed speculatively. The real
eligibility composition consumes those candidates plus an explicitly retained
Collapsible behavior primitive. The superseded core scale boards are no longer
rendered, modal geometry copies remain provisional, and the realistic Index
data slice remains a Table specimen rather than a canonical Table/DataRow
claim.

Human review accepted this interaction kernel in the eligibility composition.
That acceptance covers the reusable shell and canonical dependencies, not every
dialog composition. Consequential outcomes, illustration, and final elevation
remain explicit later composition-level work grounded in real product flows.

## Lab visual-review reorganization — 2026-08-14

### Goal

Reorganize the existing lab so Foundations and Components lead with dense,
accurate visual output; canonical, provisional, exploratory, and production
adoption states remain visibly distinct; Studies contains only unresolved
questions; and Project Status carries the deeper tracker and history.

### Delivered state

- Foundations opens with nine compact visual specimens; accepted rich studies
  live on their authoritative foundation detail routes.
- Components opens with seven registry-derived canonical candidates rendered
  from shared implementations, followed by one clearly provisional composition
  and a compact inventory that exposes audit and review maturity.
- Representative detail pages lead with visual output and local readiness;
  evidence, dependencies, definition slots, and history remain available in a
  secondary disclosure.
- Studies renders only unresolved color, layout, and modal pressure
  tests.
- A typed Current Review list owns human judgments. Project Status
  derives per-item progress and autonomous next work from the registries.

### Non-goals

- No new foundation values, component APIs, production adoption, product-route
  migration, token migration, or design-strategy decisions.
- No filters, scores, elaborate dashboards, new orchestration, or duplicated
  product-screen gallery.
- Screens remain structurally intact.

### Acceptance evidence

- The running desktop lab shows foundation specimens directly on the
  Foundations landing page and actual reusable implementations directly on the
  Components landing page before secondary metadata.
- Canonical candidates, provisional compositions, exploration, and production
  adoption are labeled independently and truthfully from the existing typed
  registries.
- Representative Foundation and Component details lead with visual output and
  local readiness; evidence, dependencies, definition slots, and history are
  progressively disclosed.
- Studies renders only open questions and pressure tests; accepted foundation
  visuals have one authoritative rendered home.
- A typed manual Current Review source contains at most three genuine human
  judgments with title, reason, destination, and review type.
- Existing focused catalog tests, typecheck, lint, design-system Playwright,
  fresh desktop visual inspection, scoped verification, and wiki-lint are green.

### Test seams

- Playwright at `/internal/design-system/*` remains the highest stable seam for
  route hierarchy, readiness labels, progressive disclosure, theme, overflow,
  and rendered visual output.
- Focused Vitest covers typed catalog/current-review derivation only when it
  contains behavior; static specimen composition relies on typecheck plus
  rendered assertions.

### Slices

- Slice: make Foundations and Components visual-first by reusing compact
  foundation specimens and actual canonical component implementations; blocked
  by: none.
- Slice: reorder representative details and validate the primary desktop review
  experience in the running lab; blocked by: visual-first overviews.
- Slice: remove accepted material from Studies, add the typed Current Review
  source, and collapse secondary inventory/evidence behind disclosure; blocked
  by: primary review experience.
- Slice: reconcile Project Status and durable documentation only where current
  claims became stale; blocked by: primary and secondary lab reorganization.

### Unresolved decisions

- None block implementation. Existing registry metadata is authoritative; any
  contradiction that would require a new design decision stops that affected
  promotion rather than inventing a direction.

Strongest case against this plan: compressing the lab could hide evidence or
make provisional work look canonical. The response is progressive disclosure,
not deletion: visual output moves first while registry-backed readiness,
dependencies, evidence, and the full tracker remain reachable and independently
labeled.

## Original project slices (historical)

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

## Slices

- Slice: replace thumbnail-first Components output with compact complete state
  sheets shared by the overview and detail routes, plus one unresolved
  inventory; blocked by: none.
- Slice: complete the independent Field / TextInput candidate and state sheet
  from accepted form, geometry, type, shape, and semantic-role baselines;
  blocked by: none.
- Slice: encode and render the Action group composition recipe derived from the
  accepted Button width, hierarchy, spacing, and size rules; blocked by: none.
- Slice: verify and, only where needed, finish the canonical entity-mark
  boundary for chain badges, overlapping token marks, and identity text;
  blocked by: none.
- Slice: prepare the highest-value remaining Yellow evidence without making a
  consequential visual decision; blocked by: completed independent Green work.
- Slice: run the design-system synchronization checks, reconcile only stale
  project state, and hand off at the human-judgment boundary; blocked by: the
  preceding bounded slices.

## Active slice

The independent safe-autonomy frontier from checkpoint `15f6dae9e` is at its
human-review boundary. Components now mounts all 14 complete shared state sheets
and one compact 29-item unresolved inventory; Product Navigation stays explicit
and unresolved. SingleChoice, Field/TextInput, and ActionGroup are accepted
current baselines. The repeated governance-parameter composition and reusable
PresetOrCustomField relationship are now accepted, including the constrained
width overflow rule owned by SingleChoice. The source-grounded explanatory
HelpTooltip candidate is also accepted, including its bare trigger, label
relationship, touch behavior, and bounded dynamic-width floating surface.
The source-grounded bounded-value Select is now an accepted current baseline:
Field geometry determines its default trigger, real pagination evidence
determines its compact trigger, and the reviewed popup owns density, shared
subtle-interaction treatment, selected-check character, and optional leading
chain identity. Its source-grounded chain fixture covers both
individual 16px marks and a canonical stacked `All chains` summary without
adding a control-radius override to their authored identity geometry or
claiming multi-value selection or mobile filter substitution. The Select
pressure test exposed one shared identity issue: legacy-style separator borders
were reducing visible artwork and indenting stacked marks. `ChainLogoStack` and
`TokenLogoStack` now consume the corrected common frame recipe; production
consumers remain unchanged.
Trigger width and visible-label treatment remain composition-owned. Compact
bounded utilities reserve width for their widest known option rather than
resizing with the current value.

The attempted next Combobox slice stopped at source inspection because its
prepared evidence conflated three real jobs: navigation Command search,
multi-select filtering, and drawer-based Asset picking. The component registry
now records that no generic single-value searchable form control is evidenced;
future Combobox work must start from a real product seam rather than combining
those adjacent behaviors.

SearchField is now an accepted current baseline. It composes TextInput and
IconButton, preserves the 44px Field scale, and owns only the search mark,
controlled clear action with focus return, and loading indicator. One size is
sufficient for current evidence; compact sizing may be added only when a real
dense-toolbar use requires it. Results, grouping, no-results recovery, Command
navigation, Asset picker behavior, responsive substitution, and production
adoption remain separate.

The source-grounded action Menu is now an accepted current baseline. Source
inspection keeps Index contract actions, external links, and the header Search
invocation as Menu evidence while treating chart type, time range, language,
theme, and social-channel choice as value selection. The reusable candidate
retains Radix action semantics, consumes canonical Button/IconButton triggers,
and reuses the accepted popup rhythm without importing Select behavior. Labeled
Menu and Select triggers consume one shared down-chevron indicator: opening
rotates it 180 degrees over the 120ms immediate-feedback duration, while
reduced-motion removes the transition; icon-only triggers do not add it.
Menu separators cross the popup padding to meet the inside of its border,
clearly separating action groups rather than aligning to the item-content axis.
Selection items, grouped header panels, submenus, responsive substitution, and
production adoption remain separate.
The minimal Popover shell is accepted by consequence of the reviewed Select
and Menu geometry, without inventing generic padding, width, or inner anatomy.
MultiSelectFilter is now an accepted current baseline and Current Review is
empty. It preserves the real staged Apply behavior, replaces Switch-based set
membership with canonical trailing Checkbox rows, keeps optional identity and
labels on one clean leading axis, and composes accepted Button geometry,
selection-value typography, identity, Popover, motion, and ActionGroup
dependencies. The accepted 44px trigger uses a 12px summary-to-chevron gap and
20px-leading/18px-trailing optical padding. Its rows retain 8px popup and 12px
item insets; the provisional 14px/16px single-line role combines with matching
20px leading identity and visible Checkbox marks to retain a 44px row. The
Checkbox keeps its 28px target by overlapping 4px into the row-owned inset.
The accepted no-divider footer groups compact secondary Clear and primary Apply
actions on the right with an 8px gap, 20px horizontal and bottom insets, and 8px
top padding. Search, large-list loading and empty states, token-result density,
mobile drawer substitution, and production adoption remain separate.
Do not change the shared legacy Card default, promote Table/DataRow, redesign
Product Navigation, begin production migration, commit, or push as part of this
slice.
