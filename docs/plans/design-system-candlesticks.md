# Overview candlesticks — lab addition

Status: implementation-verified — candle keyboard and stable-touch OHLC
inspection passed the September 15 repair gate. Human visual acceptance and
production adoption remain separate.

The [September 15 completion package](design-system-next-charts/completion/README.md)
owns the later compact V1 tooltip presentation refinement and its fresh
verification. The later G7 repair described below closes the lab interaction
limitation without changing the production default. Earlier delegation and
failed-attempt evidence remain historical, not a second active owner.

## Contract

User authorized the bounded Sol medium implementation across September 14–15. Fixed
point `49f9f22ae`, including the inspected inherited chart lab changes. Medium
presentation boundary; follow the bounded design-system verification cadence.
No commit, checkpoint, dependency install or production migration is authorized.

Bring the existing Overview candle renderer into the named chart lab. Preserve
real OHLC data, interval meaning, timestamp/launch positioning, the existing
line/Home/Discover examples, and production defaults. Capture provenance must
be explicit; line samples cannot stand in for actual candle data.

The review must retain all four OHLC values during inspection. The existing
tooltip is a valid first comparison; header inspection must not silently reduce
a candle to its close. No derived hovered return, data/source changes, bucket
changes, live append, freshness policy or new financial calculation is in scope.

## Usage and ownership

The designer finds candlesticks in the current chart review, inspects an actual
candle, and compares desktop with genuine 320/390px mobile preview. The existing
Overview frame owns square surfaces, 24px insets and responsive 24/32px title;
the renderer owns the plot, axes and interval geometry. Mobile axes remain
hidden. Frozen range labels remain explicitly specimen-only. Existing labels,
units and identities are preserved; lab explanatory notes are not product copy.

One fresh implementation owner, `/root/candlestick_lab`, runs Sol medium in the
shared checkout, with exclusive chart source/test/fixture writes. Coordinator
owns this contract, catalog/current-review and closeout documentation, reviews
the actual returned diff and independently checks evidence. No simultaneous
implementation writers or alternative candidates. The model assignment follows
the previous bounded chart slice's evidence, not a claim of general equivalence
or measured cost. Repair stays with the worker; if it cannot finish, coordinator
continues or reports the exact blocker. The user's 3005 preview stays running.

## Acceptance evidence

- Source-backed OHLC provenance and independently asserted sample values.
- Real renderer mounted; appropriate selected type and interval context.
- Desktop/light and dark, 320/390 mobile, and narrow desktop containment.
- Hover/touch/keyboard inspection without losing OHLC information; preserve line
  inspection and mobile-preview behavior.
- Launch annotation at the original bucket-relative coordinate, if included.
- Focused RED/GREEN behavior checks, app/e2e types, scoped lint and diff checks.
- Coordinator visual inspection and scoped Dark/Light review of optional seams.

Implementation evidence will live in
[the worker receipt](design-system-candlesticks/README.md). Findings and limits
must distinguish lab verification from production readiness. Factsheet bars are
excluded from this batch: their route remains but normal navigation no longer
links it; source existence does not establish current use.

## Review reconciliation

- Keep the original full OHLC tooltip for this first slice. A trial header
  readout required more vertical space on small screens; it was removed rather
  than introducing plot movement or large resting reservations. Line header
  inspection remains its own comparison. The tooltip's legacy presentation is
  retained evidence, not a new canonical tooltip contract.
- Correct the frozen footer to preserve desktop Line → Candles order, selected
  contrast and the selected mobile label. Candle-only partial-period notes must
  not appear in the line example.
- Replace early screenshots with captures that wait for candle animation to
  settle. Element count alone did not establish final wick/body geometry.
- Historical failure: the strengthened second-candle touch test reproduced a reset to January 1
  with the new keyboard opt-in. Pointer suppression then made the tooltip
  unavailable; a focus-capture attempt also failed the touch test. Three
  bounded attempts failed in that slice, so its experiments were removed and
  the unchanged renderer was characterized separately. This stop was
  superseded by the separately authorized September 15 repair below.

The earlier worker baseline with the keyboard opt-in omitted also failed
the desired keyboard and stable-touch checks in the isolated replay. The
experimental keyboard option and failed event/payload fixes from that attempt
remain removed. This historical result characterized the retained renderer in
the lab, not every live production context, and is superseded by the source
repair and evidence below.

September 15 G7 repair: the existing custom `tooltipContent` seam now opts the
lab into Recharts keyboard accessibility. `CandlestickChartBody` records the
actual `activeTooltipIndex` supplied on press and feeds it back as the Tooltip
`defaultIndex`, so focus no longer resets a tapped non-first candle to index 0.
Callers that omit `tooltipContent` keep the existing production tooltip and
interaction defaults. Mouse hover, compact V1 tooltip presentation, candle
geometry, data, domains and ticks are unchanged.

Fresh repair evidence: focused keyboard/stable-touch **2/2**, protected
glyph-clearance and compact-hover checks **5/5**, full candlestick specification
**12/12**, and integrated chart matrix **86/86**. App/e2e TypeScript, scoped
Oxlint/Prettier and diff checks passed. These checks close the lab interaction
gate; they do not replace human visual acceptance or certify production adoption.

## Handoff

The original worker's stable visual/pointer/viewport/type-round-trip subset
passed 6/6 while its keyboard and stable-touch checks remained enabled and
failing. That historical non-green handoff motivated the later repair rather
than a skipped assertion. The September 15 rerun now passes the unchanged
interaction assertions and the full 12-test candlestick specification; the
combined chart matrix passes 86/86. No production caller, financial behavior or
data contract changed.

Next human decision: review the source-faithful candle visuals and compact OHLC
surface. Production adoption and the separate source/financial questions remain
outside this lab acceptance.

## September 15 presentation conformance audit

Read-only coordinator audit after the user approved a separate tooltip refinement.
Inspected current 3005 Candles in Chrome: normal desktop in light/dark, genuine
390px light iframe and 320px light/dark iframe. Desktop DOM confirms 13px axis
labels at opacity 0.7. Source review covers the mounted renderer, host, launch
annotation, chart container and typed typography/motion/color authority. This
is not a new browser regression run or production certification.

- **Confirmed, proposed:** X/Y labels in `candlestick-chart-body.tsx` use 13px
  outside the canonical scale, with muted foreground faded again to 70%.
  Recommend the 12px auxiliary chart role and the supporting foreground without
  extra opacity; preserve all tick values, counts and positions. The line body
  has the same inherited styling, so assess both together before adoption.
- **Confirmed, proposed:** `CandleCursor` uses raw `#E5EEFA` at opacity 0.35.
  This does not inherit semantic theme contrast. Replace through a bounded
  opt-in presentation with a semantic guide-line color; keep its inspected
  candle coordinate and dashed geometry. Light-theme visibility must be checked.
- **Source-confirmed, runtime proof pending:** candles explicitly animate for
  500ms with ease-in-out and have no reduced-motion gate in the mounting chain.
  The foundation specifies 120/180/240ms and removal of non-essential motion.
  Recommend no candle growth animation for reduced motion; separately decide
  whether ordinary switching needs a short transition at all. Do not change
  data geometry or claim a runtime reduced-motion failure from this static audit.
- **Retain:** square surface, 24px host insets, canonical 32/24px title, mobile
  axis omission and 12px launch annotation. Existing performance palette is an
  explicitly retained chart dependency, not permission to replace it with generic
  success/danger colors. Candle bodies and wicks retain their financial meaning.
- **Not new conformance failures:** frozen footer labels are accepted specimen
  context, not live tabs; OHLC remains in the tooltip rather than the line-only
  header experiment. The touch/keyboard gap recorded during this audit was
  subsequently closed by the September 15 G7 repair above.

No source fixes were made by this audit. Proposed items above are not accepted
global rules and do not widen the tooltip worker's authority.

### Tooltip delegation

User authorized a separate task, “Refine candle tooltip for design-system lab”,
Sol medium, in its own worktree. Creation returned pending identifier
`client-new-thread:7e16befa-0d80-49b3-983b-29b058d16ea3`; two bounded supported
list checks did not yet resolve a usable task ID. Startup is therefore unconfirmed,
not reported as running; do not create a duplicate. Worker receipt is requested
at `docs/plans/design-system-candle-tooltip/README.md` inside its worktree.

September 15 preparation reconciliation: a bounded supported task listing and
registered Codex worktree check found no identifiable task or returned tooltip
artifact. Startup remains unconfirmed; it has not been cancelled or certified
absent. The [chart completion brief](design-system-next-charts/revision-plan.md#authorized-chart-completion-scope-and-ownership)
assigns the must-fix to the chart workstream at launch, using isolated lab-owned
output rather than another sidebar dispatch. Any later old-task result stays
unintegrated until the coordinator checks overlap. This preparation note is
superseded by the [completed refinement packet](design-system-next-charts/completion/refinements.md):
the local V1 tooltip and optional production-default-preserving seam are now
implemented and verified; no old task output was integrated.

Approved scope: semantic floating surface, 8px radius, restrained border/elevation,
compact paired OHLC rows and readable timestamp above them; preserve values,
timestamp/timezone meaning and production defaults. Check edge placement using
existing supported positioning; report constraints rather than redesigning
interaction state. Prefer a small lab-only presentation with an explicit opt-in
seam. No interaction repair, financial changes, source integration, shared-default
change, installs or commits. Own preview 3042 if free; leave 3005 and the separate
Yield/Portfolio worker on 3041 untouched. Coordinator verifies returned delta;
human visual acceptance remains required.
