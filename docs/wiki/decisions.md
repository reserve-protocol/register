---
title: Decisions
updated: 2026-09-16
type: decision
---

# Decisions

Durable decisions with the why. One `##` per decision, newest last. Split into linked pages if this file outgrows the split rule in `skills/wiki.md`.

## 2026-07-02 — llm-workflow kit adopted

Register moved from a monolithic `CLAUDE.md` to the llm-workflow router + wiki. `AGENTS.md` stays a symlink to `CLAUDE.md` (single source); `CLAUDE.md` now holds the router content. The full pre-adoption doc is archived verbatim at `docs/archive/CLAUDE-pre-llm-workflow-2026-07-02.md`; its rules live in [[project]], [[sdk]], [[design-system]], and `llm-workflow.config.json`. Repo rules won on every conflict (see [[project]] § Overrides).

## 2026-07-02 — DataTable pagination default unified

`DataTablePagination` (extracted from `data-table.tsx`) intentionally adopts the responsive style built for the DTF overview transaction table as the app-wide default: `px-5 pb-3 pt-4` padding, summary `hidden md:flex` (was `opacity-0 md:opacity-100`), full-width mobile page buttons. This is a deliberate, user-approved exception to the "never change shared defaults" rule — the old per-table `pagination*ClassName` props were removed in the same change. Verified visually on explorer governance (desktop + mobile, 12 pages); discover and top100 currently gate pagination behind >20 rows so they render none with today's data. The extraction initially also gave the page-number wrapper `flex-1`, which broke mobile layouts with many pages — fixed to match the original structure (only prev/next/page buttons stretch).

## 2026-07-02 — dtf-chat launcher styling contained, not upstreamed (yet)

The `.rc-*` overrides in `src/app.css` restyle `@reserve-protocol/dtf-chat` internals. Kept in register deliberately (release window; cross-repo change too heavy now) but contained in one documented block. Real fix — launcher theming props/CSS variables in the dtf-chat package (reserve-ai repo) — is in [[progress]] backlog.

## 2026-07-03 — Referral tracking is Mixpanel-only; conversions settle on-chain

The referral campaign (influencer links → `/?referral=<code>`) stores attribution exclusively in Mixpanel: the `referral` super property on all events plus `referral_landed` and `referral_wallet_linked` (explicit `{ wallet, code }` — the link record, extracted later via the Mixpanel export API). A reserve-api piece (`referral_links` Postgres table + origin-guarded endpoint) was built and reviewed, then cut the same day — one store is enough, and the Mixpanel API covers extraction (reserve-api PR #212 closed unmerged; its branch holds the code if a DB record is ever wanted again). No conversion/mint tracking anywhere client-side: client events are spoofable, so credit is settled post-campaign from subgraph transfer data. Last-touch, full-history-per-wallet via distinct wallet+code events. See [[referral]].

## 2026-07-03 — Vote-lock is intentionally NOT compliance-gated

The vote-lock (staking-vault deposit) flow deliberately has no geo/compliance restriction: vote-locking is governance participation, not a regulated product surface — users earn RSR rewards on AI DTFs regardless of jurisdiction. The old `useIsComplianceRestricted` gate on `submit-lock-button.tsx` was removed on purpose in the release/ai-dtf rewrite (product call, Luis 2026-07-03). Reviewers: do not re-flag its absence as a security regression. Compliance gating remains on mint/zap surfaces (`isRestricted` on the Zapper CTA, Ondo eligibility modal).

## 2026-07-03 — Ondo cap is weighted per asset; unavailable minting gets its own prompt variants

Supersedes the min-cap semantics recorded as "the confirmed product ask" in cowswap-prompt-rework: the Ondo per-transaction limits are per _asset_, and each asset only absorbs its basket-weight fraction of a DTF mint, so the binding DTF cap is `min(capacityUsd / weight)` — e.g. a $200k cap on an 18.68% weight binds at ~$1.07M of DTF, not $200k. Displayed and compared floored to $10k steps ($1k under $10k) so the trigger matches the label. Confirmed by the product owner (Jorge), who also set the rest of the model: the capacity card stays pre-quote but only fires while minting is _available_ (market open, every reported cap > 0); while minting is _unavailable_ (market closed or an asset paused at cap 0) quotes defer to un-arbitrageable secondary pools, so a resolved non-enso quote above the existing 1% `truePriceImpact` threshold (deliberately not the widget's 5% alert) shows `closed-impact` and a quote failure shows `closed-error` — both say when to come back (exact `market.nextOpen` when closed; next tradable session otherwise, missing session buckets falling back to the regular cap like the API's `sessionCapacity`) and never show a CoW CTA, since CoW liquidity is equally stale while arbitrage is blocked. Limits are per transaction, so the capacity copy invites splitting large orders.

## 2026-07-06 — Chart granularity: fetch what the API has, bucket client-side for display density

The "choppy charts" task was solved by granularity policy, not by smoothing: the DTF price series is a NAV estimate that reverses direction on ~50% of consecutive points, so any range rendering more than a few hundred points reads as noise. `historical/dtf` accepts exactly `5m`/`1h`/`1d` (everything else 400s; the reported "3h/6h granularity" was data holes, not server behavior), so intermediate display densities are produced client-side by bucketing the finest supported interval (see [[overview-charts]] for the per-range table: 24H fetches 5m and buckets to 15m, 1M fetches 1h and buckets to 6h, All buckets daily data to weekly past 400 points). The first pass landed on plain 1d for 1M and 1h for 24H; the user then asked for more density (31 and 25 points felt too sparse), which produced the fetch-fine/bucket-down pattern. 1Y deliberately stays daily (~366 pts is the standard year-chart density). The <30-day "young DTF → force hourly" override was removed outright: backfilled AI DTFs made it request thousands of hourly points on YTD/1Y, and 24H/7D already cover launch-week detail. Moving-average smoothing was rejected because it misrepresents price data.

## 2026-07-06 — Ledger wiki files use `merge=union` to stop recurring PR conflicts

`log.md`, `decisions.md`, `progress.md`, `index.md` are append/ledger files every stage on every branch writes to, so concurrent branches collided in the same region on every wiki-touching PR. Fixed with a root `.gitattributes` marking exactly those four `merge=union` (git's built-in keep-both driver, honored locally and by GitHub's PR merge). Scoped precisely: domain pages are rewritten in place, where union would keep both versions of an edited paragraph — never add them. Cost is a cosmetic duplicate `updated:` line when two branches both bump the date; wiki-lint is last-wins so it stays green and it self-heals on the next edit. Heavier alternative considered and rejected: sharding each ledger into one-file-per-stage (eliminates the wart too, but sprawls files and breaks the single-readable-index model the wiki depends on). Portable follow-up: the llm-workflow kit's wiki skill should ship this `.gitattributes` rule for every repo it installs into.

## 2026-07-08 — Workflow process calibrated on two axes: radius × size

Every prompt was paying full-stage cost. Audit showed the mechanical gate is ~32s total (kept as the floor); the real cost was spawned reviewer pairs, double gate runs, visual evidence, and wiki ingest applied to diffs of any size. `skills/workflow.md` § Calibrate: Radius × Size now separates two independent questions: **blast radius** (how far can it break — buys checks and review) and **work size** (how much work — buys ceremony). Four profiles: **touch-up** (trivial+isolated: scoped verify + self-review), **low** (contained slice — button, visual change, in-domain fix: + self-review through fired lenses, eyeball if rendered output changed), **medium** (wide radius, modest size — the shared-machinery bugfix: one stage with spawned reviewers, full gate, one row, ingest only stale pages; no plan/phases), **high** (multi-phase or cross-package: plan → stages, whole-feature review at the end). The axes are the point: collapsing them into one ladder over-processes small risky fixes and under-reviews big "simple" ones. A fired lens names what to check, not who checks it — reviewer pairs spawn at medium/high only. `scope.mjs` prints per-axis mechanical signals (risk lenses → radius, >5 files → size) plus a profile hint, and `gate-equivalent: yes` when a scoped run covered every gate command (it then counts as the closeout gate). When debating two profiles, take the heavier one; the ledger-drift lint is the backstop against profile abuse. Kit and register stay byte-identical on kit-owned files. Follow-up guardrails (same day): ledger rows are pointers, not narratives — wiki-lint caps them at `wiki.ledgerRowMaxChars` (700); downgrades below a fired radius signal must be stated with a reason; profile boundaries change only on misfires recorded in [[log]].


## 2026-08-13 — Modal widths follow content roles; workflows do not resize between states

Design-system v1 starts with a 432px substantial-task role and a 384px compact-confirmation role. Zapper establishes the substantial role and stays 432px through quote, pending, error, and completion. Its real package-owned success view includes received and used values, transaction details, expandable content, and optional contact or scheduling panels, so treating it as a tiny completion message was misleading. The compact role is reserved for a short acknowledgement with one consequence and one action; forms, warnings, transaction detail, or multiple decisions use 432px. A wide role remains open only for structurally wider content. Long financial values are formatted for reading within the role—grouped and intentionally rounded—while exact precision remains available in details or copy affordances.

## 2026-08-13 — Auctions is the V1 layout migration; Governance is deferred

Auctions will replace its separate centered list and detail islands with a persistent browse-and-inspect composition. This improves the task enough to justify structural work during V1, but the opened auction must be recomposed for the wider workspace rather than stretching its current narrow card. Exact list width, responsive routing, and detail composition are decided against real auction states when that migration begins. Governance keeps its current composition during the compressed V1 schedule; foundations and components can improve it without making a proposal-summary redesign a prerequisite. Its browse-and-summary direction remains later work, where a selected panel must clearly be a complete summary linking to the dedicated full proposal route.

## 2026-08-13 — V1 candidates share semantic roles and combinable state axes

Component-family work consumes a lab-only semantic role map instead of choosing legacy color tokens case by case. It aliases reviewed content, substrate, neutral control, selected, line, focus, disabled, and feedback roles while exact values and production token migration remain open. Intent, selection, focus, validation, disabled, and async lifecycle may combine, so the lab shows important pairings rather than one exclusive state list. Default entered/selected values use 16px/300, compact values use 14px/300, and action labels use 14px/500. Atomic one-row controls—including ordinary inputs, search, and select triggers—use full radius; multiline fields, menus, popovers, and thumbnails use the restrained 8px role. The composite-amount clause originally recorded here was superseded by the 2026-08-31 square transaction-amount decision, which was itself superseded by the 2026-09-04 restrained-radius decision below. Earlier 8px one-row input/select experiments are superseded.

## 2026-08-14 — Rendered output, reusable implementation, and adoption are separate

A lab proposal does not prove that a reusable component exists. Component metadata records rendered-output status, implementation status (`none`, `specimen`, or `canonical-candidate`), and product adoption independently. Once a component is called canonical, its active state sheet and dependent canonical lab compositions import the real candidate rather than maintaining visual replicas. The first enforced boundary is Button: the accepted V1 action contract now lives in `src/components/button/`, while the legacy production Button and product consumers remain unchanged until an explicit adoption slice.

## 2026-08-14 — Design-system verification follows the current blast radius

Bounded component iterations verify the current component seam and affected rendered behavior; coherent canonicalization checkpoints verify the reconciled design-system batch; full repository gates are reserved for production adoption, shared/global changes, release work, or another genuine integration boundary. An accumulated dirty design-system diff is not rerun as a full repository gate after every small visual change. The running lab may be reused for iterative visual checks, while canonical Playwright checkpoints retain their controlled `VITE_E2E` server and must not compete with another suite on port 3005.

## 2026-08-14 — Button width belongs to the action-group composition

V1 Buttons remain intrinsic/content-width by default. Compact actions are primarily horizontal or inline controls and should not routinely stretch to fill a parent. When actions must stack vertically in a narrow surface, use equal widths—normally full-width default 44px actions—rather than vertically stacking different intrinsic widths. This is parent-layout guidance, not a new Button size or width variant.

## 2026-08-14 — Canonical composition review requires canonical or retained dependencies

A rendered composition is ready for canonical V1 review only when every visually meaningful dependency is either a real reusable V1 candidate or an explicitly retained domain/behavior primitive. Otherwise the lab labels it provisional, blocked, or exploration-only and states the narrow scope that may be judged. This prevents a canonical child inside copied framing from making the entire specimen appear canonical. The first dependency-complete composition is the real eligibility dialog: canonical Button, 20px square binary Checkbox, compact named IconButton, and minimal Radix-backed Dialog shell, with Radix Collapsible and inline legal links explicitly retained. Unresolved Checkbox/IconButton variants, final dialog elevation, outcomes, illustration, constrained-screen behavior, Table/DataRow, and production adoption remain outside this promotion.

## 2026-08-18 — Rich records share foundations, not a universal Row

Governance proposals and Auction rebalance selectors remain distinct reviewed
compositions. Both use square structural records, a 24px outer inset, 16px
between internal regions, 8px between related rows, 4px for tight icon/text
pairs, 16px/500 titles, and reusable lifecycle and Metric seams. This shared
grammar does not promote Table/DataRow to canonical V1. Lifecycle Status was
subsequently promoted after this pressure test established its reusable
contract; the rich-record compositions themselves remain separate and
provisional.

Auction selector items show the current auction state and only the timing needed
to decide what happens next. Current-auction bid count and value traded remain
in the selected/full view. Operational and historical selector evidence reuses
inline Metric anatomy with consistent 16px/500 value emphasis; provenance reads
as one left-aligned sentence. At constrained widths, status wraps below the
title rather than squeezing it. Neutral lifecycle surfaces and borders are
opaque semantic colors so their appearance does not depend on the parent
surface.

## 2026-08-18 — Lifecycle Status is canonical; other compact labels are not

The reviewed 24px Lifecycle Status component is a canonical V1 candidate after
pressure testing across Governance proposals and Auction rebalance selectors.
It owns waiting, active, actionable, processing, success, unsuccessful, and
closed roles; standardized unframed indicators; opaque semantic tones; a
separate subtle countdown pill; and motion only for short indeterminate
processing. The pill remains intrinsically sized to its contents even when it
is placed directly in a stretching grid or flex context. This promotion does
not generalize category labels, counts,
qualifiers, removable chips, proposal progress, or outcome-detail composition,
and it does not imply production adoption.

On 2026-09-03, exact compact geometry was reopened for human review after
Lifecycle Status needed to sit beside the canonical 28px micro action in dense
automated-mint order metadata. The lab now trials a 28px intrinsic height with
10px leading and 12px trailing inset when an indicator is present, and 12px on
both sides without one. The accepted roles, tones, indicators, motion rules,
and 12px label remain unchanged. This trial does not replace the reviewed 24px
decision until human visual review accepts it.

## 2026-08-18 — Structural content regions and interactive Cards are separate jobs

Square white page regions, the ordinary 24px content axis, layout-owned
substrate-reveal corners, and the absence of a default nested-card treatment are
already foundation decisions. They do not require a universal Card component.

Repeated interactive objects remain a component-level job. The Home feature
card is authoritative existing design rather than an unresolved alternative.
Its V1 review is delta-based: judge only the accepted square outer structure,
4px shell inset with square inner media (September 14 refinement below), 24px primary and supporting-row content
axes, 16px internal-region gap, and 8px directly related content gap. The title
flows without a hidden fixed-height reservation: both Home and Discover measure
16px from the complete top row to the name and 8px from the name to its market
row; Discover's taller chart therefore creates the appropriate additional
distance from its smaller logo without a separate spacing rule. Full chart
density and launch treatment, identity and
market context, exposure ticker, transcript/video, chain variants, and
whole-card interaction form a preservation contract and cannot be removed just
because a static lab moment does not expose them. The compact Discover treatment
is supporting adaptation evidence. The legacy shared Card default remains
evidence only: it is not a migration target, and this review does not change
production adoption or define non-media card families.

## 2026-09-14 — Highlighted-card framing stays separate from chart geometry

The user accepted, for now, a square outer shell and square inner media with a
4px card-colored surround, replacing the earlier 8px inset/rounded-media delta.
The beige-to-card gradient begins immediately inside that surround. Identity
content stays 24px from the outer edge; the plot spans the gradient width.
The gradient and thin frame distinguish highlighted cards without a rounded
cutout whose contrast disappears into the fade. These are highlighted-card
context rules, not chart-owned padding or a universal Card API. The chart lab
shows the revised excerpt; the earlier full-card study is historical framing
evidence until explicitly refreshed. Production adoption remains separate.

## 2026-08-19 — V1 work is canonical-first and feedback updates its owner

Design-system work now begins by synthesizing the strongest complete candidate
from existing audits, accepted foundations, reusable components and recipes,
and strong product evidence. Decision lanes apply only to the meaningful
judgment left after that synthesis and self-review; they are not a question-first
runway. Current Review therefore contains a nearly complete candidate at the
boundary of what Codex can confidently resolve, not every unfinished slot.

After meaningful feedback, classify it as local, component,
pattern/composition, foundation, or reusable heuristic and update the most
reusable justified owner immediately. Unrelated consumers, documentation,
baselines, and broad verification may be reconciled at the next synchronization
boundary. A `canonical-candidate` is a reusable implementation, while a
`current-baseline` is the human-reviewed visual contract that new work inherits;
implementation alone cannot make a dependency authoritative. Studies remains
reserved for genuine alternatives, high-impact ambiguity, and active pressure
tests.

## 2026-08-19 — Current baselines compound without becoming permanent

Design authority is independent from rendered output, reusable implementation,
and production adoption. A `current-baseline` is the authoritative answer that
new work inherits today; realistic composition or later design feedback may
still revise its owning foundation, component, or recipe. Exploratory work does
not become authoritative merely because it renders, and a reusable candidate
does not become authoritative merely because code exists.

When downstream work needs a dependency, resolve an undefined prerequisite,
promote an existing but non-consumable baseline into the smallest justified
reusable component or recipe, or consume the existing reusable source directly.
Do not reconstruct an accepted treatment locally. The contained-selection
visual language is the first explicit recipe boundary: its compact/default
geometry and states live in
`src/components/design-system-v1/contained-selection.ts` and are consumed by
SingleChoice. Its 2px track inset is also the 2px gap between items so adjacent
hovered and selected shapes remain optically distinct. The default layout is
intrinsic: the track wraps its items and each item wraps its content. An
explicit full-width layout makes the track fill its parent and all peer items
grow equally while their accepted geometry fits. Below that readable minimum,
the full-width track preserves intrinsic peer geometry, scrolls horizontally,
and reveals the selected option rather than compressing or wrapping labels. The
contained Tabs presentation is bound to
`src/components/design-system-v1/tab-presentation.ts`. Text-only Tabs were
subsequently removed from the Tabs baseline once their strongest assumed uses
were correctly classified and transferred to Segmented Control behavior.

SingleChoice exposes only the default 44px size for now. Compact or micro
versions should be added only when a real product use requires them rather than
preemptively expanding the component API.

## 2026-08-20 — Segmented Control presentations accepted

Segmented Control is the current V1 baseline for immediate selection among a
small set of peer modes. It owns the reviewed unframed text-only compact/default
treatment and the shared contained compact/default treatment without inheriting
Tabs panel semantics or SingleChoice form-value semantics. Intrinsic is the
ordinary text-only layout; the compact DTF overview chart range is the evidenced
full-width mobile case and distributes its peers across the available width.
Icons, counts, tiny sizing, routes, panels, and production adoption remain
outside the accepted contract.

## 2026-08-19 — SingleChoice default presentation accepted

The one-row submitted-value SingleChoice control is a current V1 baseline. It
uses the default 44px contained-selection geometry, 14px/500 labels, 20px item
padding, full radius, a 2px track inset and peer gap, and the shared intrinsic
versus equal-growth full-width rule. A full-width group falls back to intrinsic
horizontal overflow and keeps its selected option visible when its peers cannot
fit without breaking that geometry. Only this pill-style form-value job is
accepted; standard radio rows, rich choice cards, compact/micro sizes, and
production adoption remain open until real usage requires them.

## 2026-08-19 — Repeated preset-or-custom form composition accepted

The repeated governance-parameter composition is an accepted V1 pattern. It
uses the 24px contained-form inset and complete-group rhythm without nested
tinted cards or divider-dependent grouping. `PresetOrCustomField` composes the
accepted SingleChoice and TextInput controls as two mutually exclusive sources
for one value: typing selects an explicit Custom option, choosing a preset
clears custom entry, and Custom owns custom validation. At constrained widths
the controls stack at full width; SingleChoice preserves its 44px geometry and
uses selected-option-aware horizontal overflow when its peers cannot fit.
Business validation and governance semantics remain feature-owned, and no
production consumer is adopted by this decision.

## 2026-08-19 — Read-only fields stay context-neutral

The shared Field/TextInput candidate does not add a lock icon automatically for
`readOnly`. Read-only behavior and the quiet non-editable surface belong to the
component; a lock or permission explanation belongs to the composition only
when the reason is important or surprising. A summary/review display should use
an information or key/value row rather than a read-only input. Disabled fields
preserve visible values and use the shared disabled treatment; form submission
progress remains owned by the action or form lifecycle rather than becoming a
generic field state.

## 2026-08-19 — Field and TextInput baseline accepted

The ordinary short-value Field/TextInput anatomy is a current V1 baseline:
visible 14px/500 labels; 16px/300 entered values; 14px/300 supporting and error
copy; an 8px label/control/help relationship; a 44px fully rounded control;
20px ordinary horizontal inset; and semantic invalid, read-only, and disabled
states. Labels and supporting text align to the control's outer edge rather
than its internal value text so forms retain one stable content axis. Leading
and trailing adornments are supported without becoming required decoration.
Multiline inputs, repeated parameter compositions, business validation, and
production adoption remain separate.

## 2026-08-20 — Textarea baseline accepted

Textarea extends the accepted Field anatomy rather than creating another field
family. It uses the restrained 8px contained-object radius, the shared 20px
ordinary horizontal field inset, a 16px multiline vertical inset, 16px/300
content, vertical resize, and the inherited invalid, read-only, and disabled
states. Character count, rich text, surrounding form composition, and
production adoption remain outside the accepted contract.

## 2026-08-20 — Switch and disabled structure baseline accepted

Switch is the current V1 baseline for an immediate boolean setting. The track
is 36×20px with a 16px thumb and a consistent 2px inset; a labeled row owns the
44px interaction target and 8px switch-to-label relationship. Enabled on uses
the active primary fill while enabled off remains neutral.

Disabled controls preserve their stored on/off value through position and an
inverse neutral treatment rather than active color, blanket opacity, a border,
hover, or elevation. The accepted opaque `disabled-structure` role is a 60/40
mix between the supporting neutral and quiet disabled surface, owned by the
semantic disabled recipe rather than Switch-local styling. Async recovery,
settings-row composition, and production adoption remain outside this
baseline.

## 2026-08-20 — Pagination baseline accepted

Pagination is the current table-independent V1 baseline. It uses 1-based
callbacks, optional page-size selection, a seven-item desktop and five-item
mobile page window, and one 32px compact control height across page actions and
the compact Select. Previous and Next remain fixed-width edge actions rather
than stretched mobile surfaces. Available navigation uses quiet actions, the
current page is a non-clickable neutral selection, and unavailable quiet
actions are bare and muted rather than inheriting the bordered disabled-control
treatment.

Pagination owns only row geometry and peer relationships; its host owns the
surrounding inset. The lab uses the accepted equal 24px ordinary-content inset,
while the existing DataTable footer retains its production composition until a
deliberate adoption pass. Shared 44px mobile hit-target expansion is
intentionally deferred to the accessibility pass rather than implemented as a
local Pagination exception. Loading, filter-reset behavior, DataTable adoption,
and production migration remain outside this baseline.

## 2026-08-19 — ActionGroup composition baseline accepted

ActionGroup is a current V1 baseline for ordinary related actions. Horizontal
groups remain intrinsic-width and do not wrap into ragged partial stacks.
When a narrow composition deliberately switches to vertical actions, every
action takes the same full width. Both directions use the accepted 8px peer
gap. Button continues to own hierarchy, size, tone, and state; transaction
lifecycle and persistent or floating action wrappers remain outside this
recipe. Production adoption has not started.

The state-sheet action labels are relationship evidence, not an accepted
completion-state design. Action choice, order, copy, and icon use remain owned
by the real composition and must be reviewed there when that flow is addressed.

## 2026-08-19 — Explanatory HelpTooltip baseline accepted

Explanatory help uses a bare 16px help glyph beside the owning field or metric
label, with a 4px visible relationship and an approximately 44px invisible
interaction target. The Radix-backed floating surface supports hover, focus,
and explicit click or touch persistence. Essential instructions remain visible;
accessible action names and transient action feedback stay with their owning
components rather than becoming HelpTooltip variants.

The surface uses bounded dynamic width rather than a fixed or minimum width:
short explanations size naturally, while longer explanations wrap at the
smaller of a 340px maximum or Radix's available collision-aware viewport width.
Normal wrapping is retained because balancing lines inside a shrink-to-fit
popover can leave the surface substantially wider than its rendered text. Other
tooltip jobs, long educational content, responsive drawer substitution, and
production adoption remain outside this baseline.

## 2026-08-19 — Stacked identity separators preserve artwork size and axis

Chain and token stacks share one canonical frame model. The requested size
describes the identity artwork itself; a 2px surface-colored separator wraps
outside that artwork rather than shrinking it. The stack optically compensates
for the first separator so its first artwork aligns with a singular identity on
the same content axis. Chain frames retain proportional rounded-square geometry
and token frames remain circular. Overlap stays component-owned and can vary by
stack size or composition. Existing legacy product consumers are not migrated
by this decision.

## 2026-08-19 — Bounded-value Select baseline accepted

Bounded-value Select uses the accepted 44px default Field geometry and an
evidenced 32px compact utility size. The popup sits 8px from its trigger with an
8px outer radius and 4px nested option radius; 40px options use the shared
subtle interaction surface, retain a persistent right-side selected check, and
support canonical leading identity without redefining identity geometry.

Width and labeling remain composition-owned. Form fields may use an external
label; self-describing filters may use a standalone trigger with a stable
accessible name. A context label inside the trigger is permitted only when a
real ambiguous-value composition warrants it and does not create another Select
variant. Compact bounded utilities reserve enough width for their widest known
option instead of resizing when selection changes. Searchable choices,
multi-value selection, action menus, native-select policy, mobile substitution,
and production adoption remain separate.

## 2026-08-20 — SearchField baseline accepted

SearchField is a current V1 baseline for standalone query entry. It composes the
accepted 44px TextInput and IconButton sources, owns a 16px leading search mark,
an optional clear action that returns focus, and a non-interactive loading
indicator while retaining the editable query. One size covers the product use
currently evidenced; a compact size waits for a real dense-toolbar requirement.
Result lists, grouping, empty-result recovery, navigation Command, multi-select,
Asset picker behavior, responsive substitution, and production adoption remain
owned by their surrounding compositions.

## 2026-08-20 — Contained Tabs baseline accepted

Tabs use the contained-selection language for genuine content-panel switching,
with compact 32px and default 44px sizes plus intrinsic and equal-growth
full-width layout settings. The reusable component retains Radix tab, panel,
and keyboard behavior. Active labels use foreground rather than primary blue.

Text-only Tabs are not part of the current V1 contract. Their strongest prior
evidence—chart ranges and adjacent immediate choices—belongs to Segmented
Control, where the reviewed unframed compact/default visual treatment remains
available under the correct semantics. Current real panel evidence supports
contained Tabs. Quiet text-only panel navigation, tiny Tabs sizing, counts,
routes, deep links, and new overflow behavior may be added only when a real
composition requires them. Production adoption remains unchanged.

## 2026-08-21 — Navigation Link baseline accepted

Link is the current V1 baseline for navigation to routes, resources, and content
locations. Inline links inherit their reading typography and remain underlined;
standalone resource links use the 14px/500 compact-structure role with a 4px
relationship between the label and an optional destination icon. The evidenced
named-return treatment is unframed, uses the 14px/300 supporting role with the
same 4px leading-arrow relationship, and promotes to primary with an underline
on hover or focus. It is not a universal Back default: compact headers whose
parent is already obvious use the canonical framed IconButton instead.

Ordinary routes omit icons by default. ArrowRight may add forward emphasis,
ArrowLeft identifies return navigation, ArrowUpRight signals a new-tab or
external destination unless its outcome has a more specific icon, and Download
is reserved for real file or resource outcomes. Native and Router anchors retain
their semantics. External resources merge secure rel tokens and require
caller-owned localized new-window announcement copy. Button-shaped navigation
composes canonical Button through `asChild`; it does not create a parallel Link
appearance. Current and visited state, unavailable destinations, recurring
Product Navigation, Tabs, breadcrumbs, analytics policy, and production
adoption remain outside this baseline.

## 2026-08-21 — Informational Accordion baseline accepted

Accordion is the current V1 baseline for coordinated informational FAQ and
product-detail sets. It owns the divider-free 48px trigger cadence, 16px
row/content axis, 8px title-to-body relationship, 20px body-to-next-title
rhythm, 16px/500 item title, 14px/20px supporting content, trailing unframed
chevron, semantic states, and 180ms disclosure motion. Card framing and hosted
content remain composition-owned; task progress, validation, editing, and
actions are not Accordion variants.

Callers choose `single` or `multiple` explicitly. Multiple is the ordinary
informational recommendation because independently useful answers remain open
for comparison. Single is reserved for mutually substitutive or unusually long
regions where simultaneous expansion harms navigation. One independent region
uses Collapsible rather than an Accordion containing one item. This acceptance
does not migrate production consumers.

## 2026-08-21 — Independent Collapsible baseline accepted

Collapsible is the current V1 baseline for one independently controlled
disclosure. It consumes the accepted Accordion trigger, content, chevron,
focus, and 180ms motion presentation without inheriting coordinated-set
semantics. Trigger copy names the hidden subject. An optional caller-owned
closed/open cue may clarify the action, stays muted at rest, becomes primary on
hover or keyboard focus, and hides below the small breakpoint where the nearby
chevron and clear subject label carry the affordance.

The primitive owns no product-copy defaults, surrounding frame, or revealed
content anatomy. Native `details`, bespoke composition triggers, auction
fields, bid lists, executable code, diagnostics, and production adoption remain
outside this acceptance.

## 2026-08-25 — Global and Product navigation baselines accepted

Global navigation and Index DTF Product navigation are separate current V1
baselines. They were judged together because both appear in the application
shell, but neither component owns or inherits the other's hierarchy. Global
navigation owns the non-wrapping desktop destination row, grouped overflow,
application-control separation, and constrained-screen global menu. Product
navigation owns DTF identity and switching, the expandable desktop rail,
public row-specific activity, compact 30-day switcher performance, and the
detached mobile DTF switching and page-navigation entry points.

The accepted mobile presentations consume the canonical Drawer behavior and
keep navigation landmarks limited to destinations; copyable token contracts
remain supplementary actions. At constrained widths, the Reserve wordmark
compresses before account identity, and public activity appears only on its
specific opened destination row rather than on the closed page-navigation
trigger. Route taxonomy, live DTF inventory and ranking, domain-event sourcing,
analytics, account-menu behavior, navigation-specific geometry promotion, and
production adoption remain outside this acceptance.

## 2026-08-27 — Canonical-first ownership resolves by semantic specificity

Canonical-first does not mean that the broadest generic canonical component
always owns a more specific composition. Use the narrowest established owner
whose semantics, anatomy, and geometry match the job. If consuming a generic
component requires locally negating its defining defaults, preserve the generic
owner and give the specific composition an explicit local owner instead of
turning the override into an unnamed variant.

Vote Lock exposed the boundary: `DialogSurface` contributes the shared 8px
outer inset and ordinary `DialogHeader` contributes 16px internally for the
ordinary 24px dialog axis, while the established compact Zapper transaction
composition uses 8px internally for a 16px total axis. Vote Lock may use an
explicit local compact transaction-header owner where that more specific
composition is the relevant evidence. Two transaction examples do not yet
promote a universal transaction-header component or recipe.

## 2026-08-31 — Transaction amount regions use square structural geometry

Transaction amount input/output regions are structural financial objects, not
ordinary atomic fields or generic contained panels. They use 0px radius across
editable, read-only, submitted, and replacement states. A loading animation or
other state layer that replaces an amount region preserves the same square
boundary so lifecycle changes do not change the object’s geometry.

This supersedes only the composite-amount clause in the 2026-08-13 radius
decision. Ordinary one-row Fields—including Delegation address inputs—remain
fully rounded; multiline fields and floating contained objects retain the 8px
role. Asset selectors, status pills, and other controls inside an amount region
retain their own component-owned radii. This decision changes the unadopted V1
transaction candidate and lab compositions, not production transaction flows.

## 2026-09-04 — Transaction amount regions use restrained 8px geometry

Human review reversed the square transaction-amount experiment. Transaction
amount input/output regions use the restrained 8px contained-object radius
across editable, read-only, submitted, and replacement states. A loading
animation or other state layer that replaces an amount region preserves the
same 8px boundary so lifecycle changes do not change the object’s geometry.

This supersedes the 2026-08-31 square transaction-amount decision. Ordinary
one-row Fields—including Delegation address inputs—remain fully rounded;
structural page sections remain square unless their owner says otherwise.
Asset selectors, status pills, and controls inside an amount region retain
their component-owned radii. This changes the unadopted V1 candidate and lab,
not production transaction flows.

An empty editable amount keeps `0` as the primary-value placeholder and shows
the corresponding zero-valued financial estimate in its supporting row—for
example, `$0.00` for USD. The supporting value must not disappear merely
because the input is empty. The flow's value formatter owns this truth because
the generic amount object also supports non-currency explanations and errors.

## 2026-09-04 — Transaction metrics resolve meaning before color

Transaction compositions must not infer color from a displayed plus or minus
sign. Production contracts use different sign conventions, and a setting,
estimate, warning threshold, and realized result do not carry the same meaning.
Slippage settings, limits, and routine projected impact remain neutral.
Elevated preflight risk uses warning; critical risk uses danger together with
explicit explanatory or consequential UI rather than relying on color alone.
Projected favorable impact normally remains neutral so an estimate is not
endorsed as a gain.

Meaningful realized favorable or adverse movement uses the existing financial
performance palette, which remains separate from success and error feedback.
Negligible routine variance may remain neutral. When an actual value replaces
an estimate, the superseded quote becomes supporting and struck through while
the actual value becomes dominant. Thresholds and materiality remain
flow-owned. The transaction lab expresses this through a local semantic value
recipe whose callers provide `neutral`, `realized-favorable`,
`realized-adverse`, `caution`, `critical`, or `superseded`; the recipe never
derives meaning from the raw number. This is an unadopted composition rule and
does not restyle production consumers or change shared component defaults.

## 2026-08-31 — Copyable Value supports an integrated dense-row treatment

The accepted Copyable Value keeps its existing separated treatment as the
default: formatted value plus canonical micro copy control. Dense aligned facts
may opt into an integrated treatment when a separate icon button would enlarge
or visually unbalance an otherwise 20px row. That treatment is one semantic
20px action containing the 14px monospace value and a 14px copy/check icon at an
8px relationship gap. The whole action owns hover, focus, click, the expanded
interaction target, and the existing transient Tooltip/live-region feedback.
Copy success replaces the icon at the same size so row geometry does not move.

The full normalized value remains the copied and accessible value; deliberate
visible shortening remains unchanged. This does not turn a whole fact row into
a copy target, replace the default treatment, authorize copy changes, or make
Copyable Value own a parent list/grid. Delegation outcomes provide the second
dense aligned composition after DTF token-address pressure, but production
adoption remains separate.

## 2026-09-01 — Subtle substrate is an opaque attached-surface role

`substrate-subtle` is the accepted opaque surface for shallow regions that are
visually attached beneath or behind a card-colored task surface. It creates
quiet depth without inheriting the color of whatever happens to sit below it.
It is not the ordinary grouping fill, a replacement card color, an interaction
state, or a softer alias for `secondary`; beige `secondary` retains its stronger
structural role for major section separation and revealed page depth.

The initial value is the opaque midpoint between the active theme's card and
secondary colors. The semantic role, not that derivation, is the durable
contract. New use requires the same attached-surface relationship rather than
mere preference for a near-white beige.

## 2026-09-01 — Transaction progress and action-slot ownership

Once an ordered transaction sequence is underway, the action slot remains
stable when a later step will require another user click. While the current
transaction processes, that slot uses a loading Button retaining the initiated
action's hierarchy; once ready, it becomes the next actionable control. Human
review on 2026-09-08 supersedes the earlier subdued-approval treatment: active
primary approvals and final transactions both retain primary color, while
spinner, busy semantics and blocked repeat clicks communicate waiting. Upcoming
actions blocked by prerequisites stay disabled and neutral. This is composition
guidance, not a change to shared Button defaults. The progress region still owns the sequence and
lifecycle truth. It replaces inactive action chrome when remaining steps
continue automatically, avoiding a duplicate loading Button where no later
manual action is expected.

Sequential progress and pre-submit advisories may share attached-region frame,
surface, and depth geometry while retaining separate semantic owners and
content anatomy. Transaction outcomes share a no-shrink minimum frame so a
result does not contract below the preceding task. The organic brand surface is
an immediate-result treatment; delayed initiation uses the same stable shell
with explicit pending/countdown semantics rather than borrowing immediate
completion motion. Vote Lock's 448px address-heavy width and the compact bare
advisory dismiss treatment remain local pending more evidence.

## 2026-09-01 — Inline Message supports full and compact-summary presentations

Inline Message is an accepted, unadopted component with two presentations. The
full presentation keeps material explanation, instructions, recovery, and
lifecycle truth visible. The opt-in compact summary places one concise state or
qualification on a single row and may move only supporting explanation into an
adjacent Help Tooltip. A tooltip must never hide information needed to decide,
act, recover, or understand the transaction's state.

The component continues to own feedback anatomy and tone, not product copy,
acknowledgement policy, dismissal, recovery behavior, or transaction
orchestration. Production adoption remains explicit and product-owned.

The summary presentation may opt into a contained leading icon when a semantic
symbol balances a trailing compact action. The contained treatment uses a 32px
tone-colored circle, a 16px glyph, and 8px outer inset. Plain remains the
default, and full messages retain their existing icon anatomy.

## 2026-09-14 — Current table work approved for now

The user approved the current table lab to move on to charts. Accept the retained
Portfolio/withdrawal, Holdings, Discover, Earn/DeFi/owned-position and governance
record presentations, plus the near-term current/history auction tables, in their
current reviewed scope. This includes the accepted warm content hover and recent
governance status/timing refinement. It is a revisitable visual baseline, not a
claim that every production state or surrounding screen was reviewed.

Do not promote the unfinished current-auction workspace or older auction record
alternatives. Initial auction-table migration still retains the existing detail
and transaction flow; source identity, permission, timing, math and action gates
remain engineer-owned. Dated lab detail references are not a working adapter.
Do not infer a universal Table/Row API, new shared defaults, global pill geometry
approval, chart acceptance or production adoption. Missing/failed data integration,
real pagination/recovery and the central engineering register remain separate.

The original table studies remain available at commit `2bfca0d1c`; later
corrections may reopen a bounded part of their visual baseline.

## 2026-09-16 — Current chart work approved for now

The user approved the current chart lab as the revisitable visual baseline. The
accepted scope is the source-based Overview line and candlestick presentations,
Home and Discover chart contexts, the Yield metric family, Portfolio total and
composition, and the final responsive, spacing, timestamp and CSV treatments.
Freeze the current evidence as the record of that baseline; later corrections
may reopen a bounded part without reopening the whole chart review.

This is lab-only design authority, not production adoption. It does not approve
financial calculations, data semantics, source selection, freshness claims,
sampling policy, shared component defaults, or a global chart/categorical
palette. Provisional source, palette, stress-fixture and opt-in dependencies
remain adoption constraints. Engineer review stays deferred to project closeout
or a separately authorized production-adoption slice.

The original chart studies remain available at commit `2bfca0d1c`. The Storybook
cleanup preserves these design decisions without retaining every study as an
active application.

## 2026-09-18 — Storybook replaces the bespoke design-system lab

The user authorized removing the lab's excess infrastructure and moving component
review into Storybook. Real canonical components, accepted visual decisions and
useful behavioral checks remain; catalogs, review/status dashboards, parallel
transaction simulators and the in-product demonstration route are removed.
Storybook uses local examples with theme/viewport controls and a small Playwright
suite. It is the only active demonstration host, so changes do not need duplicate
lab and Storybook implementations. Product primitives keep their existing APIs
until callers are explicitly migrated.

Earlier decisions refer to the lab as the context in which visual choices
were accepted. Those choices remain valid; the old host, catalogs, source paths
and review machinery are historical evidence at commit `2bfca0d1c`, not current
usage instructions. [[design-system]] owns current commands and source locations.
