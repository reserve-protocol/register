# Portfolio table coverage and next-slice preparation

Prepared 2026-09-12 against `404bcbc414cf54eed988a9e6c95b74fa0c6e7251`
and the inspected, in-progress Auctions tree. **Source audit and preparation,
not a new lab composition, design acceptance or production migration.**

User scope: investigate missing Portfolio tables/cells, especially current
vote-locks and stakes, instead of Governance preparation. Auctions, Governance,
Current Review and the user's running preview are unchanged. Low-radius,
documentation-only work; source inspection and focused verification, self-reviewed
for intent, correctness and product coverage. No live wallet or transaction work.

## Outcome

Implementation follow-up: the subsequently authorized
[owned-position slice](design-system-owned-positions-slice.md) adds the two
recommended families. The inventory below records the pre-implementation audit,
not their current absence. Other missing sections and production-adoption gaps
remain open.

Current stake and vote-lock positions are genuinely missing as Portfolio row
compositions. They were known in the original research, then explicitly excluded
from the narrower first implementation. The gap is scope/coverage, not evidence
that these rows cannot use the system.

The recommended next slice is **owned governance positions: vote-locks and
staked RSR**, compared with the existing pending/ready withdrawals. Earn supplies
useful cells, but not the correct whole-row job: opportunities foreground rate
and TVL; Portfolio foregrounds what the viewed account owns and can manage.
This preparation does not depend on accepting the Auctions layout.

## Why they are not there

1. The [first-slice brief](design-system-table-family-first-slice.md#active-implementation-contract)
   intentionally chose ordinary DTF holdings and pending/ready withdrawals,
   excluding “every other Portfolio section.” It also rejected a universal Row
   API and a replica of every page.
2. [The actual lab composition](../../src/views/internal/design-system/table-family/review.tsx)
   mounts only Index/Yield ordinary positions and withdrawals. Its Position type
   tabs do not select stakes or vote-locks. The fixtures model those two jobs.
3. [Earn's later scope](design-system-table-family-earn-preparation.md#direct-source-inventory)
   explicitly describes opportunities visible while disconnected. Its optional
   holding column/line does not establish a Portfolio management row.
4. Earlier Claude research did not overlook them: the retained research-worktree
   inventory identifies Staked RSR as C5 and Vote-locked positions as C6, and
   recommends a broader first slice. The later, authoritative bounded brief
   narrowed that recommendation. Its broad “copy-pasted” assessment is not a
   reason to merge different data/action contracts.
5. The older research also says the self-appreciating Portfolio overlay was not
   successfully rendered. The first-slice source observation deliberately uses
   `voteLocks: []` and a zero active staked amount with pending withdrawals, so
   it cannot demonstrate either missing current-position table.

External historical evidence inspected: sibling worktree
`register-research-adef9ee76`,
`docs/plans/design-system-table-family-research.md` (§1, §8) and
`design-system-table-family-inventory.md` (C1–C11). Those documents are evidence,
not current authority. This report's current coverage and behavior findings are
independently backed by the source links below; that worktree is not required.

## Coverage map

The [Portfolio route](../../src/views/portfolio-page/index.tsx) mounts ten
table sections through nine component files. “Represented” below means a bounded
lab candidate exists, not complete production parity or accepted design.

| Production table                                                                             | Lab coverage                                               | Distinct work still needed                                                                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [Index DTF Positions](../../src/views/portfolio-page/components/dtf-positions.tsx)           | Represented                                                | Existing adoption/precision/page-context gaps remain                                                                  |
| [Yield DTF Positions](../../src/views/portfolio-page/components/dtf-positions.tsx)           | Represented                                                | Same bounded ordinary-holding slice, distinct destination/data                                                        |
| [Pending Withdrawals](../../src/views/portfolio-page/components/pending-withdrawals.tsx)     | Represented: both source branches                          | Non-RSR underlying fixture and account/transaction gates are not proven by the RSR-only lab samples                   |
| [Staked RSR Positions](../../src/views/portfolio-page/components/staked-positions.tsx)       | **Missing**; Earn has related cells                        | Owned position, balance/value, rate, governed DTF and Modify navigation                                               |
| [Vote-locked positions](../../src/views/portfolio-page/components/vote-locked-positions.tsx) | **Missing**; Earn and transaction labs cover adjacent jobs | Vault/underlying distinction, live redeemable/rate line, one/many DTFs, Modify drawer                                 |
| [Available Rewards](../../src/views/portfolio-page/components/available-rewards.tsx)         | Missing as a table                                         | Staking reward vs Revenue; Claim vs Distribute Fees, separate submission/result branches                              |
| [Voting Power](../../src/views/portfolio-page/components/voting-power.tsx)                   | Missing as a table                                         | Governed DTFs, governance token, power, weight, vault/delegate addresses and copy; not a wallet-value row             |
| [RSR](../../src/views/portfolio-page/components/rsr-section.tsx)                             | Missing composition; existing cells fit closely            | Multi-chain identity and performance/balance/value without whole-row navigation                                       |
| [Transactions](../../src/views/portfolio-page/components/transactions.tsx)                   | Missing as Portfolio activity                              | Date, token/local drawer, type, long description, explorer link, independent loading; no amount column in this source |
| [Active Proposals](../../src/views/portfolio-page/components/active-proposals.tsx)           | Related rich-record candidate, **not Portfolio coverage**  | Cross-DTF/account-context projection; inventory only here, Governance work remains paused                             |

Breakdown and Rewards Available summary widgets are page compositions, not extra
missing table types. Portfolio-wide connection, loading, error/retry, viewed-account
and empty-page states are also separate from section/cell examples.

## Current positions: source facts the next slice must retain

### These are not individual timed locks or sparse opportunity holdings

Both current-position components filter `Number(amount) > 0`, then take five rows
through [useExpandable](../../src/views/portfolio-page/components/expand-toggle.tsx).
An empty current-position section unmounts. A zero balance may still have pending
withdrawals, rewards, proposals or voting power elsewhere in Portfolio.

The [response types](../../src/views/portfolio-page/types.ts) distinguish
`voteLocks[]` (vault positions) from each position's `locks[]` (pending unlock
claims). [The pending-withdrawal atom](../../src/views/portfolio-page/atoms.ts)
flattens the latter into rows with a `lockId` and deadline. Do not invent a
countdown for every active vote-lock, or equate absence of an active position
with an empty Portfolio.

Earn's mobile rule that suppresses a confirmed-zero personal-position footer
solves a different problem. In this slice every ordinary row already represents
an owned position; its balance/value should not be reduced to an optional footer
beneath global TVL. This is a recommended hierarchy, not a new accepted layout.

### Same building blocks, different information and actions

| Concern       | Vote-lock source                                                                            | Stake source                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Identity      | Governance-token symbol/name and chain; separate underlying token with explorer destination | RSR mark/chain; derived staking-token symbol and product name                                     |
| Relationship  | Zero/one/many governed DTFs; independent links, two initially visible, inline expansion     | One governed DTF with independent link                                                            |
| Rate          | APY header; flagged vault compounds raw rate for display                                    | APY, from response                                                                                |
| Balance/value | API fallback; flagged vault reads live redeemable underlying plus exchange rate and USD     | `amount` and `value` from response; `rsrAmount` also exists in the type but is not displayed here |
| Main action   | Modify opens vote-lock sidebar; row itself has no navigation handler                        | Modify and row click open the Yield staking page in a new tab                                     |
| Sort          | Fixed initial API Value descending; no interactive sort buttons in these headers            | Initial Value descending; APY, Balance and Value sort buttons                                     |
| Narrow source | Name subtitle and Underlying hidden below 640px; Governs below 768px                        | Name subtitle hidden below 640px; Governs below 768px                                             |

These are code-inspected branches, not new phone measurements. Both sources
still retain several numeric/action columns on phone. A new stacked projection
must be inspected at actual container widths before recommending its exact geometry.

### Live valuation is the important extra seam

In [vote-locked-positions.tsx](../../src/views/portfolio-page/components/vote-locked-positions.tsx)
(32–105), flagged vault rows query the SDK for the **viewed Portfolio account**
and row chain every 30 seconds. A successful `maxWithdraw` read displays
underlying amount and `1 vault-token = exchange rate underlying`; a successful
zero is retained. Loading/error falls back to API amount/value. USD uses the
live amount and price when available, otherwise the API value.

Consequences to test, not silently fix:

- The fallback amount and resolved amount are not necessarily the same unit.
  Do not copy Earn's preformatted underlying amount and assume it describes all
  Portfolio `amount` fields. Confirm stake `amount` versus `rsrAmount` and legacy
  vote-lock denomination with the producer before adoption.
- Row filtering and initial sorting still use API amount/value, even after
  display switches to live redeemable/USD. A stale positive API amount can keep
  a zero live position mounted; sorted API value can disagree with displayed value.
- Amount, exchange rate and USD availability are independent. Missing price
  must not be collapsed into zero in proposed fixtures; the existing source
  fallback remains a separately documented engineering choice.
- The current flag is chain/address-based in
  [constants.ts](../../src/utils/constants.ts), not a `vlRSR` name test. Use its
  BSC `0xe744…6d34f` identity for that branch; the existing Earn illustrative
  `shared-rsr` row is a different address and is not proof of this hook path.
- No per-user earned amount is supplied by this row contract. Do not add one
  merely to fill visual space.

### Reuse must preserve independent destinations

Reuse EntityIdentity/ChainBadgedLogo, MetricValue, value-state and sorting
building blocks, and the existing responsive focus pattern. Do not simply
render `EarnTable` with a renamed title: it has opportunity sorting and hierarchy.

The [Portfolio Governs cell](../../src/views/portfolio-page/components/governs-cell.tsx)
links every DTF, including a one-item list. The current
[Earn candidate](../../src/views/internal/design-system/table-family/earn-governs.tsx)
renders small lists/leading entries as plain text and assumes Yield has one item.
Reuse its primitives/presentation only after preserving Portfolio's links,
empty-list handling and duplicate-symbol identities. Do not import these feature
files into production or invent a new shared disclosure API in preparation.

Modify's drawer context currently chooses the first DTF and infers optimistic
context from `activeProposals` (107–125). A shared vault with many DTFs or no active
proposal needs an explicit fixture. A sorted visually leading DTF must not
silently replace the source context. Viewed account and connected transaction
account also remain different facts; no test here proves action authority.

## Recommended sequence and fixture checklist

1. **Next review slice: owned vote-lock and stake rows.** Begin with cells, then
   desktop and 390px/constrained compositions; include 320px pressure. Keep two
   domain projections and existing names/actions. Use a clearly non-executing
   Modify boundary for the vote-lock drawer; retain navigation semantics for
   staking. Compare against the existing withdrawal rows, without reopening the
   transaction flow. No new copy, arbitrary wallet or financial derivation.
2. **Then Available Rewards.** Claim and Distribute Fees are not one action:
   source calls `claimRewards` on a vault versus `distributeFees` on a DTF.
   Receipt, pending, wrong-chain and viewed-account implications need their own
   transfer brief. Do not infer transaction acceptance from Withdrawal styling.
3. **RSR is a small reuse check; Voting Power is a distinct subsequent slice.**
   The latter includes delegated-in power, weights and address/copy relationships,
   not just another balance pair. Keep standard/optimistic semantics separate.
4. **Transactions and Portfolio Active Proposals later.** Activity/navigation
   and cross-DTF governance records need their own context. This audit does not
   restart Governance or depend on the Auctions design.

Before composing step 1, obtain strict, rendered source evidence for these cases:

| Case                                               | What it must prove                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ordinary stake and legacy vote-lock                | Actual API denomination, identity, Value order, Governed link and Modify destination                                        |
| Non-RSR underlying                                 | Vault token, underlying token and governed DTF remain distinguishable; include its pending withdrawal alongside it          |
| Flagged appreciating vault                         | API fallback → live amount/rate/value; held read, failed read, successful zero, missing price and changed sort order        |
| Zero active balance, pending claim remains         | Active section absent while the withdrawal remains; not an empty Portfolio                                                  |
| Governs: empty, one, two, many, duplicate symbols  | All independent destinations work; no symbol-key collision; drawer context does not change with display ordering            |
| Six-plus positions and contrasting numeric strings | Sorting before preview limit, expansion and explicit numeric comparator; add 11-plus if using inferred TanStack comparators |
| Long vault names, large and tiny values            | No ambiguous truncation, lost denomination, clipped action or excessive mobile growth                                       |
| Viewed account / disconnected / account change     | Presentation does not imply transaction ownership; drawer receives exact vault, underlying, chain and DTF context           |
| Loading/partial/empty/error                        | Page gate vs per-cell enrichment stays explicit; zero is not unavailable; no invented recovery copy                         |

This is a fixture specification, **not a claim those fixtures already exist**.
Prefer recorded public identities plus clearly labeled synthetic ownership and
boundary overlays; no funded wallet or chain write is necessary for row review.

## Verification and remaining evidence

- Fresh source comparison covered all ten mounted Portfolio tables, their data
  types/atoms, expansion owner, current lab composition/fixtures and Earn cell
  implementations. There is no Portfolio-specific area guide in this checkout;
  root rules and the lab/E2E guides were used.
- The existing in-app lab at `localhost:3005`, Table route, was inspected through
  its live accessibility tree without navigation, control changes or refresh.
  It contains the two Portfolio anchors and a separate Earn opportunities section,
  with the latest Auctions controls still mounted. This is inventory evidence,
  not visual validation of new Portfolio rows.
- Fresh focused Vitest: **79/79 in five files**, one worker, 11.88s. Command:
  `pnpm exec vitest run src/views/portfolio-page/tests src/views/internal/design-system/tests/table-family.test.tsx src/views/internal/design-system/tests/earn-family.test.tsx --maxWorkers=1`.
  This checks existing behavior only; it does not prove absent row coverage.
- [Production Portfolio browser coverage](../../e2e/tests/general/portfolio/state-space.spec.ts)
  tests disconnection; [partial-response coverage](../../e2e/tests/general/portfolio/partial-response.spec.ts)
  asserts surviving proposal counts. Those tests incidentally mount positions,
  but do not assert the live valuation overlay or Modify behavior. The historical
  [first-slice observation](design-system-table-family-evidence/portfolio-observation.spec.ts)
  does not populate current stake/vote-lock rows.
- No new production capture, browser regression run, full unit gate, typecheck,
  lint or CI in this documentation-only pass. Existing external screenshots and
  partial-response tests are not relabeled as fresh source proof. The earlier
  [self-appreciating plan](vlrsr-self-appreciating-vaults.md) is historical context,
  not a current mounted Portfolio verification receipt.
- Runtime: bundled Node 24.19.0/pnpm 11.19.0; dependency bootstrap disabled,
  installed dependencies unchanged. Reown remote-config fallback and existing
  development/deprecation warnings were emitted; tests passed. No server started
  or stopped and no preview cache cleared.
- Documentation checks: wiki lint passed for 20 pages; all 351 relative file
  links across the six touched documents resolve; diff whitespace check passes.
  The new report is formatted. Existing bounded briefs remain in place with a
  coverage pointer; neither their accepted scope nor Current Review is changed.

Ready to scope the owned-position slice, **not yet ready to claim source-rendered
fidelity or visual acceptance**. Engineer review is required before production
adoption for units/live fallback/filtering/sort consistency and drawer/account
context. This audit changes none of those contracts.
