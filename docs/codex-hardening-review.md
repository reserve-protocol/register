# Codex hardening review

> **Superseded — historical audit (final disposition 2026-07-23).** This
> reviews the 2026-07-22 fixed point. Every blocker below has since been
> resolved: SDK 0.5.0 is published and pinned exact (no `link:`), the
> malformed-portfolio rows (including optimistic veto context), the
> manage-weights partial-metadata seam, and the zap-max fallback are fixed
> with RED-verified tests, master is merged, and Codex re-ran gates green on
> the final HEAD. Current state: `docs/wiki/progress.md` +
> `docs/plans/FOLLOWUPS.md`. Keep this file only for per-finding detail.

Date: 2026-07-22  
Review type: read-only, three-agent safety/test/code audit with primary-agent reconciliation  
Fixed point: `9065b3e27e54fdb8445689fc0f4299b2520c85db`  
Reviewed target: `3f21b1f291eb1220f08dd4575e0354d2a3b3d652` (`feature/hardening`)  
Diff: 166 files, 5,185 insertions, 6,171 deletions  
Included checkpoints: Register PRs #1053, #1054, #1055, and #1063  
Related release dependency: SDK PR #27

## Executive assessment

The hardening effort materially improves the codebase. The strongest changes are the strict proposal-description sanitizer, fee unavailable/value separation, exact governance state derivation, launch-time price validation, SDK ownership consolidation, DTF navigation cleanup, and the fail-loud E2E boundary harness. The main happy paths appear preserved, and no reviewer found a broad product regression across valid data.

The branch is **not ready to merge to master or release**. Its committed dependency range cannot provide the SDK hooks and contracts that the committed Register source now consumes. Local checks pass only because the current worktree links the sibling SDK. Publish and pinning are therefore a hard release boundary, not optional cleanup.

It is also inaccurate to characterize the entire diff as “guards only” or “no behavior change.” The effort contains three categories:

1. Behavior-preserving guards and refactors on valid inputs.
2. Intentional correctness/security changes on invalid, stale, tied, or unavailable inputs.
3. Public data-source and ownership migrations to the SDK.

Categories 2 and 3 intentionally alter observable behavior. Most changes are justified and safer, but the governance, auction, SDK, fee, deployment, approval, and issuance surfaces require explicit engineer review under the repository rules.

The review found:

- One Critical known release blocker.
- Two introduced correctness risks: an unchecked `BigInt` path on malformed Portfolio API rows and a staking-history loading-state regression.
- Several Important pre-existing hardening requirements that remain open, including deploy pricing/fees, automated issuance compliance, approval sequencing, quote identity/consent, frozen redemption, APY math, version identity, and dust redemption protection.
- A strong E2E architecture with several false-green seams, overclaimed lifecycle coverage, three skipped bug repros, and significant mobile/product-state gaps.
- Materially stale SDK/E2E/area documentation that currently gives an LLM contradictory instructions.

### Release-readiness scorecard

| Dimension                      | Assessment                          | Reason                                                                                                                                                  |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Published dependency integrity | Blocked                             | New SDK contracts are not available from the committed dependency range.                                                                                |
| Valid-data happy paths         | Good, pending browser release gates | No broad regression found; focused unit/type checks pass against the linked SDK.                                                                        |
| Invalid/partial-data safety    | Improved but incomplete             | Many crash/zero/fabrication guards landed; several network and money boundaries remain unsafe.                                                          |
| Governance correctness         | Stronger, engineer review required  | Bigint state oracle and tie/timelock fixes are substantial improvements; adapters still trust unvalidated rows and cast SDK inputs.                     |
| Auction/write safety           | Stronger, engineer review required  | Current v4/v5 launch guards are good; upstream metadata and legacy divisor gaps remain.                                                                 |
| E2E architecture               | Strong                              | Default-deny boundaries, exact transaction assertions, chain-scoped replay, frozen clocks, and real SPA navigation are high quality.                    |
| E2E durability/coverage        | Mixed                               | Several regression states can be routed around, mobile is nightly-only, lifecycle claims exceed assertions, and important product matrices remain open. |
| Code readability               | Improved overall, uneven            | Ownership and container structure improved; large files, historical comments, fake SDK DTOs, and type assertions remain.                                |
| LLM documentation quality      | Not reliable enough                 | The authoritative map, SDK wiki, E2E wiki, area guide, README, and progress wording disagree with current code.                                         |

## Scope, method, and limitations

The audit used three independent read-only review lenses:

- Safety: breaking changes, runtime behavior, money/governance/write gates, dependency contracts, and whether changes are truly guard-only.
- Tester: E2E architecture, regression-test seams, edge coverage, RED evidence, lifecycle/mobile coverage, and false-green risk.
- Code: readability, ownership, type safety, comments, file structure, repository conventions, and whether the diff reads naturally.

The primary review then re-read each high-severity claim in the target source, compared relevant files to the fixed point, inspected the retired hardening ledger, inspected the current wiki and area guides, and reconciled disagreements.

The review target is the committed `3f21b1f29` tree. The worktree’s `package.json` and `pnpm-lock.yaml` contain pre-existing local SDK links created by the parallel integration work; those changes were preserved and excluded from the committed-target assessment. No production code, test, wiki, package, lockfile, or workflow change was made as part of this audit.

Playwright was intentionally not started because Claude/Fable was running the same fixed-port suite in parallel. Starting another suite would violate `e2e/CLAUDE.md` and could invalidate both runs. Browser claims below therefore distinguish static inspection and previously recorded RED evidence from a fresh browser run by this auditor.

Severity means:

- **Critical**: blocks merge/release or creates a direct severe integrity failure.
- **Important**: can crash, mislead, weaken a write/money/compliance invariant, or materially invalidate test confidence.
- **Moderate**: incomplete coverage or design debt that can conceal a regression but is not a demonstrated current release break.
- **Minor**: readability, comment, documentation, or localized UI-state drift.

State labels used below:

- **Introduced**: target creates or broadens the issue relative to the fixed point.
- **Release integration**: source may be coherent with the sibling branch but the committed dependency/release contract is incomplete.
- **Pre-existing / hardening incomplete**: the issue existed before this range and remains open despite being in the retired hardening contract.
- **Coverage/documentation**: confidence or context defect rather than a verified production defect.

## What changed behavior, and why that is acceptable or risky

The following classification replaces the blanket “guards only” claim.

| Change family                                                                                      | Classification                           | Assessment                                                                                                                                          |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing array/default guards in Explorer, Tokens, and staking history                              | Guard on malformed/partial data          | Valid-data behavior should be unchanged. Staking history accidentally changed the loading UI; see I-02.                                             |
| Platform fee failure and zero-denominator handling                                                 | Intentional correctness change           | Error/invalid data now renders unavailable instead of a fabricated percentage. This is safer and user-visible by design.                            |
| Proposal Markdown sanitizer and URL policy                                                         | Intentional security change              | Hostile tags/URLs no longer render or egress. Strong real-pipeline coverage; no bypass found.                                                       |
| Governance tie, stale state, optimistic sentinel, and timelock operation ID                        | Intentional protocol-correctness change  | Previous results were wrong. The new behavior is desirable, not parity. Engineer review is still required.                                          |
| Auction missing/zero/non-finite price handling                                                     | Intentional write-policy change          | Launch now blocks with a visible reason instead of constructing unsafe calldata. This is the correct fail-closed behavior.                          |
| Brand, fee, exposure, status, performance, PnL, rebalance metrics, and proposal-state SDK adoption | Data-source/API-contract migration       | This changes cache keys, loading timing, return shapes, and ownership even when the UI goal is parity. It must be verified against a published SDK. |
| Index status from synchronous catalog rather than `/discover/dtfs`                                 | Product/data-source migration            | Removes an async fetch and changes unknown fallback behavior. Coherent with the linked SDK, but docs still describe the old route.                  |
| Arbitrum pruning for Index DTFs                                                                    | Supported-chain policy correction        | Required by project rules. Yield DTF Arbitrum support remains separate.                                                                             |
| Atom reset and unified updater work                                                                | Refactor with navigation behavior change | Removes stale cross-DTF display state. This is intentionally observable during SPA navigation and is covered at the strongest real seam.            |

Conclusion: the valid-data UI goal is mostly parity, but error, unavailable, stale, tied, hostile, and unsupported-chain behavior intentionally changes. Review and release notes should say that directly.

## Critical release blocker

### C-01 — committed Register cannot consume the SDK contracts it imports

State: release integration, known and documented.  
Impact: a clean install/CI checkout cannot typecheck or build.  
Disposition: blocks master/release; does not by itself prove the SDK migration logic is wrong.

At the reviewed committed target:

- `package.json` specifies `@reserve-protocol/react-sdk: ^0.4.0`.
- `pnpm-lock.yaml` resolves the 0.4.0 line.
- `src/views/index-dtf/overview/hooks/use-dtf-price-history.ts:2-7` imports `useIndexDtfPerformance` and `usePrefetchIndexDtfPriceHistory`.
- `src/views/index-dtf/overview/hooks/use-week-ago-pnl.ts:1-6` imports `useIndexDtfAccountBalanceSnapshot`.
- `src/views/index-dtf/index-dtf-container.tsx:140-148` expects `useIndexDtfStatus(identity)` to return a synchronous catalog status.

SDK tags 0.4.0 and 0.4.1 do not export the new performance/account-snapshot hooks. The 0.4.0 status hook returns a React Query result rather than the synchronous value expected by Register. Those APIs exist only on the hardening SDK branch/PR #27 at review time.

The current dirty worktree links both SDK packages from `../dtf-sdk`, which explains why local type/unit checks pass. This masks the clean-checkout failure. If the SDK changesets publish the documented minor release after 0.4.1, the result is expected to be 0.5.x; committed `^0.4.0` would not select it.

Required release gate:

1. Merge SDK PR #27.
2. Publish both SDK packages through changesets.
3. Pin Register to the actual published compatible versions; remove local links.
4. Perform a clean frozen install.
5. Run fresh Node 24 typecheck, unit, build, E2E snapshot check, desktop smoke/full as routed, and mobile gates.
6. Only then open `feature/hardening` toward master.

`docs/plans/FOLLOWUPS.md:6-13` correctly names this boundary. `docs/wiki/progress.md:13` should not call the combined work unqualified “shipped” while SDK PR #27 is open and clean CI is structurally unable to pass.

## Safety and product-correctness findings

### I-01 — malformed Portfolio proposal rows can now throw during atom evaluation

Severity: Important.  
State: introduced crash path on top of a pre-existing unvalidated transport.  
Engineer review: required for governance state semantics and SDK contract.

`src/views/portfolio-page/hooks/use-portfolio.ts:6-11` still casts raw JSON to `PortfolioResponse` without runtime validation. The new SDK-governance adapters then call `BigInt` directly on response fields in `src/views/portfolio-page/atoms.ts:109-120`, `144-147`, and `155-167`.

Missing, decimal, empty, or otherwise malformed vote/snapshot fields now throw during derived-atom evaluation. The fixed-point implementation used `Number`; that implementation could compute incorrect/`NaN` outcomes, but did not introduce the same synchronous `BigInt` exception. The change improves exactness for valid rows while making transport validation mandatory.

The same transport still has broader partial-body crash paths:

- `src/views/portfolio-page/utils.ts:9-59` calls `.some` on five arrays.
- `src/views/portfolio-page/atoms.ts:88-97` calls `.reduce` on those arrays.
- Neighboring atoms use `?? []`, proving normalization is not centralized.

Required closure:

- Validate/map the API response once at the fetch or SDK boundary.
- Use a discriminated invalid/error result rather than parsing unchecked strings inside render atoms.
- Test each omitted array and malformed governance scalar.
- Add partial optimistic-context vectors for missing/null/zero `vetoThresholdVotes`, `optimisticSnapshot`, and `optimisticSnapshotSupply`.
- Exercise both `getPortfolioProposalVotingState` and `portfolioActiveProposalsAtom`.
- Add a connected Portfolio browser vector for a partial 200 response.

`docs/plans/FOLLOWUPS.md:19-24` acknowledges a future full Portfolio SDK migration, but the current progress wording overstates what landed: proposal-state math migrated; current/historical/transaction transport validation did not.

### I-02 — staking history now renders “No data” while it is still loading

Severity: Important localized regression.  
State: introduced by a partial-response guard.  
Impact: contradictory loading UI; no transaction or protocol-state impact.

`buildStakeHistoryRows(undefined)` now returns `[]` in `src/views/yield-dtf/staking/components/overview/stake-history.tsx:45-53`, and the component always passes the result to `AreaChart` at `80-104`. `src/components/charts/area/AreaChart.tsx:129-143` interprets `[]` as a settled “No data” state and only `undefined` as loading.

At the fixed point, rows remained undefined until query data existed, so the chart showed its spinner. The target can display the title “Loading history…” at the same time as the chart’s “No data” message. Preserve three states:

- `undefined`: request not settled; render loading.
- `[]`: request settled with an empty or accepted partial response; render empty.
- Populated array: render history.

Test all three states through the real chart prop/render seam. This is the one confirmed user-visible regression caused by a guard in the reviewed range.

### S-01 — other high-traffic JSON boundaries still trust complete shapes

Severity: Important.  
State: pre-existing / hardening incomplete.

The retired hardening contract called for validated partial-body mappers, but these remain:

- Discover: `src/hooks/useIndexDTFList.ts:83-125` casts a raw body, then calls `data.filter` without first proving an array.
- Historical Portfolio: `src/views/portfolio-page/hooks/use-historical-portfolio.ts:30-52` calls `data.timeseries.map` without normalization.
- Index transactions: `src/hooks/useIndexDTFTransactions.ts:41-68` calls `data.transferEvents.map` without normalization.

The latter two are retained in the Portfolio follow-up. Discover-list validation should remain explicit too. The desired pattern is a typed SDK mapper or a deliberate runtime schema with documented missing-field policy, not scattered casts.

### S-02 — automated issuance compliance is a visual/pointer gate, not an action invariant

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for regulatory/compliance behavior.

`src/views/index-dtf/issuance/async-mint/steps/configure-mint.tsx:44,133-138` and `gnosis-required.tsx:218-225` apply `pointer-events-none`, opacity, and `aria-disabled` to a wrapper. That prevents pointer interaction but does not disable descendants or enforce the policy in handlers. Keyboard activation can bypass a pointer-only gate.

More importantly, the execution screen does not read `isRestricted` at all:

- `quote-summary.tsx:674-709` runs the operation after only a wallet-client check.
- `quote-summary.tsx:1182-1192` does not include compliance in the submit disabled condition.
- `quote-summary.tsx:1563-1568` does not include compliance in the final mint disabled condition.
- Retry/finalization handlers at `642-671` also lack the invariant.

A late VPN/geolocation update after the user reaches the quote screen can therefore leave write actions available. The real action handlers and buttons must gate on the current restriction state. The async wizard also needs a browser test across configure, quote, late restriction, retry, and final mint/redeem paths.

### S-03 — missing or zero deploy basket prices still become a zero deposit

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for money/write payload.

`src/views/index-dtf/deploy/steps/confirm-deploy/manual/atoms.ts:47-84` maps missing/zero price to required amount `0`, and the allowance gate accepts zero. `src/views/index-dtf/deploy/steps/confirm-deploy/simple/atoms.ts:71-80` consumes the result in the deploy payload; an absent map entry can also reach `.toFixed` and throw.

The existing unit tests preserve the zero fallback rather than asserting fail-closed behavior. A transiently unpriced asset must be represented as indeterminate, disable the deploy write, and render a token-specific reason. Test zero, missing price property, absent map entry, and mixed valid/invalid baskets.

### S-04 — deploy fee logic still fabricates economics and can divide by zero

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for money.

`src/hooks/use-platform-fee.ts:8-32` chooses `FALLBACK_PLATFORM_FEES[chainId] ?? 50`, returns it during loading/error, and divides without a denominator guard. That value is written into deploy form state by `src/views/index-dtf/deploy/steps/revenue/revenue-distribution-settings.tsx:159-171` and derives `governanceShare` in `src/views/index-dtf/deploy/permissionless/index.tsx:50-60`.

The hardened Index settings fee path does not protect this separate deploy hook. Required behavior is a loading/unavailable/value state, `denominator > 0` validation, and a blocked dependent form/write while unavailable. `docs/plans/FOLLOWUPS.md:31-32` correctly retains this item.

### S-05 — USDT-like non-zero-to-non-zero approvals remain unsafe in three paths

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for token-write sequencing.

These paths still emit one `approve(spender, amount)` when an allowance is non-zero but insufficient:

- `src/hooks/use-batch-approval.ts:64-125`
- `src/components/transaction-modal/index.tsx:29-40`
- `src/views/index-dtf/overview/components/zap-mint/submit-zap.tsx:93-111`

USDT and similar tokens require `approve(0)` before a new non-zero allowance. A shared sequencing helper should cover individual, approve-all, modal, and zap flows, with exact ordered transaction tests for a seeded non-zero allowance.

### S-06 — high-price-impact consent is global and sticky across quote identity

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for money/zap behavior.

`src/views/index-dtf/overview/components/zap-mint/atom.ts:41-48` stores consent in a plain global atom. `zap-warning-checkbox.tsx:14-49` sets it, but amount, token, operation, endpoint, and quote changes do not reset it. `submit-zap.tsx:201-211` only checks `highPriceImpact && !warningAccepted`.

After acknowledging one high-impact quote, a materially worse later quote can submit without fresh consent. Consent should be keyed to quote identity or reset whenever any quote-defining input changes. The test must prove re-consent is required after a new amount/token/tab/endpoint.

### S-07 — a stale signer/account quote can remain submittable during debounce

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for transaction recipient/refund identity.

`src/hooks/useZapSwapQuery.ts:35-67` embeds signer/account identity in the endpoint, then debounces the endpoint for 500 ms while React Query remains on the old key/result. The Index buy/sell panels expose the button from stale result state, and `submit-zap.tsx:155-165` sends server-provided transaction data verbatim. The Yield zap context has the same identity/result shape in `src/views/yield-dtf/issuance/components/zapV2/context/ZapContext.tsx:343-432` and `676-716`.

On a rapid account/chain/token change, the new wallet can be offered calldata built for the old recipient/refund identity. Input changes should invalidate the visible/submittable result immediately; only the refetch should debounce. Persist a quote identity alongside the result and require an exact match at the write handler.

### S-08 — Yield redeem action gates still omit frozen state

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for money/write availability.

`src/views/yield-dtf/issuance/components/redeem/index.tsx:13-41` disables confirm for invalid/undercollateralized state but not `frozen`. `RedeemInput.tsx:9-22` disables input when frozen, yet a previously valid amount can remain in state. The zap issuance surface passes only `disableRedeem={!isCollaterized}` in `src/views/yield-dtf/issuance/index.tsx:27-47`.

Both manual and zap redemption need one predicate that includes frozen state and is enforced at input, action button, and handler. Test a live transition from valid to frozen, not only an initially frozen render.

### S-09 — staking-vault APY can render non-finite or fabricated money values

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for money display.

`src/views/yield-dtf/auctions/auctions-sidebar/StakingVaultRevenue.tsx:86-140` divides rewards by assets and by `rewardsEnd - rewardsStart`, then uses `stBalance - futureAmt || 1` as a fabricated denominator. Degenerate periods/assets can produce `Infinity`, `NaN`, or a plausible value built from denominator 1. The general `DecimalDisplay` guard does not apply because this component formats the number directly.

Extract guarded math returning `undefined` for non-positive denominators/periods or non-finite results. Render unavailable and test the pure vectors plus component behavior.

### S-10 — version identity remains fabricated and stale during SPA navigation

Severity: Important.  
State: known pre-existing architecture debt.  
Engineer review: required for ABI/calldata selection.

`src/state/dtf/atoms.ts:139` initializes `indexDTFVersionAtom` to `4.0.0`. `src/state/dtf/reset-index-dtf-atoms.ts:47-51` intentionally does not reset it. Container identity/data/version reads resolve independently in `src/views/index-dtf/index-dtf-container.tsx:140-180`.

During navigation, the new DTF can coexist with the prior or fabricated version, selecting the wrong v4/v5 ABI, proposal transform, rebalance path, or calldata. A reset to another fabricated version is not enough. Version must be undefined/pending and tied to the same address/chain identity; every consumer must gate until that identity resolves.

### S-11 — an on-chain rebalance token can crash before the new metadata guard

Severity: Important.  
State: guard ordering remains incomplete in a touched auction surface.  
Engineer review: required for live on-chain/indexer mismatch.

`buildOpenAuctionArrays` correctly returns `token-metadata-missing` at `src/views/index-dtf/auctions/views/rebalance/utils/get-rebalance-open-auction.ts:67-70`. However, `src/views/index-dtf/auctions/views/rebalance/hooks/use-rebalance-params.ts:137-145` first dereferences `tokenMap[token].decimals` while building price inputs.

If the on-chain rebalance includes a token absent from the indexer metadata, the hook throws before the discriminated guard or disabled-state UI can run. The helper test starts downstream and therefore cannot catch this production ordering. Validate metadata before the historical-price loop and propagate the same failure to the launch UI.

The manage-weights derivation has the same shape at `manage-weights-view.tsx:79-93`: it reads `token.decimals` before the later `.filter(d => d.token)`. This should be covered by the same missing-metadata fixture.

### S-12 — legacy auction guards do not validate every consumed divisor/input

Severity: Important.  
State: pre-existing / hardening incomplete.  
Engineer review: required for auction math.

`src/lib/index-rebalance/open-auction.ts:41-63` validates supply and sell/buy prices, but `81-82` constructs `sharesValue` from unchecked `_dtfPrice`. `_priceError` is only rejected when `>= 1` at `97-100`; negative and non-finite values are accepted. The caller gates `indexDTFPriceAtom` but passes a different `proposedBasket.price` at `src/views/index-dtf/auctions/legacy/hooks/useAuctionLimits.ts:96-113` and `184-191`.

Validate finite `_dtfPrice > 0`, finite `_priceError` in `[0, 1)`, and parallel-array lengths before Decimal construction. Existing tests cover zero/NaN/Infinity token prices and zero supply, not these distinct inputs.

### S-13 — a small manual redeem can ship a zero-protection leg

Severity: Important.  
State: known pre-existing money bug represented by a skipped test.  
Engineer review: required to choose product policy.

`src/views/index-dtf/issuance/manual/components/index-manual-issuance.tsx:168-188` computes each `minAmountOut` with integer floors. For a small redeem and a low-rate/low-decimal asset, the required amount and 5% floor collapse to zero. `e2e/tests/flows/issuance-manual-boundaries.spec.ts:397-433` records the invariant but is `test.fixme`.

The product must either impose a non-zero floor where representable or block the dust redeem with a visible token-specific warning. A skipped test is not protection and needs an owner until the engineer selects the policy.

### S-14 — asset-price response parsing is only partially hardened

Severity: Moderate.  
State: touched network-boundary debt.

`src/hooks/use-asset-prices-with-snapshot.ts:12-35` rejects a top-level error object and non-array body, which is an improvement. It still casts every row, calls `token.address.toLowerCase()` without validation, defaults a missing price to zero, and `46-49` does not check `res.ok` before parsing JSON.

Downstream auction guards fail closed on zero, but malformed array elements can still throw and HTTP semantics are lost. Use the repository’s runtime schema policy, check `res.ok`, and document whether one bad row rejects the whole response or becomes a token-specific unavailable result.

## Known overview correctness bugs surfaced but not fixed by this effort

These are not regressions introduced by the reviewed range. They remain important because the new suite now contains or references their repros, while the retired bug ledger that owned them was deleted.

| Issue                                                   | Current evidence                                                               | Product effect                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Zero supply/current price disables history forever      | `use-dtf-price-history.ts:73,87-94`; `overview/edge-cases.spec.ts:45` is fixme | Fresh/zero-valued DTF can remain on a perpetual chart skeleton. |
| Zero unit price renders a hero skeleton                 | `charts/chart-overlay.tsx:98-120`                                              | A valid resolved `$0` is indistinguishable from loading.        |
| Market Cap/Supply hero still displays unit price        | `charts/chart-overlay.tsx:98-120`; `edge-cases.spec.ts:22` is fixme            | Selected chart type and headline value disagree.                |
| First chart value zero can produce wrong/NaN percentage | `charts/percentage-change.tsx:35-45`                                           | Degenerate series shows a fabricated percentage.                |
| Loaded-empty exposure renders a skeleton forever        | `basket-overview/basket-table-body.tsx:45-56`                                  | All-zero/empty exposure looks permanently loading.              |

These should be tracked as executable bugs with owner/acceptance criteria, not described as active passing coverage.

## Verified safety strengths

The review deliberately tried to disconfirm high-risk changes. These parts held up:

- Current v4/v5 rebalance launch construction validates consumed finite positive prices and token metadata before the write helper. Invalid states produce a disabled control/reason rather than calldata.
- Legacy v2 validates supply and sell/buy prices; the remaining distinct legacy inputs are called out in S-12 rather than treating the whole path as unsafe.
- Yield and Portfolio proposal lifecycle now delegates to SDK bigint oracles. Tie-to-DEFEATED, stale PENDING resolution, optimistic transition sentinel, quorum boundaries, and multi-action timelock vectors are materially stronger than the previous local `Number` logic.
- Settings/platform-fee display distinguishes loading, unavailable/invalid, legitimate zero numerator, and valid value. It no longer presents a fabricated fallback as truth on that route.
- The Markdown sanitizer runs after raw HTML parsing with an explicit allowlist; unsafe URL handling accepts only HTTP(S), and blank-target links get safe `rel` defaults. No bypass was found in the reviewed paths.
- The Index container reset clears prior transactions, market cap, exposure, fee, and status. Real in-app navigation holds destination boundaries and verifies stale values do not flash.
- Brand mapping ownership is coherent in the linked SDK; Register no longer keeps a second brand-shape coercion.
- Performance/PnL ownership is sensibly split: SDK owns transport/cache/price selection; Register owns period selection and product-level value difference.
- No new Index DTF Arbitrum route was introduced. Yield-specific Arbitrum handling remains isolated.

## Test-suite audit

### What is genuinely strong

The suite is not superficial. Its best patterns should become the default template:

- Default-deny external traffic is installed before page code, and committed acceptance specs do not enable `allowUnmocked`.
- API/subgraph/RPC overrides can match path, variables, chain, address, selector, and full calldata.
- Transaction tests inspect chain, target, value, function, arguments, approval order/amount, receipt outcome, and explorer identity rather than only a success toast.
- The transaction ledger correlates receipts to recorded hashes and chain.
- Time-sensitive governance/rebalance specs freeze browser and RPC time together and advance observable timers rather than sleeping.
- Yield replay is chain-scoped and fail-loud for unknown captured reads.
- Snapshot publication is manifest-validated and atomic.
- Proposal sanitizer tests use the real Markdown pipeline and a real page with hostile payloads/egress checks.
- Governance state vectors use bigint one-wei boundaries beyond `2^53`, not small-number approximations.
- Launch-price browser tests install failure before navigation, assert the visible blocking reason and disabled action, and confirm no transaction was emitted.
- The DTF navigation cleanup test is the strongest pattern in the effort: real SPA click, held destination boundaries, positive hold-hit assertions, and visible skeleton assertions before release.
- Static inspection found no committed `waitForTimeout`, raw `page.clock.*`, spec-local `page.route`, or `allowUnmocked: true` in the reviewed acceptance suite.

### T-01 — three partial-response tests do not prove the malformed override was consumed

Severity: Important coverage durability issue.

Affected specs:

- `e2e/tests/general/explorer/render.spec.ts:51-64`
- `e2e/tests/general/tokens/unlisted-partial.spec.ts:47-69`
- `e2e/tests/yield-dtf/staking/history-partial.spec.ts:26-48`

Each final assertion can pass against the normal healthy fixture. A healthy row/panel proves the page loaded, but does not prove the malformed chain/operation matcher fired. Recorded RED-on-revert runs show the tests caught the intended bug when written; future matcher, operation-name, or chain-set drift can route around the injected state and leave them green.

Required pattern:

- Inject `boundaryRequests` and assert exact operation, chain, and variables.
- Prefer an override/hold with an observable hit counter.
- Give healthy and malformed chains distinct data and assert both survival and malformed-chain absence/empty result.
- For staking, assert the settled empty-series state rather than only panel presence.

### T-02 — optimistic Portfolio partial context is not pinned fail-closed

Severity: Important.

`src/views/portfolio-page/tests/atoms.test.ts:179-242` covers complete context, threshold boundaries, and the `MAX_UINT256` sentinel, but not a missing/null/zero vector for every veto field. Given I-01, these tests must cover both malformed transport rejection and the product fallback when optional context is intentionally absent.

Assertions should prove an incomplete row never becomes executable or spuriously `SUCCEEDED`, while preserving the SDK’s intended conservative source-state fallback. The comment at `atoms.ts:128` currently says missing context reports `CANCELED`; the implementation returns no context, so the comment is wrong.

### T-03 — the “0-auction metrics” E2E does not assert zero auctions

Severity: Moderate.

`e2e/tests/flows/auctions.spec.ts:152-200` injects `auctions: []` and asserts `42.5%` plus `7,654,321`. That proves the row resolved but never proves the advertised user contract: a displayed auction count of zero. A mapper unit test covers `auctionsRun === 0`, but not the browser rendering.

Add a structural auction-count test ID and assert zero in the same row without relying on translated copy.

### T-04 — lifecycle tests overclaim “no reflow” and L0-L3 coverage

Severity: Moderate.

The overview test at `e2e/tests/index-dtf/overview/lifecycle.spec.ts:15-47` is named “no reflow” but uses `expectStablePosition`, whose helper deliberately ignores width and height. It measures no peer element, so the wrapper may resize and push adjacent/downstream content without failing.

The chart L2 test proves independent resolution but does not measure whether chart resolution shifts the hero or another island. Settings, auctions, and governance lifecycle specs only assert skeleton presence/removal and content visibility; they do not prove shape/count, same-box replacement, independent islands, or a zero-shift budget.

Use `expectStableBox` on a fixed wrapper and measure at least one peer across release. If resizing is intentionally allowed, keep `expectStablePosition` but name the test “stable origin,” not “no reflow.” The map should mark these pages partial, not L0-L3 complete.

### T-05 — reset tests pin only a subset of the reset contract

Severity: Moderate.

`src/state/dtf/reset-index-dtf-atoms.ts:28-46` resets roughly eighteen route-specific atoms and claims every route-written atom belongs there. `src/state/dtf/tests/reset-index-dtf-atoms.test.ts:26-39` seeds/checks only transactions, market cap, status, and fee; the E2E covers market cap and transaction volume.

Removing brand, basket, exposure, PnL, range, or rebalance-control resets can leave current tests green. Add a table-driven unit characterization for every reset entry, and retain the real-SPA E2E for visible integration behavior.

### T-06 — the zero-supply Manage Weights test lacks a positive control

Severity: Moderate.

`src/views/index-dtf/auctions/views/rebalance/components/manage-weights/tests/manage-weights-view.test.tsx:43-47` mocks the entire content and only asserts that zero supply renders nothing. It also passes if the component always renders nothing.

Add a non-zero-supply case that renders a sentinel, plus independent non-weight-controlled/hidden-state gates.

### T-07 — fee E2E derives expected output with production-equivalent math

Severity: Moderate.

`e2e/tests/flows/settings.spec.ts:61-99` recreates fee recipient parsing, `PERCENT_ADJUST`, and percentage formatting. This catches implementation drift but is not an independent money oracle; a shared misunderstanding can make product and test agree.

Use a fixed worked fixture with literal expected percentages or an authoritative SDK fixture whose expected display values were derived independently. Preserve the excellent controls for failure/unavailable, zero denominator, legitimate zero numerator, and 100% degeneracy.

### T-08 — mobile is not a PR gate and does not cover most hardening states

Severity: Moderate.

`playwright.config.ts` defines a mobile project, but `.github/workflows/playwright.yml:26-48` runs desktop smoke for pull requests. Mobile runs only nightly/manual at `56-85`. At review time, 18 of 72 spec files carried `@mobile`; file count is not page coverage, but it disproves the map’s stated “every page” contract.

Fee bounds, 100% fee, launch-price failure, Explorer/Token partial responses, and proposal calldata are examples of desktop-only hardening states. Add a PR mobile-smoke gate for the highest-risk render/disabled-action states; keep the deeper mobile matrix nightly if runtime cost requires it.

### T-09 — skipped bug repros are described as executed evidence

Severity: Moderate documentation/confidence issue.

There are three current `test.fixme` cases:

1. Overview Market Cap/Supply hero displays unit price.
2. Overview zero-supply/current-price history remains a perpetual skeleton.
3. Manual redeem can emit a zero `minAmountsOut` leg.

`e2e:check` verifies that each fixme contains a real app observation, but does not run it or prove RED. Comments in `overview/edge-cases.spec.ts` describe the failing assertion as validation that the suite catches the bug; a fixme never executes. Treat these as executable repro definitions with last-known manual RED evidence and an owner, not active coverage.

`docs/plans/FOLLOWUPS.md` does not currently own all three. Deleting the former bug ledger removed the durable owner/acceptance record.

### T-10 — translated English selectors remain in governance flows

Severity: Minor/Moderate test fragility.

Examples include:

- `e2e/tests/index-dtf/governance/fee-bounds.spec.ts:54,61`
- `e2e/tests/flows/governance-propose-dtf-settings.spec.ts:88,117-119`
- `e2e/tests/flows/governance-propose-basket-settings.spec.ts:94-98,127-130`

The comments acknowledge missing IDs, but the debt conflicts with `e2e/CLAUDE.md`. Add structural confirm, submit, and section-toggle test IDs. Copy/translation changes should not break governance calldata tests.

### T-11 — comments and names retain stale bug history

Severity: Minor.

`governance-propose-basket-settings.spec.ts:24-31,201-202` says assertions are fixme’d and the phantom calldata remains, but the assertions are live and the fix landed. `issuance-deprecated.spec.ts:18` says a failing condition “converts to test.fixme,” which is not automatic behavior. Multiple helpers/specs retain `CODEX`, `HARN-*`, `Z*`, `M*`, and old ledger IDs.

These comments are actively misleading, not merely verbose. Keep the invariant and move historical finding identity to this audit/git history.

### Coverage still unproven

The current suite should not claim these surfaces as complete:

- Async-mint CoW wizard compliance, omitted-price display suppression, late restriction, quote/sign/order lifecycle, convert-held, and retry/finalization.
- Manual issuance deprecated/sell-only behavior; only the zap surface has that characterization.
- Optimistic governance product matrix: challenge voting, veto window, execute-without-queue, eligibility, previews, delegates, and partial context.
- Valid `openAuction*` numerical calldata across v4/v5/hybrid/legacy; price failure is strongest on the BSC/v5 browser path.
- Every optional completed-rebalance analytic’s unavailable-versus-zero rendering.
- Mint-fee maximum; current fee-bounds E2E focuses on TVL fee.
- Zap Max from the real missing Chainlink/input-price boundary; its component test mocks `ZapContext`.
- Full Yield governance, auction, settings, and write surfaces.
- Most page-level L0-L3 and mobile dimensions.
- Version-selected ABI/calldata behavior during a real DTF identity transition.

## Code-quality audit

### K-01 — governance adapters construct SDK `Amount` objects and cast away contract mismatches

Severity: Important design debt.  
Engineer review: required for SDK/governance contract.

Portfolio builds `Amount` values and casts the object to the SDK input type at `src/views/portfolio-page/atoms.ts:109-112` and `168-196`. Yield does the same at `src/views/yield-dtf/governance/views/proposal-detail/atom.ts:73-96`.

The Yield helper uses `parseEther` for both detail-formatted values and raw list wei values. Scaling all vote/quorum values by another `1e18` preserves current ratio comparisons, so the reviewed state vectors still pass, but it violates `Amount.raw` semantics and creates a fragile coincidence. Both `as Parameters<...>[0]` assertions suppress structural/type evidence that the DTO is not the SDK’s actual mapped shape.

This conflicts with `docs/wiki/sdk.md`’s rule not to rebuild fake SDK `Amount`s. The long-term answer is an SDK proposal mapper/hook for each seam. If a temporary bridge is unavoidable, raw and formatted inputs need separately typed adapters with no assertion and explicit unit tests.

### K-02 — touched network code still uses assertions instead of boundary schemas

Severity: Important/Moderate.

The Portfolio path in I-01 is the most serious example. `use-asset-prices-with-snapshot.ts` is another. These violate the binding improvement rule to validate network bodies at the boundary, fail intentionally, and keep exact types downstream.

The refactor successfully centralized several data sources in the SDK. The remaining local network seams should follow the same ownership model rather than adding one-off casts/defaults.

### K-03 — the comment cleanup is incomplete and conflicts with the local style

Severity: Minor.

`skills/code-standards.md` asks for one-line WHY comments and no finding IDs. Production and test infrastructure still contain multi-line historical narratives and finding IDs, including:

- `src/state/dtf/reset-index-dtf-atoms.ts:25-27`
- `src/utils/form-validation.ts:15-17`
- `src/components/decimal-display/index.tsx:5-7,20-21`
- `src/views/portfolio-page/hooks/use-historical-portfolio.ts:62-63`
- `src/views/yield-dtf/staking/components/overview/stake-history.tsx:45-48`
- `src/views/yield-dtf/issuance/components/zapV2/context/max-token-in.ts:1-5`
- `src/views/index-dtf/issuance/async-mint/steps/quote-summary.tsx:234-236`
- `src/views/tokens/useUnlistedTokens.ts:92-93`
- `e2e/fixtures/base.ts:96,141`
- `e2e/helpers/subgraph.ts:185-210`
- `e2e/helpers/rpc.ts:505`
- `e2e/scripts/check.ts:172-219`

Security/trust boundaries may need more explanation, but the present comments often mix invariant, incident history, test instructions, and ledger identity. Keep one concise WHY near code; move history and test routing to the area guide/review document.

### K-04 — a tested status helper is not used by production

Severity: Minor.

`src/hooks/use-dtf-status.ts:69-76` defines `deriveDtfStatus`; `useDTFStatus` duplicates the fallback at `78-96`. Repository search shows the helper is otherwise used by tests. Either route the production return through the helper or test the real hook seam; otherwise the test can remain green while production drifts.

### K-05 — large touched files remain engineer-review and readability flags

Severity: Moderate maintainability debt, not a reason to expand this hardening PR by itself.

Notable touched production files include:

- `quote-summary.tsx`: 1,744 lines (localized hardening changes in a pre-existing file).
- `propose-dtf-settings/atoms.ts`: 956 lines.
- `dtf-settings-preview.tsx`: 906 lines.
- `propose-dtf-settings/updater.tsx`: 737 lines.
- Yield `ZapContext.tsx`: 731 lines.
- Portfolio `atoms.ts`: 419 lines after adding proposal adapters.
- `index-dtf-container.tsx`: 355 lines, improved from roughly 667.

The container reduction is a real win. The next extraction priority should be pure, typed governance adapters out of Portfolio atoms and cohesive settings proposal domains, not arbitrary line-count splitting.

### K-06 — three imperative SDK escape hatches remain

Severity: Moderate known debt.

`useDtfSdk` remains in:

- `src/components/vote-lock/hooks/use-vote-lock-refresh.ts`
- `src/views/index-dtf/governance/hooks/use-recent-proposal-receipt.ts`
- `src/views/index-dtf/governance/views/propose/shared/hooks/use-proposal-type-eligibility.ts`

`docs/plans/FOLLOWUPS.md:28-30` correctly owns these. No direct `@reserve-protocol/sdk` import was found under `src`.

### K-07 — pre-existing state/cache debt remains in touched neighborhoods

Severity: Moderate/Minor, not introduced by this range.

- `use-rebalance-auctions.ts:62-75` reads a chain-specific endpoint but omits `chainId` from the query key, allowing a cross-chain cache collision. This is already listed in `docs/wiki/improvements.md`.
- Controlled-state mirrors remain in `src/components/chain-filter/index.tsx:51-66` and `src/views/tokens/useUnlistedTokens.ts:121-129`.
- The unified Index updater still mirrors SDK queries into atoms for existing consumers. The reviewer verified seven consumers, including derived proposal atoms, so deleting those atoms in this checkpoint would have been unsafe. Treat the updater as a migration bridge and prevent new consumers.

### Code-quality strengths

- SDK migrations delete substantial local transport/type code and give completed rebalance metrics and performance history a clearer owner.
- The shared sanitizer is a justified rule-of-three extraction at a real attacker-controlled seam.
- Fee loading/unavailable/value semantics are clearer and remove duplicated fallback math.
- The unified updater reduces scattered effects and substantially shrinks the container.
- Brand shape coercion now has one SDK owner.
- Chain-domain separation is explicit and respects the project’s no-Index-Arbitrum rule.
- The target diff is whitespace-clean.

## Documentation and LLM-context audit

The documentation passes structural wiki lint, but structural lint is not semantic correctness. Several authoritative pages are stale enough to cause incorrect future changes.

### D-01 — `docs/wiki/sdk.md` contradicts the current integration

Severity: Important context defect.

Contradictions include:

- `30-32` says Register never imports `useDtfSdk`; three escapees remain.
- `61-62` then lists `useDtfSdk()` for imperative client access, contradicting the earlier statement.
- `46-50` describes the 0.3.x/installed 0.2.0 era while the committed target is on the 0.4.0 line and the integration requires a later release.
- `99-106` says status comes from the Reserve API; Index status now comes from the synchronous SDK catalog.
- Frontmatter says `updated: 2026-07-14` while the page contains a 2026-07-21 decision.

The page should define the current three-tier ownership model, current published/pending versions, the exact three temporary escapees, synchronous catalog status, and the release-link procedure. Remove obsolete version archaeology after preserving the durable decision in `log.md`.

### D-02 — `docs/wiki/domains/e2e.md` mixes durable rules with stale history

Severity: Important context defect.

Examples:

- `140-149` lists v4 writes, basket settings, auction launch, and form bounds as open even though much of that coverage landed and `VITE_E2E` now enables production validation.
- `174-177` describes status as an SDK `/discover/dtfs` query with `KNOWN_DEPRECATED`; current Index status is synchronous catalog lookup.
- The page is 266 lines and retains multiple historical rollout sections. The wiki guidance targets compact durable context around 100 lines.

Keep the offline boundary contract, transaction/time rules, snapshots, commands/CI, and honest current gaps. Move dated coverage-wave history to `docs/wiki/log.md` or git.

### D-03 — `e2e/TEST_MAP.md` is internally contradictory and not authoritative

Severity: Important context defect.

The 196-line map contains an obsolete matrix, a proposed migration that has already occurred, and a later “authoritative correction” that is itself stale.

Verified contradictions:

- `37-40` promises four desktop/mobile projects; Playwright defines three.
- `50-62` calls Earn, Portfolio, Explorer, and Bridge entirely uncovered despite current domain specs; Bridge is also described as a form even though it is static links.
- `68` still calls the SPA navigation bug a fixme after it was activated/fixed.
- `77` calls basket-settings a fixme after the assertions became live.
- `78,110,118-126` retain a Whitelist proposal type; `164` says that type does not exist and instructs the reader to replace it.
- `81` says auction writes are uncovered despite launch-write/price-guard specs.
- `93` labels staking partial-response as Z38, but retired Z38 was a different money-label issue in deleted code.
- `130-151` presents the domain tree as proposed and says 42 specs; the current tree exists with 72 spec files.
- `174` says lifecycle/mobile are uncovered everywhere despite multiple lifecycle specs and 18 mobile-tagged files.

Replace the entire correction-layer model with one generated-or-maintained current matrix. Every row should name exact spec(s), state coverage, lifecycle level, mobile status, and known bug/fixme owner.

### D-04 — the Overview area guide describes deleted data paths

Severity: Important context defect.

`src/views/index-dtf/overview/CLAUDE.md:15-20,47-48` says hero price comes from `/current/dtf` via `use-dtf-price.ts`; current hero price derives from SDK basket prices, and that hook is unused. `62-64` describes the obsolete discovery-fetch/`KNOWN_DEPRECATED` status path.

This is especially dangerous because the root router tells agents to read the area guide before changing the view. Update provenance, exact current specs, zero/loading semantics, status ownership, and the unresolved fixmes.

### D-05 — `e2e/README.md` conflicts with Playwright server safety

Severity: Moderate.

`e2e/README.md:27` says an existing server on port 3005 is reused. `playwright.config.ts:62-65` explicitly sets `reuseExistingServer: false` so the pinned E2E environment cannot be bypassed by a foreign server. The README must match the fail-loud config.

### D-06 — `docs/data-sources.md` is stale relative to SDK ownership

Severity: Moderate/Important context defect.

The page was last updated 2026-03-04 and still says:

- Basket/prices convenience `/current/dtf` owns Overview display.
- Metadata lives in `indexDTFAtom` from the subgraph.
- Historical data is consumed directly by charts/performance.

It does not describe the current react-sdk ownership, synchronous catalog status, performance hook, fee mapper, brand mapper, or proposed source-routing rules. Either update it as the detailed source registry and link it from `sdk.md`, or retire it in favor of one authoritative page. Two overlapping source-of-truth documents will drift again.

### D-07 — progress and follow-ups overstate completion and lost requirements

Severity: Important ledger defect.

`docs/wiki/progress.md:13` says the hardening × SDK effort “shipped” and “every guard revert-verified,” while SDK PR #27 remains unpublished and multiple retired requirements were deferred. It also says broad “portfolio SDK adoption,” when only proposal-governance math moved.

The final cleanup deleted `docs/plans/E2E_BUG_LEDGER.md` and the two `REGISTER_HARDENING` plans, then created a much shorter `FOLLOWUPS.md`. Git preserves history, but future agents no longer see owner/acceptance criteria for several live issues, including:

- Automated issuance compliance.
- Overview zero supply/zero price, wrong data-type hero, zero-base percentage, and loaded-empty exposure.
- Manual redeem zero slippage protection.
- Deploy zero/missing price blocking.
- USDT zero-first approvals.
- Sticky price-impact consent and stale signer quote.
- Frozen Yield redeem and staking-vault APY.
- Discover/Portfolio/historical/transaction response validation.
- Version identity.
- The three active `test.fixme` owners.

The current `FOLLOWUPS.md` is directionally good but needs explicit acceptance tests and engineer-review labels for these live requirements. Progress should say “integration complete on feature branch; release-blocked,” scope its revert-verified claim to the guards that actually landed, and distinguish Portfolio governance adoption from transport adoption.

### D-08 — wiki compression and date hygiene need a semantic pass

Severity: Moderate.

Pages over or near the wiki’s compact-context target include:

- `docs/wiki/domains/e2e.md`: 266 lines.
- `docs/wiki/sdk.md`: 116 lines.
- `docs/wiki/domains/overview-charts.md`: 105 lines.
- `docs/wiki/progress.md`: 103 lines.
- `docs/wiki/log.md`: 122 lines.

Length alone is not a defect. E2E is a demonstrated problem because obsolete history and current rules coexist. Split/prune only where it removes routing ambiguity. Update frontmatter dates when content changes; current lint tolerates several commits of staleness and should not be treated as semantic freshness proof.

### Recommended documentation topology

Keep each fact in one place:

- `docs/wiki/sdk.md`: durable SDK ownership/contracts and current release integration rule.
- `docs/data-sources.md` or a replacement wiki page: exact endpoint/source matrix; not both.
- `docs/wiki/domains/e2e.md`: durable harness architecture and current CI contract only.
- `e2e/TEST_MAP.md`: one current route/state/lifecycle/mobile matrix with direct spec links and fixme owners.
- Area `CLAUDE.md`: local provenance, edge states, and diff-to-test routing only.
- `docs/wiki/progress.md`: short stage outcome and actual fresh verifier.
- `docs/plans/FOLLOWUPS.md`: unresolved requirement, owner/decision dependency, acceptance test, engineer-review flag.
- `docs/wiki/log.md` and git: dated rollout history and retired findings.

## Three-agent reconciliation

### Safety-agent result

Adopted:

- The SDK release boundary is Critical and blocks master.
- “Guards only/no behavior change” is false; the intentional behavior/source migrations are correctly classified above.
- Unvalidated Portfolio/discover/history/transaction boundaries remain safety debt.
- Deploy price/fee, approvals, consent, quote identity, frozen redemption, APY, and version identity remain open.
- Staking history has an introduced loading-state regression.
- Current rebalance launch guards, governance bigint derivation, fee unavailable behavior, and sanitizer are meaningful strengths.

Refinement after primary re-read:

- Portfolio transport debt and the newly introduced `BigInt` throw are separated: the raw cast is old, the throw surface is new.
- Automated issuance compliance, upstream token metadata, legacy auction divisors, manual dust redemption, and partial asset-price parsing were added because they were independently verified and remain within the retired hardening scope.

### Tester-agent result

Adopted:

- Three partial-response E2Es can false-green if the malformed override stops matching.
- Optimistic partial-context vectors are missing.
- The zero-auction browser test does not assert the zero count.
- Lifecycle/no-reflow claims exceed their actual assertions.
- Reset and Manage Weights unit tests need positive/full-contract controls.
- Fee expected values need an independent oracle.
- Mobile is not a PR gate, fixmes are not executed evidence, and translated governance selectors remain fragile.
- The E2E wiki/map/area guide are materially stale.

Qualification:

- The affected partial-response tests had recorded RED-on-revert evidence when introduced, so they are not dismissed as useless. The issue is future durability if identity matching drifts.
- Unit coverage for `auctionsRun === 0` exists; the missing contract is specifically user-visible browser rendering.

### Code-agent result

Adopted:

- Staking loading behavior regressed.
- Portfolio `BigInt` parsing can now throw on unchecked rows.
- Auction token metadata is dereferenced before the new guard.
- Legacy auction inputs are under-validated.
- Governance adapters manufacture/cast SDK DTOs.
- Comments retain inaccurate history/finding IDs, production duplicates a test-only status helper, and large touched files remain review flags.
- SDK ownership, sanitizer extraction, fee semantics, chain isolation, and container reduction are strong improvements.

Qualification:

- The Yield fake-`Amount` scaling does not currently change ratio-based proposal outcomes because every vote/quorum operand is scaled equally. It remains an SDK contract/type-quality defect, not a demonstrated lifecycle regression.
- Atom mirroring in the unified updater was not flagged as dead code: seven current consumers justify it as a migration bridge. New code should use SDK hooks directly.

### Claims rejected or deliberately not elevated

- No sanitizer bypass was found; the real pipeline and URL egress policy are strong.
- No new Index Arbitrum support/leak was found.
- Display-leaf `Number` conversion is not automatically a money-write violation. Conversions used only to format percentages/PnL were not elevated unless they can change a protocol threshold or display non-finite values.
- The fee updater atom remains necessary for existing consumers; deleting it in this checkpoint would break derived proposal/settings state.
- The local green checks are useful integration evidence but not release evidence because they run against the linked SDK.

## Prioritized closure order

### P0 — release integrity

1. Merge/publish SDK PR #27.
2. Pin both published SDK packages and remove links.
3. Clean install and run all Node 24 release gates.
4. Change progress wording from shipped to integration-complete/release-blocked until those gates pass.

### P1 — introduced or direct write/compliance risks

1. Validate Portfolio rows before all `BigInt`/array operations.
2. Restore the staking history loading/empty/populated tri-state.
3. Enforce async compliance in real action buttons and handlers.
4. Resolve version identity before any ABI/calldata consumer.
5. Move token metadata validation ahead of every auction derivation and complete legacy input guards.
6. Choose and enforce the manual redeem dust/min-out policy.

Every item in this group requires a real test at the failing seam; governance, SDK, auction, issuance, and money items require engineer review.

### P2 — remaining hardening contract

1. Fail closed on deploy prices and deploy fee availability.
2. Centralize zero-first approvals.
3. Key price-impact consent and zap results to quote identity.
4. Gate frozen Yield redemption everywhere.
5. Guard staking-vault APY math.
6. Validate Discover, historical Portfolio, transaction, and asset-price boundaries.
7. Fix/activate the overview zero/data-type/empty-state repros.

### P3 — test confidence

1. Add boundary-hit assertions to partial-response specs.
2. Complete optimistic partial-context vectors.
3. Assert zero-auction UI count.
4. Make lifecycle claims match box/peer measurements.
5. Characterize every reset atom and add positive controls.
6. Add a risk-routed mobile PR smoke set.
7. Give every fixme an owner and last-known RED record.

### P4 — LLM context and readability

1. Rewrite the E2E map as one current matrix.
2. Correct SDK/E2E/Overview/data-source provenance.
3. Fix README server reuse and progress/release wording.
4. Restore unresolved acceptance criteria to `FOLLOWUPS.md`.
5. Remove stale finding-ID narratives and inaccurate comments.
6. Extract typed governance adapters before adding more logic to large atoms/updaters.

## Verification evidence

Fresh during this audit:

| Command/check                                  | Result                                                                               | Limitation                                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `git diff --check 9065b3e27..3f21b1f29`        | Green                                                                                | Static whitespace only.                                                                                                        |
| `pnpm typecheck`                               | Green                                                                                | Ran under local Node 22 with an engine warning and linked SDK; release requires Node 24/published pins.                        |
| `pnpm test:run`                                | 94 files, 832 tests passed                                                           | Linked SDK; several tests attempted remote Reown config and logged `ENOTFOUND`, so the unit environment is noisy/non-hermetic. |
| Safety reviewer’s focused high-risk Vitest set | 8 files, 75 tests passed                                                             | Linked SDK; focused state/math/reset/fee/PnL/auction tests only.                                                               |
| `pnpm e2e:check`                               | Green; all 63 required snapshots, chain-scoped Yield replay, three recognized fixmes | Static snapshot/fixme validation; does not execute Playwright or prove fixmes RED.                                             |
| `node scripts/llm-workflow/wiki-lint.mjs`      | Green; 19 pages                                                                      | Structural links/frontmatter/freshness window only; does not detect semantic contradictions above.                             |

Not run by this auditor:

- Playwright smoke/full/mobile, to avoid colliding with the parallel Claude/Fable fixed-port server.
- A clean published-SDK install/build, because the required SDK release did not exist at the reviewed point.

The full unit run emitted remote Reown configuration failures for several tests and a Sentry telemetry notice. The tests still passed, but hardening tests should not attempt real network configuration. Mock the remote config/bootstrap once at test setup or disable it in the test environment so genuine boundary escapes remain visible.

## Final handoff

The codebase is safer and more coherent than at the fixed point, and the E2E foundation is unusually strong. The effort should continue from this branch rather than be rolled back. It should not be merged or described as complete until the SDK is published/pinned and clean release gates pass.

The next checkpoint should treat this document as the reconciled finding ledger. Update each item with a commit/test disposition as it lands; do not convert unresolved bugs into comments or skipped tests without an owner.

**Engineer review required:** SDK contracts/release pins; governance DTO/state derivation; auction price/metadata/legacy math and calldata gates; deploy deposit and fee math; approval sequencing; zap quote identity and impact consent; async compliance; manual dust redemption; frozen Yield redemption; staking-vault APY; version-selected ABI/calldata; and any change to shared atom/default behavior.
