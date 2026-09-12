# Discover browsing cells — bounded lab candidate

## Contract and boundary

Latest spacing touch-up: count-ended basket triggers use 16px trailing padding,
with the leading logo inset and 44px height unchanged. Three
[source-bound browser cases](design-system-table-family-evidence/discover-count-padding-2026-09-11/record.json)
and two focused unit tests pass; desktop and phone captures were inspected.
Logo-only triggers retain their prior padding. This does not change motion or
ordinary Button defaults.

Current refinement: 12px surface-colored overflow fades and stationary fitting
baskets. This is a low-risk local lab iteration, not a shared contract change.
Fade only edges with more content; decorations must not intercept input or
cover the keyboard focus outline. A synthetic Short basket preview exercises
one asset at 100%, without mutating the default source sample. Keep immediate
opening, 72px/second speed, 1.2-second acceleration and 44px trigger geometry.
The proposed hover delay and homepage consolidation are not part of this pass.

Refinement verified: [7 passing source-bound browser cases](design-system-table-family-evidence/discover-strip-edges-2026-09-11/record.json)
retain the manual-edge, fitting-basket, resizing, original speed/loop, touch and
trigger checks. Five focused unit tests, app/E2E types and scoped lint/format
pass. The initial regression failed on the missing fade. The resize test then
caught retained manual state during a quick reopen; the strip now resets on
close and never animates while closing. The touch test waits for native
`scrollend` before keyboard input instead of racing swipe inertia. Self-review
covered intent, state cleanup, decoration hit testing and unchanged defaults;
light desktop/dark phone captures were inspected. This local refinement has
no production, shared-token or analytics change. Visual acceptance remains
with the human; remote-logo fallbacks and physical-device limits still apply.

Current follow-up: restore the horizontal basket hover strip (2026-09-11).
Keep the verified 44px closed trigger and column geometry. Discover's measured
marquee is the motion authority: immediate opening, 72px/second, 1.2-second
quadratic velocity ramp (28.8px travelled at 1.2 seconds), continuous looping,
and restart on reopen. The homepage ticker instead uses an 18-second CSS loop;
do not blend the two or change either production implementation. Keep this
candidate local until reviewed. Add pointer-transit protection, pause while
reading the strip, keyboard/touch manual scrolling, Escape dismissal and
reduced-motion handling. Repeated visual sequences must not repeat accessible
content. Verify real elapsed motion, hover transit, looping, manual access and
phone/desktop themes; no production migration or new shared defaults.

The strip remains local to the lab; production ownership will be reconciled at
adoption rather than importing homepage internals or changing their behavior.
Both loop copies now include identical leading padding, avoiding the source's
8px first-copy-only seam discrepancy. Hover pauses retain their offset; click,
keyboard and touch pin a manually scrollable single sequence. Reduced motion
also uses one sequence. The invisible 8px pointer corridor bridges the existing
popup offset without adding an opening/closing timer. There is no expanded
vertical list, extra title bar, chevron or new product action.

Hover-strip status: implementation verified; human visual/motion review required.
[Current source-bound record](design-system-table-family-evidence/discover-hover-2026-09-11/record.json)
retains 11/11 browser cases, 40 captures and real animation-frame samples. The
1925px sequence cruised at 71.993px/second and completed its loop. The browser
suite checks hover transit, pause/restart, reduced-motion tap/swipe and keys,
responsive round-trip reopening, Escape return and outside-control focus.
The pre-edit hover regression failed because no popup appeared without a click.
Literal unit expectations pin 3.6px at 0.6 seconds and 28.8px at 1.2 seconds.
Final focused unit/catalog tests pass 52/52; app/E2E types, scoped lint/format,
wiki and relative links pass. This is the project-approved bounded lab checkpoint,
not a full-repository gate. A broad scope invocation hit the existing dependency
verification/install prompt and stopped; no install was approved or performed.

Dark/Light review found keyboard entry and stale responsive pin state; both
were fixed and the affected risk axis rechecked. Browser testing additionally
caught Radix suppressing focus return after hover-then-click pinning. Explicit
Escape/resize restoration now excludes genuine outside interaction, preserving
the next control's focus. New assertions exercise these real sequences rather
than forcing focus onto the strip. Inspected light desktop hover and dark phone
keyboard captures; logo fallbacks remain an evidence limitation. No physical
device or screen-reader session is claimed. Production and homepage code remain
unchanged; adoption and final design acceptance are not granted here.

Preceding follow-up: initial identity/trigger refinement (2026-09-11), medium
because a named opt-in TokenStackTrigger will live with the identity primitives.
Fixed point remains `adef9ee76`; unrelated dirty-tree work is retained. Give
ordinary wide-row tags one line, retain 24px artwork inside a balanced 44px
trigger, remove the chevron, align artwork to the Basket heading, and distinguish
row reveal from direct hover/focus. Existing Button and logo-stack defaults stay
unchanged. Browser geometry/hover checks plus existing Discover interaction tests
own proof. That pass left the rejected vertical panel unchanged; the current
hover-strip contract above supersedes its expanded-content treatment.

Initial follow-up status: implementation verified, human visual review required.
[Fresh source-bound evidence](design-system-table-family-evidence/discover-trigger-2026-09-11/record.json)
retains 9/9 passing browser cases and 37 captures. The pre-edit sizing regression
failed at 48px instead of 44px. The final browser run checks 24px artwork,
8px frame clearance on the leading/top/bottom edges, 1px resting border, absent
chevron, header/artwork alignment and ordinary subtext at one line at 1152px and
desktop. The 1151/1152 transition, phone/desktop themes, sorting, pressure states,
existing popup open/close and navigation also pass. Existing movement is not
changed or approved by these tests.

Live 3005 measurement confirms the CMC20 trigger shrank from approximately
168×48px to 121×44px, with 10px visible-artwork clearance on the leading/top/bottom
edges. Gallery, normal rows, row-hover and keyboard-focus captures were inspected
in light/dark; remote logo fallback limitations remain. The 46 focused unit/catalog
tests, app/E2E types, scoped lint/format, wiki/links and evidence hashes pass.
Independent Dark/Light review found no implementation blocker; their keyboard
oracle finding was confirmed/fixed by moving the pointer away and tabbing from
the row's name link. The catalog's canonical implementation-link ordering was
also corrected after its focused test caught the new secondary implementation
link in first position. Ordinary Button and stack defaults are unchanged.
Engineer review of the new opt-in
trigger is recorded in the V1 plan for project closeout, not required to review
this closed-trigger trial.

Fixed point: `adef9ee76`, branch `design-system-v1`. The inspected dirty tree is
prior authorized design-system work; no commit, production migration, shared
default change or token change is part of this slice. Profile: medium, one local
composition with independent review. State: human-review-required; implementation
and the bounded verification checkpoint are complete.

First harden the latest Holdings toolbar, metadata and divider corrections.
Then add a separate cell gallery and one Discover browsing-table anchor. The
reviewable increment is identity with classifications, inspectable held-token
baskets, and period-qualified performance with a compact trend. It is not the
whole Discover page, a universal Table API, or a chart-system acceptance.

## Source transfer and journeys

Direct owners: `src/views/home/components/discover-index-dtf/` (table, columns,
basket hover card and mobile substitution), `src/hooks/useIndexDTFList.ts`, and
`src/views/home/hooks/use-filtered-index-dtf.ts`. The source area guide is
`src/views/home/CLAUDE.md`; the frozen boundary is
`e2e/snapshots/shared/discover-dtfs.json`. The outside research remains a map,
not implementation authority.

| Job/state | Source behavior | Lab disposition and proof |
| --- | --- | --- |
| Compare DTFs | Name, ticker, chain, tags, basket, market cap, price, 30-day performance | Preserve all fields in a bounded sample, reusing current type and identity owners. Inspect wide and narrow captures. |
| Open a DTF | Native name link and pointer row navigation; modified click opens a new tab | Preserve destinations, native link keyboard/modifier behavior, and pointer row navigation. Basket actions must not navigate. |
| Inspect basket | Four held-token logos, overflow count, hover expansion and collateral marquee | Preserve the refined closed stack; restore a horizontal hover strip with Discover motion and manual keyboard/touch access. Never substitute underlying exposure. |
| Zero/missing | API normalization can conflate missing financial values with zero | Explicit local null/zero pressure data; no production hook changes. Missing percent/series never becomes a zero trend. |
| Inactive | Hidden normally, surfaced by search with an Inactive qualifier | Separate pressure preview only, not mixed into the ordinary active sample. |
| Narrow screen | Production substitutes feature cards | The [card follow-up](design-system-discover-mobile-cards.md) supersedes the stacked-row trial with a lab-local card composition consuming production chart/ticker behavior. Compact and full-chart previews preserve the same sampled fields; neither is production adoption. |
| Search, filters, pagination, featured content | Page-level controls and a 20-row pager | Outside this cell/composition slice. The bounded sample has no pretend pager; production behavior remains untouched and required before migration. |
| Loading and recovery | Placeholder rows replace data while fetching | Local loading preview and restore; no live API, wallet, transaction or error-recovery claim. |

## Usage, hierarchy and agent affordances

1. Compare name/classification, market cap and return, then inspect a basket
   without leaving the list. Name is primary; ticker/tags support recognition.
2. Open the basket by keyboard, read all held assets and weights, close with
   Escape and return to the trigger. A nearby row link remains a separate action.
3. At phone width, read a long name without sacrificing financial facts. Sort
   from a named control; do not leave desktop headers above stacked fields.

Controls outside the white composition are explicitly lab conditions, independent
of width. The catalog routes to this brief, local implementations and retained
proof. Local exploratory recipes are not new defaults an agent may silently
apply to product screens.

## Owners and geometry

- Existing DataTable owns sorting; no second sort state or universal wrapper.
- Same-destination identity links follow the [whole-row navigation treatment](design-system-table-family-first-slice.md#whole-row-navigation-treatment): neutral text on hover, retained native navigation/focus, and a separate basket affordance.
- EntityIdentity / ChainBadgedLogo own identity, including 32px mark and 12px gap.
- TokenLogoStack owns 24px grouped logos. The opt-in TokenStackTrigger owns the
  44px closed control: 28px framed marks with 8px frame clearance above/below
  and at the leading edge. Its 9px CSS leading inset accounts for the 1px
  control border and stack's existing -2px separator correction. Button
  defaults are untouched. Count-ended triggers now use 16px trailing padding
  (17px to the outer border), giving text more room than the round leading logo;
  logo-only triggers retain their existing 12px trailing padding. Popover supplies positioning/dismissal only; the local
  horizontal strip owns motion and accessible manual reading.
- PerformanceValue owns sign/color/announcement. The local sparkline uses the
  existing installed chart renderer, no new shared chart API.
- Table rows own 24px insets and a semantic substrate seam. Narrow Discover
  now uses the [card family's geometry](design-system-discover-mobile-cards.md);
  Portfolio/Holdings keep their independently reviewed row/divider treatments.
- Name 16px/500, ordinary values 16px/300, supporting labels 14px/300. No dense
  variant. Tags remain supporting text, not a cluster of colored badges.
  Separate tags with commas in rows and cards; reserve the middle dot for
  different metadata groups, such as the ticker followed by the tag list.
- Narrow cards keep the accepted 8px direct name/market relationship and 16px
  top-region/name gap. Classifications follow the market row; their full text
  wraps rather than removing financial facts. No dense type variant is added.
- Width is owned by the composition, including a 390px constrained preview.
  The local wide-table threshold is 1152px; 38/14/12/12/24% columns prioritize
  ordinary one-line identity subtext. Longer pressure content may wrap; phones
  retain all tags. Below the threshold, one card list replaces the table while
  the same DataTable instance retains sorting. An opt-in alternative renderer
  leaves existing consumers unchanged; its shared API requires engineer review
  before adoption.

## Proof and promotion

Before coding: source-backed browser captures plus fresh Holdings/Portfolio
regressions. New behavior: a failing browser test at the actual lab route, then
green basket keyboard/navigation/sort/pressure/overflow checks. Capture light
and dark at phone, desktop and the affected container bands. Inspect screenshots
at ordinary viewport height, not just geometry assertions. Unit-check finite
series, zero/missing and fixture derivation where that is the stable seam.

Visible pressure cases: long name + many tags, the largest basket, zero versus
unavailable metrics, flat/missing trend, inactive record. These are not held-out
independent experiments. Review rubric: complete information, clear hierarchy,
usable separate actions, no overflow, faithful data meaning, no shared-default
or production changes.

One candidate is sufficient: local, reversible cell composition. Rejected:
reproducing expanding hover-only logos over neighboring columns, and building
a complete new Discover page before the cells are reviewed. Human judgment is
still required for the new basket presentation, sparkline integration, row
rhythm and narrow projection. Earn and rich navigable records follow separately.

Analytics: these are internal fixture controls, not product adoption; no new
Mixpanel events are added. Adoption must separately reconcile the real page's
events, card substitution, search/filter/pagination and fetching boundaries.

Initial hardening: the eight affected Holdings/Portfolio browser cases passed
at 375/1400 in both themes. The new lab-route test failed before implementation
because the Discover sample table was absent, as intended. Source-capture
assertions were corrected for the existing marquee's repeated text and the
app's address-versus-cached-slug URL forms; neither required a product change.

Independent review: project-required Dark/Light read-only packets cover risk and
intent respectively; one implementation owner reconciles both. No concurrent
writes or candidate competition. Both independently confirmed frozen source
fidelity. Their copy finding is confirmed/fixed: retain the source `Collateral:`
heading; `Basket`, `Close` and `No data` come from existing source/control owners,
not invented product wording. Row identity is dynamic description. Catalog
routing and direct pointer/modifier navigation proof are closeout requirements.
Visual judgment still belongs to the human; internal review does not accept it.

The suspected long-sort-label pressure reproduced at 320px: its 246.125px
nonwrapping trigger exceeded the 240px inset content width. The local Discover
toolbar now uses the existing 44px icon-only SortMenu option; its accessible
field/direction and checked menu items remain available. No shared default
changed. The regression selects the full performance field, not just Name.

The initial overflow oracle counted InlineAction's deliberate 4px pseudo-element
hit-area extension as clipped text. It was corrected to inspect table cells,
headers, name content and scroll containers; the separate trigger-width test
still catches actual toolbar overflow. This was a test-oracle correction, not a
visual change made to satisfy a false failure.

## Completion boundary

Review at `/internal/design-system/components/table#discover-family-review`.
The existing 3005 preview was checked directly: three separate cell tiles,
independent preview conditions/width controls, and the five-column composition
are present. No production view or shared default was changed by this slice.

Verification retained from the initial implementation (the
[mobile-card follow-up](design-system-discover-mobile-cards.md) owns the current
narrow presentation and its fresh checks):

- [Source observations](design-system-table-family-evidence/discover-source-2026-09-10/record.json):
  2/2 browser cases, existing LCAP desktop table/hover and mobile card.
- [Discover candidate](design-system-table-family-evidence/discover-candidate-2026-09-10/record.json):
  6/6 cases, 31 captures; light 320, light/dark 390 and 1400, plus keyboard,
  pointer and modified-click navigation. The 1023/1024 container transition
  closes an open basket and preserves focus in the visible projection.
- [Earlier-family regression checkpoint](design-system-table-family-evidence/discover-predecessor-check-2026-09-10/record.json):
  15/15 cases, 22 selected captures. Holdings and Portfolio run at 320/375/1400
  in both themes; additional cases cover touch-pointer affordances and Retina
  chain-badge borders. Recent toolbar spacing and right-flush seams stay intact.
- The combined three-spec browser run passed 21/21 without retries or skips.
  All cases enforce public-source stability. The owned 3043 server stopped;
  the user's 3005 preview was not restarted or replaced.
- App/E2E types, scoped lint/format, and 62/62 tests across the Discover,
  Holdings, Portfolio, catalog and inventory seams passed. Wiki/link and
  retained-artifact hash checks also passed. This is the plan's coherent
  design-system checkpoint, not a full repository integration gate.

Inspected ordinary-height desktop, phone, dark, long-content, 1024px threshold,
constrained, loading, unavailable/zero, and opened-basket captures. The gallery
was also inspected on 3005. Source-capture logos and some candidate logos resolve
asynchronously or to fallbacks; these are layout/interaction records, not
brand-asset approval. Source hover capture includes its opening transition.
No physical device, screen-reader session, live-finance correctness, actual
wallet action or production mobile-card migration is claimed.

Dark/Light findings are reconciled; the bounded recheck found no remaining
important concern. Product-copy ownership, long-sort overflow and pointer
navigation evidence were resolved. Human review is still needed for the basket
horizontal hover strip, trend integration and row rhythm; narrow record hierarchy
has since been superseded by the separate mobile-card preview. Dense type,
universal row APIs, chart-system acceptance and rich-record review remain out of
scope. **Engineer review required before production adoption**, including the
existing shared opt-in seams; this lab checkpoint does not authorize migration.
