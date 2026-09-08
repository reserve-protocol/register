# Manual issuance design-system readiness

## Goal

Keep the production audit, reuse boundaries, and geometry owners for Manual
Mint/Redeem in one source-backed reference. The initial readiness audit and
two-anchor proof are complete. Current lifecycle implementation and verification
are owned by [the lifecycle lab contract](manual-issuance-lifecycle-lab.md).
Neither document authorizes production or security-policy changes.

Current status: paused at the [verified transaction checkpoint](transaction-consolidated-regression.md#checkpoint-disposition).
The preparation and anchor milestones below are completed evidence. Use the
lifecycle contract for present coverage; do not restart the two-anchor phase.

## Current state

- Automated issuance has a production/SDK audit, an interactive lab lifecycle,
  and focused lab tests. The lab is provisional review evidence and is not
  adopted by production.
- Production automated issuance is a CoW-backed, atomic-batch-gated wizard. The
  SDK owns quote and execution mechanics; Register owns presentation, local
  input state, route reset, balance snapshots, and dust reconciliation.
- Production manual issuance is a separate direct Folio mint/redeem surface
  under `src/views/index-dtf/issuance/manual/`. Its mechanics, visible states,
  correctness boundaries, and provisional reuse map are reconciled below; no
  manual V1 composition has been accepted or adopted.
- The worktree contains the user's active design-system work. This audit must
  preserve it and must not reinterpret provisional lab output as accepted
  system authority.

## Non-goals

- Do not change production automated or manual issuance behavior, SDK/package
  code, on-chain math, transaction builders, shared component defaults, or
  global design tokens.
- Manual visual implementation is authorized in the lab only; its lifecycle
  contract names the current review slice and acceptance evidence.
- Do not silently resolve product, engineering, or design questions whose
  answer is not established by current production evidence or accepted V1
  authority.
- Checkpoints require explicit user authorization; production adoption and pushes
  remain separate actions.

## Acceptance evidence

- Every production automated-issuance entry, gate, configuration branch, quote
  state, execution phase, recovery path, outcome fact, and responsive behavior
  is mapped to the lab as covered, intentionally changed presentation,
  missing, misleading, or engineer-review-dependent.
- The mounted automated Mint and Redeem lab is reviewed across representative
  entry, quote, execution, failure, collateral-ready, and outcome states in
  light and dark themes, including realistic order volume and overflow.
- Obvious lab defects are separated from choices that need human review; any
  safe correction made during the audit is verified at the focused render seam.
- Manual production Mint/Redeem mechanics, states, transaction boundaries,
  facts, edge cases, and current test coverage are recorded with source paths.
- The manual readiness map classifies what can reuse accepted shared
  components, what may reuse only provisional composition evidence, what must
  remain manual-flow-owned, and what requires engineering review.
- Every materially distinct automated-issuance UI branch currently rendered by
  production is available for review in the lab, while implementation-only
  behavior with no distinct production presentation remains documented rather
  than receiving invented UI.
- The production-migration contract explicitly preserves unmodeled behavior and
  content until it is audited; absence from the lab is never treated as
  permission to delete, flatten, or improvise a replacement.
- Documentation housekeeping leaves one current manual readiness owner and
  updates any directly contradicted automated-audit claims.

## Test seams

- Production automated behavior: source and existing async-mint unit tests;
  current guide and installed SDK types where the UI delegates behavior.
- Automated lab behavior: the public state selector and observable task/order
  UI in `transaction-composition-staged.test.tsx`, plus mounted browser review.
- Manual production behavior: direct source tracing and the existing manual
  atom/E2E coverage named by the issuance area guide.
- Documentation: `wiki-lint`, formatting, and link/path inspection.

## Slices

- Slice: inventory and reconcile production automated issuance against the
  current lab state-by-state; blocked by: none.
- Slice: inspect the mounted automated lab for visual hierarchy, interaction,
  overflow, theme, and transition defects; blocked by: automated inventory.
- Slice: correct only high-confidence, low-risk lab defects and verify them;
  blocked by: automated reconciliation and visual inspection.
- Slice: add production-visible automated-issuance pressure states for chain
  identity, quote/order failures, no-swap completion, trading pauses, expiry,
  wallet recovery, missing price, and manual-flow navigation; blocked by:
  automated reconciliation.
- Slice: audit production manual Mint/Redeem mechanics, UI, edge cases, and
  tests, then classify reusable and flow-owned patterns; blocked by: none.
- Slice: complete this readiness document, update stale automated-audit claims,
  run documentation housekeeping and scoped verification, and hand off the
  remaining human and engineer decisions; blocked by: all audit slices.

## Unresolved decisions

- Which remaining automated-lab composition choices are strong enough for the
  user to retain, versus still-active visual experiments.
- Whether any automated-lab gap reflects a missing production requirement or a
  deliberate simplification that should remain lab-only.
- Which manual-issuance host and composition should be reviewed first; this
  audit will map the current page behavior but will not select a redesign
  without human review.
- Any change to manual mint/redeem math, allowance policy, minimum outputs,
  transaction ordering, wallet gating, or result truth requires engineer
  review and is outside this audit.

## Audit findings

### Authority and evidence boundary

This document reconciles the current branch rather than guessing from the lab.
For automated issuance, production behavior comes from
`src/views/index-dtf/issuance/async-mint/`, the installed
`@reserve-protocol/async-zap-sdk`, and the async-mint tests. For manual issuance,
behavior comes from `src/views/index-dtf/issuance/manual/`,
`src/hooks/use-batch-approval.ts`, and the issuance write/boundary/failure E2E
specs. The lab remains presentation evidence, not behavior authority.

The reachable automated outcome is the completed state rendered inside
`steps/quote-summary.tsx`. The separate `steps/success.tsx` is routable by the
wizard type, but no setter that enters it was found. It must not be treated as a
second production contract unless engineering identifies an external entry.

### Automated issuance reconciliation

| Production behavior or state                                                                                    | Current lab disposition                                                        | Review consequence                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Advanced-flow introduction, Swap recommendation, smart-account requirement, supported-wallet guidance           | Covered by Introduction, Wallet required, and Incompatible wallet              | Keep the current narrow entry family. Wallet support copy remains product-owned.                                                                             |
| Mint with chain-specific quote token; Redeem with DTF shares                                                    | Covered, including a BSC/USDT 18-decimal configuration fixture                 | Keep the same composition and change identity, decimals, balance, validation, and downstream quote-token amounts together.                                   |
| Existing basket collateral reduces Mint swaps and may be sold during Redeem                                     | Covered by Input only, Existing collateral ready, and Existing collateral only | Preserve the all-or-nothing production policy. The lab may present it more clearly but must not invent per-token selection.                                  |
| Redeem held collateral while entering zero DTF shares                                                           | Covered mechanically and tested                                                | The current result text, `Redeemed 0 CMC20`, needs human wording review because it is truthful but reads like a failed operation.                            |
| Quote search, slow-search escape, halted error, retry, and edit                                                 | Covered by Quote searching, Quote paused, and Quote unavailable                | `Pause quote search` is safer than production's `Cancel` until SDK abort semantics are authoritative.                                                        |
| Per-leg quote failures                                                                                          | Covered by Per-order quote failure                                             | Preserve successful leg quotes and identify only the unavailable leg; do not imply the whole quote failed.                                                   |
| No CoW legs because balances/direct legs satisfy the operation                                                  | Covered by No swaps needed                                                     | Keep the Collateral checkpoint visible, state that no swaps are needed, and allow the next operation-specific action.                                        |
| Ondo market closed or capacity zero blocks quoting                                                              | Covered by Trading paused                                                      | Keep it at configuration, preserve the current production copy intent, and block quote creation.                                                             |
| Positive Ondo capacity splits one asset into multiple CoW orders                                                | Covered by Split order quotes                                                  | Duplicate asset rows remain valid distinct orders; never key, summarize, or reconcile them by symbol alone.                                                  |
| Submit every CoW order, then authorize approvals and presigns                                                   | Covered by Authorizing orders                                                  | Ordinary copy correctly describes one shared authorization instead of one signature per order.                                                               |
| MetaMask splits more than ten calls into sequential wallet batches                                              | Production UI keeps the same generic authorization state; the lab does too     | No dedicated lab state is required for UI parity. Keep copy neutral about confirmation count; exposing `1 of N` is a future engineering/product enhancement. |
| Orders fill independently; expired/cancelled legs can be retried without replaying completed legs               | Covered by Orders filling, Recoverable failure, and Cancelled order            | Keep per-order status subordinate to left-column high-level progress and retain completed work during retry.                                                 |
| Nearest active order expiry countdown                                                                           | Covered in the right order header                                              | Keep routine expiry with the order detail it governs; escalating imminent expiry into the left task remains a later human decision.                          |
| User rejection, transaction failure, or missing wallet client during authorization/final Mint                   | Covered by Transaction failed and Wallet unavailable                           | Keep these separate from failed-order retry and preserve quote/completed-order evidence around the recovery action.                                          |
| Mint pauses at `collateral_ready` and needs a final user action                                                 | Covered by Collateral ready and Final mint signing                             | Retain. This is the most important Mint/Redeem lifecycle difference.                                                                                         |
| Redeem authorizes the redeem call and order presigns before fills, then completes without a second final action | Covered by the shared tree's Redeem policy                                     | Retain. Never show a later `Mint`-style action for Redeem.                                                                                                   |
| Final amount is reconciled after fills; final batch and CoW orders have separate identities                     | Covered with a final transaction plus completed orders                         | Quote/executed/result source priority remains engineer-owned.                                                                                                |
| Input token price unavailable                                                                                   | Covered by Price unavailable                                                   | Keep token amounts usable while replacing only price-derived USD values with unavailable language; never fabricate `$0`.                                     |
| Disconnect resets the provider-local wizard; route leave/reload does not restore execution                      | Deliberately not promised by the lab                                           | Keep as a known product limitation; do not add return-later language.                                                                                        |
| Compliance/geo restriction                                                                                      | Not represented inside this composition                                        | Reuse the host restriction pattern unless product wants the automated lab to certify every host gate. It is not an order-lifecycle state.                    |
| Switch to manual issuance                                                                                       | Covered below Introduction and configuration                                   | Keep as entry/configuration navigation only. Production intentionally removes the escape once execution begins.                                              |

### Automated lab defects corrected in this audit

- The recoverable-failure left column exceeded the fixed review workspace by
  about 22px and clipped the waiting Mint action. The desktop workspace is now
  736px high, aligned with Manual's review host, and fits every
  current left state while preserving a constant two-column frame.
- Order rows and collateral-logo stacks no longer use the asset symbol alone as
  a React key. A capacity-split asset can legitimately produce multiple orders,
  so duplicate assets must render independently.
- No production automated behavior, SDK code, transaction math, or shared
  component default changed.

Production completion includes `New mint` / `New redeem`. The current lab keeps
that reset as a compact header action, with default-sized `View transaction`
and `View DTF` footer actions. The footer is the sole final-transaction link;
the former duplicate hash/copy row is removed. This supersedes the earlier
single-action outcome experiment and does not remove the ability to restart.

### Automated decisions applied for human review

The production-visible branches in the matrix have explicit lab states. The
following statements describe the current lab candidate rather than proposed
future changes:

1. **Zero-share Redeem outcome.** When held collateral alone was sold, the
   outcome omits the misleading `Redeemed 0 CMC20` fact and identifies existing
   collateral as the source. Received USDC and transaction/order evidence stay
   visible.
2. **Expiry urgency.** The ordinary countdown stays in the right order header
   because it governs orders. The imminent-expiry pressure case mirrors the
   countdown beside the left Collateral action so the high-level task remains
   sufficient without duplicating routine progress.
3. **No-swaps Collateral stage.** The three-section left column remains intact,
   the middle stage reads `Collateral ready` with `No swaps needed`, and the
   empty right ledger is omitted. Input does not collapse directly into Mint
   because the collateral checkpoint remains causally important.
4. **Final outcome risk facts.** The outcome labels the aggregate actual value
   as `Collateral swap price impact`, distinguishing the collateral trades from
   the final protocol Mint/Redeem operation. A no-swaps path omits the fact.
   The authoritative production source remains an engineering-review boundary.
5. **Desktop order-panel behavior.** The high-level and detail columns remain
   spatially stable on desktop rather than copying production's wrapper-width
   collapse. Narrow screens continue to make orders opt-in.

### Automated engineering-review blockers

**Engineer review required** before production migration for:

- the authoritative executed amount and price-impact source for fulfilled CoW
  orders, including partial-fill and fallback behavior;
- the authoritative final Mint/Redeem amount, dust, and final transaction source
  when receipt, SDK state, and refreshed balances disagree;
- whether quote cancellation truly aborts in-flight work or only prevents future
  refetches;
- whether and how provider-local execution can be reconstructed after reload;
- whether the dormant Success route is intentional;
- whether an order whose underlying status is Expired versus Cancelled needs a
  distinct recovery or disclosure.

### Manual issuance: current production contract

Manual issuance is not automated issuance without CoW. It is a direct Folio
flow that begins as a full-page two-column surface:

- The left column owns Buy/Mint versus Sell/Redeem, one DTF-share amount, USD
  estimate, balance/Max, the current transaction action, and recovery message.
- The right column is persistent evidence. Mint shows every required basket
  asset, wallet balance, required quantity, allowance state, and per-token
  approval/revoke action. Redeem shows each expected basket asset and value.
- Deprecated DTFs are sell-only. Compliance restrictions block Mint but preserve
  Redeem as an exit path.
- Mint derives exact basket requirements from `toAssets(1e18, 0)` scaled by the
  requested shares. Max is the limiting wallet collateral balance with one-wei
  headroom for the contract's ceil pull.
- Mint requires an allowance for each basket token. `Approve All` starts one
  separate ERC-20 transaction per token in parallel; it is not one atomic batch.
  Partial failures retain per-token state and retry only failed tokens.
- USDT-like tokens can require Revoke and then Approve. Unlimited allowance is
  on by default; finite approval uses twice the current requirement.
- After allowances are sufficient, Mint is one Folio transaction. V2 protects
  shares with a fee-or-0.15%-floor-derived `minSharesOut`; V1 uses the legacy
  two-argument call.
- Redeem is one Folio transaction with a hard-coded 5% minimum-output haircut
  per basket asset.
- Current success is only a toast and clears the amount. Failure remains inline
  and preserves the amount for retry. No persistent result or transaction
  identity is shown.
- The reciprocal switch to zap minting/redeeming belongs outside the running
  transaction lifecycle.

### Manual composition preflight

This section instantiates the project
[flow composition transfer brief](../../templates/design/flow-composition-transfer.md).
It must be consumed before expanding the existing coarse atomic specimen into a
manual Mint/Redeem candidate.

#### Production state transfer

| Visible state or job                            | Current production behavior                                                                                                                                                          | Disposition for the lab                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Route entry without settled wallet reads        | The page renders its Manual surface; account-dependent balances, allowances, and actions remain unavailable until reads settle. There is no manual-flow-owned Connect Wallet screen. | Preserve the host behavior; do not invent a dedicated wallet gate without current product evidence.                          |
| Basket loading                                  | The right ledger renders five placeholder rows while basket data is unavailable.                                                                                                     | Visually standardize with the eventual ledger geometry so loading does not introduce a different row rhythm.                 |
| Empty or edited Mint amount                     | Buy is selected, the DTF-share amount owns USD and Max, and basket requirements derive from the same amount.                                                                         | Reuse the accepted amount grammar; keep the ledger causally tied to the entered share goal.                                  |
| Insufficient basket balance                     | The affected requirement is marked insufficient. The direct Mint action validates balances; Approve All can still be offered while allowances are insufficient. | Preserve the per-asset cause and distinguish permission readiness from balance readiness; do not silently change approval policy. |
| Permissions required                            | Each basket row retains balance, requirement, allowance state, and an individual action; the main action becomes Approve All. Unlimited permission defaults on.                      | Visually standardize, but preserve every permission boundary and keep the unlimited choice visible.                          |
| Token identity and explanation                  | Rows expose token name, symbol and a token-address explorer link. Revoke has a USDT-specific explanation. | Preserve these secondary affordances as well as the main actions; the two anchors now expose real token links and the unchanged Revoke explanation. |
| Revoke required                                 | A USDT-like row requires Revoke before its later Approve action. The aggregate selector still counts insufficient allowances without excluding this special case. | Preserve the row sequence; do not imply the aggregate path safely skips or handles it. Keep its known mismatch engineering-owned. |
| Aggregate approvals in progress                 | Separate token transactions expose signing, confirming, success, or failure per asset while the aggregate action reports progress.                                                   | Reuse lifecycle language and stable action placement; do not call the work one batch or one signature.                       |
| Partial approval failure                        | Completed permissions remain complete; failed rows expose their own fallback and the aggregate action retries only failures.                                                         | Preserve progress and retry scope. Recovery must not reset the amount or completed permissions.                              |
| All permissions ready                           | The same main action location becomes Mint while the requirement ledger remains visible.                                                                                             | The current lab retains a separate final Mint action and completes the approval region; no extra global timeline.                                                 |
| Mint wallet request, confirmation, or failure   | One Folio transaction follows permissions. Failure remains inline and the amount survives for retry.                                                                                 | Reuse the simple transaction lifecycle and one-line recovery treatment.                                                      |
| Empty or edited Redeem amount                   | Sell is selected; the left input is DTF shares and the right ledger shows the expected basket assets and values.                                                                     | Reuse input grammar, but use a receive-only ledger relationship rather than permission or order anatomy.                     |
| Redeem wallet request, confirmation, or failure | Redeem is one Folio transaction with client-computed minimums; there is no approval stage.                                                                                           | Reuse the simple one-transaction lifecycle and never inherit Mint's permission stage.                                        |
| Successful Mint or Redeem                       | Production shows a toast, clears the amount, and keeps no persistent result evidence.                                                                                                | Deliberately pressure-test the accepted consequential outcome hierarchy, but label only facts whose source is established.   |
| Compliance restriction                          | Mint input and Max are disabled while Redeem remains available as an exit.                                                                                                           | Preserve exactly; do not replace it with a flow-wide unavailable state.                                                      |
| Deprecated DTF                                  | Buy is unavailable and Sell remains reachable.                                                                                                                                       | Preserve the sell-only policy and its existing route behavior.                                                               |

#### Task and information hierarchy

- The task column must be sufficient to identify Mint versus Redeem, the share
  goal and value, the next user or wallet action, and any blocking or recoverable
  condition.
- The basket ledger is persistent supporting evidence on desktop. Mint associates
  every asset with required quantity, wallet balance, permission state, and
  applicable action. Redeem associates every asset with expected quantity and
  value.
- Aggregate approval progress belongs in the left Token approvals amount-style summary and the affected
  rows. The current Mint trial separates desired amount, approvals and the final
  Mint action; Redeem remains direct. Do not add an automated-order header or a separate global stepper merely
  to repeat those states.
- The page host owns the two-column workspace. The transaction composition owns
  its task and ledger; neither a Dialog nor the automated narrow-to-wide
  transition is inferred.
- On narrow screens the task leads and the ledger follows visibly. Unlike the
  automated order ledger, Manual rows contain required user actions. Do not hide
  them behind optional inspection without a reviewed way to expose blockers.

#### Verified component owners for the two anchors

This is the current import/variant audit, not authority for unbuilt execution or
outcome states. Catalog `implementationSource` wins over a same-named legacy
export; the generic production `ui/checkbox` is not the V1 Checkbox.

| Visible use | Exact owner and configuration | Audit disposition |
| --- | --- | --- |
| Mint/Redeem tabs | `design-system-v1/segmented-control`, contained / compact / intrinsic | Retained; matches the compact transaction mode control. |
| Share amount | `design-system-v1/transaction-amount-object`, input; `TransactionAmountAsset` | Retained: 8px radius, 16px internal inset, explicit `0` and zero USD placeholders. |
| Approval setting | `components/checkbox`, binary 28px slot / 20px mark; `v1Typography.label` | Corrected legacy import; native keyboard and whole-label toggle verified. Row geometry stays flow-owned. |
| Primary / per-token actions | `components/button`, primary / default, quiet / micro and neutral InlineAction; Approve has a local soft-blue trial (`TX-P21`) | 44px minimum primary, 28px Approve actions; Revoke uses the 20px inline action inside the stable minimum-height permission region to align its visible text without ghost padding. Approve tests token-based blue fill/text without an outline. Primary opts into wrapping for long amount labels without consuming its side inset; ordinary height is unchanged. Preview-only execution remains explicit. |
| Max and alternate action | `components/button` InlineAction | Retained: standard 20px text treatment with expanded hit area. |
| Asset identity | `components/entity-identity`, default; retained TokenLogo renderer at 32px | Standard 16px name matches primary quantities in both modes; name/address, 8px mark-to-copy relationship and full explorer destination survive narrow layouts. |
| Explorer link | `design-system-v1/link`, return / external | Corrected manual glyph to the owner's external icon and standard new-tab announcement. Muted resting treatment stays unchanged. |
| Approved / Revoke help | `components/lifecycle-status`, success; `design-system-v1/help-tooltip` | Retained: 28px intrinsic status, standard tooltip surface and production explanation. |
| Text and validation | `v1Typography` body / itemTitle / supporting / label; semantic danger for insufficiency | Retained; amount validation uses compact field-adjacent feedback. Amount, approval count and final Mint readiness share the responsive headline scale: 22px/28px below 360px, 28px/32px below 640px, then 32px/38px. Final Mint keeps the same 16px label and label-to-headline spacing, existing 32px CMC20 mark, and 14px explanation. It distinguishes step readiness from the button's exact amount and wallet/chain phase, without claiming readiness for an empty, unavailable or insufficient amount. |
| Surfaces and spacing | `bg-card`, semantic recessed ledger, `bg-secondary` host seam | Retained; no nested asset cards, added shadows, or per-row dividers. Measurements are below. |

#### Geometry ownership

| Relationship                                    | Owner              | Starting contract and proof                                                                                                                                           |
| ----------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page width, two columns, and column separation  | Manual page host   | Preserve the production page host while using the semantic substrate or owned gap for separation; the content cards do not repair the page edge.                      |
| Task control edges and text axis                 | Task shell plus amount primitive | Shell owns 8px padding; amount owns its existing 16px padding, giving a 24px text axis. The top amount begins 16px after compact tabs, without another visible heading. Do not wrap the amount in another 24px content inset. |
| Compact mode header                             | Task shell plus header | 8px shell plus 8px header inset gives the established 16px compact-header axis. |
| Ledger header and row text axes                  | Header plus list/row | Header owns 24px top/side inset and 8px bottom inset; the following row owns 16px top inset, totaling 24px between groups. List owns 8px horizontal inset and row owns 16px, totaling 24px at every width. |
| Directly related label/value and control groups | Their local parent | Use accepted 4px tight pairs and 8px direct relationships; do not accumulate child margins.                                                                           |
| Task regions and action seam | Manual task / ManualMintStages | Mint has desired amount, approvals and final transaction regions, separated by full-width 2px secondary boundaries. The Zapper alternative stays in the amount section with 24px bottom inset. Connected down-arrow boundaries share Automated's local owner. The amount and approval count use TransactionAmountObject; the final readiness summary follows the same 24px text axis and label top inset. Supporting/control gaps are 24px and checkbox/action gaps are 16px. Buttons have 8px side inset, 24px bottom clearance before an arrow boundary, and 8px at the final footer. Completed approvals keep the count and short confirmation with 24px bottom inset, without hidden controls. Final recovery uses 16px explanation/message and 8px message/action gaps. English ready, signing and confirming share geometry; longer text wraps rather than truncating. Redeem retains its direct 8px input/action gap. Alternative navigation keeps the 24px text axis. |
| Asset-row padding                               | Ledger row         | 16px horizontal and 12px vertical inset. Identity, quantities, status, and action align inside the same row owner. |
| Row boundaries                                  | Ledger list        | No separators or per-asset containers. Adjacent 12px row insets create 24px between asset contents without an extra list gap. The list adds 4px top/bottom; the final row's 12px, list's 4px, and outer 8px retain the 24px bottom inset. |
| Asset-row type hierarchy | Entity identity and financial values | Use standard-density EntityIdentity: names and primary amounts share 16px/24px typography in Mint and Redeem. Names and required/received values use medium weight; wallet balances retain light weight. Labels, addresses, and USD values stay 14px/20px. Compact identity would wrongly demote the name beside a 16px received amount. |
| Responsive ledger                               | Manual asset row / lab host | Mint: 32px logo with name/address and permission action, then Required beside Balance with 8px between tiers. Both quantities use foreground; Required has stronger weight. Insufficient balance replaces the Balance label without adding height; intrinsic labels share horizontal space. Redeem: identity beside expected quantity and supporting USD value, without a second comparison tier. Wrap actions/values only when needed. Test actual half-width columns and phones. Desktop lab columns scroll within the 736px review host; mobile uses page scrolling. Production scroll ownership remains a migration decision. |
| Unlimited control                               | Task action group  | Plain checkbox labeled “Approve unlimited token amounts” inside the middle Token approvals region, on the 24px text axis. Standard HelpTooltip sits at the far right, centered, outside the clickable label. Its factual copy describes maximum allowance without advice or assumptions about unchecked behavior. No pill enclosure. The choice survives mode changes; default and scope across batch/individual approvals remain unchanged. |

The former fixed 128px permission slot is superseded by container-aware columns:
natural trailing width in wide rows and equal tracks below 320px of row content.
Controls stay beside the wrapping identity through signing/confirmation/success;
loading follows the same column layout. The 28px permission-region minimum stays,
without changing shared Button or Status Pill sizes. At narrow widths the address
shows its identifying suffix, with the complete address retained accessibly and
on hover. Below 272px of content, units occupy a consistent second line in both
comparison columns. Insufficient balance has shorter visible wording under width
pressure; error meaning is not hidden in a tooltip or conveyed only by color.

The user-authorized readiness trial replaces the Unlimited setting with
`Required tokens approved` when a positive Mint amount has sufficient
allowances and account reads are ready. The completed section wraps naturally
without invisible controls; the setting value is retained and the control returns
when requirements change. This changes presentation, not allowance policy.
Failed assets keep their existing Revoke/Retry action with an alert marker;
the main summary names affected symbols without adding an asset row.

These are relationship owners, not approval of one visual layout. Any departure
must be recorded as a manual-flow pressure item before human review rather than
patched with an unowned margin.

#### State continuity

| Transition                        | Context that remains                                  | Legitimate replacement                                                 | Regression to test                                                                               |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Empty → amount entered            | Mode, task shell, asset identities, action location   | Placeholder values become calculated requirements or expected receipts | Input/ledger jump, placeholder collapse, or mismatched row height                                |
| Permissions required → approving  | Amount, Max, every asset row, completed permissions   | Row statuses and aggregate action copy                                 | Reordered rows, disappearing action slot, or loss of individual fallback                         |
| Partial failure → retry           | Amount, successful permissions, failed asset identity | Summary recovery and failed-row action                                 | Replaying successful approvals or replacing specific failure with a generic reset                |
| All permissions ready → Mint      | Amount and approved ledger                            | Approval region shows readiness; the already-visible final Mint action enables                                 | New panel height or a disconnected final action                                                  |
| Transaction failure → ready retry | Amount, requirements/receipts, relevant permissions   | Waiting state becomes recovery action                                  | Cleared input or lost supporting evidence                                                        |
| Confirmation → outcome            | Operation and authoritative result identity           | Editable task becomes consequential result                             | Invented exact facts, unexplained shrink, or loss of the basket evidence needed for verification |
| Mint ↔ Redeem before execution    | Page host and DTF identity                            | Amount, ledger semantics, action policy                                | Mint-only permissions leaking into Redeem or exit paths becoming blocked                         |

#### Transaction truth and first review slice

- Treat the entered DTF shares as user input, basket quantities as protocol
  requirements or expected outputs, allowance as refreshed on-chain state, and
  approval/Mint/Redeem hashes as separate submitted records.
- Distinguish the intended outcome from its available evidence: Basket assets
  used/received describes the completed operation, while the fixture's amounts
  remain explicitly estimated in its visible subtitle. Confirmed quantities and
  persistent result sourcing remain engineering-owned. The View transaction
  preview must remain present without fabricating an on-chain identity.
- First render one Mint state with multiple permissions including a Revoke row,
  plus one Redeem state with receive-only basket values. Correct their complete
  hierarchy, geometry, theme, and narrow behavior before multiplying the design
  across execution and recovery fixtures.
- The atomic lab retains the two reviewed anchors with an explicitly synthetic
  five-token Ethereum basket, including a USDT reset-allowance pressure case.
  Raw balances, allowances, scaled requirements, permission counts and separate
  Mint/Redeem Max values share one fixture source. Six-decimal share entry and
  conservative fixture rounding are lab bounds, not a production parser/math contract.
- Amount, Max, mode and Unlimited controls are interactive. Transaction controls
  now drive a deterministic lab lifecycle, with separate external simulator
  controls for wallet responses. Navigation is explicitly preview-only. This
  is not production execution or wallet integration. The approved clarification
  “Approve unlimited token amounts” retains production's default without new
  security guidance or a changed allowance policy.
- The 29-state lifecycle now includes configuration/access gates, independent
  approval progress, recovery, and direct Mint/Redeem outcomes. The lifecycle
  contract owns the coverage and human-review queue. Optional narrow-screen
  disclosure is not introduced: required asset actions stay visible.

The asset-led row replaces the earlier four-column requirement candidate for
this flow; it reuses Entity Identity, Token Logo, Link, Help Tooltip, Button,
Lifecycle Status and financial typography without promoting a new generic row.
The rejected alternative was to keep adding responsive/visual props to the
shared requirement candidate. Stable local anatomy is easier to scan and keeps
the approval and token-address association intact. It costs more desktop height;
the desktop lab now supplies a fixed-height review host with column scrolling,
while stacked mobile retains page scrolling.
Production functionality is a minimum, not a visual-template constraint.
Engineering/security policy remains unchanged, including Unlimited.
The desktop lab workspace supplies a 736px review height shared by both columns
across configuration, permissions, execution and outcomes. Both columns scroll
at their outer edges if content exceeds that height. Task contents remain
natural-height and top-grouped; spare space stays below the content, not before
the amount or between controls. Beige remains the 2px seam. This fixed height
simulates a page host for review; it is not a production height requirement.
On stacked mobile layouts the column wraps its contents. Outcome minimum height
still measures the task contents, not the stretched column surface. This is a
Manual page-host decision, not a change to dialog/outcome no-shrink behavior.

Alternate-flow guidance stays beneath the primary action, inside the card, with
supporting context and a descriptive text action. Manual Mint offers “Want
to buy with a single token?” / “Switch to Zapper”: label left, action at the
right content edge, wrapping only when needed. Automated configuration
offers “Already hold the required basket tokens?” / “Switch to manual minting”.
The header remains for Mint/Redeem modes, not an abbreviated “Manual” shortcut.

#### Process evaluation gate

The manual pass is the first organic pressure test of this preflight. Before UI
code changes, a fresh worker must be able to recover the production state
transfer, hierarchy, exact reuse boundaries, geometry owners, continuity risks,
and truth constraints from the routed files without relying on session history.
The two anchors were refined before the user authorized lifecycle expansion.
For each expansion, record:

- any production-visible branch the worker omitted or reinterpreted;
- any accepted component default or spacing relationship the reviewer had to
  rediscover;
- any local exception introduced without a named owner; and
- whether the two anchors were structurally sound enough to multiply without a
  correction loop.

The routing has deterministic documentation coverage, but is not a guarantee
of visual quality. If the same omission survives, revise the
smallest owner or route; do not add a new generic skill merely to repeat this
brief.

The first fresh-eyes review found nested 40px amount text versus 24px headings,
half-width ledger overflow, a hardcoded invalid Max, and inert unlabeled actions.
The correction pass tests empty/zero, non-preset, Max and over-balance values and
measures the resulting card-to-text/control axes and row containment. Tests that
only find labels or count rows are not evidence for those relationships. Record
content, behavior, measured geometry and human acceptance separately. These are
visible pressure cases, not an independent held-out evaluation.

### Manual reuse map

| Manual job                                      | Reuse disposition                                      | Recommended composition                                                                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Buy/Sell mode                                   | Accepted shared control                                | Reuse the V1 segmented-control treatment already used by Zapper/automated entry; keep deprecated sell-only policy flow-owned.                                                              |
| Enter DTF shares, see USD, balance, and Max     | Accepted amount grammar                                | Reuse Transaction Amount Object/Input anatomy and 8px amount-region radius. Manual input is DTF shares, not the stablecoin funding model from automated Mint.                              |
| Understand required basket assets               | Manual-flow-owned relationship using shared primitives | Build one requirement/allowance ledger from Token Identity, formatted Amount, status pill, and micro action. Do not reuse the CoW order row: there is no sold-to-bought pair or order UID. |
| Approve N tokens, including Revoke then Approve | Provisional staged-transaction recipe                  | Reuse the stable action slot, status vocabulary, one-line recovery message, and compact high-level stage disclosure. Keep every permission row and transaction boundary visible.           |
| Submit direct Mint                              | Accepted transaction action/result grammar             | Reuse the named wallet-request/confirming action states and consequential outcome structure. Do not reuse automated collateral-order progress.                                             |
| Submit direct Redeem                            | Accepted simple transaction flow                       | Reuse the direct one-transaction action and outcome. The expected basket is detail, not a second process stage.                                                                            |
| Partial approval failure                        | Accepted recovery relationship plus flow-owned rows    | One summary action retries failed approvals; completed approvals remain complete; each failed row keeps its own fallback action.                                                           |
| Result and next action                          | Accepted outcome hierarchy, manual-owned facts         | Trial the submitted share amount and expected basket, not unverified received amounts. Do not fabricate a transaction identity. View DTF is a navigation preview until connected to the same chain/DTF; receipt sourcing remains engineering-owned. |
| Responsive host                                 | Page composition, not Dialog                           | Keep the same structured task and ledger usable in a page/card host. A modal shell is not required and must not own the transaction state.                                                 |

### Patterns not to reuse from automated issuance

- CoW sell/buy order rows, UIDs, expiry, solver language, and failed-leg retry.
- The narrow-to-wide transition; manual starts with a basket obligation ledger.
- Existing-collateral composite funding; manual Mint always consumes the basket
  assets the wallet already owns.
- The Collateral-ready then final-Mint split. Manual has permissions followed by
  a direct Mint, not market settlement followed by a separate finish phase.
- Aggregate price-impact and route language; manual requirements are protocol
  quantities and minimums, not exchange quotes.

### Manual risks and missing decisions

1. **Address normalization defect.** `toAssets` stores lowercase addresses while
   the balance updater keeps read-call addresses in their original case. Max,
   validation, and row values later index these records inconsistently. The
   current mixed-case unit test does not reproduce production because it seeds
   the requirement map in the token's original case. Engineering must investigate
   and regression-test normalization before production adoption; this is not
   authorization to change production during the lab design pass.
2. **Parallel approval prompts.** `Approve All` fires every token transaction in
   parallel. Preserve the observed behavior for the design lab, but engineering
   must confirm supported-wallet behavior and whether sequential submission is
   required. The UI must not call it one batch or one signature.
3. **USDT Revoke path is not included in Approve All.** The global hook uses the
   generic ERC-20 ABI and does not reflect the row-level `needsRevoke` branch.
   The lab exposes the aggregate failure and the individual Revoke → Approve
   recovery rather than implying `Approve All` handles every token uniformly.
   Finite aggregate allowances remain required × 2; individual USDT still uses
   maximum allowance even with Unlimited off, matching current source.
4. **Zero minimum-output leg.** An existing E2E `fixme` proves a small Redeem can
   round one low-decimal asset's `minAmountsOut` to zero, silently removing
   protection for that leg. The UI must not invent a display workaround; an
   engineer must choose a nonzero floor or block unsafe dust Redeems.
5. **Unlimited permission consequence.** Preserve the default-on choice and
   allowance behavior. The user approved clearer labeling and placement near
   Approve All and a factual maximum-allowance tooltip, not a policy change, and explicitly deferred
   new security explanations and policy changes to engineering/security review;
   neither is part of this design-system pass.
6. **Outcome truth source.** The current toast repeats the entered share amount,
   not receipt-decoded assets or refreshed balances. A persistent V1 outcome is
   appropriate, but its exact facts require receipt/RPC source decisions.
7. **Input parsing.** Validation uses `Number(amount)` while transaction math
   uses `safeParseEther`. Existing boundary tests cover common precision and
   over-balance cases, but engineering should confirm the accepted decimal and
   magnitude grammar before the V1 input hardens it.
8. **V1 versus V2 semantics.** The two contract call shapes and V2
   `minSharesOut` calculation must remain explicit implementation policy even if
   the visible UI is identical.

### Implemented manual-design sequence

1. Build one page-hosted lab shell with independent Mint and Redeem modes,
   realistic five-asset fixtures, and no production writes.
2. Establish Mint configuration states: empty, valid, insufficient one asset,
   all approved, unlimited off/on, and deprecated/compliance gates.
3. Add approval lifecycle pressure: multiple required, Revoke required,
   authorizing, confirming, partial failure, failed-only retry, and all ready.
4. Add direct Mint wallet request, confirmation, failure recovery, and a
   receipt-shaped outcome using only facts whose truth category is explicit.
5. Add Redeem expected-assets review, simple transaction lifecycle and outcome.
   Track zero-minimum dust protection for engineering; do not invent a blocked
   UI state absent from production.
6. Verify desktop, intermediate column widths and narrow stacked layouts.
   Keep required row actions visible; optional disclosure needs separate review.

### Manual-lab acceptance checklist

- The requested share amount, required basket quantities, balances, allowances,
  and transaction calls all derive from one bigint-backed fixture graph.
- Every approval is presented as its own transaction; Revoke and Approve are
  separate when required.
- Completed approvals never regress or replay during a failed-only retry.
- The stable action slot says whether the wallet, chain, or user is next.
- Mint and Redeem share primitives and spacing but do not share false lifecycle
  stages.
- Deprecated/compliance exit behavior remains identical to production.
- No outcome labels estimated requirements as executed results.
- The zero-minimum Redeem defect is either blocked by production logic or kept
  visibly outside an approvable design state.
- Desktop and narrow layouts preserve association between an asset, its amount,
  allowance, status, and action.
- Production behavior, SDK/contracts, shared defaults, and design tokens remain
  untouched until their respective review gates are satisfied.
