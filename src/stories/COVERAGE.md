## Preserved design areas

The source baseline is commit `2bfca0d1c`, under `src/views/internal/design-system/`.
Original visual owners are reused when available. Story-only reference modules
preserve designs that have no adopted production owner. Existing acceptance does
not imply production adoption; transaction studies remain exploratory.

| Original area                                               | Storybook destination                                                                                                      | Preservation                                                                                                                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color foundation, meaning, performance and contrast studies | Foundations / Principles / Color; Explorations / Foundation studies / Contrast                                             | Semantic aliases, theme values, feedback versus financial performance, interaction states and contrast comparisons                                                                                                        |
| Typography study, contexts and refinements                  | Foundations / Principles / Typography; Explorations / Foundation studies / Typography contexts and refinements             | Full role scale, weights, numeric/identifier treatment, long-content examples                                                                                                                                             |
| Spacing and density                                         | Foundations / Principles / Spacing; Explorations / Foundation studies / Responsive insets and Row density                  | Original grouping, inset, axis, single-line and rich-row examples                                                                                                                                                         |
| Shape and control geometry                                  | Foundations / Principles / Radius; Explorations / Foundation studies / Shape and Control geometry                          | Canonical control owners at supported sizes, contained objects, structural regions and size relationships                                                                                                                 |
| Elevation, motion, iconography and accessibility            | Foundations / Principles; Explorations / Foundation studies / Elevation and Keyboard and meaning                           | Original visual studies, timing controls, reduced-motion choices, icon sizes and semantic cues                                                                                                                            |
| Page layout, workspace and workflow studies                 | Explorations / Layout studies                                                                                              | Frames/regions, browse-and-inspect, governance, progressive workflow, full-width context and contained form rows                                                                                                          |
| Brand surfaces                                              | Foundations / Organic brand; Patterns / Market                                                                             | Original component-owned animation and card compositions                                                                                                                                                                  |
| Button, loading hierarchy, IconButton, ActionGroup          | Components / Actions / Button, Icon button, Action group; Explorations / Foundation studies / Button hierarchy and loading | Canonical variants, left/right icon placement, connected controls, unavailable/loading states and grouped hierarchy                                                                                                       |
| Field, input, textarea, search, presets                     | Components / Fields and selection / Text input, Textarea, Search, Preset or custom                                         | Labeled anatomy, read-only/disabled/error, search loading/clear/no-results and custom input                                                                                                                               |
| Select and MultiSelectFilter                                | Components / Fields and selection / Select, Multi select filter                                                            | Placeholder/selected/identity, constrained content, disabled choices, minimum selection and apply/clear semantics; standard 44px Field trigger                                                                            |
| Checkbox, switch, radio and segmented selection             | Components / Fields and selection / Checkbox, Switch, Single choice; Navigation and disclosure / Segmented control         | Controlled interactions, disabled on/off, compact/full-width and constrained tracks                                                                                                                                       |
| Link, tabs and pagination                                   | Components / Actions / Link; Navigation and disclosure / Tabs, Pagination                                                  | Treatments, external context, keyboard panels and first/middle/last/narrow pagination                                                                                                                                     |
| Menu, popover and help tooltip                              | Components / Actions / Menu; Feedback and overlays / Popover, Help tooltip                                                 | Real popup primitives, placement, keyboard/dismissal, destructive/unavailable actions and labeled Field trigger                                                                                                           |
| Dialog, drawer and eligibility                              | Components / Feedback and overlays / Dialog, Drawer                                                                        | Real liquidity-simulation editing task; eligibility disclosure; CFB whitepapers; NVIDIA/Ondo and BTCB/bridge asset information                                                                                            |
| Accordion and collapsible                                   | Components / Navigation and disclosure / Accordion, Collapsible                                                            | Multiple (recommended) and single sets, real disclosure behavior and unavailable state                                                                                                                                    |
| Inline message, lifecycle, metric, copy, loading and empty  | Corresponding Components entries                                                                                           | Separate semantics, supported variants and actionable/missing/loading/empty states                                                                                                                                        |
| Information-row state sheet                                 | Retired 2026-10-28; superseded by Patterns / Market / Holdings                                                             | Identity/metric rows are covered by the accepted Holdings table and its phone layout                                                                                                                                      |
| Entity identity, token/chain stacks, fallback and accounts  | Components / Data display / Entity identity                                                                                | Original marks and geometry, long names, missing image, loading, chain/token stacks and account identity                                                                                                                  |
| Global/product navigation and mobile utilities              | Patterns / Navigation                                                                                                      | Home without an active destination, expanding rail, DTF switcher, separate mobile global/product panels, connected and narrow headers, unclipped utility/language controls, short-screen scrolling and copyable addresses |

## Component adoption and pending explorations

Toast is under Components / Feedback and overlays. Its story exercises the same
Sonner host used by the app, including brief and described success/error states.
Dashboard (unreviewed) groups the activity dashboard proposal behind an Overview:
Activity chart is the
shared chart panel, legend and inspection with a daily category bar chart in
stacked and diverging layouts, volume and count, 7 days to one year (weekly) and
loading, empty and unavailable states. Foundations / Principles / Color lists the
proposed data series slots. Dashboard (unreviewed) / eUSD activity layout
composes volume and count panels under one period control with a map placeholder.
Slider (Components / Fields and selection) and Progress indicator (Components /
Feedback and overlays) are accepted; their stories reuse canonical primitives
without changing product defaults. Slider offers optional exact entry with native
validation; Progress leads with a stacked Index proposal-details
voting card, including standard/optimistic snapshots and independent current/final
phase controls, 4px square rails and zero/1%/99%/51%/opposition boundaries.
Majority uses a consistent For basis with explicit ties; generic/contextual
quorum share status tones and known zero challenges are neutral. Criteria and
vote totals use two groups with one seam and no vertical divider; unavailable
targets retain known amounts with explicit wording. Examples stay focused on the
voting card and its states; the rejected surrounding page example was removed.
Generic threshold meters, measured completion and unknown-duration
Spinner remain available; proposal-list lifecycle indicators retain their owner.
Their Docs and the design-system guide record scope
and remaining acceptance decisions.

Dialog is the V1 modal: centered on desktop, bottom sheet on phones. Drawer Docs
show only the phone navigation panels in a phone frame; there is no desktop Drawer.
Dialog Docs leads with the real liquidity-simulation task: canonical controls,
exact integer entry/coarse slider adjustment, bounds, and apply versus dismiss.
Title-row and topic-icon headers are working variants of that same task.
Header-only guidance shows both, the existing bordered transaction controls, and
an inert, explicitly incorrect empty-row example. Documentation panels are
separate from the white header specimens on neutral stages; the Avoid panel has
a destructive outline, heading and crossed-circle marker outside its specimen.
Eligibility uses the standard 432px desktop width without row dividers.
Jurisdictions expand inline as semicolon-separated entries wrapping naturally
at the existing supporting-text size. The expanded heading/list align
with the confirmation text using the 40px indent;
there is no inner cap, scroller or fade. Canonical DialogBody handles short-screen
overflow above the fixed confirmation area. The muted centered disclosure
preserves checkbox selections and retains focus; the external link is unchanged.
The form retains first-line checkbox alignment and 20px group gaps.
Policy copy, type sizes, palette and mobile insets are retained.
Informational examples include grouped CFB whitepaper versions/PDF links and a
canonical V1 Collapsible changes disclosure. Asset information leads with the
source-grounded NVIDIA/Ondo comparison, plus a BTCB/Bitcoin bridge variant.
Reference/held identity regions keep their group labels without right-side context
chips; the held token uses a chain badge with chain and inline address copy as
supporting text. The title names the asset; provider explanation precedes
docs/risk actions. Whitespace separates groups within one continuous white body; canonical
identity/copy/link owners replace legacy modal framing. Beige hairline dividers
are not used inside these dialogs. Active tab content determines natural height; the canonical body handles overflow
while inactive content unmounts.
Accepted 2026-10-28 (presentation only); the examples use captured source data.

Zapper and RFQ includes a Bounded dialog proposal using the canonical Dialog
around the same transaction content, with one frame inset, real focus/dismissal
behavior and viewport scrolling. Existing standalone/embedded references retain
their geometry and all five transaction families retain their distinct mechanics.

## Screen layout proposal and pilots

The Index DTF overview region proposal is under Explorations / Screen layouts /
Index DTF overview. It exposes page-geometry choices. The partial screen under
Explorations / Screen pilots / Index DTF overview tries the recommended settings
with the shared lab navigation compositions, the complete PHOTON chart, Holdings and the
existing pre-quote zapper card in the desktop support column. The zapper retains
its CMC20 fixture; PHOTON trading and compact trade entry remain outside this pilot.
Docs and the pilot plan enumerate other sections that need visual review. Neither
example changes production or approves geometry.

The pilots share the accepted 20px mobile section/header inset. Navigation has
both the retained compact example and a native 44px floating example with
translated action-label pressure cases. Breakpoint transitions close displaced
navigation overlays and transfer focus to a visible equivalent.
The mobile/accessibility spec runs in Chromium and mobile WebKit, covering larger
default fonts, short-screen focus, persistent search/drawer openers and measured
clearance around fixed controls. Holdings facts retain paired alignment at ordinary
phone widths and stack for enlarged text. Physical-device acceptance and the
preserved palette's contrast findings remain separately documented.

Explorations / Screen pilots / Participate and Earn is a separate full-page
demo using the same global header and the existing Index/Yield Earn and DeFi
tables. Category tabs (Select on phones), search, DTF/network filters (chain
Select on phones), a full-width Index/Yield compact sort dropdown, fixture states and
wallet columns can be reviewed in Docs or full screen. FAQs/graphics, DeFi
asset-type shortcuts and featured content remain deferred; its page arrangement
is a trial.

## What stays retired

The old app route, standalone host, navigation shell, progress dashboards,
readiness/status catalogs, audit queues, capture infrastructure and tests that
asserted those structures are replaced by Storybook navigation, Docs, Controls
and focused browser checks. Their removal does not retire the visual examples
listed above. Historical alternatives are labeled as studies rather than
silently promoted to current production defaults.

## Market patterns

| Original presentation sources                                 | Storybook destination                                         | Preserved variants                                                                                                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `table-family/{positions,withdrawals,table,cells,fixtures}`   | Patterns / Market / Portfolio tables                          | Index/Yield positions, processing/completed withdrawals, loading, empty and long content                                                                                    |
| Holdings table, tabs and specimens                            | Patterns / Market / Holdings                                  | CMC20/PHOTON exposure/collateral, loading/performance-loading, newly added, missing, long and unavailable; full/836px/390px widths; canonical panel/visible-tab association |
| Discover table/cards, asset strip and featured card           | Patterns / Market / Discover                                  | Table, cards, phone layout, loading, inactive, missing and long content; featured card with transcript and launch chart                                                     |
| Earn, DeFi and owned-position tables/cells                    | Patterns / Market / Earn and owned positions                  | Index/Yield governance, DeFi yield, vote locks, staked RSR, pending, wallet loading, sparse, missing, long, loading and empty                                               |
| Governance proposal records and state fixtures                | Patterns / Market / Governance records                        | Standard/optimistic/contested, pending, voting, queue/wait/execute, executed, defeated, quorum failure, canceled and expired                                                |
| Active and upcoming auction table                             | Patterns / Market / Auctions / Active and upcoming auctions   | Accepted table states for all, restricted and permissionless auctions                                                                                                       |
| Alternative auction detail workspace, bids and weights editor | Explorations / Auctions / Auction detail workspace            | In-progress detail scenes, data/viewer/network/outcome states, weight editor, bids, removal, liquidity and recovery                                                         |
| Completed and expired auction records                         | Patterns / Market / Auctions / Completed and expired auctions | Completed/expired, ongoing browse variant, restricted/permissionless, metrics loading, zero activity, pressure and empty                                                    |
| `charts/{fixtures,panels,plot}` pressure states               | Patterns / Market / Charts / Source states                    | All 12 captured/neutral/zero/estimated/loading/empty/unavailable/delayed/interrupted/single/two-point/long cases; full/narrow/390px                                         |
| Overview line/candle source studies                           | Patterns / Market / Charts / Overview                         | Canonical production bodies with original local data; line and candles (empty and unavailable states live in Source states)                                                 |
| Home, Discover, Yield and Portfolio chart studies             | Patterns / Market / Charts / Product families                 | Home/Discover, Yield price/APY/supply/staked RSR and price empty, Portfolio total/composition and empty states; full/narrow/390px                                           |

## Transaction references

Each family has named entry/recovery/outcome stories and a **state** control for
all original fixed states. These preserve the original presentation modules,
including amounts, assets, progress, orders, delegation, advisories and outcome
attachments. Actions are local visual demonstrations, not financial execution.

| Original presentation sources                | Storybook destination                                            | Available states                                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `transaction-composition-rfq*`               | Patterns / Transactions (In progress) / Zapper and RFQ           | 20: quote search/review, routes, approvals/signing, RFQ/atomic execution and outcomes, failure/recovery/refund, advisories and support |
| `transaction-composition-manual-*`           | Patterns / Transactions (In progress) / Manual issuance          | 29: mint/redeem inputs, requirements, permissions/approvals, progress, recovery and outcomes                                           |
| `transaction-composition-staged-*`           | Patterns / Transactions (In progress) / Automated issuance       | 26: configuration, quote, approval/signing, orders filling, recovery and outcomes                                                      |
| `transaction-composition-stake*`             | Patterns / Transactions (In progress) / Stake and delegate       | 25: stake/unstake, approval, signing, pending/completion, delegation and recoveries                                                    |
| `transaction-composition-vote-lock*`         | Patterns / Transactions (In progress) / Vote lock and delegation | 24: lock/unlock, approval/signing, sequential delegation, recoveries and outcomes                                                      |
| `zapper-modal-study`, `modal-geometry-study` | Explorations / Transactions / Modal geometry                     | Original quote specimen and historical 432px/384px continuity comparisons                                                              |

Transaction frame/current/predecessor contracts, paired-review dashboards,
coverage/status/pressure catalogs and the manual simulator are retired host or
process infrastructure. Their rendered transaction states live in the families
above. Eligibility remains under Components / Feedback and overlays / Dialog;
its historical legal copy is a visual fixture, not current product policy.
