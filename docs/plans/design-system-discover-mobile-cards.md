# Discover mobile card review

## Contract and transfer

Fixed point: `adef9ee76`; the inspected in-progress table-family work is retained.
This is one medium, lab-only slice. Production adoption, homepage changes,
data hooks, a new chart system and a universal responsive table API are non-goals.

The user wants the current Discover/Home card family brought into the Discover
lab with a careful V1 composition pass, preserving successful product behavior.
Direct source and rendered inspection found that production already shares
`IndexDTFFeatureCard`: Discover uses a 112 × 48 header chart and Market Cap;
Home uses a 208px body chart and transcript/video. The earlier card review
accepted foundation deltas only, not every responsive/edge state.

## Usage and ownership

- Browse at phone width: coherent cards retain name, ticker, classifications,
  price, period-qualified performance, asset ticker and Market Cap.
- Sort at desktop, then constrain the list: order and focused item survive;
  only one heavy presentation is mounted. The same TanStack owner drives both.
- Inspect unavailable/zero, loading, inactive and long-content conditions,
  then recover: missing values never become zeros; skeletons are not links.

One candidate with two chart placements, not competing ownership models.
Reject per-cell responsive substitutions for this card family and two mounted
lists with independent sort state. The lab exposes preview controls only;
navigation preserves real overview destinations. No new product analytics.

## Preservation and geometry

Reuse the actual production chart and scrolling ticker implementations, rather
than approximate their behavior with the desktop cell sparkline or popup.
Keep the production 18-second ticker cycle, visibility behavior and reduced
motion; do not replace it with the desktop basket strip's different timing.
The lab wrapper consumes existing canonical logo, type, value and focus owners.
The old homepage wrapper stays untouched, including transcript, chain variants,
launch treatment and video. Those remain preservation obligations before any
future shared extraction or adoption.

The accepted Home card foundation owns square outer shape, 8px shell inset and
media radius, 24px primary/supporting content insets, 16px primary region gap,
8px name/market gap. The Discover surface preview below changes its media
corners and uses contrast-only lab framing; the Home baseline is unchanged. The
available-width boundary remains 72rem. A two-column card list may use an
intermediate width; an explicit 390px lab constraint remains a single column.

### September 11 — card surface preview and contrast-only framing

The 2px `secondary` surround and gaps are lab framing solely to provide contrast.
The user explicitly clarified that they are not a saved container preference,
a proposed product layout or a table/card contract. Leave page-host composition
undecided. The geometry checks retain this preview setup, not design authority.
Cards currently have square outer/media regions and a steady `card` fill in
both themes. The accepted Home card is unchanged.

The inset diagnosis measured 32px from the card edge to its title and top row:
8px shell plus 24px inner padding. The production source uses 4px plus 20px,
totaling 24px. Removing the gradient exposed this accumulated inset.
The user authorized the correction: remove the lab card's outer padding so
header content and Market Cap use a total 24px horizontal inset. Header top and
footer bottom also use 24px, owned by those regions. The full chart and scrolling
ticker retain their own edge/fade geometry without a redundant padded shell.
Name/market rhythm, ticker timing and shared Home defaults remain unchanged.

The inspected production visibility hook activates at 85% visibility. Its
gradient-to-card surface switch is gated by `showTranscript`; the local
production Discover caller disables that flag. The lab uses the quieter card
fill for browsing instead of importing the highlighted-card attention effect.
Keep the actual chart/ticker implementations; do not infer that decorative
surface parity requires transcript or new viewport state in this composition.

The [surface-trial record](design-system-table-family-evidence/mobile-card-surfaces-2026-09-11/record.json)
predates the inset correction and retains six selected captures from eight
passing card browser cases, all bound
to one public source digest. Geometry checks cover every captured state, including
loading and two-column long-content rows. The pre-change 390px case failed on
the absent 2px surround; the final run passes without retries. App/E2E types,
scoped lint/format, wiki lint and diff whitespace checks pass. Direct live-preview
inspection covered compact 390px; all six retained light/dark/phone/tablet
captures were visually inspected. No new production verification is claimed.

The [inset-correction record](design-system-table-family-evidence/mobile-card-insets-2026-09-11/record.json)
is the current geometry evidence: eight passing card browser cases, six selected
captures and one public source digest. The pre-change 390px test measured 32px
at all five header/footer content landmarks against the intended 24px; the final
run measures 24px across every captured state. Loading/content heights still
match. All six captures and the live 390px compact preview were inspected.
App/E2E types, scoped lint/format, wiki lint and whitespace checks pass. This
bounded correction does not rerun or claim production verification.

## Evidence and human gates

Visible pressure cases: 320/390 widths, light/dark, long names/tags, zero versus
unavailable, loading → content, inactive, short/empty basket, compact versus
body chart, 1151/1152 container crossing, sort/focus continuity and navigation.
Browser regression is the highest stable seam; add a focused DataTable test
for any opt-in alternative renderer. Run scoped types/lint, relevant existing
Discover tests, browser checks and inspect screenshots before handoff.
Rubric: source fidelity, honest values, balanced geometry, legible mobile
hierarchy, one mounted list/state continuity. These are visible pressure tests,
not held-out independent evaluation. Final visual preference remains human
review; shared opt-ins need engineer review before production adoption.

## Implementation and review disposition

`discover-card.tsx` is a lab-local composition, not a completed extraction of
`IndexDTFFeatureCard`. It directly consumes the production PerformanceChart,
FeatureCardAssetTicker, animation styles and visibility hook. Homepage
transcripts/video, multi-chain card selection and featured-page packing are
unchanged and remain outside this Discover preview. The full-chart option uses
Discover's same 30-day dataset and Market Cap, not a misleading YTD/stories swap.

DataTable's optional `renderAlternative` receives its existing table instance;
only its table markup or the alternative list is mounted. The default path,
sorting, pagination and expansion remain unchanged. The lab owns the 1152px
container boundary and focus transfer, not a new global breakpoint policy.
Cards use a two-column list from 704px available width; each card stays intrinsic.

Dark/Light review confirmed reuse and default compatibility. Corrected findings:
keep name/market directly 8px apart, preserve missing weights as an em dash,
and opt out of both Recharts animation layers under reduced motion. The
animation option defaults to true, preserving production callers. These reports
do not confer human design acceptance.

RED evidence: new card absent at the live lab route; DataTable kept rendering a
table when an alternative was requested; chart renderers ignored disabled
animation; loading height differed at 320/390/768; open-sort-menu resizing
retained the previous item's focus instead of the sort control. The corrected
tests exercise the public rendered seam, plus the library animation option.
Menu test sequencing waits for dismissal before the next keyboard action.
The wider regression also caught the text sort control's 4px expanded hit target
overflowing DataTable's scroll wrapper. A local 4px toolbar inset contains it;
no shared control geometry changed. Both its scroll width and the constrained
card content now fit, verified directly in the browser.

The final focus review found an outside-click case: after leaving a card,
resizing reclaimed its focus. Browser RED confirmed it. Focus memory now clears
on document pointer interactions outside the composition, except a portal whose
ID is controlled by a trigger in that composition. Unrelated app menus are not
exempt. Own sort/basket continuity and outside non-focusable content are tested
separately, so preserving local focus does not mean stealing it back.
The unrelated-menu test uses the desktop language menu and checks mounted
background markup, since Radix correctly hides that background from the
accessibility tree while its modal menu is open.

Final screenshot inspection found the source ticker skeleton's legacy dark fill
inconsistent with the rest of the card. The lab loading strip now composes the
canonical Skeleton inside the source ticker container geometry. The loaded
ticker remains a direct production consumer. A browser RED confirmed the old
owner, and regression checks require uniform skeleton fills and unchanged
loading/content heights; production skeleton defaults remain untouched.

## Verification scope

The fresh focused run uses `playwright.design-system.config.ts`, the
`design-system-review` project and an owned server on 3043. The user's 3005
preview stays untouched. The six specs are `discover-cards-lab-regressions`,
`discover-family-lab-regressions`, `discover-trigger-lab-regressions`,
`discover-strip-edges-lab-regressions`, `discover-motion-lab-regressions` and
`table-row-links-lab-regressions` (all `.spec.ts` under `e2e/design-system`).

Focused unit owners: DataTable (6), production chart animation option (2),
Discover meaning/motion (5), component catalog (33), catalog UI (5).
`pnpm typecheck` checks app and E2E; scoped oxlint and Prettier check changed
owners. The Home/Discover area guide remains accurate: its production flow and
smoke routes are unchanged; the additive chart option preserves current defaults.

Direct final inspection covered light default compact/full and dark long-name
cards at 390px, and the constrained card at a desktop viewport. Earlier visual
inspection covered 320px wrapping. Browser attachments additionally cover 768px,
missing values and skeletons. Static captures disable animation; separate ticker
cases assert its running/paused states and 18-second duration. No claim of full
screen-reader testing, launch-marker interaction coverage, production fetching
correctness or acceptance of every Home card feature is made.
Some offline capture logos use the existing fallback; the separate live-preview
inspection resolved the actual logos. These are layout/behavior records, not
brand-asset approval.

Closeout follows the project’s scoped lab cadence, not a full repository gate
over the accumulated checkpoint diff. Scope's existing broad-any in DataTable
and an older audit capture's empty catch are unchanged by this slice. No workflow
rule change is justified; the useful corrections are in the component/tests.

## Initial card-slice receipts (before the surface trial above)

[Retained record](design-system-table-family-evidence/mobile-cards-2026-09-11/record.json):
21/21 lab browser cases, one public source digest, no retries/skips; 24 current
card captures. All retained image hashes verify. The 7/7 existing production
regression cases used the base Playwright config with only an owned 3043 port,
two workers and separate output paths; production defaults remain unchanged.
Focused unit/catalog checks passed 51/51. App/E2E types (`pnpm typecheck`), scoped
oxlint/Prettier, wiki lint and relative-file link checks are green. No full
repository/CI pass is claimed.

Independent Intent/Risk findings and affected-axis rechecks are resolved.
Status: **human-review-required**, not accepted/adopted. Review the ordinary
compact card first, then Full chart, long content and loading at phone width.
Engineer review remains deferred until production adoption; no commit or push.
