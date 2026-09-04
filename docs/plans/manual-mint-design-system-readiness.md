# Manual issuance design-system readiness

## Goal

Deeply reconcile the current automated Mint/Redeem Design System V1 lab with
the production automated-issuance flow, identify the remaining visual,
behavioral, and human-decision risks, and leave a source-backed manual
Mint/Redeem readiness map that makes the next design pass fast without
pre-designing or changing the production flow.

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
- Do not implement or visually redesign the manual Mint/Redeem flow yet.
- Do not silently resolve product, engineering, or design questions whose
  answer is not established by current production evidence or accepted V1
  authority.
- Do not commit or push.

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
  688px high, the smallest 8px-grid height used by this audit that fits every
  current left state while preserving a constant two-column frame.
- Order rows and collateral-logo stacks no longer use the asset symbol alone as
  a React key. A capacity-split asset can legitimately produce multiple orders,
  so duplicate assets must render independently.
- No production automated behavior, SDK code, transaction math, or shared
  component default changed.

Production completion includes `New mint` / `New redeem`, while the lab
intentionally keeps `View DTF` as the sole terminal action. This is a reviewed
presentation choice, not a forgotten production feature; do not restore the
restart action without new human direction.

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
| Insufficient basket balance                     | The affected requirement is marked insufficient and the aggregate action is unavailable.                                                                                             | Preserve the per-asset cause and summarize it at the stable action seam without replacing the ledger with one generic error. |
| Permissions required                            | Each basket row retains balance, requirement, allowance state, and an individual action; the main action becomes Approve All. Unlimited permission defaults on.                      | Visually standardize, but preserve every permission boundary and keep the unlimited choice visible.                          |
| Revoke required                                 | A USDT-like row requires Revoke before its later Approve action.                                                                                                                     | Preserve as a distinct row-owned transaction sequence; it is not covered by generic Approve All.                             |
| Aggregate approvals in progress                 | Separate token transactions expose signing, confirming, success, or failure per asset while the aggregate action reports progress.                                                   | Reuse lifecycle language and stable action placement; do not call the work one batch or one signature.                       |
| Partial approval failure                        | Completed permissions remain complete; failed rows expose their own fallback and the aggregate action retries only failures.                                                         | Preserve progress and retry scope. Recovery must not reset the amount or completed permissions.                              |
| All permissions ready                           | The same main action location becomes Mint while the requirement ledger remains visible.                                                                                             | Preserve the action-slot transition without adding a second global timeline.                                                 |
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
- Aggregate approval progress belongs in the stable task action and the affected
  rows. Do not add an automated-order header or a separate global stepper merely
  to repeat those states.
- The page host owns the two-column workspace. The transaction composition owns
  its task and ledger; neither a Dialog nor the automated narrow-to-wide
  transition is inferred.
- On narrow screens the high-level task leads and basket detail becomes an
  explicit inspection region without breaking the asset-to-value/action
  association.

#### Geometry ownership

| Relationship                                    | Owner              | Starting contract and proof                                                                                                                                           |
| ----------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page width, two columns, and column separation  | Manual page host   | Preserve the production page host while using the semantic substrate or owned gap for separation; the content cards do not repair the page edge.                      |
| Task and ledger content axes                    | Each visible panel | Use the ordinary 24px complete-group axis unless a named compact recipe owns a narrower region. Verify both panels align at their top-level axes.                     |
| Directly related label/value and control groups | Their local parent | Use accepted 4px tight pairs and 8px direct relationships; do not accumulate child margins.                                                                           |
| Task regions and action seam                    | Task composition   | Use a 16px internal-region relationship. The stable action slot owns its relation to the preceding context; recovery messaging does not add a second independent gap. |
| Asset-row padding                               | Ledger row         | Start from symmetric 16px inset. Identity, quantities, status, and action align inside the same row owner.                                                            |
| Row boundaries                                  | Ledger list        | A divider contributes no spacing. Row inset owns density, and scrolling cuts at the list boundary rather than inside row padding.                                     |
| Ledger overflow                                 | Ledger body        | The header remains stable and the body owns scrolling for realistic baskets; page overflow remains available on narrow screens.                                       |

These are relationship owners, not approval of one visual layout. Any departure
must be recorded as a manual-flow pressure item before human review rather than
patched with an unowned margin.

#### State continuity

| Transition                        | Context that remains                                  | Legitimate replacement                                                 | Regression to test                                                                               |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Empty → amount entered            | Mode, task shell, asset identities, action location   | Placeholder values become calculated requirements or expected receipts | Input/ledger jump, placeholder collapse, or mismatched row height                                |
| Permissions required → approving  | Amount, Max, every asset row, completed permissions   | Row statuses and aggregate action copy                                 | Reordered rows, disappearing action slot, or loss of individual fallback                         |
| Partial failure → retry           | Amount, successful permissions, failed asset identity | Summary recovery and failed-row action                                 | Replaying successful approvals or replacing specific failure with a generic reset                |
| All permissions ready → Mint      | Amount and approved ledger                            | Aggregate approval action becomes Mint                                 | New panel height or a disconnected final action                                                  |
| Transaction failure → ready retry | Amount, requirements/receipts, relevant permissions   | Waiting state becomes recovery action                                  | Cleared input or lost supporting evidence                                                        |
| Confirmation → outcome            | Operation and authoritative result identity           | Editable task becomes consequential result                             | Invented exact facts, unexplained shrink, or loss of the basket evidence needed for verification |
| Mint ↔ Redeem before execution    | Page host and DTF identity                            | Amount, ledger semantics, action policy                                | Mint-only permissions leaking into Redeem or exit paths becoming blocked                         |

#### Transaction truth and first review slice

- Treat the entered DTF shares as user input, basket quantities as protocol
  requirements or expected outputs, allowance as refreshed on-chain state, and
  approval/Mint/Redeem hashes as separate submitted records.
- Do not label a requirement or expected amount as received. Persistent outcome
  amounts remain provisional until receipt/RPC source priority is approved.
- First render one Mint state with multiple permissions including a Revoke row,
  plus one Redeem state with receive-only basket values. Correct their complete
  hierarchy, geometry, theme, and narrow behavior before multiplying the design
  across execution and recovery fixtures.
- The atomic lab now contains only those two first-review anchors. The Mint task
  exposes five production-shaped requirements, independent Approved/Approve/
  Revoke boundaries, and the existing unlimited-approval choice; Redeem keeps
  the same amount task and turns the ledger into receive-only evidence.
- These anchors remain human-review-required and are not a complete manual
  state contract. Execution, recovery, outcomes, wallet/compliance gates, and
  narrow-screen disclosure must not be inferred from them or copied wholesale.

#### Process evaluation gate

The manual pass is the first organic pressure test of this preflight. Before UI
code changes, a fresh worker must be able to recover the production state
transfer, hierarchy, exact reuse boundaries, geometry owners, continuity risks,
and truth constraints from the routed files without relying on session history.
Review the first Mint and Redeem anchors before state expansion, then record:

- any production-visible branch the worker omitted or reinterpreted;
- any accepted component default or spacing relationship the reviewer had to
  rediscover;
- any local exception introduced without a named owner; and
- whether the two anchors were structurally sound enough to multiply without a
  correction loop.

The new routing has deterministic documentation coverage but unproven
behavioral confidence until that run. If the same omission survives, revise the
smallest owner or route; do not add a new generic skill merely to repeat this
brief.

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
| Result and next action                          | Accepted outcome hierarchy, manual-owned facts         | Show received/minted amount, transaction identity, relevant basket details, and View DTF. Approval transactions remain out of the final outcome unless troubleshooting requires them.      |
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
   the requirement map in the token's original case. Normalize every address
   boundary and add a production-shaped regression before redesign work.
2. **Parallel approval prompts.** `Approve All` fires every token transaction in
   parallel. Preserve the observed behavior for the design lab, but engineering
   must confirm supported-wallet behavior and whether sequential submission is
   required. The UI must not call it one batch or one signature.
3. **USDT Revoke path is not included in Approve All.** The global hook uses the
   generic ERC-20 ABI and does not reflect the row-level `needsRevoke` branch.
   The future lab needs a realistic token requiring Revoke → Approve rather than
   implying `Approve All` handles every token uniformly.
4. **Zero minimum-output leg.** An existing E2E `fixme` proves a small Redeem can
   round one low-decimal asset's `minAmountsOut` to zero, silently removing
   protection for that leg. The UI must not invent a display workaround; an
   engineer must choose a nonzero floor or block unsafe dust Redeems.
5. **Unlimited permission consequence.** Unlimited approval defaults on. The
   future design must retain a clear control and explain its scope without
   burying it in a tooltip. Changing the default is a product/security decision.
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

### Fast manual-design implementation order

1. Build one page-hosted lab shell with independent Mint and Redeem modes,
   realistic five-asset fixtures, and no production writes.
2. Establish Mint configuration states: empty, valid, insufficient one asset,
   all approved, unlimited off/on, and deprecated/compliance gates.
3. Add approval lifecycle pressure: multiple required, Revoke required,
   authorizing, confirming, partial failure, failed-only retry, and all ready.
4. Add direct Mint wallet request, confirmation, failure recovery, and a
   receipt-shaped outcome using only facts whose truth category is explicit.
5. Add Redeem expected-assets review, simple transaction lifecycle, dust-safety
   blocked state, and outcome.
6. Verify desktop first, then make the high-level task primary and the asset
   ledger opt-in on narrow screens. Manual issuance is uncommon on phones, but
   it must remain usable and truthful.

### Future manual-lab acceptance checklist

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
