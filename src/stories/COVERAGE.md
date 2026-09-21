## Preserved design areas

The source baseline is commit `2bfca0d1c`, under `src/views/internal/design-system/`.
Original visual owners are reused when available. Story-only reference modules
preserve designs that have no adopted production owner. Existing acceptance does
not imply production adoption; transaction studies remain exploratory.

| Original area                                               | Storybook destination                                                                          | Preservation                                                                                                                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color foundation, meaning, performance and contrast studies | Foundations / Principles / Color; Applied studies / Contrast                                   | Semantic aliases, theme values, feedback versus financial performance, interaction states and contrast comparisons                                                                      |
| Typography study, contexts and refinements                  | Foundations / Principles / Typography; Applied studies / Typography contexts and refinements   | Full role scale, weights, numeric/identifier treatment, long-content examples                                                                                                           |
| Spacing and density                                         | Foundations / Principles / Spacing; Applied studies / Responsive insets and Row density        | Original grouping, inset, axis, single-line and rich-row examples                                                                                                                       |
| Shape and control geometry                                  | Foundations / Principles / Radius; Applied studies / Shape and Control geometry                | Atomic controls, contained objects, structural regions and size relationships                                                                                                           |
| Elevation, motion, iconography and accessibility            | Foundations / Principles; Applied studies / Elevation and Keyboard and meaning                 | Original visual studies, timing controls, reduced-motion choices, icon sizes and semantic cues                                                                                          |
| Page layout, workspace and workflow studies                 | Explorations / Layout                                                                          | Frames/regions, browse-and-inspect, governance, progressive workflow, full-width context and contained form rows                                                                        |
| Brand surfaces                                              | Foundations / Organic brand; Patterns / Market                                                 | Original component-owned animation and card compositions                                                                                                                                |
| Button, loading hierarchy, IconButton, ActionGroup          | Components / Button, Icon button, Action group; Applied studies / Button hierarchy and loading | Canonical variants, supported controls, unavailable/loading states and grouped hierarchy                                                                                                |
| Field, input, textarea, search, presets                     | Components / Text input, Textarea, Search, Preset or custom                                    | Labeled anatomy, read-only/disabled/error, search loading/clear/no-results and custom input                                                                                             |
| Select and MultiSelectFilter                                | Components / Select, Multi select filter                                                       | Placeholder/selected/identity, constrained content, disabled choices, minimum selection and apply/clear semantics                                                                       |
| Checkbox, switch, radio and segmented selection             | Components / Checkbox, Switch, Single choice, Segmented control                                | Controlled interactions, disabled on/off, compact/full-width and constrained tracks                                                                                                     |
| Link, tabs and pagination                                   | Components / Link, Tabs, Pagination                                                            | Treatments, external context, keyboard panels and first/middle/last/narrow pagination                                                                                                   |
| Menu, popover and help tooltip                              | Components / Menu, Popover, Help tooltip                                                       | Real popup primitives, placement, keyboard/dismissal and destructive/unavailable actions                                                                                                |
| Dialog, drawer and eligibility                              | Components / Dialog, Drawer                                                                    | Real overlays, compact/standard/non-dismissible, original attestation mock and long-body scrolling                                                                                      |
| Accordion and collapsible                                   | Components / Accordion, Collapsible                                                            | Real disclosure behavior and unavailable state                                                                                                                                          |
| Inline message, lifecycle, metric, copy, loading and empty  | Corresponding Components entries                                                               | Separate semantics, supported variants and actionable/missing/loading/empty states                                                                                                      |
| Information-row state sheet                                 | Patterns / Information row                                                                     | Original identity/metric rows, holdings context and narrow layout                                                                                                                       |
| Entity identity, token/chain stacks, fallback and accounts  | Components / Entity identity                                                                   | Original marks and geometry, long names, missing image, loading, chain/token stacks and account identity                                                                                |
| Global/product navigation and mobile utilities              | Patterns / Navigation                                                                          | Home without an active destination, expanding rail, DTF switcher, separate mobile global/product panels, connected and narrow headers, utility/language controls and copyable addresses |

## What stays retired

The old app route, standalone host, navigation shell, progress dashboards,
readiness/status catalogs, audit queues, capture infrastructure and tests that
asserted those structures are replaced by Storybook navigation, Docs, Controls
and focused browser checks. Their removal does not retire the visual examples
listed above. Historical alternatives are labeled as studies rather than
silently promoted to current production defaults.

## Market patterns

| Original presentation sources                                     | Storybook destination                                 | Preserved variants                                                                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `table-family/{positions,withdrawals,table,cells,fixtures}`       | Patterns / Market / Portfolio tables                  | Index/Yield positions, processing/completed withdrawals, loading, empty and long content                                            |
| Holdings table, tabs and specimens                                | Patterns / Market / Holdings                          | CMC20/PHOTON exposure/collateral, loading/performance-loading, newly added, missing, long and empty; full/836px/390px widths        |
| Discover table/cards, asset strip and organic card content        | Patterns / Market / Discover; Cards / Organic Content | Table, cards, phone layout, loading, inactive, missing and long content; actual Home/Discover brand cards                           |
| Earn, DeFi and owned-position tables/cells                        | Patterns / Market / Earn and owned positions          | Index/Yield governance, DeFi yield, vote locks, staked RSR, pending, missing, long, loading and empty                               |
| Governance proposal records and state fixtures                    | Patterns / Market / Governance records                | Standard/optimistic/contested, pending, voting, queue/wait/execute, executed, defeated, quorum failure, canceled and expired        |
| Current-auction workspace, table, detail, bids and weights editor | Patterns / Market / Auctions / Current                | All original table/detail scenes, data/viewer/network/outcome states, weight editor, bids, removal, liquidity and recovery          |
| Auction history and browse records                                | Patterns / Market / Auctions / History                | Completed/expired, ongoing, restricted/permissionless, metrics loading, zero activity, pressure and empty                           |
| `charts/{fixtures,panels,plot}` pressure states                   | Patterns / Market / Charts / Source States            | All 12 captured/neutral/zero/estimated/loading/empty/unavailable/delayed/interrupted/single/two-point/long cases; full/narrow/390px |
| Overview line/candle source studies                               | Patterns / Market / Charts / Overview                 | Canonical production bodies with original local data; line/candles and empty variants                                               |
| Home, Discover, Yield and Portfolio chart studies                 | Patterns / Market / Charts / Product Families         | Home/Discover, Yield price/APY/supply/staked RSR, Portfolio total/composition and empty states; full/narrow/390px widths            |

## Transaction references

Each family has named entry/recovery/outcome stories and a **state** control for
all original fixed states. These preserve the original presentation modules,
including amounts, assets, progress, orders, delegation, advisories and outcome
attachments. Actions are local visual demonstrations, not financial execution.

| Original presentation sources                | Storybook destination                              | Available states                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `transaction-composition-rfq*`               | Patterns / Transactions / Zapper and RFQ           | 20: quote search/review, routes, approvals/signing, RFQ/atomic execution and outcomes, failure/recovery/refund, advisories and support |
| `transaction-composition-manual-*`           | Patterns / Transactions / Manual Issuance          | 29: mint/redeem inputs, requirements, permissions/approvals, progress, recovery and outcomes                                           |
| `transaction-composition-staged-*`           | Patterns / Transactions / Automated Issuance       | 26: configuration, quote, approval/signing, orders filling, recovery and outcomes                                                      |
| `transaction-composition-stake*`             | Patterns / Transactions / Stake and Delegate       | 25: stake/unstake, approval, signing, pending/completion, delegation and recoveries                                                    |
| `transaction-composition-vote-lock*`         | Patterns / Transactions / Vote Lock and Delegation | 24: lock/unlock, approval/signing, sequential delegation, recoveries and outcomes                                                      |
| `zapper-modal-study`, `modal-geometry-study` | Explorations / Transactions / Modal Geometry       | Original quote specimen and historical 432px/384px continuity comparisons                                                              |

Transaction frame/current/predecessor contracts, paired-review dashboards,
coverage/status/pressure catalogs and the manual simulator are retired host or
process infrastructure. Their rendered transaction states live in the families
above. Eligibility remains under Components / Dialog; its historical legal copy
is a visual fixture, not current product policy.
