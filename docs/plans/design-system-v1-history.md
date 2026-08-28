# Design system v1 — historical record

> Historical/load-on-demand evidence. This file preserves the former active
> plan, including dated studies, superseded queues, prior handoffs, and the
> transaction-review chronology. It is not the current operating contract.
> Start with [the active design-system v1 plan](design-system-v1.md); use this
> record only when a routed audit or evidence trail requires it. Words such as
> “current” and “active” below describe the state when each section was written.

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
- The lab uses direct routed navigation for Foundations, Components, Screens, and Project Status; category landing pages expose the relevant catalog, while detail-route group navigation moves into a closed full-width disclosure so it remains reachable without reserving specimen width.
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

## Accepted typography baseline — 2026-08-22

Human-approved current baseline; production adoption remains separate:

- Use Lausanne 300 for spacious hierarchy and reading: display, page and
  section titles, lead copy, body copy, ordinary values, and supporting text.
- Use Lausanne 500 for compact structure and emphasis: panel titles, labels,
  actions, selected controls, repeated-item titles, and emphasized values.
- Keep 700 parked with no V1 role unless a real composition demonstrates a
  rare need. Do not buy another weight until the 300/500 system exposes a
  concrete gap.
- The six candidate sizes are 48, 32, 24, 20, 16, and 14px. Restrict 12px to
  genuinely auxiliary chart or dense metadata cases rather than treating it as
  a normal hierarchy tier. Application typography remains stable across
  breakpoints except for the rare display/hero role, which provisionally steps
  from 48px/54px to 40px/46px on narrow phones; page titles, sections, body,
  controls, and data do not inherit a responsive scale.
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
- Use a 20px line height for 14px typography by default across weights and
  roles. Tighter treatment requires a reviewed component-specific geometry and
  remains an exception rather than a reusable typography default.
- Human-readable financial values stay in Lausanne, inherit their contextual
  role, add tabular numerals, and align right in comparable columns. Monospace
  is reserved for machine identifiers such as addresses and transaction hashes.
  Peer values use consistent precision, a true minus sign, and an em dash for
  unavailable data. Long readable content targets roughly 65 characters per
  line; meaningful titles wrap, while only known-width machine cells truncate.
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
- Compact standalone controls—buttons, segmented controls, badges, icon controls,
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
- The later accepted Button-family refinement supersedes those provisional
  compact and default values for actions only: text-only compact Buttons use
  14px on each side and 12px on an icon side; text-only default Buttons use
  24px on each side and 22px on an icon side. Micro Buttons retain 10px/8px.
  Selection triggers, contained-selection items, and icon-only controls keep
  their separately reviewed geometry rather than inheriting the Button
  correction.
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
- A divider belongs directly to one boundary and never supplies spacing by
  itself. Adjacent regions use matching semantic insets unless an intentional
  hierarchy difference is being reviewed. Do not combine a parent stack gap
  on one side with unrelated child padding on the other; remove the divider
  when spacing or surface contrast already provides enough separation. When a
  bordered region leads directly into an action, that region owns symmetric
  inset and the attached footer contributes no additional top gap; only a
  genuinely separated footer owns a new gap. For compact transaction task
  shells, divider-to-facts and facts-to-primary-action are 16px internal-region
  relationships; related fact rows remain 8px apart.

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
- Ordinary routes omit icons by default. A trailing ArrowRight may add forward
  emphasis, ArrowLeft leads return navigation, ArrowUpRight signals an external
  or new-tab destination unless a more specific outcome icon applies, and
  Download is reserved for real file/resource outcomes. Navigable rows and
  cards use a far-trailing ChevronRight;
  ChevronDown belongs to in-place disclosure and is not a route indicator.
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
without invented UI. The contained Tabs work recovered during that transition
remains visible; its former text-only proposal is superseded by the later
Tabs-versus-Segmented-Control review. Unresolved Product navigation remains
inventory for the later navigation-family review.

The Components landing page now leads with a compact, lab-only review board.
It is the primary place to compare the emerging component language before any
candidate changes a shared production primitive:

- One scale matrix aligns compatible controls to the accepted 28px micro, 32px
  compact, and 44px default heights. A dash is shown when a size has no clear
  semantic use instead of creating a complete Cartesian product of variants.
- Actions, icon actions, text fields, search, select, checkbox rows, and
  segmented controls shared the same columns so shape, padding, type, icon, and
  alignment errors were visible across families rather than only in composed
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
- Tab variants used foreground text for the active item and supporting text for
  inactive items rather than turning selection into a primary-blue action. The
  former text-only candidate followed the Index overview timespan treatment;
  later review correctly moved that immediate range-selection job to Segmented
  Control and removed text-only Tabs from the active baseline.
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
domain documentation. Lab-authored copy is review metadata, not migration copy.
Product-facing copy is preserved verbatim from its evidenced source—including
in lab specimens: agents have no authority to edit visible wording, labels,
placeholders, accessibility names, or lifecycle/status language unless the
user explicitly approves that specific copy change. Copy concerns and
alternatives may be reported separately, but must not be silently implemented.
This includes apparent typo and clarity corrections. If a new UI has no
evidenced copy owner, stop and request the copy rather than inventing it.

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
- This was a partial Button definition, not production migration. Pressed and
  long-label behavior remained open at this stage; the active slice below now
  owns their current status. Destructive confirmation is defined below.
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
  universal Row prop matrix. `EntityIdentity` owns the accepted 8px direct
  mark-to-copy relationship; host layouts may reserve a larger alignment slot
  around the mark without adding another component-specific text gap. The
  badge recipe follows the strongest recent
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

### Reusable product-kernel evidence — 2026-08-14

The first unattended synthesis batch establishes real shared candidates instead
of lab-only copies. Authority remains component-specific rather than applying
to every item in this evidence set:

- `EntityIdentity`, `ChainBadgedLogo`, and `TokenLogoStack` share geometry while
  leaving token resolution and account-avatar domain logic in their existing
  specialized primitives. The corrected chain badges are 16px at xl, an
  optically floored 14px at lg and 12px at md, including their 1px
  surface-separating borders. Their 4px rounded-square treatment stays legible
  instead of collapsing into a circle at small sizes.
- `Metric` owns inline and centered-headline label/value anatomy. The headline
  treatment follows the strong Home source with a 16px/300 label and 16px/500
  value, while
  `MetricValue` gives comparable data cells the same 16px/300 tabular baseline.
  Parents continue to own cards, grids, help, and responsive composition.
- The Table lab composes those seams in a realistic divider-free Index holdings
  slice. This is deliberately not a universal Row abstraction and is not a
  production Table-default migration.
- Exploratory `EmptyState` evidence distinguishes quiet absence from a
  user-resolvable absence while leaving region size, surface, and illustration
  outside the primitive. It is not canonical without explicit human acceptance.
- `Button` is a real reusable candidate rather than repeated lab markup. It
  implements the accepted four tones, 28/32/44px scale, optical icon padding,
  two-color focus, structured disabled state, state-led loading, and pressed
  treatment. Long-label overflow remained open in this historical evidence
  batch and is resolved by the active slice below.

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

The safe-autonomy frontier from checkpoint `9c40640d5` is implemented as one
uncommitted, unadopted lab stage. Existing accepted recipes retain authority
only within their reviewed scope. Tabs is now an accepted current baseline;
the other newly synthesized contracts remain exploratory and every item keeps
`adoptionStatus: none`.

Accepted in human review:

- Radix-backed `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` now apply the
  accepted contained compact/default geometry to real keyboard-connected
  panels. Intrinsic/full are layout settings rather than variants. Text-only
  presentation was removed after its strongest assumed uses were correctly
  classified as Segmented Control behavior. Tiny sizing, counts, routes, deep
  links, and new overflow policy remain excluded.
- `SegmentedControl` now owns immediate peer-mode selection in reviewed
  text-only and contained compact/default presentations. Intrinsic is the
  ordinary text-only layout; the compact mobile DTF chart range provides the
  accepted full-width text-only case. It does not inherit Tabs panels or
  SingleChoice form-value semantics.
- `TextArea` now extends the accepted Field anatomy with a restrained 8px
  contained-object radius, 20px horizontal and 16px vertical inset, vertical
  resize, and inherited invalid, read-only, and disabled states. Character
  count, rich text, and production adoption remain excluded.
- `Switch` now owns the accepted 36×20 immediate boolean treatment with a 16px
  thumb and a semantic inverse-neutral disabled pair that preserves stored
  state without active color, blanket opacity, borders, or elevation. Async
  recovery, settings-row composition, and production adoption remain excluded.
- Table-independent `Pagination` now owns the accepted 1-based contract,
  optional page-size selection, 32px peer-control row, seven/five-item responsive
  windows, non-clickable current page, quiet available/unavailable hierarchy,
  and host-owned outer inset. Shared 44px mobile hit-target expansion is
  intentionally deferred to the accessibility pass; DataTable defaults and
  production adoption remain unchanged.
- `CopyableValue` now owns the accepted 14px monospace machine-value
  presentation, deliberate address shortening, canonical micro copy action,
  truthful clipboard success, polite announcement, Escape dismissal, and
  two-second neutral-to-success feedback transformation. Full-value layout,
  failure presentation, sensitive-value policy, explorer-action pairs,
  native/bridged address composition, and production adoption remain separate.
- `Skeleton` owns neutral material and pulse only; hosts retain truthful size,
  radius, repetition, and loading boundaries. `Spinner` owns the accepted
  14/16/24px placement scale and inherits contextual color. Both remain
  unadopted and do not replace refined product loading compositions.
- `EmptyState` now owns quiet title-only and actionable absence with the
  accepted 4px title/description relationship, 384px centered description
  measure, optional unframed neutral icon, and canonical intrinsic actions.
  Host framing, exact request channels, bespoke milestone artwork,
  loading/error states, and production adoption remain separate.

Previously accepted baseline carried into this slice:

- Button now includes its centered 0.98 momentary press scale and opaque filled
  interaction colors derived from the theme token at 8% hover and 16% pressed
  darkening. The scale uses the accepted 120ms duration, leaves layout fixed,
  and is omitted under reduced motion. Persistent `aria-pressed` selection
  remains outside ordinary Button. The accepted label-fit policy remains
  concise, intrinsic, and single-line by default, with deliberate default-size
  wrapping reserved for unavoidable localized copy.

Accepted in the subsequent human review:

- `Link` now provides one accepted, unadopted navigation contract for inline reading
  links, standalone navigation, and the evidenced quiet return-navigation
  pattern. Return navigation uses the accepted 14px light supporting role with
  a 4px arrow-label relationship and promotes from supporting-neutral to
  primary underline on hover or focus. This is not a universal Back default:
  named return links orient users when the parent is not otherwise clear, while
  compact headers with obvious parent context use the canonical framed
  IconButton. Link retains native or React Router anchors,
  merges secure external-resource rel tokens, requires caller-owned localized
  new-window announcement copy alongside the visual external indicator, wraps
  long labels, and composes the canonical Button through `asChild` for
  button-shaped routes rather than inventing a Link-button variant. Current and
  visited states, unavailable destinations, product navigation, tabs,
  breadcrumbs, analytics policy, and production adoption remain separate.
  Accepted in the subsequent human review:

- `Accordion` is now an accepted, unadopted baseline for coordinated
  informational FAQ/product-detail sets. It retains Radix single/multiple
  behavior, keyboard navigation, long labels, disabled state, a stable 16px
  row/content axis, 48px minimum triggers, an 8px expanded title/body
  relationship, a 20px body-to-next-title rhythm, and 14px/20px supporting
  content. Callers explicitly choose the behavior: multiple is the ordinary
  informational recommendation, while single is reserved for mutually
  substitutive or unusually long regions. Its V1-specific height animation
  uses the accepted 180ms ordinary-component duration without changing the
  legacy 200ms production animation or any consumer.
- `Collapsible` is now an accepted, unadopted baseline for one independently
  controlled disclosure. It consumes the Accordion presentation and 180ms
  motion without inheriting set semantics. Clear caller-owned subject copy is
  required; the optional closed/open cue stays muted at rest, becomes primary
  on hover/focus, and hides below the small breakpoint. Hosted content,
  bespoke triggers, native `details`, and production adoption remain outside.

System Learning: button-shaped navigation exposed a semantics-only gap in the
accepted Button implementation. `asChild` now transfers the unchanged Button
presentation to a real anchor instead of nesting navigation inside an
operation. This adds no tone, size, or visual default. Unavailable/loading
`asChild` controls are defensively removed from sequential focus and suppress
activation, while the Link contract still forbids representing an unavailable
destination as an anchor.

Current Review:

### Navigation audit remediation contract — 2026-08-25

## Goal

Make the coordinated Global and Product navigation candidate truthful and
review-ready by fixing the verified behavior, responsive-fit, semantic,
ownership, and source-of-truth failures without changing the accepted visual
direction or adopting the candidate in production.

## Current state

The lab renders a strong visual direction, but its mobile Product drawers are
locally recreated modal surfaces without canonical focus/dismissal behavior,
the mobile Global menu drops focus when opened, the desktop header permits
wrapped route labels at supported widths, the More popup has no bounded-height
overflow strategy, and active guidance still describes removed or superseded
states.

## Non-goals

- No production navigation migration, live route wiring, analytics, DTF
  sourcing/ranking, account-menu redesign, or personalized activity logic.
- No broad component registry, dependency graph, or general Drawer redesign.
- No promotion of navigation-specific 40/36px rail geometry, outlined 48px
  drawer rows, 82x48px mobile identity, or 6px optical spacing into general
  component authority.

## Acceptance evidence

- Focused component tests prove mobile Product drawers use the canonical Drawer
  contract, Escape/outside dismissal and focus return work, mobile Global menu
  receives and returns focus, language alternatives meet the 44px touch target,
  supplementary address actions sit outside the navigation landmark, and
  drawer rows retain their geometry without depending on optional icons.
- Browser inspection proves desktop route labels remain single-line with a
  deliberate overflow transition, More remains usable under constrained
  height, and mobile Global/Product navigation works in light and dark themes.
- Scoped lint, typecheck, focused tests, route browser checks, wiki lint, and
  diff checks are green after the final edit.
- Current Review, catalog, plan, wiki, and progress claims match the rendered
  candidate and preserve candidate/unadopted status.

## Test seams

Use the public V1 navigation components for structure and semantics, focused
Testing Library interaction tests for focus/dismissal, and the routed design-
system lab for responsive and visual behavior. Production navigation remains
evidence only.

## Slices

- Slice: canonical mobile overlay and focus behavior; blocked by: none.
- Slice: desktop fit, popup overflow, touch, and landmark semantics; blocked by:
  canonical overlay behavior.
- Slice: simplify shared destination/copy ownership and reconcile authority;
  blocked by: resulting component contracts.
- Slice: final scoped and routed verification; blocked by: all implementation
  slices.

## Unresolved decisions

None block remediation. Navigation-specific geometry remains deliberately local
until realistic product adoption pressure-tests it.

## Outcome

Remediation is complete and human review accepted Global and Product
navigation as separate current baselines. Mobile Product navigation
now consumes the canonical Drawer contract with contained-bottom placement,
focus entry/return, Escape and outside dismissal; mobile Global navigation
owns equivalent focus entry/return without pretending its inline utility panel
is a modal. Desktop Global navigation has an explicit non-wrapping 1200px host
boundary and a bounded, scrollable More surface. Navigation landmarks contain
destinations only, supplementary token-address actions remain outside them,
drawer rows retain 48px geometry without depending on optional content, and
caller-owned labels replace hidden English defaults. Lab fixtures are isolated
from reusable owners. The coordinated result remains unadopted; production
wiring, inventory unification, and
navigation-specific geometry promotion remain separate work.

- Current Review is empty. Human review accepted Global navigation and Index
  DTF Product navigation after rendering them together in one realistic
  application shell. They remain separate reusable current baselines and
  sources of truth. The accepted result uses current Index DTF and
  application-header evidence plus
  accepted Link, Button, IconButton, Menu, identity, popup, and foundation
  baselines. It covers the non-wrapping 1200px-and-wider desktop header,
  bounded anchored grouped overflow, collapsed and hover/focus-expanded
  product rail, current/public-activity states, and
  separate constrained-screen global and DTF-page menus. The product identity
  mark and route icons share one 40px rail axis in both collapsed and expanded
  states instead of relying on the intrinsic logo box; the constrained menu
  keeps its own 24px content-led identity slot. The lab exposes the real
  lower-level global route, shared global destination row, product identity,
  and product route owners above the complete compositions. Top-level global
  destinations use meaningful 16px icons plus labels and a quiet selected
  surface rather than an underline. Adjacent top-level destinations retain a
  2px sibling gap so neighboring hover and selected pills never visually merge.
  The coordinated lab also renders the application home state, where the same
  global owner has no current destination instead of inventing a selected
  fallback. More and constrained global navigation use one single-line
  destination-row owner. Constrained navigation shares the outlined 48px
  drawer recipe with DTF page navigation, while desktop More retains the same
  outlined pill treatment and icon-label-trailing anatomy at the established
  40px popup density. Both surfaces carry the complete current navigation
  inventory: four primary destinations, three internal tool destinations, and
  five external resource destinations. Mobile
  group headings replace repetitive per-row subtitles. Internal destinations
  end in a chevron and external destinations replace it with the external-link
  indicator. The common desktop application-control cluster is also in
  scope: Search, theme, language, and Account/Connect. The conditional
  contact-team bell is not misrepresented as a permanent Notifications action.
  Deterministic disconnected and connected-account fixtures expose the account
  width and hierarchy without requiring a live wallet session; the connected
  fixture retains the current chain-mark-plus-short-address information model.
  The current comparison groups these actions in one 40px rounded toolbar
  shell. Its outlined 32px compact controls use 4px on both wrapper axes and a
  matching 4px sibling gap, aligning the cluster silhouette with the 40px
  global-route surfaces without creating a new Button size.
  Within that cluster, the disconnected Connect gateway uses the accepted
  primary action tone; once connected, the chain-and-address account control
  returns to secondary outline treatment because it acts as identity/menu
  access rather than the cluster's acquisition action.
  The closed mobile application-header candidate is now a reusable 56px shell
  rather than a locally styled specimen. It retains the existing grouped
  Search/Theme/Language decision, but the trigger, Connect/account control, and
  global-menu trigger consume canonical Button/IconButton owners. The utility
  surface is a header-owned composite disclosure rather than an action Menu: a truthful
  SearchField-family launcher opens the existing search dialog, default
  contained Segmented Control owns theme, and a 44px disclosure row expands
  only the alternative language choices inline. The summary and alternatives
  form one connected outlined control, so the selected value is not repeated.
  Selection collapses that list, and the utility surface grows in place instead
  of opening a second popup. The panel shares the header's `card` surface in
  both themes; containment alone does not authorize a structural `secondary`
  or separate `popover` background. The three resting
  controls share the accepted 44px scale. On mobile the
  surface spans the full header width and begins directly at the 56px header
  boundary. That produces viewport width in product use and the truthful
  simulated-phone width in the lab without trigger-relative offsets.
  Human review rejected the initial transfer of
  44px ordinary mobile form/action geometry into this dense navigation context;
  all visible header controls instead use the canonical 32px compact size, with
  a 4px relationship between peers. Disconnected, chain-and-address connected,
  transparent landing-surface, 360px square-mark, and 320px lower-bound
  fixtures are rendered together. The grouped utility trigger uses the existing
  14px micro glyph scale with a 4px internal gap; retaining three 16px glyphs
  inside the compact control made the icons read as a cramped block. The
  connected account retains its chain mark and shortened address across those
  widths. Desktop and constrained account controls share the existing 14px
  micro mark and 4px relationship gap; constrained headers shorten only the
  visible address to `0x71…2A6C`, while the accessible account identity remains
  `0x71F9…2A6C`. The brand keeps the full Reserve wordmark when the header content box
  has room, then switches to the existing square mark before the wordmark would
  compress or lose its gap to the controls. The panel contains one search
  launcher, both theme choices, and access to all four production languages; search closes
  the panel before handing focus to its dialog. Closing the utility surface also
  resets the inline language disclosure. It does not copy the legacy
  duplicate Search row or raw shadow. Opened global-menu
  redesign, account-menu behavior, production state wiring, analytics, and
  production adoption remain outside this closed-header review.
  Product rail routes retain a stable 40px target and icon axis.
  The collapsed state uses one 40px circle; expansion reveals a 40px outer pill
  and contracts the inner icon circle to 36px with the same accepted 2px inset
  relationship as contained selection. A 6px structural gap plus the circle's
  2px inset produces the intended 8px optical circle-to-label relationship, and
  the persistent rail fills its containing page region rather than ending at
  its final route. The constrained Product menu reuses the same selected,
  hover, focus, icon, and 14px/500 label language, while retaining an explicit
  mobile-appropriate 48px full-width route independent of optional icon
  content. It uses one fully rounded state surface, a 4px sibling gap, symmetric
  8px outer inset, a 24px alignment slot
  containing the 16px glyph, and the accepted 8px slot-to-label relationship.
  Product Navigation owns a one-line identity trigger rather than transferring
  the shared two-line asset-row `EntityIdentity` anatomy. It consumes the
  canonical logo and label roles while keeping chain context in the expanded or
  constrained badged mark and navigation region label. Its constrained 24px mark slot and
  route-icon slot share one centerline, while the DTF name and route labels
  start on the same axis. The desktop rail retains its separate fixed 40px
  alignment slot and uses the same 6px structural gap as its route rows. The
  trigger places a plain 24px token logo inside an outlined 40px clickable
  container when collapsed, without a separate switch cue or chain badge. That
  clickable region keeps its outline through expansion, changing from the 40px
  collapsed circle to the complete identity pill. The expanded rail restores
  the badged logo and moves the ordinary chevron to the
  far edge when labels are visible; constrained navigation keeps its 20px
  badged logo. The 16px chevron is
  centered in an invisible 24px trailing slot so it gains optical inset without
  implying a second control. The rail-only nested route-icon circle remains
  deliberately absent from the menu because the menu never collapses.
  It does not alter production
  navigation, invent route
  hierarchy, use legacy Yield DTF presentation as authority, or allow either
  accepted baseline to become authority for the other. Production adoption
  remains separate.

  The DTF identity row is an accepted, unadopted interaction: activation pins the
  desktop rail open, replaces page routes with DTF rows using the same alignment
  and state language, and restores page navigation after selection. Because the
  identity trigger already owns current context, the switcher list excludes the
  current DTF and presents alternatives only. The desktop list keeps its 16px
  resting gap below the identity divider as scroll-content padding, making the
  divider itself the clipping boundary instead of leaving a static blank strip
  where rows disappear. Pointer or keyboard focus leaving the desktop rail
  dismisses switching as well as expansion, restoring the current DTF's default
  page navigation instead of leaving the alternative-DTF list pinned open.
  Mobile does not copy that
  in-place identity row: its detached 82 × 48px pill uses an unbadged 32px DTF
  token logo and a separate 32px ghost switch cue. The shell retains the
  adjacent mobile action cluster's 8px outer inset, while the two related units
  use the established 2px contained-control gap. The 16px switch glyph is
  centered in that control. Hover/focus/open feedback belongs to the ghost cue
  while the floating pill surface remains stable; press reuses the accepted
  centered 0.98 button transform.
  The trigger opens DTF switching directly, while a separate
  48px right-hand floating cluster owns page navigation and contextual actions.
  Both open one full-width bottom-drawer presentation: the long switcher grows
  to the shell's maximum height and scrolls, while the shorter page list remains
  content-led. Both consume the canonical Drawer header's equal 24px top/right
  action axis. The visible gap from header controls to the first row also
  resolves to 24px, while navigation row content aligns to that same 24px axis
  rather than recreating drawer padding locally. Drawer headers use the existing
  16px/500/24px item-title role and a compact secondary close control. Drawer
  rows place their 16px trailing chevron inside a 24px slot matching the leading
  icon wrapper. A shared 12px gap follows that leading slot in both the DTF
  switcher and page-navigation drawers, giving full-slot identity marks and
  inset glyphs one stable relationship to their labels; popup rows retain their
  bare 16px treatment. The current
  human-review experiment moves the drawer row shape to the canonical 8px shell
  edge, uses 16px horizontal/12px vertical padding, gives each row a visible
  default outline, and separates siblings by 4px. The active row reuses the
  established `primary/30` selected-pill outline. The content axis stays 24px
  and row height returns to 48px. Supplementary content begins after a 16px
  section gap rather than the 8px sibling-row gap. The drawer shell alone owns
  the final 8px bottom inset, matching the 8px horizontal row-shape inset
  without duplicated supplementary padding. Drawer presentation omits the
  popup recipe's identity and supplementary divider lines. The DTF page drawer does not
  demote token contracts to quiet footer text or introduce a nested card.
  A single-chain DTF uses one non-navigation row with the same fully rounded
  drawer-row recipe; its badged DTF mark and “DTF on Chain” copy establish the
  token as the address owner. A multi-chain DTF adds one wrapping “{ticker}
  token addresses” group label, then uses chain-led rows with a 16px chain mark
  centered in the shared 24px leading slot and inline muted Native/Bridged
  roles. This avoids repeating a potentially long ticker while
  keeping each shortened contract and accepted `CopyableValue` action attached
  to its chain. Copy actions always write the full captured contract address.
  This is not yet an
  accepted replacement for the balanced 12px popup-row recipe.
  Its 8px wrapper inset and sibling gap
  keep the two floating surfaces aligned without making global and product
  navigation one component. A separate phone specimen shows the 56px top
  application bar and its global-menu trigger. The rail pins its identity while the remaining
  height scrolls to the bottom edge of the navigation surface; the constrained
  menu bounds its item viewport at 288px. Switcher mode uses a 32px bottom fade
  in the owning surface color plus equal scroll-end padding, so overflow is
  legible while the final row can still clear the fade completely. A 16-item
  fixture set sourced from the captured Discover snapshot tests density, logos,
  chain badges, and overflow only; it does not authorize a production list or
  ranking. The real list source, search
  threshold, current-subroute preservation/fallback policy, analytics, and
  production integration remain unresolved. These mobile compositions are
  lab-only proposals; the current production logo-to-overview link and floating
  page-menu trigger are evidence, not adoption authority.

  The current review also pressure-tests compact public metadata without making
  navigation depend on governance, auction, wallet, or market domain models.
  Destinations accept a generic indicator descriptor and optional trailing
  metadata. A small `NavigationIndicator` candidate distinguishes an active
  public phase with the semantic information role from a notable or
  time-sensitive public phase with the semantic warning role. It deliberately
  omits counts and user-personalized states: current evidence supports at most
  one relevant auction and the candidate is communicating what is happening in
  the destination, not what a connected account must do. The detached mobile
  page-navigation trigger does not aggregate public activity; indicators appear
  only on the specific destination rows after the drawer opens. Collapsed rail
  placements use the compact 4px dot inside an 8px slot so the signal remains
  peripheral. In the collapsed rail, that 8px slot starts at 32px and
  ends at the 40px row edge, sitting on the icon's horizontal centerline rather
  than floating at the top like a notification badge or clipping outside the
  rail. Expanded destination rows retain the default 6px dot in a 16px slot
  where its meaning has more room to resolve.

  Alternative-DTF rows use the same generic trailing seam for a compact
  `PerformanceValue`. The fixture period is explicitly the Discover table's
  default Last 30 Days, while the row shows only the signed percentage and
  exposes the period accessibly. It reuses accepted positive/negative financial
  colors, tabular numerals, a true minus sign, and an unavailable-data state.
  Performance replaces the ordinary destination chevron in switcher mode so
  the trailing edge has one job. The expanded rail uses the accepted 256px
  layout width so realistic tickers and values retain distinct columns without
  crowding; that width remains stable between page routes and switcher mode.
  These additions are unadopted review candidates and
  do not authorize live market sourcing, personalized governance logic, or
  production migration.

Deferred spacing-exception reconciliation (non-blocking for the current
navigation review): recheck prior accepted/provisional optical corrections that
use off-grid edge values—especially Button icon-side inset pairs and compact or
default Select/Menu trigger leading/trailing pairs. Determine whether each can
converge on the accepted spacing scale or one shared icon-aware inset recipe.
Existing recipes remain current until reviewed, but they are not precedent for
new component-specific relationship gaps. Do not turn this follow-up into a
broad spacing audit during an unrelated component review.

- Human review accepted the Color calibration as a
  working baseline: feedback foregrounds retain 65% semantic hue and mix 35%
  theme foreground; the destructive action ramp uses 88% / 80% / 72% of the
  destructive hue mixed with black; and the light supporting role moves 8%
  toward ordinary foreground while dark retains its existing supporting value.
  Components consume the same semantic aliases in both themes. The recorded
  comparison remains in the lab, but this does not authorize production
  migration, performance-color retuning, overlays, brand/accent redesign, or
  component-level dark-theme overrides.

- Human review accepted the Radius role taxonomy, so it no longer blocks
  subsequent work: structural surfaces, contained objects, atomic controls,
  and separately layout-owned structural reveals. The current 0 / 8 / full
  mapping is a working baseline rather than an irreversible value commitment.
  Complex screens may justify tuning the first two values while preserving the
  semantic categories. The earlier 16px substrate-reveal idea remains
  unapproved until a real composition provides evidence and clarifies whether
  its owner is a layout, Card, or another specific component.

System Learning: the desired theme invariant is architectural, not a demand
for identical raw values. A component should consume one semantic alias in
both themes; `:root` and `.dark`, or a theme-responsive derived token, own the
different values. Existing `dark:` color utilities in product code are
migration evidence, not precedent for V1 component contracts. Accessibility
corrections should first tune the semantic foreground at its reusable owner
while preserving quiet surfaces and hierarchy rather than adding fill, border,
or neutral text weight indiscriminately.

The popup-row transfer pressure test found no unresolved shared-rule judgment:
Select and Menu both render 40px rows from the shared 12px inset and 16px line
box; MultiSelectFilter intentionally reaches 44px because its 20px identity and
Checkbox marks own content height. The shared source remains provisional and
does not enter Current Review.

Accordion's former 180ms motion mismatch is resolved through a V1-specific
animation without modifying the legacy 200ms production class. Human review
accepted the result and its single/multiple usage guidance.

Prepared next — Yellow only:

- `Inline Message` retains its source audit, reusable implementation, and tone
  grid as evidence preparation only. Before returning to Current Review, show
  source-grounded content immediately before and after representative messages
  inside a real task composition. If the surrounding transaction, form, or
  policy composition is not yet ready, defer the message with it rather than
  inventing framing. Toast and Progress do not advance ahead of this boundary
  merely because they are adjacent feedback components.

- Drawer-to-Dialog source matrix:

  | Flow                              | Preserve                                                                                                                                | Responsive Dialog pressure test                                                                                        | Boundary                                                                 |
  | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
  | Stake / unstake                   | tab state, amount and balance context, delayed-unstake detail, delegate/checkbox adjuncts, error and transaction footer, reset-on-close | centered desktop task shell; bottom-attached phone; ordinary 24px axes around dense amount content                     | migration candidate; no Drawer exception established                     |
  | Vote lock / unlock / delegate     | three-mode tabs, governance context, refresh/reset behavior, scroll ownership, transaction footer                                       | centered desktop task shell; bottom-attached phone; preserve mode and lifecycle before geometry                        | migration candidate; no Drawer exception established                     |
  | Shared and deploy token selectors | search, all/selected tabs, chain identity, list loading/empty states, multi-select draft, submit footer, close resets                   | centered desktop selection Dialog with bounded scroll; phone sheet; keep list density inside the shell-owned 24px axis | one selector composition, not Drawer authority                           |
  | Confirm deploy                    | simple/manual modes, guarded trigger, long scroll, pointer containment, success replacement, deploy lifecycle                           | wider centered desktop task Dialog; bottom-attached phone; success remains the same Dialog lifecycle                   | migration candidate; transaction behavior requires later engineer review |
  | Package-owned Zapper input/output | one-instance route state, quote/input/output geometry, success state, package focus and transaction behavior                            | retain its evidenced compact centered modal and 8px dense structural edge; do not route through local Drawer           | upstream/package boundary; not a Drawer migration                        |
  | Mobile navigation                 | full-screen navigation regions, header continuity, route dismissal                                                                      | do not convert to a task Dialog                                                                                        | navigation production migration is Red and excluded                      |

  The matrix authorizes no production migration. A desktop Drawer exception can
  reopen only after a named flow demonstrates meaningful context or usability
  loss in its Dialog pressure test.

Blocked or skipped: production adoption and migration, route navigation, mobile
popup substitution, async Switch recovery, Table/DataRow, accepted feedback-token migration,
transaction lifecycle, AmountField, AssetPicker, dense-table transformation,
Auction/Governance restructuring, navigation production migration, shared defaults, Card
extraction, commits, and pushes.

### Transaction-system map complete; truth-spectrum review active

The source-grounded map now lives in
`docs/plans/transaction-system-audit.md`. It reconciles the existing
modal-family, Zapper, Drawer-to-Dialog, layout, action, and component evidence
without choosing one flow as the model. The first recommended visual artifact
is now the sole Current Review item: a deterministic action-to-outcome truth
spectrum spanning atomic, RFQ/order, transparent staged, and delayed
settlement. It remains a bounded presentation review, not production migration.

The comparison covers the common Index instant Zapper, vote-lock/unlock/
delegate, relevant Yield DTF Zapper and stake/unstake evidence, manual mint/
redeem, and automated mint/redeem. Confirm Deploy and token selection enter
only where they expose a lifecycle, selector, or outcome requirement missing
from those primary families. Imported Zapper structure remains package-owned;
Yield DTF presentation is coverage evidence rather than visual authority; and
automated mint is a complexity stress test rather than the default model. Index
DTF Zapper and automated mint are the primary anchors because they have the
highest current product importance and the strongest recent functional or
design attention. That makes them high-value evidence, not presumed-correct
authority: current omissions, confusing transitions, weak recovery, and
under-specified outcomes remain findings to resolve.

The correction-heavy human review that followed is diagnosed in
`docs/plans/transaction-review-feedback-postmortem.md`. That report is not
authority; it distinguishes existing-rule violations, missing composition
rules, product-evidence dependencies, and legitimate design judgment so future
transaction work does not turn every correction into a new variant.

For each flow, record:

- entry point and shell across page, centered Dialog, current Drawer, and phone
  bottom-sheet presentations;
- amount/input/output, asset identity and selection, balance/Max, quote, fee,
  route, slippage, and supporting-detail requirements;
- validation, compliance, wallet, network, allowance/approval, signing,
  submitted, confirming, multi-step, success, recoverable failure, retry, and
  dismissal/reset behavior;
- duration and execution visibility as separate dimensions: near-instant,
  opaque asynchronous waiting, transparent staged execution, and delayed or
  later-claimable settlement. Verify whether each source exposes real progress,
  elapsed/estimated time, only a truthful waiting message, or named internal
  steps; never manufacture progress detail to make unlike flows look alike;
- a step-by-step truth gap: the user goal and decision at that step, the real
  protocol/package/application state available, what the current UI shows, what
  a user needs for comprehension, confidence, recovery, or follow-up, and what
  is missing or unnecessarily exposed. Current copy and information density are
  evidence to evaluate, not requirements to preserve;
- which accepted primitives already apply, which open contracts are genuinely
  shared, and which behavior must remain flow-owned.

The output is a flow-by-stage matrix, a shared-layer ownership map, responsive
shell criteria, and a prioritized review sequence using realistic states. It
must not invent a universal `TransactionFlow` component, preserve accidental
legacy variation, restyle package internals from Register, or promote Amount
Field, Asset Picker, Transaction Action, Inline Message, Progress/Stepper, or an
outcome composition before multiple real flows support the seam.

Outcome review works backward from the actual result rather than copying the
current success screen. For every terminal or resumable state, identify what
changed, which assets, amounts, positions, or permissions resulted, final
versus quoted values where knowable, chain and transaction identity, remaining
or later-claimable work, useful next actions, and recovery or support context.
Show only information that is reliable and useful, but treat currently missing
result information as a design-system gap rather than proof it is unnecessary.

Family resemblance should come from shared shell hierarchy, spacing and type
roles, input/output anatomy where applicable, state vocabulary, anchored-action
behavior, transaction-detail presentation, feedback and recovery hierarchy,
and outcome composition. It must not require the same quantity of information,
the same progress visualization, or the same success layout. An opaque Zapper
wait may use package-owned messaging, timing, and animation while a transparent
automated-mint process names justified internal stages; instant flows should not
gain ceremonial progress UI merely to match either one.

Home feature-card extraction and the Home golden screen remain ready follow-up
work, not prerequisites for this transaction stage. Overview can preserve its
current chart composition; its meaningful remaining prerequisite is bounded
Table/DataRow work rather than a generic Chart contract.

The active board now treats the complete audit registry as the inventory rather
than limiting itself to the first outcome-language artifact. It consumes
accepted Dialog, Field, Entity Identity, Button, Action Group, Lifecycle Status,
Copyable Value, Link, typography, spacing, color, and radius baselines, and uses
Inline Message only as a declared provisional recovery treatment inside
realistic context. Four stateful compositions preserve the product shape each
family actually needs: manual mint remains a focused page with basket
requirements; RFQ remains a compact package-owned reference; automated mint
expands from amount/quote work into a paired order workspace; delayed settlement
crosses from initiation Dialog to durable account state. Secondary vote-unlock
and local-selector pressure tests exercise the canonical task shell and the
missing local selection seam without pretending they are two more transaction
families.

The board proposes complete, orchestration-free presentation candidates for a
local Amount object, local asset-picker trigger/list/options, approval/
requirement row, and transaction identity block. Lifecycle vocabulary composes
the accepted status owner. Consequential outcomes remain independently composed
family evidence rather than one extracted summary component. It separately
labels input/output hierarchy, transparent stage lists, delayed settlement, and
selector Dialog structure as composition recipes or flow-owned work where the
audit requires that boundary.
Every composition exposes a credible review/action state plus execution,
consequential result, and source-backed recovery/follow-up through one review
control, so those phases can be judged without multiplying disconnected
specimens. A coverage map assigns the remaining important audit jobs to a
composition, an existing owner, an upstream/flow-owned seam, or explicit
deferral. No proposal is promoted by its appearance in the board.

The earlier faithful Zapper reconstruction at
`src/views/internal/design-system/zapper-modal-study.tsx` is now explicitly
routed as the strongest visual composition evidence for paired input/output
surfaces, financial hierarchy, density, asset and balance context, and focused
action treatment. The real host seam at
`src/views/index-dtf/components/zapper/zapper-wrapper.tsx` confirms the product
context and upstream boundary. Neither source is canonical V1 authority and
neither authorizes copying package-owned selectors, settings, quote mechanics,
or local provisional styling. The review board carries a visible predecessor
transfer contract: preserve or improve each successful quality, and record the
stronger evidence or product constraint whenever one is intentionally removed.

The board defines no universal transaction component or orchestration API and
does not resolve exact result sources, queue persistence, polling, receipt
decoding, guarded dismissal, or production behavior. Confirm Deploy result and
readiness remain excluded as visual authority behind their P0 correctness
findings. Human review should judge the coherent whole and then decide whether
any proposed seam deserves a reusable contract.

#### Baseline Context trace before knowledge-routing restructuring

- Actually needed: this active plan; the complete transaction-system audit;
  design-system authority and project safety guidance; accepted Button,
  Action Group, Dialog, Field, Entity Identity, Metric, Lifecycle Status,
  Search, Segmented Control, Empty State, Skeleton/Spinner, Copyable Value,
  Link, typography, semantic-role, and layout-recipe owners; the named Zapper
  visual predecessor and real package host seam; and only the manual issuance,
  automated mint, installed Zapper, vote-unlock, and unstake/withdraw sources
  already routed by the audit.
- Decision authority: accepted V1 foundations and component owners governed
  presentation and semantics; the audit governed required jobs, lifecycle
  truth, source priority, ownership, and deferral. The named Zapper study and
  real package host supply strong visual composition evidence without becoming
  canonical authority; other product sources supply behavioral or coverage
  evidence according to their audited role.
- Substantial irrelevant material: most of this plan's long chronological
  record, general project guidance outside UI safety, and full product-flow
  implementations beyond the exact audited seams. They were useful for
  precedence checks but expensive as primary task context.
- Duplicated, stale, or conflicting guidance: the prior plan still described a
  narrow 16-snapshot truth board after the scope widened; product flows disagree
  on shell, lifecycle words, outcome persistence, and transaction-versus-order
  identity. This section and the expanded contract supersede that narrow board
  description; the audit's ownership/lifecycle matrices resolve product
  precedence without treating variation as authority.
- Difficult to discover: no single consumable owner joined Amount anatomy,
  local selection, requirements, lifecycle presentation, identity, durable
  state, and outcomes into a review sequence. The audit registry was the only
  reliable index; the strongest earlier Zapper composition was mentioned only
  in prose without a direct path or evidence role. Exact package host callbacks
  and safe-dismissal behavior remained difficult to locate and stay deferred.
- Inferred or reconstructed: candidate prop seams and composition boundaries
  had to be reconstructed from repeated audited jobs because no reusable owner
  exists yet. Reliable final values, automated reconciliation, queue indices,
  and Confirm Deploy truth were not inferred; the board labels estimates,
  preserves flow/upstream ownership, and defers those claims.

### Expanded composition-first transaction review contract

#### Goal

Use the complete transaction-system audit as the requirements inventory and
rework Current Review into the smallest set of credible transaction
compositions that collectively pressure-test the shared system. Every visible
piece is either an accepted V1 baseline, a faithfully retained current or
upstream boundary, a complete review candidate, a flow-owned treatment, or an
explicitly deferred dependency.

#### Current state

The narrow truth-spectrum board has been superseded by a composition-first
transaction-system review. Four realistic family compositions, two bounded
pressure tests, six proposed presentation candidates, and one coverage map now
make Amount, selection, requirements, details, lifecycle, identity, recovery,
durable state, outcomes, and ownership intentional. The work remains
exploratory and unadopted pending human review.

#### Non-goals

- No production migration, transaction orchestration, package restyling,
  product-mechanics change, shared-default adoption, or new authority without
  human review.
- No universal `TransactionFlow`, fixed progress model, fabricated result
  source, or identical information volume across transaction families.
- Do not use Confirm Deploy outcomes or readiness as visual truth while its P0
  result-source and multi-asset readiness findings remain unresolved.

#### Acceptance evidence

- Current Review leads with realistic atomic/manual, package RFQ, transparent
  automated, and delayed-settlement compositions rather than isolated state
  specimens; task-shell and local-selector pressure tests appear where the
  audit requires them.
- A visible, path-backed predecessor transfer contract distinguishes strong
  visual composition evidence from canonical authority and requires a reason
  whenever a successful predecessor quality is intentionally removed.
- The compositions exercise input/output, identity, transaction details,
  prerequisites, action hierarchy, execution, recovery, consequential outcome,
  and later work in the amount appropriate to each family.
- A visible coverage map assigns every important audit registry job and
  lifecycle requirement to a composition, an accepted/current owner, or an
  explicit unresolved/deferred state.
- Every composition declares the authority status of its visible parts without
  turning lab proposals into current baseline by implication.
- Focused RTL tests pin the coverage and family distinctions; scoped lint,
  typecheck, the repository gate, desktop/phone light/dark inspection, wiki
  lint, and `git diff --check` are green after the final edit.

#### Test seams

- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx`
  is the stable composition/coverage seam: it asserts family-specific jobs,
  candidate ownership labels, and audited deferred boundaries rather than
  private component structure.
- The routed lab in the in-app browser owns responsive, theme, overflow,
  hierarchy, and whole-composition inspection.

#### Slices

- Slice: audit-to-composition coverage map and explicit status taxonomy;
  blocked by: none.
- Slice: atomic/manual composition exercising Amount, requirement/approval,
  action lifecycle, recovery, identity, and outcome candidates; blocked by:
  coverage map.
- Slice: package RFQ and transparent automated compositions preserving their
  different orchestration and information volumes; blocked by: none after the
  direct-source and predecessor evidence contracts are available.
- Slice: delayed settlement across initiation and durable multi-entry account
  state, plus responsive vote-lock/task and local-selector pressure tests;
  blocked by: none after the direct-source contract is available.
- Slice: whole-board self-review, coverage reconciliation, Context trace,
  verification, and human-review handoff; blocked by: all composition slices.

#### Unresolved decisions

- Exact receipt/RPC result sources, automated result reconciliation, package
  host callbacks, post-receipt synchronization, queue-index semantics, guarded
  dismissal, and Confirm Deploy P0 findings remain engineer-review questions.
- Human review must decide whether the proposed Amount object,
  requirement/approval row, transaction identity, and local asset-selection
  composition deserve reusable V1 contracts.
  Outcome similarity must first emerge independently across families; this
  stage may render complete compositions but cannot promote a shared layout.

### Transaction composition synthesis pass

The composition-first board now applies the strongest relevant accepted owners
and predecessor lessons as one product experience rather than as adjacent valid
parts. Review states lead with financial intent, recognizable asset identity,
balance/Max context, material quote or requirement detail, and one dominant
action. Once execution, recovery, or completion becomes the user's real task,
that state moves ahead of the preserved financial context instead of remaining
below the fold as an appended status specimen.

The local Amount candidate restores the predecessor's strongest relationship:
input and output remain a 4px composite with explicit direction, editable input
values carry the interactive primary emphasis, and fiat plus balance/Max
information share one 20px amount footer rather than competing with the label.
The bounded InlineAction gives terse Max/Use field accessories button semantics,
primary text, and a transparent 28px target without increasing that footer's
layout height. Submitted read-only amounts preserve geometry while moving to
the content surface and foreground text. Accepted Metric
anatomy now owns ordinary transaction facts. Requirement rows align comparable
financial values in columns, lifecycle steps use a quiet connected sequence
instead of a bordered administrative list, durable queues use open structured
rows, and consequential outcomes lead with the result rather than nesting it
inside a generic success card.

The visible predecessor contract now marks each major quality as preserved,
improved, or intentionally not transferred. Compact task focus and a dominant
action are preserved. Financial hierarchy, input/output truth, supporting-data
density, lifecycle language, recovery, and consequential outcomes are improved.
Package-owned control internals and one universal shell are intentionally not
transferred because the package boundary and audited family differences are
stronger product constraints. No accepted foundation or component owner was
changed by this synthesis; all transaction presentation seams remain
provisional and unadopted. The installed Zapper review-to-quote-search
transition now preserves shell geometry: selectors, Max, quote details, and
action remain mounted; temporarily unavailable controls disable in place; and
expanded uncertain quote values use equal-height skeleton rows. The animated
output is the only materially changing region.

Final review-panel reconciliation also keeps interaction truth aligned with
visual truth. Deterministic values render as non-interactive financial text
rather than invisible-focus read-only fields. RFQ and staged execution states
replace asset-selection and swap affordances with locked identity plus a
direction marker once work has started. Atomic execution names the permission
step without implying the final mint is already underway. The shared outcome
candidate is explicitly success-only until another consequential outcome has
enough evidence for a truthful visual contract.

### Transaction current-flow reconciliation

#### Goal

Re-ground every represented transaction composition in direct inspection of
the current product implementation. Preserve current mechanics and useful
structural relationships, apply accepted V1 presentation deliberately, and
separate evidenced consolidation or improvement from larger UX redesign.

#### Current state

The composition board expresses the audit's lifecycle distinctions and uses
accepted V1 owners, but its interaction structure was synthesized primarily
from the audit. Manual issuance, installed Index Zapper, automated mint, and
Yield unstake/withdraw now need a source-first comparison against the actual
render tree, state ownership, sequencing, and current outcome behavior.

#### Non-goals

- No production migration or transaction-behavior change.
- No redesign of package-owned Zapper internals.
- No attempt to force one shell, lifecycle, outcome, or amount pattern onto
  every flow.
- No silent adoption of larger UX redesign opportunities discovered during
  reconciliation.
- No accepted foundation or component-baseline changes solely to fit these
  compositions.

#### Acceptance evidence

- A source-grounded preserve / standardize visually / consolidate /
  deliberately improve / do-not-touch classification for each represented
  family.
- Every material structural difference between the lab and current product is
  either restored or carries a visible evidence-backed reason.
- The lab renders the smallest credible current-flow compositions in light and
  dark, including default plus execution/recovery/outcome states that materially
  differ.
- Focused transaction/catalog tests, app and E2E typecheck, lint, full unit
  suite, Dark/Light review, wiki lint, and diff check are green.

#### Test seams

- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx`
  owns visible flow structure, state transitions, ownership labels, and
  unsupported-invention regressions.
- `src/views/internal/design-system/tests/component-catalog.test.ts` owns the
  provisional catalog and Current Review routing.
- Current product E2E specifications are evidence for mechanics; lab work does
  not rewrite their production snapshots or behavior.

#### Slices

- Slice: direct source reconstruction for the four represented families;
  **complete**.
- Slice: explicit lab-versus-product structural reconciliation and
  classification; **complete**.
- Slice: conservative composition correction using accepted V1 presentation;
  **complete**.
- Slice: whole-board visual, review-panel, verification, and context-trace
  closeout; **complete**.

#### Unresolved decisions

- Which weak current outcomes can be improved inside the lab without implying
  unverified result sourcing or production behavior.
- Whether any currently proposed shared seam survives direct source comparison
  in at least two local flows; otherwise it remains a recipe or flow-owned.
- Larger interaction redesign opportunities stay separately flagged for human
  review and do not block conservative reconciliation.

#### Reconciliation decisions

- **Manual issuance:** preserve the editable share goal, Buy/Sell mode, one
  approval-to-mint action slot, persistent requirements, per-asset permission
  state, and the separate Zapper escape hatch. Remove the invented read-only
  review summary, action pair, global lifecycle timeline, and unrelated quote
  metrics. An in-context successful mint result remains visibly labeled as a
  deliberate improvement candidate because the current product only toasts and
  resets. Requirement headers now use a deterministic content/status grid
  rather than allowing approval progress to run into explanatory prose. Their
  narrow rows pair identity with status and required amount with balance,
  while desktop retains the four comparable columns.
- **Installed Index Zapper:** preserve one compact package-owned widget with
  Buy/Sell, paired input/output, selection, quote, approval or signature,
  waiting, expiry/refund handling, and package result. Remove locally invented
  order metadata and controls. The lab is a faithful boundary reference; only
  the Register host surface and cross-family lifecycle language are locally
  standardizable.
- **Automated mint:** preserve the narrow configure step, widening only after a
  quote exposes collateral orders, flow-owned per-order progress, completed-leg
  preservation, scoped retry, the separate final mint boundary, and the
  dedicated detailed outcome. Remove the prior one-workspace-for-every-state
  synthesis and do not reveal orders during configuration.
- **Delayed unstake:** preserve the staking input page, review/confirmation
  modal, and durable withdrawal queue as separate surfaces. Remove the invented
  combined lifecycle panel. Standardize the modal, amount pair, state language,
  and queue presentation while deferring queue-index, cancellation, and broader
  legacy Yield architecture changes. The durable queue is an open divided list
  aligned to its section title rather than a stack of separately boxed
  mini-cards.

Genuinely shared work is now limited to amount and entity presentation,
action-required versus waiting language, transaction/order identity,
contextual recovery hierarchy, and consequential outcome anatomy. Approval
orchestration, package economics, automated-order execution, queue ownership,
and shell transitions remain flow-owned.

#### Context-trace update

- Directly needed product sources were the manual issuance render tree and E2E
  flow, the installed Zapper host plus package README/type contract and Zapper
  E2E states, automated mint configure/quote/order/success sources and area
  guide, and Yield unstake modal plus withdraw-queue sources and E2E flow.
- Important design authority remained the accepted V1 foundation/component
  owners and canonical-first plan. Product sources authorized mechanics and
  relationships; the earlier Zapper study supplied strong noncanonical visual
  evidence; the transaction audit supplied cross-flow vocabulary and risks.
- The complete transaction audit and broad design-system plan contained much
  more family inventory and history than this four-flow correction needed.
  They were useful routers but insufficient substitutes for the render trees.
- The stale claim to reconcile was that the audit-derived composition itself
  represented current flow structure. Direct inspection showed the manual
  action slot, automated progressive shell, and delayed page/modal/queue
  boundaries had been flattened. No clear consumable owner summarized those
  relationships, so they had to be reconstructed from adjacent components,
  state atoms/context, and behavior tests.

### Transaction composition correction

#### Goal

Correct the composition-first transaction review so it is concise, visually
coherent, source-grounded, and genuinely reviewable. Preserve real transaction
mechanics while removing audit prose, invented controls, blanket dialog
geometry, and premature shared layout that weakened the product experience.

#### Current state

This pre-correction snapshot is superseded by the focused correction below.
The four-family board preserves more current-flow structure than its first
iteration, but several specimens still turn audit requirements into visible
explanation, apply the ordinary 24px Dialog content axis to dense amount flows,
and reuse an unproven left-icon outcome template. The Zapper reference also
reconstructs upstream-owned internals too freely, and automated configuration
shows a selector that the current flow does not own.

#### Non-goals

- No production migration or transaction-orchestration change.
- No package-owned Zapper redesign, production reimplementation of its
  internals, or promotion of the bounded visual reference as a Register V1
  component contract.
- No change to accepted foundation or component defaults merely to fit the
  transaction board.
- No attempt to render every transaction family, permutation, or engineering
  dependency.

#### Acceptance evidence

- Review/input states keep financial intent and one dominant action visually
  primary; explanatory copy appears only when it changes the decision.
- Dense amount pairs and their action use the accepted 8px shell edge while
  ordinary explanatory dialog content may retain the 24px content axis.
- Automated configuration retains its fixed current input token and presents
  future steps as one coherent staged surface.
- Delayed unstake states state cooldown timing once, keep current-state language
  above preserved context, and expose the durable queue without a permanent
  overlay.
- Outcomes preserve family-specific evidence and no longer derive similarity
  from one premature icon-left template.
- Coverage and catalog claims describe only what is visibly exercised or
  explicitly deferred.
- Focused tests, scoped lint/typecheck, desktop/phone light/dark inspection,
  wiki lint, and `git diff --check` are green.

#### Test seams

- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx`
  owns visible composition structure, prohibited inventions, concise copy, and
  truthful coverage claims.
- The routed lab owns density, hierarchy, overflow, theme, and complete-board
  visual inspection.

#### Slices

- Slice: concise review states and corrected dense-input geometry; blocked by:
  none.
- Slice: family-specific outcome compositions and delayed durable-state review;
  blocked by: concise review states.
- Slice: coverage/catalog reconciliation, whole-board review, verification, and
  documentation housekeeping; blocked by: both composition slices.

#### Unresolved decisions

- Exact production Zapper styling and package outcome internals remain
  upstream-owned.
- Production result sourcing, queue indices, guarded dismissal, and Confirm
  Deploy correctness remain engineer-review dependencies.
- Shared outcome code may be extracted only after independently composed
  families demonstrate stable repeated anatomy.

### Focused installed-Zapper composition correction

#### Goal

Make the ordinary quote-ready Zapper slice visually and semantically complete
enough to review before returning to the other transaction families.

#### Current state

The slice now defaults to its ordinary quote-ready state, preserves functional
Buy/Sell and close controls, aligns financial and asset evidence, exposes a
real bounded selector and quote-details state, and restores the installed
package's distinctive delayed quote-search treatment as an inspectable
upstream-owned state. Input and output assets now share the same prominent 20px
amount-context label, circular token mark, and canonical chain badge rather
than mixing picker and static-display treatments. Compact selector-list rows
retain their 14px label role. It also keeps order identity, expiry, exact outcome
value, and fixture-specific recovery visible. Dead alternate-operation controls
were removed only from other single-branch specimens where no alternate fixture
exists. Amount language now follows transaction truth rather than flow variety:
Zapper consistently uses `You use` plus `Estimated output` before completion,
an expired order clears its stale estimate, automated mint retains the same
estimate label until collateral execution makes the output final, delayed
unstake consistently says `Available to withdraw later` and names the immediate
review action `Start 14-day cooldown`, and outcome facts distinguish confirmed
values from pre-transaction estimates.

#### Non-goals

- No production Zapper or package change.
- No claim that the lab reconstruction owns package internals.
- No universal transaction component or redesign of quote/orchestration logic.
- No changes to accepted component or foundation defaults.

#### Acceptance evidence

- The default state is the complete ordinary quote-ready widget and is named
  as Zapper rather than as an RFQ order.
- Input/output values, asset identity, fiat context, balance/Max, quote source,
  minimum output, impact, and network estimate form one aligned composition.
- The asset trigger opens a bounded package-reference selector state rather
  than behaving as a dead button.
- Compact selector rows use 14px/16px primary and supporting roles for their
  forced-single-line metadata stack; the full
  asset-selection task uses the existing 16px/24px item-title role over
  14px/20px support. Both use 8px outer and symmetric 12px row insets. A quiet
  selected surface plus `aria-pressed` replaces the trailing checkmark and its
  blank alignment slot, and balance values retain the asset symbol.
- In-flight order execution keeps Buy/Sell, settings, and refresh mounted but
  disabled, preventing the stable header from implying that the pending order
  can change operation or quote configuration.
- Atomic confirmation and RFQ fill waiting retain the submitted amount pair and
  quote facts while using route-specific source and lifecycle language; no
  order identity or expiry is invented before the package exposes it.
- Lifecycle states, review-only variants, and optional outcome attachments are
  separate review groups rather than one ambiguous flat state strip.
- Filled, failed, expired, and native-refund states contain only evidence
  relevant to their fixture.
- Focused behavior tests and desktop/phone light/dark visual inspection are
  green.

#### Test seams

- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx`
  owns the visible Zapper state contract and interactive selector/details.
- The routed lab owns alignment, density, overflow, and theme inspection.

#### Slices

- Slice: correct the quote-ready composition and interactive supporting states;
  blocked by: none.
- Slice: recheck waiting, outcome, and expiry against the corrected quote
  anatomy; blocked by: quote-ready composition.
- Slice: focused verification and visual critique; blocked by: both slices.

#### Unresolved decisions

- Exact upstream package styling and production behavior stay package-owned.
- Atomic transaction and RFQ order execution remain different lifecycle
  branches even when they share the same quote-ready entry composition.

### Transaction sidecar pressure test

The installed-Zapper board now tests one neutral, lab-only sidecar shell across
two different lifecycle jobs instead of duplicating their geometry. The
existing outcome update and intro-call follow-ups compose the shell after the
main success transition. A separate review state composes the same shell with
the exact current production high-price-impact wording from
`large-mint-prompt-body.tsx`; it appears immediately because no outcome motion
precedes it. The historical CoW redirect/promo is not current product behavior
and was not recreated.

The shell owns responsive attachment, width, a semantic secondary-to-card
vertical gradient, 16px inset, header alignment, dismissal, depth, and a
360ms reveal. It stays below the modal on
constrained host widths and attaches to the right only when its actual host can
preserve the centered task plus a visible outer gutter; the main modal remains
anchored while the sidecar appears. This placement is container-driven rather
than viewport-driven, preventing the lab column from clipping desktop-class
layouts. The advisory uses the canonical 24px actionable-status pill with a
warning indicator and warning title foreground; the two outcome attachments use
the primary brand foreground for their titles while retaining the canonical
32px compact dismiss action. The shell intentionally has no structural border;
its 4px attachment gap, gradient, and depth own separation. Outcome content, advisory content,
visibility rules, and product triggers remain separately owned. Production
`LargeMintPrompt` is unchanged, so adopting the shared shell there remains a
deliberate later migration rather than an implication of this review specimen.
