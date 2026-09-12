# Earn table-family preparation

Status: implemented and verified as a lab candidate; human review required.
The [source receipt](design-system-table-family-evidence/earn-source-2026-09-11/verified/record.json)
retains 24 captures. The [final verification receipt](design-system-table-family-evidence/earn-lab-2026-09-11/verification.json)
records 15 final Earn browser checks, 52 captures, 70 focused unit/catalog tests,
app/E2E types and scoped lint/format. The preceding combined run passed 51 cases
(38 existing-family plus 13 Earn); the final Earn-only hardening was rerun after it.
No production changes or new design acceptance are implied.
This is the source-transfer brief for the [overnight plan](design-system-table-family-overnight.md),
not a replacement for direct rendered inspection or an acceptance decision.
Source fixed point: `01a900cdf2589d455d04f78806d2ca8ff2b9122c`.

## Current mobile refinement — 2026-09-12

User-authorized, low-radius lab trial: retain identity/rate above Governs-left and
TVL-right regardless of wallet state. Use a consistent 4px rate label/value gap.
When Wallet position is enabled, append a compact left-aligned personal-position
line only for a non-zero or unknown holding; loading remains explicit. The user
rejected the separated label-left/value-pair-right footer. The current trial uses
14px/300 supporting type throughout: label, USD value, then dot-separated token
amount. Only the available USD value uses primary text color. Keep label/value
spacing at 8px and the value pair together when room permits, with a wrapping
fallback for long amounts. No extra surface or divider.
Desktop retains its wallet column and muted zero values; rate copy, financial
calculations, row actions and governed-assets disclosure are unchanged.

Presence is an explicit fixture fact (`hasHolding`: true/false/unknown), not an
inference from formatted amounts or USD valuation. At production adoption it must
come from the actual token/share balance, including non-zero holdings whose USD
value rounds to zero. This is a reversible local fixture boundary, not a new
SDK/public contract. A Sparse wallet positions preview makes one funded row
inspectable without changing default fixture values or auto-enabling the wallet.
That condition is unavailable in DeFi, which has no wallet-position column.

Verification targets: stable main-fact geometry across wallet toggles, funded and
known-zero rows in one list, unknown/partial values, loading recovery, long names,
both themes at 320/390/1400, and retained sort/disclosure/drawer focus. A loading
position reserves space until resolved; confirmed-zero mobile rows intentionally
collapse that section rather than keeping a permanent empty allocation. This
supersedes the original wallet-dependent Governs placement below.

Inline refinement verification: the focused light-390 browser RED measured the
rejected footer at 44px against the new ordinary-line target of 20px. GREEN passed
15/15 Earn browser cases without retries and 32/32 focused Earn/DeFi unit cases,
app/E2E typecheck, scoped lint/format, diff whitespace and wiki lint. Browser checks
pin 14px/300 for label and amounts, the 8px gap, stable main facts, sparse-wallet
presence and loading/disclosure recovery. Long-content fixtures now also stress
wallet amounts. Light 390px Index/Yield sparse lists, dark 320px wrapped amounts,
dark 390px loading and light desktop wallet columns were visually inspected.
[Inline wallet receipt](design-system-table-family-evidence/earn-wallet-inline-2026-09-12/record.json).

Scoped intent/correctness/product self-review found no blocker. This remains a
low-radius presentation trial: the scope tool's medium size signal covers the
entire accumulated 911-file dirty tree, not this local correction. Its initial
mapped run stopped at pnpm's dependency-bootstrap/no-TTY check; scoped checks ran
with the pinned runtime and dependency verification disabled. Full suite/CI were
not run. Unit output retains Reown remote-configuration fallback warnings and
existing deprecations; browser output retains existing ambiguous-duration warnings.
No production/shared-default changes, commits or user-preview restart.

The earlier split-footer layout is rejected; its
[receipt](design-system-table-family-evidence/earn-mobile-wallet-2026-09-12/record.json)
only retains history of the presence and loading work. The presence flag has no
live adapter; production adoption still requires engineering review of actual
token/share ownership and loading/unknown states. Visual acceptance is pending.

The initial Index/Yield slice below is now complemented by the
[DeFi Yield row/cell extension](design-system-table-family-defi-slice.md),
available through the same Earn family selector. Its separate evidence and
review boundary do not expand the acceptance claims recorded here.

## What is ready

The existing Portfolio/withdrawal, Holdings and Discover families passed a
combined 38-case browser run, with no retries. The
[receipt and eight retained phone captures](design-system-table-family-evidence/overnight-baseline-2026-09-11/record.json)
are source-bound to the unchanged checkpoint. The focused semantic, typography,
DataTable and family/catalog unit suites also passed 64/64; see the adjacent
[unit receipt](design-system-table-family-evidence/overnight-baseline-2026-09-11/unit-record.json).
These are regression results, not new visual acceptance or production parity.

The public unauthenticated DAO response was captured successfully: 14 vaults,
with source URL, timestamp and SHA-256 in
[metadata](design-system-table-family-evidence/earn-source-2026-09-11/daos-meta.json).
It proves real source relationships exist; it does not prove a rendered page,
connected balance or a coherent valuation against older RPC snapshots.

## Direct source inventory

| Responsibility                                         | Source owner                                                                                                                                                                                                            | Requirement to preserve                                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Index opportunity table and governed-assets disclosure | [vote-lock positions](../../src/views/earn/views/index-dtf/components/vote-lock-positions.tsx)                                                                                                                          | Governance token → vault identity, TVL and underlying amount, conditional wallet holding, one/many governed DTFs, APR/APY, row opens drawer |
| Yield opportunity table                                | [staking positions](../../src/views/earn/views/yield-dtf/components/staking-positions.tsx)                                                                                                                              | RSR → staking-token identity, TVL and RSR amount, conditional wallet holding, governed DTF, APY, row opens staking drawer                   |
| Shared presentation                                    | [cells](../../src/views/earn/components/earn-table-cells.tsx), [table styles](../../src/views/earn/components/earn-table-styles.ts)                                                                                     | Identity relationship, paired metrics, independently operable rate help; present layout is evidence, not accepted system grammar            |
| Wallet display                                         | [position balance](../../src/views/earn/components/position-balance.tsx), [exchange rate](../../src/components/vote-lock/hooks/use-vote-lock-exchange-rate.ts)                                                          | Preserve amount denomination and independently loading wallet data; do not infer zero from unavailable                                      |
| Index data and filters                                 | [DAO hook](../../src/views/earn/views/index-dtf/hooks/use-vote-lock-positions.ts), [atoms](../../src/views/earn/views/index-dtf/atoms.ts), [filters](../../src/views/earn/views/index-dtf/components/table-filters.tsx) | Search/chain/DTF filters and hidden-symbol rules remain data concerns, outside the first cell slice                                         |
| Yield data                                             | [token list](../../src/hooks/useTokenList.tsx), [atoms](../../src/views/earn/views/yield-dtf/atoms.ts)                                                                                                                  | Distinct backing/rate calculation and loading behavior; no implied Index/Yield data unification                                             |
| Rate explanation                                       | [Index FAQ](../../src/views/earn/views/index-dtf/components/faq.tsx)                                                                                                                                                    | Help scrolls to and opens the existing answer; not currently a short tooltip                                                                |
| Action boundary                                        | [external vote-lock drawer](../../src/components/vote-lock/external-vote-lock-drawer.tsx), [vote-lock drawer](../../src/components/vote-lock/drawer.tsx), [staking drawer](../../src/components/stake-drawer/index.tsx) | Inspect the real entry boundary; full staking-flow implementation was not reviewed and no transaction path was exercised                    |

These lists are opportunities visible while disconnected, not wallet-gated
portfolio tables. Connecting adds a holding column. The source smoke tests do
not establish populated-list, sorting or drawer behavior.

## Meaning before geometry

The [independent review reconciliation](design-system-table-family-reconciliation.md)
separates the older checkpoint's questions from this newer candidate. Source
Earn headers start newly selected fields ascending, despite initial rate-descending
order; retain that behavior pending an explicit design decision. A request-error
and recovery specimen still needs source evidence and approved wording; the
existing missing-value fixture is not that state.

- Index sorts by raw `apr`; a designated self-appreciating vault displays
  compounded APY instead. Raw sorting and displayed rate order can differ.
  Keep the rate kind explicit and obtain product/engineering direction before
  changing that calculation or sorting contract.
- Both source tables use the header “Avg. 30d%”, but Yield APY is derived from
  backing/yield inputs. Do not assert identical measurement periods merely
  because the headers match. Preserve source copy pending clarification.
- The Index API type describes locked amounts as shares, while the TVL cell
  pairs `lockedAmount` with an underlying-token symbol. This is a denomination
  question requiring producer evidence, not a confirmed live defect.
- Wallet balance absence currently falls through to “None”; exchange-rate
  error paths can use a 1:1 fallback. A new value-state specimen must distinguish
  known zero, loading, unavailable amount and known amount with unavailable USD.
  That does not authorize changing production data behavior overnight.
- Governed DTFs are ranked using their market cap; more than three become a
  leading DTF plus a disclosure of others. Source drawer selection uses the
  underlying position's DTF order, not necessarily that visually leading DTF.
  Do not silently make the leading link and row action the same destination.

## Candidate scope, not design acceptance

Reuse the existing identity, numeric/value-state and sort components through
opt-in DataTable composition. Do not generalize the position family's shell:
its default sorting, column tracks and breakpoint are position-specific.

The new vocabulary is bounded to five jobs: governance/vault identity, paired
USD and underlying amount, optional wallet holding, governed-asset relationship
and disclosure, and a rate with its kind and help action. Index and Yield may
share these cells without sharing hooks, exchange-rate math or transactions.

Use the current ordinary typography and identity trials as the starting point,
not a new dense mode. Keep whole-row activation visually distinct from actual
independent DTF links; do not make the entire identity look like a separate link.
Keyboard row activation must be deliberate, with nested disclosure/help actions
isolated from it. A fixture drawer boundary must say it is non-executing.

For narrow widths, retain rate kind and governed identity instead of inheriting
the source's hidden APR/APY label and hidden TVL below 420px. A title/rate line
with paired facts below is a candidate to test, not an established composition.
Inspect populated source first and decide with whole rows at 390px, long names,
many governed DTFs and wallet states; do not approve cells in isolation.

## Historical capture stop and architectural reassessment

The new capture prototype mixed multichain list replay with a single-chain
Yield drawer replay. Its failures were fixture/setup failures, not verified
production defects. The full attempt history and unverified corrections are
preserved [outside the normal test suite](design-system-table-family-evidence/earn-source-2026-09-11/reproduction/README.md).
No existing test was disabled. Auto-review rejected further execution after
the retry limit. The user subsequently approved the narrowed restart on
2026-09-11; the passing separated batch below supersedes that earlier stop.

The code-level reassessment identified these boundaries:

- [Yield RPC replay](../../e2e/helpers/rpc.ts) accepts one chain ID or `false`.
  It is not a boolean “enable all Yield data” switch. Its other-chain fallback
  is not adequate evidence for a populated multichain Earn list.
- [Subgraph overrides](../../e2e/helpers/subgraph.ts) must identify the exact
  operation, chain and token IDs; a broad overlay can feed a legacy query the
  wrong tokens and leave the token-logo map incomplete.
- The populated list also reads `fullyCollateralized()` for each basket.
  Exact recorded responses exist for the selected baskets. The successful
  batch uses eUSD and bsdETH; hyUSD is correctly filtered out as deprecated.
  Do not add a generic true response or relax the
  harness's fail-loud unmocked-request checks.

Narrowed approach completed after approval:

1. Type-check and split the prototype. Start with disconnected Index-only
   table/disclosure captures; leave unrelated Yield lists on the existing
   empty background fixture. Prove the source table before opening drawers.
2. Capture a separate synthetic Index wallet holding with known denomination,
   then independently inspect rate-help and vote-lock drawer entry.
3. Capture the two-chain Yield list with exact list and basket responses;
   inspect a single-chain staking drawer only in its own replay context.
4. Repeat source observations in both themes at 390px and 1400px. Record
   zero/loading reachability, focus, nested actions and request identities.
   Only then complete the transfer matrix and build the first lab candidate.

This kept the fix local to the evidence setup; no new global harness architecture
was needed. The final source receipt records 18 passing cases and 24 captures.

## Next human checkpoints

Resume approval was received on 2026-09-11. Later: rate-period
copy and denomination questions require the relevant owner before adoption;
Earn mobile composition and the existing Discover card trials require visual
review. Claude's independent findings must be reconciled against exact source
and evidence, not adopted solely from a report.

## Resumed source findings and transfer contract

The final separated batch proves Index/Yield lists in light/dark at 390/1400px;
Index governed disclosure and original FAQ activation; Index loading, populated
and filtered-empty recovery; a synthetic wallet loading then converting 12,345
shares at 1.5 assets/share; and both real drawer entry/dismissal boundaries.
Every case retained strict unmocked-request checks and an empty transaction log.
Yield source includes active eUSD and bsdETH; deprecated Base hyUSD is supplied
but correctly excluded. The earlier two-row expectation using hyUSD was wrong.
The rate-help test now identifies the open accordion region rather than the
previous answer's transient closing animation. No production fix was necessary.

Limitations: Yield yield-feed replay is empty, so displayed 0% is not financial
truth. Its TVL uses the recorded mainnet RSR price; captures mix snapshot dates.
No live wallet, transaction, slashing, claim, error recovery, full filter matrix
or screen-reader session is proven. Source phone views hide wallet and TVL;
the new lab proposes preserving those facts in stacked rows instead.

The candidate retains real identities/relationships, labels and rate kinds;
all displayed numeric examples are explicitly illustrative. The source Index
sort basis remains raw APR even where the display is APY. Missing and zero
stay distinct; a known underlying balance may coexist with an unavailable USD
value. Production calculation/denomination concerns remain unchanged.

| Relationship | Candidate owner and exact use | Boundary |
| --- | --- | --- |
| Identity | Existing IdentityCell, direct 32px ChainBadgedLogo, 12px text gap | Retains the current shared trial; no new defaults |
| Primary / supporting values | MetricValue body 16px/300; supporting 14px/300; identity 16px/500 | Ordinary typography only, no dense variant |
| Governs | Existing V1 Popover with neutral InlineAction and independent DTF links | Single/short groups stay inline; larger groups disclose all others; no new shared API |
| Rate explanation | Canonical disclosure with original Index FAQ wording | Bounded explanation sample, not full FAQ or calculation redesign |
| Source row action | Canonical Dialog, explicitly labeled non-executing boundary preview | No source drawer reconstruction, submit button, wallet connection or transaction |
| Sorting | Existing DataTable state plus local columns, Sort and SortMenu | Same owner across responsive views; no second sort state |

Desktop rows use 24px outer edge insets and vertical padding with secondary
dividers; interior cells contribute 12px each to the column gap. The header
keeps the existing divider-free spacing trial. Both families group Gov. Token
and Governs before TVL, optional Your lock/Your stake, and rate. Identity and
Governs stay left aligned; metrics stay right aligned. Identity reserves 30%
without wallet facts and 26% with them; each metric reserves 18%, leaving
Governs the remaining width. These are local review proportions, not shared
table defaults. At available width below 1024px,
each record has 24px insets, identity/rate above facts, and the gray divider
starts at the left text inset and reaches the right edge. No page-container
policy is implied. The available-width control bounds the composition to 390px.

Your lock/Your stake use supporting-text color for known zero primary values,
without changing type size/weight, row tone or interaction. This is an opt-in on
the local EarnPair: TVL and rate zero values keep their existing treatment.
Detect zero from the fixture value, not its formatted string; unavailable
values remain dashes and wallet loading remains skeletons. Adoption must retain
unrounded value/position truth rather than infer a missing position from rounded
USD text.

Dataset, wallet visibility and preview conditions are independent controls.
Condition changes preserve dataset/sorting; loading removes active record
actions while leaving known structure. Focus must transfer between corresponding
visible controls across the breakpoint and return after a boundary preview.
Switching between Index and Yield resets sorting to each source's initial
rate-descending order; the two families expose different sortable fields.
The first review pair is the shared-vault Index row and the narrow wallet row;
correct those complete compositions before multiplying states. Long content,
zero/unavailable, empty and independent wallet-loading are explicit pressure cases.

## Completed checkpoint and next review

### September 11 desktop column grouping follow-up

The user requested the same descriptive-before-numeric order for Index and Yield,
with numeric alignment and phone composition unchanged. This low-radius pass
changes only the local column definitions; sorting IDs, cell anatomy, actions,
copy, loading and the mobile projection remain intact. The larger scope-tool
size reflects the retained uncommitted checkpoint, not this iteration's radius.

Four mounted header-order cases failed against the prior order, then the Earn
unit suite passed 9/9. The extended browser suites passed 15/15 without retries:
visible header/cell alignment, both wallet states and families, long values at
1024px available width, phone states, sorting/focus and loading recovery.
App/E2E types and scoped lint/format checks passed. The
[source-bound receipt](design-system-table-family-evidence/earn-columns-2026-09-11/record.json)
retains 14 inspected light/dark desktop and representative phone captures.
Images use offline fixtures and some fallback marks, not live financial data.
Intent/product/correctness self-review found no implementation blocker; this
remains a visual review candidate, with no production or shared-default change.
The owned 3043 verification server exited; the user preview was not restarted.
Full repository gates and CI were not run for this bounded iteration.

### Earlier preparation checkpoint

The [review record and agenda](design-system-table-family-evidence/earn-lab-2026-09-11/review.md)
reconciles independent findings and names the remaining human decisions.
The candidate is at `/internal/design-system/components/table#earn-family-review`.
Source and lab captures are separate: source identities/relationships inform the
candidate, but illustrative amounts and rates are not financial evidence.

Late visual hardening pinned a 23px loading-row shift, preserved the rate/help
and governed-disclosure slots, aligned wallet skeletons with their values, and
reattached disclosure resize observation after loading. Yield keeps its source
20px governed-token logo and plain symbol; Index retains dollar-prefixed symbols.
The final 15 cases pass with source-drift guards and zero transaction logs.

App/E2E type checks, 70 focused units, changed-code formatting, scoped lint,
documentation links and retained image hashes are the checkpoint boundary.
Repository lint passed with existing warnings; no full repository/CI gate is
claimed. No new checkpoint commit or push was made. Claude's isolated worktree
and the user's 3005 preview were not restarted or changed by the test harness.
