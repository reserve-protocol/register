# DeFi Yield table-family slice

Status: human-review-required; lab-only candidate, not production adoption.
Fixed point: `01a900cdf2589d455d04f78806d2ca8ff2b9122c`.

Current refinement contract (2026-09-11): constrained rows use a top-right
icon-only external pool action, with 12px chain and platform marks beside their
names under the pool name. Base/Rewards retain the full row width; APY help appears
once beside sorting. Desktop retains its text action, separate platform artwork
and original APY composition. Keep selected-sort emphasis, destinations, stack sizes and row
insets. Scope is a low, local lab composition
change, not shared defaults, production, data classification or manual labels.
Mounted column ownership and browser geometry/loading are the verification seams.

## Decision and evidence

The previous Earn scope explicitly prioritized governance and staking; its
independent-review handoff treated DeFi pools only as a contrast. The user now
requests the missing third family. Source owners: `views/earn/components/pools-table.tsx`,
`hooks/useEarnTableColumns.tsx`, `hooks/useRTokenPools.ts`, and the repository
`lib/meta/earn-pools.json`. Read actual source rendering before final composition.

## User usage and ownership

- Select DeFi Yield in the existing Earn family selector; compare pool assets,
  project, chain, APY, Base APY, Reward APY and TVL. Initial APY descending;
  new desktop numeric headers begin descending and text headers ascending.
  The menu at both widths preserves its independent direction when changing fields,
  following the reviewed sorting control used by the other lab families.
- Follow the pool's existing external destination or its separate DefiLlama
  analytics link by pointer or keyboard. The row itself is not a drawer trigger.
- Narrow to phone width without losing rate breakdown, project/chain or sort;
  inspect loading, zero/unavailable, long content and empty recovery.

One local DeFi composition uses existing DataTable, sorting, link, logo stack,
metric, skeleton and tooltip owners. Do not add a fake governance field or wallet
position. The wallet switch/loading option are unavailable for DeFi; switching
back preserves the prior governance/staking wallet preference. A new DeFi local
row shape does not unify product APIs. No pool fetches, on-chain actions, new
analytics events or production changes in the lab.

The default fixture includes five rows. The added Curve TriRSR specimen uses the
source-verified ETH+ / eUSD / RSR identity and CMS destination (pool
`28c0ad15-ecaf-4b14-8ad6-06ded47566b1`); its rates/TVL remain illustrative.
The remaining examples are Beefy eUSD/USDC, Uniswap RSR/WETH, Yearn ETH+ETH-f,
and Convex ETH+/WETH. The three replacements preserve public-feed identities and
existing CMS destinations; figures remain illustrative. Yearn's source label is
an LP-token symbol, so fixture artwork uses pinned underlying-address identities
rather than parsing pool labels. No live adapter or token-logo defaults change.
Both two- and three-token stacks stay horizontal
at 32px per logo and occupy 52px, with matching loading placeholders. The existing
overlap API uses 2 for two tokens and 11 for three: 36px frames advance by 18px
or 9px respectively, including the shared -2px leading separator compensation.
The user prioritizes the two-token composition and accepts denser three-token overlap.
This is a local pool-identity trial, not a new shared stack default.

## Composition and constraints

The user-authorized trial presents four desktop data columns: Pool,
Platform (project), APY (total with visible base/reward
breakdown), and TVL, followed by a compact “View pool” action at the right edge.
The pool identity is plain text, not another link. Narrow records place identity
beside a fixed 32px external-link action with a 16px gap. The supporting line has
12px chain and platform marks, each 4px from its name, separated by a dot.
Pool names and supporting metadata can wrap into the remaining width.
The APY and TVL facts share a two-column grid with 4px label/value gaps. Base and
Rewards follow across the full row, wrapping between the two intact values if
necessary. Major groups retain 16px spacing and rows retain their 24px insets.
The phone action is anchored to the header's top/right edges; the separate footer
action is removed. Its 32px square visual has a 44px square pointer target, a
platform-specific accessible label, and a naming tooltip. It uses the canonical
Button/asChild with compact square geometry to preserve native link behavior;
the IconButton wrapper does not expose anchor children. No shared API changes or
logo-plus-arrow button variant are introduced.
Pool consumes EntityIdentity: 32px horizontal token stack, 12px mark/text gap, token names
above 20px-line supporting metadata; constrained metadata may wrap without truncation.
Platform consumes EntityIdentity: an uncropped 20px project mark centered
beside one body-role text line (16px/300), with the standard 8px mark/text gap and no chain badge. The original logo shapes
remain intact; circles in Beefy/Yearn belong to their source assets.
Total APY and its adjacent arrow now form one neutral contextual Link to
DefiLlama, with a 4px visual gap, a 24px line box and a downward-expanded 44px
pointer target over noninteractive supporting content, source-named tooltip and accessible
name including the visible rate. Hover/focus underlines without a filled background. The breakdown
contains only rates and shares the group's right edge on desktop; on phone it
starts on the APY axis and can use the full record width.
Selecting Base APY or Reward APY gives that supporting rate foreground emphasis
without a size, weight or placement change; other sorts restore both muted rates.
The total sort option is explicitly named “Total APY”.
One flex-centered APY help control retains all three source explanations: in
the desktop APY header or once in the constrained toolbar, never in each narrow
record. The toolbar preserves separate non-overlapping 44px help/sort touch areas.
The sort menu remains available at both widths with all
seven source fields; header sorting and missing/zero semantics are unchanged.
“Platform”, “Base”, “Rewards”, “View pool” and “View analytics on DefiLlama” are the specific wording
approved with this trial, not a wider product-copy change.
24px edge insets, ordinary 16px primary type, neutral dividers on narrow records.
DeFi paired-token artwork is 32px per logo after the latest size trial; the
12px logo-to-text gap and row padding remain unchanged.
The loading mark is 32px high as well. Hidden fixture labels reserve each identity's
actual wrapping geometry beneath placeholders, including narrow metadata.
Single-token identities are not changed.
The earlier 24px trial passed six unit and seven browser checks, including
the exact artwork dimensions, gap, target height and loading stability. See the
[24px review captures](design-system-table-family-evidence/defi-24px-2026-09-11/record.json).
The pool action uses canonical compact secondary Button/asChild; analytics uses
canonical contextual Link. Neither shared owner changes. No whole-row action/hover claim.
Otherwise retain source help/empty wording. Metadata identities/destinations
come from the existing CMS; amounts/rates and pressure conditions are explicitly
illustrative, not current financial facts. Filters and featured pool cards remain
outside this row/cell slice.

## Acceptance and review

Medium, one bounded stage: source desktop/phone observation; mounted selector,
sorting, missing/zero and destination tests; browser light/dark 390/1400 and
1023/1024 container boundaries (plus 1279/1280), loading/long/empty states, both external links, tooltips
and retained existing Earn checks. Check true cell containment and visible UI.
Independent intent/risk review plus final human visual review; no acceptance
promotion. Pressure cases are visible, not held-out. Existing preview port 3005
and Claude's worktree/port remain untouched; own test port 3043 only.

The data-and-action comparison retains the same 1024px container threshold as Earn,
with space allocated for the visible yield breakdown and TVL.
Below it, records retain every metric instead of copying production's
horizontally scrolled table and hidden base/reward columns.

## Verification and review — 2026-09-11

- RED: the mounted selector contained Yield staking but no DeFi Yield option.
  The later loading geometry check measured 234px rather than the loaded 258px.
  Fixed the local placeholder line boxes and right alignment; no shared defaults.
- Source capture: two production 390/1400 checks; the subsequent combined run
  passed 22 cases (seven DeFi lab, two DeFi source, thirteen existing Earn).
  [Combined receipt](design-system-table-family-evidence/defi-combined-2026-09-11/record.json).
- Final DeFi browser checks passed 7/7; 34 screenshots and source digest are in the
  [lab receipt](design-system-table-family-evidence/defi-lab-2026-09-11/record.json).
  Cases cover light/dark 320/390/1400, sorting/recovery, >=44px pool targets,
  both keyboard destinations, rate help and projection focus. The final layout
  at that checkpoint kept analytics beside the pool name. The later grouped
  trial above supersedes that placement, not its destination contract.
- `pnpm typecheck`, `pnpm lint`, `pnpm test:run`: 137 files / 1227 tests passed.
  A first sandboxed full-unit run failed only the native filesystem-watcher test;
  its isolated rerun and the full gate passed with native watcher access. No
  unrelated test or dependency was changed. After the breakpoint-only refinement,
  scoped Earn/DeFi units passed 19/19; app/E2E types, scoped lint/format,
  wiki-lint and diff checks passed. Browser commands use
  `DESIGN_SYSTEM_PORT=3043 pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review` with the named specs above.
- Dark/Light review: no remaining scoped blocker. Pool target fixed; tooltip
  test corrected to target help rather than the identically named Sort button.
  Inner-fact overflow finding withdrawn after inspecting the canonical 12px
  expanded help hit area; checks retain actual cell and visible-text containment.
  Desktop first-sort versus independent narrow direction is documented and
  directly unit-tested. Loading stability was additionally pinned after visual
  inspection. Metadata destinations match all four CMS records.

Human review remains: visual hierarchy, the pool/analytics-link composition and
mobile facts. This does not accept DeFi filtering, featured cards, live data,
production adoption, or the old null-reward-to-zero adapter behavior. The lab's
unavailable case deliberately keeps unknown separate from a known zero; adoption
must decide the source adapter contract explicitly.

## Initial grouped review trial — 2026-09-11

Low-radius, lab-local refinement of the existing candidate; no shared defaults,
production behavior, data adapters or transaction mechanics changed. The
user approved trying the four-column recommendation; visual acceptance remains
open. Existing typography, 24px stacks, 12px identity gap and row padding are
retained. The number of supporting lines can change content height.

The mounted regression first failed because Platform was absent (six existing
tests stayed green), then passed with the visible breakdown, separate analytics
destination and retained reward sorting. A browser sequence initially clicked
the sort trigger again during menu exit; the verifier now waits for the menu's
closed state rather than relying on unchanged row order as a completion signal.

Final grouped-layout verification: Earn/DeFi units 20/20, DeFi browser 7/7
(both themes, 320/390/1400 and four boundary widths), scoped lint, typecheck,
wiki-lint and diff checks passed. Default, long content and loading captures
were visually inspected; desktop analytics was moved alongside the breakdown
after the first render made rows unnecessarily tall. Final source-bound
[captures and receipt](design-system-table-family-evidence/defi-grouped-2026-09-11/record.json)
supersede the prior seven-column visual evidence for this trial. User port 3005
was not restarted or stopped; production remains unchanged.

## Platform identity and analytics refinement — 2026-09-11

The user requested a trial of the hierarchy described above: larger project
mark beside both text lines, smaller chain mark on the name axis, and a compact
analytics icon beside total APY. This supersedes the prior two equal-sized
platform/chain icons and text analytics action, not the four-column grouping.
The platform uses canonical EntityIdentity; original artwork is contained, not
cropped. Main pool artwork remains 24px per token.

The source-named icon-link test failed before implementation while the other
six DeFi tests passed. A later 320px all-row hit-area check caught overlap
between APY help and analytics for shorter rates (Yearn, Convex and Curve).
The narrow rate slot now reserves 48px and the check covers every rendered row
through default, long, zero/unavailable, loading and recovery states. The two
controls retain separate targets without making the APY number itself a link.
The canonical IconButton API does not accept anchor children; the local link
uses the supported quiet Button/asChild API without changing either owner.

Verification: final Earn/DeFi units 20/20 and browser checks 7/7; app/E2E
typecheck, scoped lint, wiki-lint and diff checks passed. Fresh light/dark
desktop/phone screenshots, loading, long content and boundary captures are in
the [platform refinement receipt](design-system-table-family-evidence/defi-platform-2026-09-11/record.json).
The final all-row touch-target assertion passes through zero/unavailable
states as well as ordinary rates. Default and loading output were visually
inspected. This remains a lab trial awaiting human visual review; no production
changes, shared-default changes or commits were made.

## Explicit pool action and inline analytics — 2026-09-11

The approved follow-up replaces the linked pool identity with plain text and a
compact View pool action, right-aligned on desktop and left-aligned below the
mobile facts. Platform artwork is now 24px, matching the paired pool marks.
Total APY and its adjacent arrow form one neutral contextual analytics link
with underline feedback, replacing the detached ghost control. This supersedes
the platform refinement's separate analytics target and 48px rate slot.

Verification: Earn/DeFi units 20/20, browser checks 7/7 without retries, app/E2E
typecheck and scoped lint passed. Desktop and phone defaults and dark phone
loading were visually inspected. The browser suite covers loading geometry,
safe destinations, keyboard navigation, focus transfer, sorting and separate
help/link targets. Source-bound evidence is in the
[actions refinement receipt](design-system-table-family-evidence/defi-actions-2026-09-11/record.json).
This remains a lab trial for user review; production, shared defaults and the
user's server on port 3005 are unchanged. Nothing was committed.

## APY geometry, sort emphasis and chain badge — 2026-09-11

The user identified the 44px analytics layout box as unwanted text spacing,
the help wrapper's baseline drift, and the hanging arrow beyond the supporting
line. The new geometry keeps a 24px primary line and a down-only pointer extension
over noninteractive supporting content. Platform chain identity now uses the
shared badge with its original uncropped artwork; chain text remains explicit.
Selected Base/Reward sorting changes only that supporting rate's foreground tone.

RED: two mounted tests failed for the missing custom mark and Total APY label;
the browser spacing regression measured 44px where the required line box is 24px.
The scoped review found no intent/risk blocker and requested an actual lower
extension hit-test in addition to geometry; that assertion is now included.
Review also caught a stale composition sentence, corrected in the current section.
The additive custom mark contract is recorded for engineer review before adoption.

Verification is bounded per the V1 cadence. The whole accumulated-tree scope
command attempted an unrelated dependency verification/install and stopped before
lint; no dependency changes were made. Scoped commands use the existing runtime
with dependency auto-verification disabled. No full repository gate is claimed.

Final evidence: 28/28 focused DeFi/Earn/logo units and 7/7 browser checks without
retries, scoped lint, app/E2E typecheck, diff check and wiki-lint. Light/dark
desktop and phone defaults, selected Reward sorting, long names and dark loading
were visually inspected. The
[refinement receipt](design-system-table-family-evidence/defi-refinement-2026-09-11/record.json)
includes source-bound captures and the native lower-extension hit check.
No production changes or commits; user port 3005 remains untouched.

## Chain context moved to pool identity — 2026-09-11

The user approved moving the existing chain name and a 14px inline icon beneath
the token names, with plain 24px platform artwork beside one platform-name line.
No inferred strategies or manual labels were added. Canonical EntityIdentity
owns the two-line pool typography; the supporting icon fits a 20px flex line.
Loading mirrors the new two-line pool and single-line platform geometry.

RED: the mounted ownership check found no chain in the first cell. GREEN:
DeFi/Earn units 21/21, browser 7/7 without retries, app/E2E typecheck, scoped
oxlint, diff check and wiki-lint. Browser coverage pins 14/20/24px geometry,
no platform badge/subtitle, loading row-height continuity and existing sorting,
APY links, keyboard destinations and responsive focus. Light/dark desktop,
phone default and dark phone loading were visually inspected. Low self-review
found no scoped intent/correctness issue. See the
[pool-chain receipt](design-system-table-family-evidence/defi-pool-chain-2026-09-11/record.json).
Shared component code and production remain unchanged in this refinement.

Platform-weight follow-up: user approved only normal body weight for the platform
name (16px/300), not removing chain icons or action borders. The 24px artwork and
all geometry remain unchanged. Four light/dark 390/1400 browser checks passed,
including explicit font dimensions; desktop/phone defaults visually inspected.
Scoped lint, diff and wiki checks passed.
[Weight-only receipt](design-system-table-family-evidence/defi-platform-weight-2026-09-11/record.json).

Icon-size follow-up: platform artwork is 20px and inline chain icons are 12px;
pool artwork stays horizontal at 24px. Text roles, line boxes, gaps and action
treatment are unchanged; skeleton artwork matches. Four light/dark 390/1400
browser checks, scoped lint, diff and wiki checks passed; desktop/phone default
captures were visually inspected. Vertical token stacking was discussed but not
implemented. [Size-trial receipt](design-system-table-family-evidence/defi-small-icons-2026-09-11/record.json).

Pool-size follow-up: the user requested 32px pool artwork again; horizontal
stacking, platform 20px, chain 12px and text/spacing are preserved. The two-token
loading mark occupies 52px horizontally to match the stack's border/overlap
geometry and prevent a name-axis shift. Seven browser checks passed across both
themes, 320/390/1400 and container boundaries, including loading height/name-axis
continuity; scoped lint, diff and wiki checks passed. Desktop default, narrow long
names and dark loading were visually inspected.
[32px pool receipt](design-system-table-family-evidence/defi-pool-32-2026-09-11/record.json).

Three-token follow-up: added Curve's ETH+ / eUSD / RSR pool as a fifth lab fixture,
with verified token identities and an existing CMS destination; rates and TVL are
illustrative. It appears second under default Total APY sorting. All three logos
remain 32px in the horizontal stack; its loading mark occupies 70px. The existing
zero-state test now identifies the specific pool rather than the platform name,
since two fixtures use Curve. RED confirmed the new row was absent before the
change. GREEN: 22/22 focused DeFi/Earn units and 9/9 lab/source browser checks,
app/E2E typecheck, scoped lint, diff check and wiki-lint. Desktop and phone default,
narrow long content and dark loading captures were visually inspected. Scoped
self-review found no blocker; production code, shared defaults and port 3005
are unchanged. [Three-token receipt](design-system-table-family-evidence/defi-three-tokens-2026-09-11/record.json).

Equal-footprint trial: two- and three-token pool stacks now occupy 60px at 32px
artwork height, preserving the 12px text gap and aligning names/chain subtext.
Loading uses the same 60px footprint. No platform spacing, shared defaults or
production changes. RED measured the old 18px difference between name axes;
GREEN: 7/7 browser checks, 9/9 DeFi units, app/E2E typecheck, scoped lint/format,
diff check and wiki-lint. Light desktop/phone defaults and dark narrow/default
and loading captures were inspected. Denser three-token artwork remains a human
visual-review trade-off, not acceptance. Scoped self-review found no correctness
or scope blocker. [Equal-stack receipt](design-system-table-family-evidence/defi-equal-stacks-2026-09-11/record.json).

Fixture-variety follow-up: replaced three repeated eUSD/USDC rows with the
source-verified Uniswap RSR/WETH, Yearn ETH+ETH-f and Convex ETH+/WETH records.
One eUSD/USDC pair and the three-token Curve specimen remain. Existing local
Uniswap artwork and CMS destinations are reused. Address-pinned token symbols
preserve Yearn's actual underlying artwork without misreading its LP-token label;
this is fixture normalization only, not a live-adapter correction. Layout,
illustrative numeric values and default ordering remain unchanged.

RED: all three new identity cases were absent. GREEN: 12/12 DeFi units and
9/9 lab/source browser checks, app/E2E typecheck, scoped lint/format, diff check
and wiki-lint. The mounted test's row query was corrected to tolerate the
existing desktop/mobile projections; no rendering change was needed. Light
desktop/phone defaults, dark phone long content and narrow loading were visually
inspected. Scoped self-review found no intent/correctness blocker. No production
changes, commits or user-server restart. [Varied-pool receipt](design-system-table-family-evidence/defi-varied-pools-2026-09-11/record.json).

Platform-gap correction: removed the local 12px override to use EntityIdentity's
standard 8px gap, with matching loading geometry. Pool stacks/text gaps and all
other sizes stay unchanged. Four light/dark desktop/phone browser cases passed,
including loaded/loading gap assertions; desktop and phone captures inspected.
Scoped lint/format, diff and wiki checks passed. Shared defaults are untouched.
[Platform-gap receipt](design-system-table-family-evidence/defi-platform-gap-2026-09-11/record.json).

Two-token-first refinement: reduced both stack footprints from 60px to 52px,
retaining 32px artwork, the 12px pool text gap and 8px platform gap. The user
explicitly accepts greater three-token occlusion. Loading/name axes stay aligned.
Four light/dark desktop/phone browser cases passed; desktop/phone defaults were
visually inspected. Scoped lint, diff and wiki checks passed; shared defaults
and production remain unchanged. [Narrow-stack receipt](design-system-table-family-evidence/defi-narrow-stacks-2026-09-11/record.json).

Mobile grouping trial: pool identity now combines chain and platform subtext,
without a second platform logo. APY and TVL use 4px label/value gaps, with the
Base/Rewards breakdown spanning the record below them. APY help appears once
beside the mobile sort toolbar; their separate 44px targets do not overlap.
Desktop composition, sorting, links, 24px row insets and divider geometry stay
unchanged. Total and breakdown rendering are reused across projections.

RED confirmed the combined mobile metadata was absent. GREEN: 26/26 focused
DeFi/Earn units, 7/7 browser cases, app/E2E typecheck and scoped lint/format.
Browser coverage includes both themes, 320/390/1400 widths, long names, loading,
zero/unavailable, sorting, and help/link focus transfer at the container boundary.
Phone and desktop defaults, dark narrow long names and dark phone loading were
visually inspected. Scoped self-review found no correctness or scope blocker;
the visual trial remains awaiting human review. No production/shared-default
changes, commits or user-server restart.
[Mobile grouping receipt](design-system-table-family-evidence/defi-mobile-cleanup-2026-09-11/record.json).

Mobile action refinement: moved the pool link to a compact outlined single-arrow
control at the identity's top-right and removed the footer action. Chain and
platform now use matching 12px supporting marks; desktop keeps “View pool”.
The link retains its destination and focus key, gains a platform-specific name
and tooltip, and has a non-overlapping 44px target. Loading reserves each
fixture's actual name/metadata wrapping rather than assuming equal row heights.

RED: missing platform mark and named icon-only pool link (12 existing cases
passed, two new expectations failed). GREEN: 27/27 DeFi/Earn units, 7/7 browser
cases, app/E2E typecheck and scoped lint/format. Browser checks include both
themes, 320/390/1400, long names, per-row loading continuity, keyboard external
destinations, tooltip/Escape and focus across container boundaries. Light phone
and desktop defaults, dark 320px long names and dark phone loading were visually
inspected. At 320px, long names and supporting metadata wrap without hiding data;
the ordinary 390px metadata stays on one line. Scoped intent/correctness/product
self-review found no blocker. No shared component contract or production change;
this remains a human visual-review trial.
[Mobile action receipt](design-system-table-family-evidence/defi-mobile-action-2026-09-11/record.json).
