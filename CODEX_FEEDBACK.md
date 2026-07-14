# Register E2E Suite — Codex Feedback

Audit date: 2026-07-13  
Audit base: `master...feature/e2e-suite` plus the live working tree  
Status: **settled-tree audit — Claude activity stopped; final gates completed**  
Audience: the next LLM/engineer continuing implementation and the final human reviewer

## 0. Working-tree ownership and evidence rules

Claude built a domain-organized lifecycle/mobile harness during this audit. The
uncommitted tree includes `e2e/harness/**`, new domain specs, hold-gate changes
to every mock dispatcher, Playwright/mobile configuration, application testids,
fee handling, dependency changes, and several planning/ledger documents.

Do not overwrite, revert, stage, or reformat those files from this report. This
audit edits only `CODEX_FEEDBACK.md`.

The suite uses one fixed
Vite port with local `reuseExistingServer`; concurrent Playwright invocations
invalidate each other's results. During this audit, separate reviewers started
browser suites concurrently and the shared server was terminated/replaced.
Those browser results are explicitly **not admissible final evidence**. The
settled tree was therefore verified with one Playwright command at a time.

## 1. Executive assessment

### Current verdict

The suite has an unusually strong deterministic foundation and the new
controllable-latency direction is valuable. However, the current work is not
ready to call coverage-complete. The largest immediate issue is a committed loss
of default-deny chain enforcement; the largest quality issue is that the
lifecycle harness, shell probes, and positive-only writes overstate what they
prove. All configured projects are green on the final fingerprint, so these are
trust/coverage findings rather than a red gate.

### Provisional grades

| Area | Grade | Why |
|---|---:|---|
| Existing deterministic architecture | A- | Central offline boundaries, strict unmodeled-call teardown, registry/snapshots, clock, wallet ledger, exact calldata, reject/revert paths. |
| Current mock trust / false-green resistance | B- | Most helpers are strict, but Index GraphQL chain enforcement was removed after the app fix and image/price fallbacks remain permissive. |
| Existing test quality | B+ | Strong transaction and state assertions; some new tests reproduce production formulas or normalize known bugs. |
| New lifecycle harness architecture | B | Holds are a useful seam, but identity is too coarse, overlapping holds do not compose, and diagnostics/timeouts are weak. |
| New lifecycle/mobile test quality | C+ | Mostly skeleton-visible→absent checks. L0, shape/count, peer-island movement, stabilization, and mobile-specific behavior are largely not asserted. |
| Index-DTF route coverage | B+ | Deep overview/manual issuance/governance/settings and auction reads; two positive auction-launch writes exist, but manage, factsheet, automated issuance, negative auction roles, legacy, vote-lock, and deploy remain material gaps. |
| Yield-DTF coverage | C+ | Two-fixture replay plus positive stake/unstake writes exist; approval/cooldown/withdraw/cancel, issuance writes, governance, auctions, settings, and most failure/edge states remain open. |
| General-route coverage | D+ | Discover has coverage; Earn, Portfolio, Explorer, Tokens/Top100, Bridge, and deployment routes are mostly or entirely uncovered. |
| CI/reliability evidence | B | Type/helper/snapshot plus isolated smoke/full/mobile are green; local verification used unsupported Node 22, mobile is absent from workflow jobs, and fixed-port concurrency remains fragile. |
| Code cleanliness | C+ | Good domain intent, but duplicate old/new trees, a 900+ line helper, 300–500 line specs, whole-file package formatting, and conflicting ledgers/docs add noise. |
| LLM ergonomics | B | Strong guides and diagnostics, but contradictory append-only planning documents and permissive harness APIs can steer agents into false claims. |

**Overall grade: B- (7.3/10) for the settled tree.** The suite
can reach B+/A- if the trust regression is reversed, lifecycle claims are made
honest, and the highest-risk uncovered write surfaces are prioritized.

## 2. Fresh verification inventory

Final verification used content fingerprints for both tracked diffs and
untracked files. They remained unchanged across every accepted gate:

- `pnpm exec tsc -p e2e/tsconfig.json --noEmit` — pass.
- `pnpm exec vitest run e2e/helpers/tests` — pass: 5 files, 47 tests.
- `pnpm e2e:check` — pass: 63 required snapshots, valid envelope/freshness/
  identity, Yield replay keys chain-scoped.
- `pnpm e2e:smoke` — pass: 47 passed, 4 fixmes skipped, 46.0 s.
- `pnpm e2e:full` — pass: 102 passed, 4 fixmes skipped, 1.8 min.
- `pnpm e2e:mobile` — pass: 20 passed, 28.7 s. The sandboxed attempt first
  failed to bind `127.0.0.1:3005` with `EPERM`; the approved isolated retry was
  green.
- Final inventory: 177 project cases across 68 spec files. Local Node is 22;
  the project requires Node >=24 and CI uses Node 24, so CI remains the
  authoritative engine check.
- `node scripts/llm-workflow/scope.mjs --base master` — high-radius gate-
  equivalent pass: app lint/typecheck, 57 unit files / 608 tests, 47 E2E helper
  tests, smoke, and wiki lint (19 pages). Lint emitted existing warnings but did
  not fail.

Not independently revalidated in the final sequence: temporarily unskipping all
four bug regressions to prove each fails for its stated root cause. The GH0
dispatcher issue and the fake version-reset fixme are specifically audited in
this report; do not treat “four skipped” as proof that all four are sound.

Earlier browser results gathered while multiple actors shared port 3005 remain
inadmissible; only the isolated unchanged-fingerprint sequence above is used.

### Monitoring log

- **17:10–17:15 PT:** Claude remained active. New domain specs appeared for
  Yield issuance, Index zap render, deprecated overview, factsheet, manage, and
  settings fee distribution; related attribute-only testids were added.
- **17:15–17:20 PT:** Claude remained active. The harness gained a fee-registry
  seed and a new 100%-platform-fee fixme. No stable interval was reached.
- **17:20–17:25 PT:** Claude remained active. A new Index issuance compliance
  spec appeared.
- **17:25–17:30 PT:** Claude remained active. New Yield overview, Portfolio
  disconnected, and Bridge render specs appeared.
- **17:30–17:35 PT:** Claude remained active. New Earn/DeFi and Explorer outer-
  container render specs appeared.
- **17:35–17:40 PT:** Claude ran browser verification and updated the buildout
  handoff/bug ledger; no settled full-gate evidence was identifiable from the
  generic last-run file.
- **17:40–17:45 PT:** Claude remained active. A new manual-mint domain write
  spec appeared and another Vite verification process owned port 3005.
- **17:45–17:50 PT:** Claude continued focused browser verification; the shared
  port was active during the interval.
- **17:50–17:55 PT:** Claude remained active. PHOTON was added to the registry,
  targeted-capture support published its BSC snapshot tree, and a PHOTON
  governance render spec appeared.
- **17:55–18:00 PT:** Claude continued PHOTON-focused verification and updated
  the buildout handoff while Vite repeatedly owned port 3005.
- **18:00–18:05 PT:** Claude's verification process remained active until about
  18:03; no subsequent source change was observed by 18:05. Monitoring continues
  until a full quiet interval is established.
- **18:05–18:10 PT:** Claude resumed with the auction-write slice, extracting a
  shared active-rebalance encoder and adding launch-action testids.
- **18:10–18:15 PT:** Claude added and focused-tested a positive
  `openAuction()` launcher path.
- **18:15–18:20 PT:** Claude expanded the auction slice to BSC/CMC20 and added a
  synthesized nonzero permissionless window plus positive
  `openAuctionUnrestricted()` coverage; focused verification remained active.
- **18:20–18:25 PT:** Claude added regular-project Explorer transaction and
  governance route probes and updated the auction area guide. Both Explorer
  probes assert only the shared parent container, while the guide now calls two
  positive auction submissions a permission matrix. The tree was still moving.
- **18:25–18:30 PT:** Claude added empty-shaped Index/Yield Explorer subgraph
  branches, direct resolver unit checks, and began a GH0 desired-behavior fixme.
  The normal Explorer transaction probe was still shell-only during this slice.
- **18:30–18:35 PT:** Claude removed the regular transaction probe after
  reproducing the partial-response crash, retained a fixme, and continued
  focused browser verification on port 3005. The governance probe still asserts
  only the shared Explorer parent.
- **18:35–18:40 PT:** Claude added Index/Yield Earn tab wrappers and two
  disconnected route probes, then ran focused browser verification. Both probes
  assert only their newly added top-level container; activity stopped near 18:39,
  but the required full quiet interval had not yet elapsed.
- **18:40–18:43 PT:** No source, test, snapshot, or planning-document changes
  and no port-3005 owner were observed. Combined with the quiet period beginning
  near 18:39, this established the first full five-minute settled interval; the
  final isolated verification sequence began from that fingerprint.
- **18:43–18:45 PT:** The non-browser gates passed and desktop smoke passed 45
  with four fixmes skipped, but Claude resumed during that run and added Yield
  unstake testids plus a new write spec. The fingerprint changed, so that smoke
  result is provisional and full/mobile were deliberately not started.
- **18:45–18:50 PT:** Claude iterated on the eUSD unstake write and widened Yield
  replay with connected-account empty-state fallbacks. Focused runs repeatedly
  owned port 3005; no stable interval was reached.
- **18:50–18:55 PT:** Claude added exact stRSR balance/simulation seeds and a
  generic `pendingUnstakings` empty response, then continued timing adjustments
  around the confirmation modal.
- **18:55–19:00 PT:** Claude prevented the global Index selector table from
  leaking into Yield exact seeds (a good correction), then added temporary RPC
  calldata logging while debugging the unstake transaction. Focused Playwright
  again owned port 3005; the spec was explicitly not settled.
- **19:00–19:05 PT:** Claude completed focused unstake debugging, added permissive
  Yield fallback unit tests, and documented the write as landed. The unit tests
  currently lock arbitrary-token and selector-only acceptance rather than strict
  request identities.
- **19:05–19:10 PT:** Claude began a positive eUSD stake write, adding input/modal
  testids and exact RSR balance, allowance, delegate, approval-simulation, and
  stake-simulation seeds. Focused iteration continued.
- **19:10–19:15 PT:** Claude documented stake as proving an approval flow even
  though MAX allowance skips the approval transaction, then began a matured-
  unstake withdraw case. The withdraw overlay used draft era `0` while the
  captured eUSD stRSR slot `0x109` replays era `1`; focused correction continued.
- **19:15–19:20 PT:** Claude could render the withdraw button but found an
  additional collateralization/trading-state gate, removed the uncommitted
  withdraw spec, and documented it as a near-miss/coverage debt. The prep testid
  remains. The buildout document also claims a green full suite, but no isolated
  settled-tree full run was observed during this audit interval.
- **19:20–19:25 PT:** No source, spec, snapshot, or planning-document changes and
  no port-3005 owner were observed. A second full quiet interval was established;
  verification restarted from a new content fingerprint including the two Yield
  write specs.
- **19:25–19:42 PT:** Final type/helper/snapshot, smoke, full, and mobile gates
  completed sequentially. Mobile required an approved retry after sandbox bind
  denial. Tracked-diff and untracked-content hashes were unchanged before and
  after the complete sequence; no further Claude activity was observed.

### Findings on the 17:10–17:15 batch

- `index-dtf/factsheet/render.spec.ts` checks only the outer `dtf-factsheet`
  container. Empty chart/data, a permanent inner skeleton, or wrong performance
  values all pass. This is route wiring, not factsheet acceptance coverage.
- `index-dtf/manage/render.spec.ts` checks only `dtf-manage`. Its comment claims
  the non-manager submit is gated/disabled but never locates or asserts the
  submit control, form hydration, role read, or absence of auth/upload traffic.
- `index-dtf/overview/state-space.spec.ts` is a useful deprecated-state mobile
  render check, but duplicates the older deprecated overview flow and adds no
  mobile-specific assertion.
- `index-dtf/issuance/zap-render.spec.ts` duplicates the existing zap smoke with
  nearly the same shell/tab assertions. Migrate/replace; do not carry both.
- `yield-dtf/issuance/state-space.spec.ts` goes directly to the default Zap route
  then expects manual mint/redeem panels. It must switch through the structural
  manual toggle (as the existing Yield smoke does) or target a real manual
  subroute before those assertions are meaningful.
- `index-dtf/settings/distribute-fees.spec.ts` is a weaker, smoke-tagged duplicate
  of the existing full write test. It does not seed/assert nonzero pending fees,
  permits `txLog.length > 0` rather than exactly one transaction, uses `last()`
  (which can hide extra writes), omits chain/from/terminal state, and adds a slow
  write to PR smoke. Migrate the stronger existing test into the domain tree
  instead of duplicating it.
- `index-dtf/settings/fee-edge.spec.ts` invents a fee-semantic oracle: it assumes
  `platformFee=100%` must leave the governance recipient nonzero. Under a model
  where the platform takes 100%, zero for every downstream recipient may be the
  correct economic result even though an intermediate calculation is
  `Infinity`. Engineer review must define expected allocation. A safe test can
  assert no `NaN`/`Infinity` leaks and that displayed shares conserve the
  contract-defined total; it must not infer protocol semantics from the desired
  JavaScript branch.
- `index-dtf/issuance/compliance.spec.ts` correctly asserts the restricted
  widget attribute and alert, but duplicates existing compliance coverage. Its
  `@mobile` run repeats the same assertions and has no mobile-specific control,
  overflow/dialog, or connected-wallet empty-transaction assertion. Count it as
  a restricted render at mobile viewport, not completed mobile compliance.
- `yield-dtf/overview/render.spec.ts` advances frozen time by 20 seconds and
  asserts only the outer container. It duplicates the stronger two-fixture
  smoke and does not prove name, price, backing, or any island completed.
- `general/portfolio/state-space.spec.ts` is a valid disconnected-state check,
  but it covers only the connect prompt; it does not reduce the connected,
  empty, past-activity-only, history, error, or transaction gaps.
- `general/bridge/render.spec.ts` proves route wiring only. For this static page,
  the behavioral contract is the exact chain/token external href or deep link,
  copyable address, and safe link attributes; none are asserted yet.
- `general/earn/render.spec.ts` says it covers the DeFi empty state but asserts
  only the permanent `earn-defi` wrapper. Loading, populated, failed, and broken
  empty states all satisfy it.
- `general/earn/tabs.spec.ts` repeats that shell pattern for Index and Yield
  Earn. The new `earn-index-dtf` / `earn-yield-dtf` wrappers can remain visible
  while positions, DAO/list data, rates, or child queries fail. Assert the
  disconnected empty-state content structurally, a snapshot-derived row/value
  where data is intended, relevant link/tab identity, and loading/error
  separation. Repeating wrapper visibility at Pixel 7 is not mobile behavior.
- `general/explorer/render.spec.ts` has the same issue: the parent wrapper proves
  routing but not the transactions tab, navigation, loading/empty distinction,
  row/link truth, or any one of the five Explorer subroutes. Do not update the
  coverage map from ⬜ to covered based on these shell checks. In particular,
  the error boundary can leave `explorer-page` visible while the selected child
  has crashed or rendered blank, so these tests do not regress the reported GH0
  `.map` failure. The governance case also omits `@mobile` despite the adjacent
  route probe carrying it.
- The later GH0 transaction fixme is directionally correct—it asserts desired
  survival under a missing `entries` field—but its declared per-test override is
  not the deterministic stimulus it claims. `mockSubgraphRoutes` invokes
  `resolveYieldQuery` (where `overrides.subgraph('Transactions', {})` is looked
  up) only while global Yield replay is active; this general-route fixture never
  calls `setYieldReplay`. The observed failure instead comes from the generic
  `EMPTY_SHAPE` response, particularly the deprecated Arbitrum client. Route
  general multichain operations through the new honest-empty branch regardless
  of DTF replay mode, prove the override was consumed/request identity was hit,
  then run the fixme unskipped. Direct unit tests of `resolveYieldQuery` do not
  verify the dispatcher condition that currently bypasses it.
- `index-dtf/issuance/manual-write.spec.ts` is weaker than the existing manual
  flow: it permits any positive transaction count, inspects only `last()`, and
  asserts only target/function. It omits exact shares, receiver, minSharesOut,
  chain, value, terminal confirmation, rejection, and revert. Migrate the
  stronger test; do not add this duplicate to smoke.
- `index-dtf/governance/photon-featured.spec.ts` does not yet prove the contract
  in its name/comments. A visible proposals card with no skeleton can still be
  empty or standard governance. Assert snapshot-derived proposal IDs/count,
  BSC boundary chain, optimistic governor flags/badge, and at least one
  optimistic-specific lifecycle/action. CMC20 already exercises captured BSC
  governance, so PHOTON's unique value is optimistic semantics, not merely a
  fifth render fixture.
- `index-dtf/auctions/launch-write.spec.ts` is honest that it does not validate
  auction math, but its acceptance claim remains too broad. It permits extra
  transactions and checks only target/function/nonce. Assert exact-one tx,
  chain/value/from, nonempty equal-length token/weight/price arrays, fixture-
  coherent limits, and terminal state. Add unauthorized, community-window,
  rejection, and revert cases. Move this slow engineer-review write out of PR
  smoke. Keep an independent protocol vector/oracle so the shared tuple builder
  is not both stimulus and truth.
- `yield-dtf/staking/unstake-write.spec.ts` is an incomplete positive-only write
  probe. In its current form it imports unused balance-encoding symbols, claims a
  connected-wallet balance seed without registering one, and requests the
  `overrides` fixture without using it. Even once it renders, `txLog.length > 0`
  plus last-call function/amount can hide extra/wrong writes; it does not assert
  stRSR target, chain, sender, value, exact-one transaction, confirmed terminal
  state, cooldown entry, rejection, revert, retry, max/over-balance, or the later
  withdraw/cancel boundary. Keep it out of PR smoke until deterministic and
  migrate it into a full stake→unstake→cooldown→withdraw/cancel lifecycle.
- The supporting Yield RPC fallback answers test-wallet `balanceOf` and
  `allowance` with zero for **any** contract address on the replay chain. The
  Index branch already restricts equivalent defaults to known token owners/
  spenders. Apply the same known-token/known-contract identity checks here (and
  decode both allowance arguments); otherwise a wrong stToken, spender, or
  arbitrary-contract read can quietly look like an honest empty wallet. Exact
  per-test stRSR balance seeding should remain the write test's positive input.
- The new `pendingUnstakings` fallback is also selector-only: it returns an empty
  dynamic array for any target and any `(rToken, draftEra, account)` arguments.
  Scope it to the chain's known `FacadeRead`, the selected Yield fixture, and
  `TEST_ADDRESS`, or register the exact call in the spec. Otherwise wrong facade,
  RToken, draft-era, and account wiring all false-green as “no cooldowns.”
- Do not describe the five new RPC tests as “negative” trust tests: one explicitly
  requires an arbitrary fake token's `balanceOf(TEST_ADDRESS)` to pass silently,
  and another calls `pendingUnstakings` with selector-only malformed calldata and
  requires it to pass. Those tests canonize the identity holes. Replace them with
  known-identity success plus unknown target/argument failure cases.
- `yield-dtf/staking/stake-write.spec.ts` seeds `delegates(account) == account`
  but then accepts either `stake` or `stakeAndDelegate`, hiding the exact branch
  the fixture was designed to prove. Assert `stake` only; add a separate exact
  delegate fixture for `stakeAndDelegate` and validate its address. The current
  max allowance deliberately skips the economically important approve→stake
  sequence, and the same exact-one/chain/from/value/terminal/reject/revert gaps as
  unstake remain. Hardcoded RSR/stRSR identities should be registry/snapshot-owned
  so a future fixture refresh cannot silently split the test from replay data.
- `E2E_BUILDOUT_PLAN.md` currently says that direct-stake case proves “approval
  (stake),” but only an `approve()` **simulation** is mocked; MAX allowance means
  no approval transaction is sent or asserted. Rename the claim or add the
  zero/partial allowance two-transaction sequence with exact ordering.
- The initial withdraw stimulus hardcodes `pendingUnstakings(..., draftEra=0)`.
  The captured eUSD stRSR storage slot `0x109` is `1`, and the app refetches after
  loading it. Derive the era from the replay snapshot (or explicitly seed the
  slot) and prove the exact override was consumed. The selector-only empty
  fallback otherwise turns this mismatch into a missing-button timeout instead
  of a useful identity failure.
- `src/views/index-dtf/auctions/CLAUDE.md` now calls those two positive cases the
  launch **permission matrix**. That wording is false until disconnected,
  non-launcher-inside-restricted-window, launcher/community boundary, expired
  window, rejection, and revert behavior are exercised with an empty-transaction
  oracle where appropriate. Describe the present slice as two positive role/
  window paths. Likewise, `E2E_BUILDOUT_PLAN.md` claims harness sufficiency
  “CONFIRMED across ALL dimensions,” routes “covered,” and repeated “stable”
  gates that are not supported by the shell-only tests, weak lifecycle oracles,
  coarse hold identity, or isolated final-suite evidence. Narrow these claims
  before handing the plan to another LLM.

## 3. Blocking trust findings

### P0 — restore strict Index-subgraph chain enforcement

Evidence:

- `e2e/helpers/subgraph.ts:172-223` resolves Index DTF snapshots by globally
  unique address and no longer receives the URL chain.
- `mockSubgraphRoutes` records `urlChain`, but passes only `(body, log,
  overrides)` into `resolveIndexQuery`.
- `e2e/tests/flows/spa-chain-identity.spec.ts:13-15` explicitly says the rest of
  the suite stays green regardless of wrong-chain traffic.
- The earlier strict `(urlChain, DTF chain)` validation and negative helper test
  were removed when the react-zapper dependency was updated.

Impact: a future chain regression on issuance, settings, governance, auctions,
or any route not exercised by the one overview SPA journey can receive a valid
snapshot from the wrong subgraph and pass. The harness currently knows both
identities but intentionally does not enforce them.

Required correction:

1. Pass `subgraphChainForUrl(url)` to `resolveIndexQuery` again.
2. For every request carrying a known DTF identity, require URL chain to equal
   registry chain before overlays/snapshot fulfillment, unless a test explicitly
   declares a negative wrong-chain scenario.
3. Restore helper unit tests proving correct-chain fulfillment and wrong-chain
   failure.
4. Keep the SPA journey as end-to-end regression evidence; it supplements, not
   replaces, the central trust contract.

Do not argue that globally unique addresses make the response safe. Production
subgraph hosts are chain-specific; the exact regression this suite found was a
valid address sent to the wrong host.

### P1 — unknown image egress still bypasses default-deny

`e2e/fixtures/base.ts:80-103` aborts **every** request whose resource type is
`image`, regardless of host, before logging unmodeled egress. A newly introduced
remote product dependency can disappear in tests without failing the boundary
contract. Allow only named inert hosts/paths; unknown image hosts must log and
fail like other egress.

The host-agnostic `**/cdn-cgi/trace**` handler has the same shape. Restrict it to
the actual geolocation hosts.

### P1 — Yield token pricing can synthesize plausible truth

The API replay admits addresses from Yield RPC maps as price tokens and can
supply synthetic `$1` values. Those maps contain non-token contracts as well as
tokens. Existing Yield overview assertions accept “some dollar text,” so a
wrong contract/value can look green.

Capture an explicit `{chainId, tokenAddress, price}` fixture, reject non-token
addresses, and assert exact snapshot-derived price/backing request identity.

## 4. New lifecycle harness review

### What is good

- Boundary holds are implemented in the central API, subgraph, and RPC
  dispatchers instead of spec-local routes.
- RPC holds inspect Multicall3 inner calls, which is necessary for modern viem
  batching.
- Handles expose hit counts and release state.
- Teardown releases parked requests and resets frozen/Yield global state.
- The harness wraps navigation, wallet, transaction outcomes, overrides, and
  request views into a discoverable entry point.
- Pure hold/geometry helpers have focused unit tests.

Preserve this direction, but tighten the contract before migrating hundreds of
tests onto it.

### P1 — hold identity is too coarse

`e2e/harness/hold.ts:13-34` can match:

- subgraph only by `operationName`;
- API only by substring pathname;
- RPC only by method, target, and four-byte selector.

It omits URL/RPC chain, GraphQL variables, API method/query, caller account, and
full calldata. A multichain/SPA test cannot freeze Base without also freezing a
same-operation Mainnet request. An API hold can catch a near-miss path. A
selector hold can conflate calls whose arguments create different UI states.

Extend optional matchers with the same semantic identity used by strict replay:

```ts
subgraph: { urlChain, operationName, variablesSubset }
api: { method, exactPathname, searchSubset }
rpc: { chainId, method, to, fullCalldata | selector }
```

Exact pathname should be the default. Make substring/prefix matching explicit.

### P1 — overlapping holds do not compose

`HoldRegistry.gate()` finds and awaits only the first unreleased match. If a
broad L1 hold and a specific L2 island hold both match one request, releasing
the broad hold lets the request through without rechecking the specific hold.
The second handle records zero hits.

Either reject overlapping registrations with a precise error, or await all
matching holds captured for that request. Add a unit test for broad + specific
overlap before claiming staged L1→L2 composition.

### P1 — `seedManualIssuance` is Base-specific but claims all chains

`e2e/harness/seed.ts:6-7,79-83` hardcodes Base's `INDEX_DEPLOYER`, while
`DtfHarness.seedManualIssuance(dtf)` accepts any registry DTF and comments that
it is generalized. Mainnet and BSC use different deployers for the
`approve(deployer,1)` USDT probe.

Resolve the deployer from `dtf.chainId`, add helper tests for Ethereum/Base/BSC,
and guard `totalSupply === 0n` before calculating rates.

### P2 — harness state can become stale

`WalletControl.chain` is the initial fixture option, not the provider's current
chain after `wallet_switchEthereumChain`. Future switch-network tests can read a
false value. Expose an async current-chain query or update controller state from
recorded provider requests.

`RequestsView.naming()` searches `JSON.stringify` output. Prefer explicit
identity fields in each `BoundaryRequest`; string containment can both miss a
semantic identity and match unrelated payload text.

### P2 — add hold diagnostics and bounded waits

Specs repeat `expect.poll(() => hold.hits)` and otherwise wait 10–30 seconds
when a matcher never fires. Add `hold.waitForHit({ timeout })` with an error that
prints matcher, active route, and nearest boundary requests. On timeout or
teardown, report unreleased holds and hit counts rather than silently releasing
everything.

## 5. Lifecycle and layout test quality

### The current tests do not prove the foundational contract

The guide requires L0 blank, L1 correct skeleton shape/count, L2 independent
islands, L3 exact behavior, and mobile-specific chrome. Most new specs prove
only:

1. a skeleton becomes visible;
2. the held request was hit;
3. after release, the skeleton disappears or a container exists.

Specific gaps:

- Auctions, governance, settings, and discover do not assert skeleton
  shape/count or any geometry.
- Settings ends on `#roles`, which is not evidence that the roster has the
  correct entries; an empty loaded card can pass.
- Overview chart asserts container visibility but not a rendered path/data
  state or box stability.
- Only overview hero calls a geometry helper.
- L0 is not explicitly captured.
- Most specs do not prove an L2 peer remains stable while another island
  resolves.
- `@mobile` reruns the same assertions at a phone viewport but generally does
  not assert bottom navigation, portal/menu, cards, dialogs, CTA bars, overflow,
  or touch-specific behavior.

Do not mark a route's lifecycle/mobile cells complete from these tests.

### The “CLS-style” helper is not CLS and can false-green

`e2e/harness/lifecycle.ts:56-72` samples one bounding box immediately before and
after an action. It does not:

- wait for animations/query commits to settle;
- observe shifts that occur between the two samples;
- measure sibling/peer movement;
- use the browser Layout Instability API;
- calculate CLS impact and distance fractions.

`expectStablePosition` intentionally ignores size, so content can expand and
move everything below it while the test passes.

Rename this to simple box/position stability unless it becomes a real
PerformanceObserver-based shift budget. At minimum, wait for the target content
and two animation frames, measure affected peer boxes, and assert the exact
loaded state inside the release action.

### Avoid blanket lifecycle combinatorics

Testing every product-distinct state is good. Testing identical skeleton
implementation on every state and every route is often implementation coupling,
not behavior confidence. Use a risk-based matrix:

- one lifecycle contract per distinct island/loading architecture;
- every state whose loading behavior actually differs;
- mobile on breakpoint-sensitive layouts and critical write dialogs;
- exact behavior/state tests for the rest.

This keeps the suite deletable and avoids multiplying slow skeleton checks that
catch no new bug.

## 6. Test-oracle and test-practice findings

### P1 — fake version-reset regression

`e2e/tests/flows/spa-state-cleanup.spec.ts:96-99` is named
`indexDTFVersionAtom is reset on cross-chain navigation`, but its body only
loads a registry fixture and checks that its chain is Mainnet. It would pass
unchanged if un-fixmed and cannot observe the atom or a version-gated surface.

This violates the plan's rule that a bug test must fail when un-fixmed. Add a
stable version-gated observable and perform a v5→v4 SPA navigation, or remove
the fake test and leave the item only in the bug ledger.

### P1 — green tests codify known unsafe behavior

Two additions turn bugs into requirements:

- `settings.spec.ts:217-238` expects a failed registry read to display a
  fabricated 50% fee and rescales recipient shares from it.
- `issuance-manual-boundaries.spec.ts:397-438` expects a real redeem amount to
  submit a zero `minOut` for at least one asset.

If the app is fixed to show indeterminate/error state or protect/block dust,
these tests fail. Write the desired behavior as a failing/fixme regression tied
to the ledger, or keep a narrowly labeled characterization outside the
acceptance gate. Do not present unsafe current behavior as green product truth.

### P1 — known settings RPC-chain bug is still uncovered

The map/ledger identifies `tokenJar()` using stale global `chainIdAtom`, which
can misclassify fee recipients after cross-chain navigation. Existing SPA tests
cover GraphQL and `/current/dtf` REST identity only. Add an RPC boundary test
that navigates v5/v4 across chains and asserts every tokenJar call uses the
current DTF chain.

### P2 — overview edge tests assert shells, not outcomes

- Empty history checks `overview-price-chart` remains mounted, then polls for
  the same container. A blank inner chart or missing empty state passes.
- Single-point history checks only container/hero/basket visibility; no curve,
  point, domain, or fallback is asserted.
- Market Cap fixme checks only that text changes from unit price. Supply, TVL,
  or another wrong number passes.
- Zero-supply fixme checks only that a skeleton is hidden. A disappeared chart,
  crash boundary, or unrelated error can satisfy `toBeHidden`.

Add stable empty/error/point testids and assert exact snapshot-derived market
cap/supply values plus the expected boundary request.

### P2 — new governance coverage is valuable but incomplete

Support mapping `Against/For/Abstain => 0/1/2`, zero-power/already-voted/window
guards, and exact cancel calldata are high-value additions. Remaining gaps:

- cancel rejection and reverted receipt recovery;
- confirmed cancel terminal state;
- optimistic voting branch;
- fetched CANCELED/EXPIRED states;
- QUEUED with null ETA;
- decoded incoming action previews;
- vote-lock/delegate flows.

The cancel spec locally reproduces SDK timelock-ID derivation. Keep an
independent protocol vector or contract/library reference so test and product do
not share the same mistaken formula.

### P2 — manual issuance boundaries are strong but miss the nearest boundary

Exact decoded MAX/minSharesOut/minAmountsOut and amount guards are good. Add the
minimal `MAX + 1 wei` case; the current over-balance test uses a huge number and
does not prove the ceil boundary. Add zero-first USDT approval/revoke/reapprove,
partial approval failure/retry, and meaningful v4/mainnet or BSC coverage.

### P2 — Yield state assertions remain weak

- Staking render covers only eUSD in the new domain spec and checks visibility,
  while the old smoke covers two fixtures. Wrong/blank/zero rate/APY can pass.
- Yield issuance state-space must navigate to the manual surface before
  asserting manual mint/redeem panels; the default issuance route is Zap.
- Existing overview uses translated text/`first()` and accepts arbitrary dollar
  output.

Derive exact expected exchange rate/APY/backing/price, test both fixtures, and
add structural anchors for each data island.

## 7. Coverage priorities

### Index-DTF P1

1. Restore central GraphQL chain enforcement and add the missing RPC-chain SPA
   regression.
2. Automated CoW issuance: compliance, configure, quote legs, signatures,
   rejection/retry, partial failure, execution, success.
3. Auction writes: `startRebalance`, `openAuction`,
   `openAuctionUnrestricted`, bid, role/window matrix, reject/revert.
4. Manage brand: exact role gating, nonce/SIWE chain/domain/URI, uploads, save
   payload, preservation, error/retry, account/chain signature invalidation.
5. Governance optimistic fixture/flow, incoming action previews, cancel
   failures, lock/delegate.
6. Permissionless deployment: validation, summary, chain, exact factory writes,
   reject/revert, terminal address.
7. Factsheet and legacy-auction route behavior.

All money, governance, permissions, SDK contracts, auction roles/math, routing
state, and fee math require **Engineer review required** handoff.

### Yield-DTF P1

1. Stake→unstake→cooldown→withdraw/cancel lifecycle and draft boundaries.
2. Active vs mint-paused vs frozen vs undercollateralized issuance gates.
3. Manual/zap write calldata and reject/revert paths.
4. Auctions bid/claim.
5. Governance vote/propose and settings pause/freeze/unfreeze role matrices.

### General routes P2

Portfolio, Explorer tabs, Earn tabs, Tokens/Top100, Bridge links, and both deploy
routes remain largely unprotected. Prioritize money/history correctness and
loading-vs-empty-vs-error tri-state over shallow route renders.

## 8. CI, mobile, and performance

### Mobile is configured but not continuously verified

The `mobile` project is always declared; workflow jobs call only `smoke` or
`full`, so scheduled/manual GitHub full runs do not exercise mobile. The comment
“off CI; local/nightly” is misleading because no nightly workflow command runs
`e2e:mobile`.

The user decision not to run mobile on PR CI should be preserved. Choose and
document one honest policy:

- manual-only mobile, with no claim of continuous coverage; or
- a scheduled non-PR mobile job.

Use explicit scripts for “all desktop” versus “all including mobile”; generic
`pnpm e2e` currently runs all declared projects.

### Add exclusive server orchestration

Port 3005 plus `reuseExistingServer` caused audit runs to interfere. Add a lock
or unique per-run port. An LLM should receive a fast “another suite is active”
error instead of ambiguous timeouts or `ERR_CONNECTION_REFUSED`.

### Runtime budget

The old guide's smoke timing is stale. New lifecycle holds add roughly 8–12
seconds per representative test under current timeouts. Before scaling this
pattern across every route/state/mobile combination:

- record per-spec and per-boundary timings;
- use one representative lifecycle test per unique architecture;
- add fast `waitForHit` diagnostics;
- remove duplicate old smoke coverage after migration;
- do not shard until isolated runs are deterministic.

## 9. Architecture and cleanliness

### Keep one canonical coverage/debt source

`E2E_TEST_MAP.md`, `E2E_BUILDOUT_PLAN.md`, `E2E_BUG_LEDGER.md`, older findings,
wiki progress, README, domain guides, and this report currently disagree.
Examples include Bridge form vs static link, nonexistent Whitelist proposal,
stale test counts/timings, chain bugs listed both open and closed, and lifecycle
rows marked complete before their requirements are asserted.

Rewrite current truth in place instead of appending “supersedes above” sections.
Prefer one machine-readable route/state ledger and generate summary tables. A
route addition should require either a mapped test or explicit debt entry.

### Finish the test-tree migration atomically by domain

The old `smoke/` + `flows/` tree and new domain tree currently coexist, creating
duplicate Yield and render coverage. Migrate one domain, verify it, then remove
its old copies. Do not leave two long-lived canonical locations.

### Reduce noisy diffs

The settled `package.json` diff reformats nearly the entire file while changing
only dependencies/scripts; lockfile churn is also large. Restore project
formatting and keep semantic dependency/script changes reviewable. Dependency
bumps to the SDK/zapper are production-contract changes, not E2E-only plumbing,
and need scoped app verification.

### Extract only real concepts

`rpc.ts` is over 900 lines and multiple specs are 300–500 lines. Useful future
seams are RPC dispatch vs Index/Yield replay vs receipts, and governance fixture
builders vs lifecycle assertions. Avoid a generic page-object hierarchy or
one-line wrapper files; the current small controller classes are near the upper
limit of useful abstraction.

## 10. LLM-optimized implementation rules

For every new read test:

1. Identify exact route, fixture, chain, and boundary identity.
2. Assert loaded semantic truth derived independently from snapshots.
3. Add only product-distinct empty/error/loading states.
4. Assert zero unmodeled calls and correct chain hosts.

For every new write test:

1. Assert disconnected/unauthorized guard and empty `txLog`.
2. Decode exact target, chain, value, function, arguments, and ordering.
3. Assert pending/confirmation state.
4. Cover wallet rejection and reverted receipt.
5. Assert terminal refresh and retry/double-submit behavior.

For every fixme:

1. Link a ledger ID and root-cause location.
2. Write desired behavior, not current buggy behavior.
3. Run it un-fixmed and prove it fails for the stated reason.
4. Never use a placeholder body that would already pass.

For lifecycle tests:

1. Hold the exact chain/request/island.
2. Prove the hold was hit.
3. Assert correct skeleton shape/count only where product-relevant.
4. Release while waiting for exact content/empty/error state.
5. Measure affected peers after stabilization if layout is the requirement.
6. On mobile, assert the mobile-specific interaction/layout, not just visibility.

## 11. Resolved earlier findings — do not reopen without new evidence

- Yield RPC replay keys are chain-scoped and collision-checked.
- Snapshot parsing is cached per worker.
- Local worker count is capped.
- Helper contract tests run through scoped verification and CI.
- Snapshot check validates required files, envelope, freshness, and identities.
- Yield issuance correctly distinguishes active eUSD from redeem-only hyUSD in
  the older smoke; do not reintroduce a universal mint-panel expectation.

## 12. Settled-tree completion protocol

This audit used the following sequence with no other Playwright/Vite owner and
unchanged content hashes. Repeat it on Node 24 after future corrections:

```sh
pnpm exec tsc -p e2e/tsconfig.json --noEmit
pnpm exec vitest run e2e/helpers/tests
pnpm e2e:check
pnpm e2e:smoke
pnpm e2e:full
pnpm e2e:mobile
```

Then run the project scoped/gate commands required by the final diff. Verify:

- no unmodeled operation or unknown egress;
- no unexpected skip/fixme;
- every declared bug regression actually fails when temporarily un-fixmed;
- route/state/mobile ledger matches discovered specs;
- no browser command overlapped another suite;
- worktree did not change during verification;
- production dependency and fee/routing changes carry Engineer review handoff.

## 13. Recommended next sequence

1. Checkpoint/review the settled Claude slice; do not mix cleanup with unrelated
   production dependency changes.
2. Restore strict Index GraphQL chain enforcement.
3. Fix harness chain identity, overlap semantics, diagnostics, and Base-only
   seeding before migrating more specs.
4. Replace fake/green-bug tests with real desired-behavior regressions.
5. Make the initial lifecycle tests prove honest L0/L1/L2/L3/mobile claims, or
   narrow the claims.
6. Complete one domain migration and remove duplicates.
7. Reconcile canonical docs in place.
8. Rerun the isolated settled-tree completion protocol after corrections.
9. Only then expand into automated issuance, negative auction roles/math,
   manage, optimistic governance, remaining Yield writes, and semantic general-
   route coverage.

The suite's strict boundaries, exact transaction ledger, snapshot-derived
oracles, and failure-path depth are worth preserving. The next quality gain is
not more test count; it is ensuring every new abstraction and coverage claim is
as strict and semantically exact as the best existing transaction tests.

## MISSING_TEST_CASES

This is the implementation-ready backlog derived from the settled 68-spec tree.
`E2E_TEST_MAP.md` remains the project-owned coverage map; reconcile items there
when they are adopted. This list intentionally excludes duplicate route-mount
checks, copy assertions, and viewport permutations that do not exercise
different product behavior. One checkbox is one distinct test or one explicitly
parameterized family where the setup and oracle are identical across fixtures.

Priority meanings:

- **P0** — harness trust or false-green prevention; fix before expanding volume.
- **P1** — money, permissions, governance, chain identity, or primary workflows.
- **P2** — important state/error/mobile behavior and semantic route coverage.
- **P3** — useful resilience, performance, and maintenance coverage after P0–P2.

Every write case below inherits the same minimum oracle unless narrowed:
exactly the expected transaction count and order; `chainId`, `from`, `to`,
`value`, decoded function and every argument; pending/disabled UI; receipt-driven
terminal state; zero writes when gated; reject, revert, recovery, and double-
submit protection. Every read/lifecycle case must prove its exact boundary was
hit, distinguish loading/empty/error, and assert snapshot-derived semantic
content—not only an outer wrapper.

### A. Harness and trust contracts

- [ ] **P0 HARN-001 — strict Index subgraph chain match:** a Base, BSC, and
  Mainnet DTF succeeds only on its registry-chain Goldsky URL; the same known
  address on either wrong host returns a modeled error and records an unmocked
  identity failure.
- [ ] **P0 HARN-002 — overlay cannot bypass chain validation:** an otherwise
  valid `overrides.subgraph` response must still fail when the URL chain is
  wrong. Validate chain before applying test-local data.
- [ ] **P0 HARN-003 — Index RPC wrong-chain SPA regression:** navigate
  Mainnet→Base→BSC without reload and assert every DTF-naming `eth_call`,
  including `tokenJar()`, fee registry, version, and roles, uses the destination
  chain and correct contract.
- [ ] **P0 HARN-004 — unknown image egress:** an image request to an unlisted
  host must appear in `unmockedCalls` and fail teardown; only named inert image
  CDNs may be aborted silently.
- [ ] **P0 HARN-005 — host-scoped Cloudflare trace:** the known geolocation trace
  host receives the deterministic fixture; the same path on an unknown host is
  rejected.
- [ ] **P0 HARN-006 — Yield unknown-token reads fail loud:** arbitrary-contract
  `balanceOf(TEST_ADDRESS)` and `allowance(TEST_ADDRESS, spender)` fail unless
  the target is a known token and the spender is a known protocol contract.
- [ ] **P0 HARN-007 — Yield pending-unstake identity:** only the known
  `(chain, FacadeRead, rToken, draftEra, TEST_ADDRESS)` call receives an empty or
  overlaid queue; wrong facade, RToken, era, or account fails loud.
- [ ] **P0 HARN-008 — Yield price identity:** price replay rejects non-token
  contracts found in RPC maps and unknown addresses instead of assigning a
  plausible `$1` value.
- [ ] **P0 HARN-009 — hold identity completeness:** unit cases distinguish
  subgraph operation plus variables and URL chain, API method/path/query, RPC
  chain/address/full calldata, and Multicall3 inner calls with identical
  selectors but different arguments.
- [ ] **P0 HARN-010 — overlapping holds compose:** two matching holds both park
  a request until both release; releasing one cannot accidentally open the
  second. Include reversed release order and `releaseAll()` teardown.
- [ ] **P1 HARN-011 — hold diagnostics and timeout:** `waitForHit()` reports the
  expected identity, closest observed identities, hit count, elapsed time, and
  pending holds; it fails quickly instead of leaving a 20–30 second UI timeout.
- [ ] **P1 HARN-012 — wallet chain state updates:** after a mocked network
  switch, `harness.wallet.chain`, provider `eth_chainId`, request chain, and
  transaction ledger all reflect the new chain; rejection leaves all four on
  the old chain.
- [ ] **P1 HARN-013 — transaction ledger exactness:** extra transactions before
  or after the expected call fail an exact-one oracle; `last()` must not hide
  approval, duplicate-submit, or wrong-target writes.
- [ ] **P1 HARN-014 — transaction outcome queue isolation:** success, rejection,
  revert, and delayed receipts are consumed once, in order, and never leak into
  the next test or retry.
- [ ] **P1 HARN-015 — `seedManualIssuance` multichain deployer:** the USDT probe
  uses each chain/version's real deployer rather than the Base deployer; unknown
  mappings fail with a setup diagnostic.
- [ ] **P1 HARN-016 — zero-supply fixture guard:** manual issuance and active-
  rebalance fixture builders reject `totalSupply=0` with a named setup error
  instead of dividing by zero or generating nonsense.
- [ ] **P1 HARN-017 — rebalance snapshot schema:** runtime validation rejects
  number/string drift, mismatched token/amount arrays, zero supply, invalid
  windows, and limits outside protocol order before encoding a tuple.
- [ ] **P1 HARN-018 — independent auction oracle vector:** decode a reviewed
  fixed protocol vector whose expected tokens, weights, prices, limits, and
  nonce are not produced by the same helper that builds the stimulus.
- [ ] **P2 HARN-019 — targeted capture atomicity:** `--dtf=<slug>` publishes all
  required files and manifest metadata atomically, preserves byte-identical
  unrelated snapshots, and removes temporary output on failure.
- [ ] **P2 HARN-020 — snapshot registry integrity:** duplicate address/slug,
  chain-directory mismatch, missing proposal/rebalance joins, malformed
  governance identity, and stale targeted manifests fail `e2e:check`.
- [ ] **P2 HARN-021 — bug-fixme validity:** each committed fixme is temporarily
  run as a normal test and must fail for its stated assertion/root cause; a
  fixme body that already passes fails a meta-check.

### B. Cross-cutting lifecycle, mobile, and accessibility

- [ ] **P1 LIFE-001 — representative lifecycle per unique architecture:** cover
  one REST table, one Index subgraph list, one Yield subgraph list, one direct
  RPC island, one Multicall3 island, and one mixed API+RPC page through
  L0→L1→L2→L3. Do not repeat this for pages with identical architecture.
- [ ] **P1 LIFE-002 — skeleton/content geometry:** for each representative,
  compare stabilized position and size, expected row/card count, and unaffected
  peer islands before and after release; a two-immediate-sample check is not
  sufficient.
- [ ] **P1 LIFE-003 — independent island ordering:** release islands in both
  orders and prove island A can finish while B remains loading without hiding,
  shifting, or populating B.
- [ ] **P1 LIFE-004 — error after partial success:** one island resolves and a
  sibling errors; retain valid content, show retry/error only for the failed
  island, and never regress the whole page to a skeleton.
- [ ] **P2 MOB-001 — mobile navigation chrome:** bottom navigation, portal menu,
  route selection, back behavior, and body-scroll locking work at the phone
  breakpoint.
- [ ] **P2 MOB-002 — transaction dialogs:** Zap, manual issuance, governance,
  auction, and staking dialogs fit the viewport, expose the primary CTA, retain
  input on wallet rejection, trap/restore focus, and do not scroll behind the
  portal.
- [ ] **P2 MOB-003 — tables become usable mobile layouts:** holdings,
  governance, auctions, Explorer, Earn, Portfolio, and Factsheet use their
  intended card/horizontal-scroll pattern with critical values and row actions
  still reachable.
- [ ] **P2 MOB-004 — sticky CTA and keyboard:** issuance/staking/auction CTAs
  remain visible above the virtual keyboard and safe-area inset; focusing an
  amount field does not cover confirmation controls.
- [ ] **P2 A11Y-001 — structural interactive semantics:** test TabMenu, proposal
  actions, dialogs, and table/card links by keyboard for focus order, Enter/
  Space activation, Escape close, focus restoration, and disabled controls that
  cannot fire transactions.

### C. Index DTF — Overview

- [ ] **P1 IDX-OVR-001 — true zero-supply chart:** serve price history with
  `totalSupply=0`; assert a defined empty/unavailable state, no permanent
  skeleton, and no `NaN`/`Infinity`. Replace the current placeholder fixme with
  this desired behavior.
- [ ] **P1 IDX-OVR-002 — zero-price history:** a legitimate zero price renders
  as data/empty according to product semantics, never as “still loading.”
- [ ] **P1 IDX-OVR-003 — zero first value percent change:** a series beginning
  at zero avoids divide-by-zero and displays the contract-defined unavailable or
  bounded change state.
- [ ] **P1 IDX-OVR-004 — all-zero-weight exposure:** basket content resolves to
  a defined empty/zero composition without an infinite skeleton.
- [ ] **P1 IDX-OVR-005 — exact data-type semantics:** Price, Market Cap, and
  Supply each show independently derived exact values and units; Market Cap
  must not reuse unit price. Replace the current “value changed” oracle.
- [ ] **P2 IDX-OVR-006 — candlestick/line switch:** default chart type, explicit
  toggle, OHLC rendering, line fallback, preserved selected range, and no stale
  chart overlay.
- [ ] **P2 IDX-OVR-007 — young-DTF ranges:** unavailable ranges are absent or
  disabled, selecting a now-invalid range resets to `all`, and the selector does
  not reflow adjacent content.
- [ ] **P2 IDX-OVR-008 — history empty vs single point vs error:** distinguish
  all three with a retryable error state and correct range controls.
- [ ] **P2 IDX-OVR-009 — week-ago wallet PnL:** no prior holding hides PnL;
  positive, negative, and zero prior balances produce snapshot-derived deltas;
  an operation error is not presented as “no prior holding.”
- [ ] **P2 IDX-OVR-010 — holdings join integrity:** missing token metadata,
  missing price, duplicate token, and token/amount length mismatch surface a
  bounded error rather than silently dropping or mispricing a row.
- [ ] **P2 IDX-OVR-011 — SPA state reset:** navigate Yield→Index and between
  Index versions/chains; chart type, data type, range, DTF version, symbol,
  basket, and price cannot leak from the prior page.
- [ ] **P2 IDX-OVR-012 — deprecated semantics:** inactive badge, unavailable buy
  action, valid sell/navigation actions, and live historical data coexist on
  desktop and mobile.
- [ ] **P1 IDX-OVR-013 — real version-atom reset regression:** first prove the
  source route populated a v4 version-dependent branch, navigate to a v5 DTF,
  and assert the v5 branch plus destination RPC identity. The current fixme's
  fixture-chain assertion must fail if the reset is removed.

### D. Index DTF — Zap and manual issuance

- [ ] **P1 IDX-ZAP-001 — low-liquidity quote:** warning/gate, exact quote
  identity, acknowledgement behavior, and empty ledger before acknowledgement;
  distinguish it from high price impact.
- [ ] **P1 IDX-ZAP-002 — wrong-chain quote rejection:** correct token addresses
  on the wrong quote chain or RPC host fail; switching networks refetches a
  chain-correct quote and clears the stale one.
- [ ] **P1 IDX-ZAP-003 — quote replacement race:** a slow first amount and fast
  second amount may resolve out of order; only the latest quote is displayed and
  submitted.
- [ ] **P1 IDX-ZAP-004 — exact allowance boundaries:** allowance zero,
  insufficient-by-one, exact, and MAX produce the correct approval sequence and
  exact quote transaction.
- [ ] **P2 IDX-ZAP-005 — account/network change during confirmation:** modal
  closes or invalidates safely, stale quote cannot submit, and the form refetches
  under the new identity.
- [ ] **P2 IDX-ZAP-006 — mobile buy/sell behavior:** amount entry, token picker,
  warning acknowledgement, approval step, rejection recovery, and success view
  are usable at phone width.
- [ ] **P1 IDX-MAN-001 — v4 vs v5 mint ABI:** parameterize OPEN and a v5 fixture;
  assert exact version-specific function and whether `minSharesOut` exists.
- [ ] **P1 IDX-MAN-002 — max plus one boundary:** `MAX` submits the calculated
  ceiling; the smallest representable `MAX+1` input stays disabled with an empty
  ledger, proving the ceil boundary rather than only a broad over-balance case.
- [ ] **P1 IDX-MAN-003 — USDT zero-first approval:** nonzero insufficient
  allowance sends approve(0)→approve(required)→mint in exact order; rejection or
  revert at either approval stops later writes and retry resumes correctly.
- [ ] **P1 IDX-MAN-004 — multi-token partial approval failure:** token N fails
  after earlier approvals; no mint occurs, completed approvals are preserved,
  and retry submits only the remaining approvals plus mint.
- [ ] **P1 IDX-MAN-005 — approval simulation failure:** a failed simulate keeps
  submit unavailable, identifies the affected asset structurally, and produces
  no wallet request.
- [ ] **P1 IDX-MAN-006 — redeem dust policy:** replace characterization of
  `minOut=0` with engineer-approved desired behavior; prove either a nonzero
  floor or an explicit user-visible unsafe-dust block.
- [ ] **P1 IDX-MAN-007 — manual deprecated sell-only:** on the manual surface,
  mint controls are absent/disabled, redeem remains usable, and attempts cannot
  produce a mint transaction.
- [ ] **P1 IDX-MAN-008 — per-asset decimal boundaries:** 6/8/18-decimal basket
  assets round in the correct direction for mint pulls and redeem minimums;
  mixed-decimal arrays remain index-aligned.
- [ ] **P1 IDX-MAN-009 — fee extremes:** zero, typical, maximum allowed, and
  invalid fee data conserve amounts and never create negative/overflowing
  `minSharesOut`.
- [ ] **P2 IDX-MAN-010 — connected-state reset:** disconnect, account change,
  and chain change clear amount, balances, allowances, modal state, and prepared
  calldata without leaking a prior transaction.

### E. Index DTF — Automated CoW issuance

- [ ] **P1 IDX-COW-001 — wallet/network eligibility:** disconnected,
  unsupported chain, wrong chain, and supported Gnosis-compatible path show the
  correct gate and zero writes.
- [ ] **P1 IDX-COW-002 — configuration validation:** basket amounts, slippage,
  deadline, receiver, and empty/invalid configuration block progression with no
  quote request.
- [ ] **P1 IDX-COW-003 — quote leg identity:** every collateral leg uses the
  expected chain/token/amount, response legs remain token-aligned, and an
  unknown/missing/duplicate leg fails visibly.
- [ ] **P1 IDX-COW-004 — no-collateral-leg shortcut:** a fixture requiring no
  swaps skips quote/sign steps and prepares only the exact mint action.
- [ ] **P1 IDX-COW-005 — convert-held collateral:** existing wallet assets reduce
  quote legs and exact spend without double counting balances.
- [ ] **P1 IDX-COW-006 — Ondo/asset paused gate:** a paused or unsupported asset
  prevents order creation and explains the blocked leg structurally.
- [ ] **P1 IDX-COW-007 — compliance fail-closed:** unavailable, malformed, VPN,
  and prohibited compliance responses cannot reach signature/order submission;
  redeem remains governed by its intended policy.
- [ ] **P1 IDX-COW-008 — slow quote cancellation:** timeout/cancel leaves no
  signature or order, restores controls, and ignores a late quote response.
- [ ] **P1 IDX-COW-009 — partial quote failure and retry:** one failed leg does
  not submit the successful subset; retry replaces only the failed quote and
  preserves exact ordering.
- [ ] **P1 IDX-COW-010 — signature rejection:** retains configuration/quotes,
  produces no order, surfaces recovery, and a retry signs the same reviewed
  payload.
- [ ] **P1 IDX-COW-011 — order submission failure:** signed payload failure,
  malformed order ID, and network error never show execution success; retry is
  idempotent.
- [ ] **P1 IDX-COW-012 — order lifecycle:** pending→partially-filled→filled,
  canceled, expired, and failed states render independently from quote state and
  lead to the correct mint eligibility.
- [ ] **P1 IDX-COW-013 — final mint:** filled legs produce the exact versioned
  mint calldata and receiver/minimum; reject/revert leaves the wizard recoverable
  and does not reuse a stale order on retry.
- [ ] **P2 IDX-COW-014 — mid-wizard identity change:** wallet disconnect,
  account change, route change, and chain change cancel polling and clear quotes,
  signatures, orders, and prepared transactions.
- [ ] **P2 IDX-COW-015 — reload/resume policy:** refresh during each durable stage
  either restores the intended order safely or restarts explicitly; it must not
  infer success from local state alone.

### F. Index DTF — Governance

- [ ] **P1 IDX-GOV-001 — proposal list empty/error/pagination:** distinguish no
  proposals from a subgraph error, assert exact snapshot IDs/count/order, and
  verify “show all”/pagination without duplicate rows.
- [ ] **P1 IDX-GOV-002 — PHOTON fixture semantics:** assert BSC request identity,
  exact captured proposal IDs/count, standard-vs-optimistic flags, and absence/
  presence of the optimistic badge per proposal—not just a visible card.
- [ ] **P1 IDX-GOV-003 — fetched CANCELED state:** a proposal already canceled in
  its snapshot renders terminal state, no live actions, and the cancel tx link.
- [ ] **P1 IDX-GOV-004 — fetched EXPIRED state:** expired queue/execute window is
  derived from clock plus ETA/grace period and exposes no queue/execute action.
- [ ] **P1 IDX-GOV-005 — queued null ETA:** malformed/null ETA fails closed with
  a bounded unavailable state rather than a stuck spinner or premature execute.
- [ ] **P1 IDX-GOV-006 — active tally refresh:** vote confirmation swaps to a
  fresher voting snapshot; exact For/Against/Abstain tally and “already voted”
  state appear only after receipt.
- [ ] **P1 IDX-GOV-007 — cancel failure matrix:** unauthorized user has no
  control; authorized wallet rejection and reverted receipt retain QUEUED state,
  recover the CTA, and never show CANCELED.
- [ ] **P1 IDX-GOV-008 — per-type detail previews:** independent vectors for
  basket composition, DTF fee/settings, basket/trading settings, and DAO calls
  decode the exact proposed changes. Test preview semantics once per type, not
  once per lifecycle state.
- [ ] **P1 IDX-GOV-009 — unknown/raw action preview:** unknown selector, malformed
  calldata, and multi-action proposal render a safe raw/unsupported view without
  crashing or inventing decoded meaning.
- [ ] **P1 IDX-GOV-010 — basket proposal submit:** exact reviewed
  `startRebalance` targets/weights/prices/limits, proposal description, governor,
  and action arrays; reject/revert and stale-price retry.
- [ ] **P1 IDX-GOV-011 — basket proposal validation:** duplicate token,
  zero/negative/over-100 weights, missing price/liquidity, token-map mismatch,
  and unchanged basket keep submission disabled.
- [ ] **P1 IDX-GOV-012 — basket-settings phantom action:** unfix and prove a
  voting-period-only change contains exactly one action; unchanged threshold is
  never injected.
- [ ] **P1 IDX-GOV-013 — shared-governor menu:** fixtures with shared vs separate
  owner/trading governors expose the correct three/four proposal destinations
  and submit to the selected governor.
- [ ] **P1 IDX-GOV-014 — governance parameter boundaries:** threshold, quorum,
  voting delay, voting period, timelock delay, and fee inputs round-trip through
  units/decimals into exact calldata at min/max/one-past boundaries.
- [ ] **P1 IDX-GOV-015 — delegate/undelegated vote gate:** zero current votes but
  undelegated balance offers the correct delegation CTA; self/other delegate,
  undelegate, reject, revert, and post-receipt voting-power refresh.
- [ ] **P1 IDX-GOV-016 — vote-lock variants:** single/multiple reward tokens,
  APR threshold/badge, no rewards, governed-DTF hovercard, and chain-correct
  links use snapshot-derived values.
- [ ] **P1 IDX-GOV-018 — raw iframe sanitization:** unfix the existing regression;
  raw iframe markup never materializes, its `src` is never requested, and safe
  surrounding markdown remains rendered. Include mixed case/encoded attributes
  without broadening beyond the sanitizer's threat model.
- [ ] **P1 IDX-GOV-019 — basket-settings empty-change guard:** with every field
  equal to live settings, confirmation stays disabled and the ledger is empty;
  changing then restoring one field returns to the empty state with no phantom
  threshold/action.
- [ ] **P1 IDX-OPT-001 — optimistic list/detail identity:** an actually
  optimistic proposal shows its badge, challenge/veto timing, optimistic
  governor, and selector-registry-derived action preview.
- [ ] **P1 IDX-OPT-002 — eligibility fail closed:** eligible, ineligible,
  loading, RPC error, and malformed eligibility cannot accidentally enable an
  optimistic propose/challenge action.
- [ ] **P1 IDX-OPT-003 — optimistic voting:** only the protocol-supported
  challenge/Against action is available; exact support/calldata, voting window,
  reject/revert, and tally refresh are asserted.
- [ ] **P1 IDX-OPT-004 — veto window boundaries:** one second before/at/after the
  boundary produces the correct challenge/execute controls without `<`/`<=`
  drift.
- [ ] **P1 IDX-OPT-005 — optimistic success execution:** successful optimistic
  proposal executes without a standard queue step, targets the correct governor/
  timelock, and reaches EXECUTED only after receipt.
- [ ] **P1 IDX-OPT-006 — optimistic create:** form validation, exact proposal
  actions/description, eligibility, reject/revert, and post-submit optimistic
  detail route.
- [ ] **P2 IDX-GOV-017 — governance mobile workflows:** list→detail, proposal
  preview, vote/delegate, queue/execute/cancel, and create confirmation remain
  usable without clipped actions or hidden changes.

There is no “Whitelist proposal” create form in the product. Do not add a test
for the stale map entry; cover unknown/raw allowlist calldata preview under
`IDX-GOV-009` instead.

### G. Index DTF — Auctions and rebalances

- [ ] **P1 IDX-AUC-001 — restricted boundary:** freeze one second before, at,
  and after `restrictedUntil`; launcher/community controls and labels change
  exactly once at the protocol boundary.
- [ ] **P1 IDX-AUC-002 — available/expired boundary:** freeze before, at, and
  after `availableUntil`; active/completed bucketing and launch/bid controls use
  the intended inclusive/exclusive rule.
- [ ] **P1 IDX-AUC-003 — complete read-state matrix:** idle, restricted active,
  permissionless active, completed, and expired detail each assert round,
  progress, metrics, liquidity, and the exact available actions.
- [ ] **P1 IDX-AUC-004 — API/subgraph/RPC disagreement:** stale history with live
  active tuple, stale API metrics, and missing liquidity show a bounded partial/
  error state rather than silently choosing the convenient source.
- [ ] **P1 IDX-AUC-005 — token map mismatch:** unknown, duplicate, or misordered
  rebalance tokens cannot white-screen or attach metrics/prices to the wrong row.
- [ ] **P1 IDX-AUC-006 — launcher authorization matrix:** disconnected,
  connected wrong chain, authorized launcher, unauthorized user during
  restricted window, and launcher after permissionless opening each assert CTA
  visibility and an empty ledger where forbidden.
- [ ] **P1 IDX-AUC-007 — community matrix:** non-launcher before, at, and inside
  the permissionless window plus expired window; prove the fixture does not
  already include `TEST_ADDRESS` as a launcher.
- [ ] **P1 IDX-AUC-008 — exact `openAuction` payload:** assert exact-one tx and
  independently reviewed nonce, token array, weight tuples, price ranges,
  limits, chain, sender, target, and value.
- [ ] **P1 IDX-AUC-009 — exact unrestricted payload:** assert exact-one
  `openAuctionUnrestricted(nonce)` with all ledger fields and no preceding
  privileged call.
- [ ] **P1 IDX-AUC-010 — launch failure matrix:** wallet reject, reverted receipt,
  delayed receipt/double-click, and post-confirm refetch; state cannot advance on
  failure and the retry uses the same active nonce.
- [ ] **P1 IDX-AUC-011 — stale nonce/race:** rebalance changes while the dialog
  is open; stale prepared calldata is invalidated and never sent.
- [ ] **P1 IDX-AUC-012 — hybrid manage-weights step:** LCAP/Venionaire-style
  hybrid route requires valid managed weights before launch, rejects unchanged/
  invalid weights, and submits reviewed math.
- [ ] **P1 IDX-AUC-013 — Ondo cap default:** cap-aware token initializes the
  correct maximum, preserves a user-lowered value, and rejects values above the
  protocol cap.
- [ ] **P1 IDX-AUC-014 — bid quote and maximum:** exact sell/buy token, auction
  price at frozen time, requested amount, max auction size, balance, allowance,
  and one-past boundaries.
- [ ] **P1 IDX-AUC-015 — bid approval/write:** zero/exact allowance paths,
  approval ordering, exact bid calldata/value, reject/revert at each step, and
  receipt-driven remaining-size refresh.
- [ ] **P1 IDX-AUC-016 — bid price movement:** advancing frozen time updates the
  dutch price; a quote prepared at the old price cannot submit after its validity
  boundary without refresh.
- [ ] **P1 IDX-AUC-017 — legacy v2 route:** historical list/detail render from a
  v2 fixture, modern controls stay absent, legacy/dead launch action cannot send
  a transaction, and route links remain chain-correct.
- [ ] **P2 IDX-AUC-018 — auction mobile:** active/history cards, metrics,
  manage-weights, launch/community, and bid dialog expose all critical values and
  controls at phone width.

### H. Index DTF — Settings, Manage, Factsheet, and deployment

- [ ] **P1 IDX-SET-001 — tokenJar SPA chain:** Mainnet→Base→BSC navigation reads
  tokenJar and fee recipients from the destination chain and labels the same
  address consistently.
- [ ] **P1 IDX-SET-002 — registry failure desired behavior:** replace the
  fabricated 50% characterization with a retryable/indeterminate state; never
  display fallback percentages as live truth.
- [ ] **P1 IDX-SET-003 — platform fee 100% semantics:** after engineer-defined
  allocation, assert conservation and exact recipient shares with no NaN,
  Infinity, negative, or fabricated nonzero recipient.
- [ ] **P1 IDX-SET-004 — fee recipient variants:** governance, deployer, external,
  tokenJar/staking-vault, duplicate recipient, zero recipient, and rounding
  remainder classify and sum exactly once.
- [ ] **P1 IDX-SET-005 — governance-card variants:** optimistic veto rows,
  missing stToken governance, owner==trading governor, and separate governors
  show/hide the correct cards and durations.
- [ ] **P1 IDX-SET-006 — reward-token variants:** none, one, many, unknown
  metadata, and zero-rate reward tokens render exact identities without a
  permanent skeleton.
- [ ] **P1 IDX-SET-007 — distribute-fees preconditions:** zero pending fees hides/
  disables action; nonzero snapshot-derived fees enable any connected wallet;
  disconnected and wrong-chain states produce zero writes.
- [ ] **P1 IDX-SET-008 — distribute-fees exact/failures:** exact-one target/
  function/chain/value, reject, revert, double-click protection, confirmation,
  pending-fee refresh to zero, and retry.
- [ ] **P2 IDX-SET-009 — roles loading/error/mobile:** exact roster grouped by
  role, duplicates deduped, no-role empty, RPC error/retry, independent fee vs
  role loading, and mobile card layout.
- [ ] **P1 IDX-MGT-001 — role gate:** disconnected, ordinary wallet, snapshot
  brand manager, and one of the hardcoded global-manager EOAs prove the desired
  authorization policy; unauthorized states cannot obtain nonce/sign/upload or
  save.
- [ ] **P1 IDX-MGT-002 — SIWE request:** exact domain, URI, chain ID, folio,
  account, nonce, issued/expiration times, and statement; malformed/expired/
  reused nonce fails closed.
- [ ] **P1 IDX-MGT-003 — signature invalidation:** account, chain, route, or
  domain change after signing invalidates the session and prepared save payload.
- [ ] **P1 IDX-MGT-004 — asset uploads:** valid logo/cover, invalid type, size
  limit, crop/dimension failure, server error, retry, replacement, and removal;
  save references only confirmed uploads.
- [ ] **P1 IDX-MGT-005 — brand save payload:** exact changed fields, preservation
  of untouched fields, clearing optional fields, URL/social validation, reject/
  server error/retry, and receipt/response-driven terminal state.
- [ ] **P2 IDX-MGT-006 — unsaved changes/mobile:** navigation warning, cancel/
  discard, reload behavior, mobile upload controls, and keyboard-safe save CTA.
- [ ] **P1 IDX-FCT-001 — performance math:** independent vectors validate
  `calculatePerformance`, monthly P&L, cumulative/inception values, negative and
  zero returns, and displayed rounding.
- [ ] **P1 IDX-FCT-002 — inception clamp/range:** requested periods before
  inception clamp correctly; young DTF, missing months, leap/month boundaries,
  and current partial month remain ordered.
- [ ] **P1 IDX-FCT-003 — CSV export:** headers, chronological rows, exact raw
  values/units, escaping, selected range, and filename correspond to the visible
  DTF; empty/error data cannot export misleading content.
- [ ] **P2 IDX-FCT-004 — empty/single/error lifecycle:** no performance history,
  one point, partial month data, and API failure produce distinct states and
  recover without collapsing the page.
- [ ] **P2 IDX-FCT-005 — factsheet mobile:** summary, chart, period controls,
  monthly table/card, and CSV action remain reachable with no overflow.
- [ ] **P1 IDX-DEP-001 — route collision/gate:** `/deploy/index-dtf` and the real
  `/deploy-index` route follow the intended feature gate; no one-character path
  bypass exposes an unapproved deploy flow.
- [ ] **P1 IDX-DEP-002 — basket input:** manual and CSV paths validate addresses,
  duplicates, chain, decimals, weights, unsupported assets, empty rows, and
  preserve exact normalized ordering.
- [ ] **P1 IDX-DEP-003 — governance/deployment summary:** owner/trading settings,
  roles, fees, basket, metadata, and chain round-trip into the final reviewed
  configuration with no hidden defaults.
- [ ] **P1 IDX-DEP-004 — exact factory writes:** chain-specific factory target,
  value, salts/config structs, deterministic address, transaction ordering,
  rejection, revert, retry, and terminal navigation to the deployed folio.
- [ ] **P2 IDX-DEP-005 — wizard reset/resume/mobile:** back/forward preservation,
  account/chain invalidation, reload policy, double submit, and phone layout.

### I. Yield DTF — Overview and issuance

- [ ] **P1 YLD-OVR-001 — exact two-fixture values:** eUSD and hyUSD assert exact
  snapshot-derived price, exchange rate, APY, supply, collateralization, and
  backing—not arbitrary dollar text or wrapper visibility.
- [ ] **P1 YLD-OVR-002 — backing integrity:** token identities, amounts,
  distribution sum, revenue split, missing metadata/price, and duplicate tokens
  remain aligned and conserve totals.
- [ ] **P1 YLD-OVR-003 — collateral states:** SOUND, IFFY, DISABLED/defaulted,
  undercollateralized, trading paused, issuance paused, and frozen states expose
  the correct warnings/actions without hiding valid data.
- [ ] **P2 YLD-OVR-004 — chart edges:** empty, single point, zero first value,
  missing period, API/subgraph error, and range switch distinguish unavailable
  data from loading.
- [ ] **P2 YLD-OVR-005 — cross-chain SPA reset:** eUSD↔hyUSD navigation resets
  replay chain, metadata, chart/range, backing, staking rate, and action gates;
  no mainnet request can satisfy Base or vice versa.
- [ ] **P1 YLD-ISS-001 — state gate matrix:** active, mint-paused/redeem-only,
  issuance frozen, globally frozen, undercollateralized, deprecated, and wrong-
  chain states assert exact mint/redeem availability and zero forbidden writes.
- [ ] **P1 YLD-ISS-002 — manual mint exact path:** balances/allowances, basket
  quote, throttle, fee, exact issue calldata/receiver/amount, approval ordering,
  confirmation, rejection, revert, retry, and refresh.
- [ ] **P1 YLD-ISS-003 — manual redeem exact path:** RToken balance, redemption
  throttle, per-collateral minimums, custom/default basket choice, exact calldata,
  reject/revert/retry, and post-receipt balances.
- [ ] **P1 YLD-ISS-004 — frozen redeem regression:** replace the enabled-but-
  reverts bug with desired gating or explicitly supported behavior; no green
  test may normalize a contract revert as acceptance.
- [ ] **P1 YLD-ISS-005 — undercollateralized/custom redeem:** default redemption
  is blocked when unsafe, the intended custom redemption route is reachable if
  supported, and dead `redeemCustom` UI cannot masquerade as coverage.
- [ ] **P1 YLD-ISS-006 — throttle boundaries:** zero remaining, exact remaining,
  one unit above, refill over frozen time, and stale throttle after chain/account
  change use bigint math and exact UI gates.
- [ ] **P1 YLD-ISS-007 — mixed decimals/dust:** basket assets with 6/8/18
  decimals produce correct minimums and a reviewed dust policy with no silent
  zero protection.
- [ ] **P1 YLD-ISS-008 — compliance:** unrestricted, prohibited, VPN, unavailable,
  and malformed responses fail closed for mint while preserving only explicitly
  allowed redemption behavior.
- [ ] **P1 YLD-ZAP-001 — mint/redeem quote identity:** exact chain/token/amount,
  latest-quote race, price impact/liquidity gates, allowance, and byte-for-byte
  transaction match.
- [ ] **P1 YLD-ZAP-002 — quote/write failures:** unavailable/error/malformed
  quote, wallet rejection, approval revert, swap revert, retry, and stale quote
  invalidation after account/chain change.
- [ ] **P2 YLD-ISS-009 — manual/zap mobile:** structural mode switch, amount/
  asset details, warnings, modal, and success/error recovery at phone width.

### J. Yield DTF — Staking and withdrawals

- [ ] **P1 YLD-STK-001 — exact direct stake:** strengthen the current case to
  require exactly one `stake(amount)` call with all ledger fields; self-delegate
  stimulus must not permit `stakeAndDelegate` as an alternative.
- [ ] **P1 YLD-STK-002 — stake-and-delegate branch:** a distinct delegate fixture
  sends exact `stakeAndDelegate(amount, delegate)` and refreshes both balance and
  delegate only after receipt.
- [ ] **P1 YLD-STK-003 — approve→stake:** zero and insufficient allowance send
  exact approval then stake in order; exact/MAX allowance sends stake only.
  Reject/revert either step and verify recovery without duplicate approval.
- [ ] **P1 YLD-STK-004 — stake input boundaries:** empty, zero, exact balance,
  one wei above, decimals, minimum, and native fee insufficiency keep bigint-
  correct gates and an empty ledger where invalid.
- [ ] **P1 YLD-STK-005 — exact unstake:** strengthen the current case to assert
  target/chain/from/value/exact-one call, pending UI, receipt, and a new cooldown
  queue entry derived from post-transaction data.
- [ ] **P1 YLD-STK-006 — unstake failures:** rejection, reverted receipt,
  over-balance, zero amount, stale balance, and double click retain input and do
  not create a cooldown entry.
- [ ] **P1 YLD-STK-007 — cooldown boundary:** pending one second before
  `availableAt`, available exactly at/after it, and frozen-time advancement move
  the same draft once without off-by-one drift.
- [ ] **P1 YLD-STK-008 — draft era identity:** derive the captured storage era,
  refetch the exact Facade call after era change, and reject stale/wrong-era
  pending data.
- [ ] **P1 YLD-STK-009 — multiple drafts/endId:** mixed pending/available entries,
  nonzero indices, gaps, and multiple available entries compute the reviewed
  `endId` and amount without withdrawing pending drafts.
- [ ] **P1 YLD-STK-010 — withdraw:** exact `withdraw(account,endId)`, state gate,
  collateralization/trading prerequisites, reject/revert/retry, receipt-driven
  queue removal, and balance refresh.
- [ ] **P1 YLD-STK-011 — cancel unstake:** exact draft/index semantics, pending-
  only availability, reject/revert/retry, receipt-driven return to stRSR balance,
  and no cancel for matured/withdrawn entries.
- [ ] **P1 YLD-STK-012 — trading/default gates:** trading paused, frozen,
  undercollateralized, deprecated, and legacy versions show the contract-correct
  stake/unstake/withdraw/cancel availability.
- [ ] **P1 YLD-STK-013 — delegation change during stake:** delegate/account
  changes invalidate simulations and prepared calldata; stale delegate can never
  be submitted.
- [ ] **P2 YLD-STK-014 — exact rates/rewards:** exchange rate, APY, current stake,
  pending, withdrawable, and reward history are snapshot-derived for both
  fixtures, including zero/empty/error states.
- [ ] **P2 YLD-STK-015 — staking mobile:** tabs, amount input, cooldown summary,
  draft cards, confirmation, withdraw/cancel actions, and error recovery are
  fully reachable on mobile.

### K. Yield DTF — Auctions, governance, settings, and deployment

- [ ] **P1 YLD-AUC-001 — auction list state matrix:** no auctions, open revenue,
  open recollateralization, settleable, settled/claimed, unavailable, and
  boundary error states distinguish loading/empty/error.
- [ ] **P1 YLD-AUC-002 — dutch price boundaries:** frozen time before/start/
  midpoint/end produces independently calculated price and correct bid/settle
  availability.
- [ ] **P1 YLD-AUC-003 — bid exactness:** sell/buy token, amount, minimum output,
  auction ID, bidder, allowance/approval, chain/target/value, and max/one-past
  boundaries.
- [ ] **P1 YLD-AUC-004 — bid failures/race:** rejection, approval revert, bid
  revert, price expiry while modal is open, competing fill/remaining-size
  change, retry, and double-submit protection.
- [ ] **P1 YLD-AUC-005 — settle/claim:** permission gate, exact call/IDs,
  unavailable-before-end, confirmation refresh, rejection/revert, and already-
  settled idempotence.
- [ ] **P2 YLD-AUC-006 — auction mobile:** auction cards, price/amount details,
  bid input, approval, confirmation, settle/claim, and errors at phone width.
- [ ] **P1 YLD-GOV-001 — overview semantics:** exact proposal IDs/order/state,
  empty/error/pagination, delegates/top voters, and block-number loading without
  transient state computed against block zero.
- [ ] **P1 YLD-GOV-002 — proposal lifecycle:** PENDING, ACTIVE, DEFEATED,
  QUORUM_NOT_REACHED, SUCCEEDED, QUEUED, EXECUTED, CANCELED, and EXPIRED derive
  correct CTAs from frozen time and on-chain state.
- [ ] **P1 YLD-GOV-003 — vote:** For/Against/Abstain exact governor/support,
  voting power/delegation gate, reject/revert/retry, receipt-driven tally, and
  chain-correct v4/current ABI where applicable.
- [ ] **P1 YLD-GOV-004 — proposal parameter families:** independent vectors for
  basket/backup, revenue split, issuance/redemption throttles, pause/freeze,
  roles, governance timings, and upgrade/spell actions decode and submit exact
  calldata. Group handlers by unique ABI/logic; do not make copy-only variants.
- [ ] **P1 YLD-GOV-005 — proposal validation:** unchanged config, invalid basket/
  backup, totals not conserved, invalid roles, unsafe throttle/timing bounds,
  and unknown selector keep submission disabled or render safely.
- [ ] **P1 YLD-GOV-006 — queue/execute/cancel failures:** permission, timing,
  rejection, revert, retry, exact action hash, and receipt-driven terminal state.
- [ ] **P2 YLD-GOV-007 — governance mobile:** list/detail/delegate/vote/propose/
  queue/execute remain readable and actionable without clipped previews.
- [ ] **P1 YLD-SET-001 — exact roles roster:** owner, pauser, short freezer, long
  freezer, guardian, and missing/duplicate roles render from live RPC with
  chain-correct identities and error/retry.
- [ ] **P1 YLD-SET-002 — pause/freeze role matrix:** authorized vs unauthorized,
  disconnected/wrong-chain, pause issuance, pause trading, pause both, short/
  long freeze, unpause, and unfreeze expose only allowed actions.
- [ ] **P1 YLD-SET-003 — settings writes:** exact target/function/arguments for
  every unique pause/freeze branch, reject/revert/retry, pending disabled state,
  and post-receipt status refresh.
- [ ] **P1 YLD-SET-004 — legacy single-pause branch:** legacy fixture uses its
  version-correct combined pause/unpause ABI and never exposes unsupported
  current-version controls.
- [ ] **P2 YLD-SET-005 — settings state/error/mobile:** partial RPC failure is not
  shown as “no role” or “unpaused”; independent cards recover and remain usable
  at mobile width.
- [ ] **P1 YLD-DEP-001 — deploy validation:** basket/backup assets, diversity,
  revenue split conservation, governance addresses/timings, roles, throttles,
  metadata, and chain-specific constraints at min/max/invalid boundaries.
- [ ] **P1 YLD-DEP-002 — deploy summary/write:** every reviewed field maps to the
  exact factory call(s), deterministic address, chain/value/order, rejection,
  revert, retry, and terminal route.
- [ ] **P2 YLD-DEP-003 — wizard identity/mobile:** account/chain change resets
  prepared deployment, back/reload policy is explicit, double submit is blocked,
  and every step is usable on mobile.

### L. General routes

- [ ] **P2 GEN-HOME-001 — featured semantics:** exact featured DTF count,
  weight-descending order, chain/address links, duplicate handling, and packing/
  animation completion—not only shell visibility.
- [ ] **P2 GEN-HOME-002 — featured empty/error:** distinguish empty campaign,
  REST failure, malformed item, slow response, and retry while the rest of Home
  remains usable.
- [ ] **P2 GEN-DIS-001 — discover empty/error:** search-no-results, truly empty
  feed, API error, retry, and slow response render distinct table states.
- [ ] **P2 GEN-DIS-002 — discover identity/filter edges:** deprecated DTF search,
  chain/type tab persistence, empty chain filter, casing, duplicate address, and
  row link chain correctness.
- [ ] **P2 GEN-DIS-003 — discover mobile:** filters/search, table-to-card layout,
  row navigation, loading, empty, and error at phone width.
- [ ] **P1 GEN-ERN-001 — Index Earn semantic list:** exact DAO/vote-lock rows,
  chain, reward/APY values, sort/filter, row action/link, disconnected/connected
  positions, empty, loading, and error.
- [ ] **P1 GEN-ERN-002 — Yield Earn semantic list:** exact token/rate/APY/TVL,
  search/filter/sort, connected stake position, empty, loading, error, and
  chain-correct navigation.
- [ ] **P1 GEN-ERN-003 — DeFi semantic list:** DefiLlama rows, Reserve-specific
  filtering, APY/TVL units, sort, external link safety, empty/error/retry, and
  malformed pool handling.
- [ ] **P1 GEN-ERN-004 — Earn chain/filter regressions:** default vs “All chains”
  uses the same supported set, deprecated Arbitrum does not reappear, BSC casing
  does not drop results, and Yield search respects DTF filters.
- [ ] **P2 GEN-ERN-005 — Earn mobile:** tab navigation, filters, cards, APY/TVL,
  positions, links, empty, and error states—not wrapper visibility.
- [ ] **P1 GEN-PRT-001 — connected holdings:** exact cross-chain positions,
  balances, USD totals, price/PnL, chain grouping, row links, and no duplicate
  assets from REST/RPC joins.
- [ ] **P1 GEN-PRT-002 — truly empty wallet:** no holdings and no transaction
  history shows the empty prompt, not a loader or stale prior account.
- [ ] **P1 GEN-PRT-003 — past-activity-only wallet:** zero current holdings plus
  historical transactions still mounts history rather than the empty prompt.
- [ ] **P1 GEN-PRT-004 — history period matrix:** every supported period uses its
  own loading/error/data status; one failed period cannot leave all periods in a
  skeleton or reuse another period's series.
- [ ] **P1 GEN-PRT-005 — account impersonation/query identity:** `?account=` vs
  connected wallet selects the intended account consistently across portfolio,
  history, transactions, links, and refetch; account change clears old data.
- [ ] **P2 GEN-PRT-006 — partial/error/mobile:** one chain/API failure retains
  other holdings with a retryable partial state; phone cards/chart/period/history
  remain usable.
- [ ] **P1 GEN-EXP-001 — transactions happy path:** exact multi-chain rows,
  amount/USD/token/from/to/hash, sort, type/token/wallet/chain filters,
  pagination/limit, and chain-correct links.
- [ ] **P1 GEN-EXP-002 — transactions partial response regression:** unfix GH0;
  a chain response missing `entries`, a rejected chain, and deprecated Arbitrum
  cannot crash or erase healthy chains. Prove the intended override was consumed.
- [ ] **P1 GEN-EXP-003 — tokens:** exact rows, search/filter/sort, pagination,
  supply/price/mcap semantics, unknown metadata, empty/error, and chain-correct
  token link.
- [ ] **P1 GEN-EXP-004 — collaterals:** exact status/target/reference values,
  SOUND/IFFY/DISABLED/default states, partial multicall failure, loading/error,
  filter/sort, and links.
- [ ] **P1 GEN-EXP-005 — governance:** exact cross-DTF standard/optimistic rows,
  block-aware derived state, DTF/governor filters, partial missing `dtfs` or
  `proposals`, empty/error, and chain-correct proposal link.
- [ ] **P1 GEN-EXP-006 — revenue:** Mainnet/Base/BSC values, available totals,
  category/table semantics, partial chain failure, and deprecated Arbitrum not
  gating healthy chains.
- [ ] **P2 GEN-EXP-007 — tab routing/mobile:** direct/deep links, back/forward,
  filter isolation/reset between all five tabs, child-content anchors, loading/
  error boundaries, and usable mobile layouts. A visible `explorer-page` parent
  is not the oracle.
- [ ] **P1 GEN-TOK-001 — token directory sort:** header sort actually changes the
  server query/full result order; Market Cap sorts by USD market cap rather than
  raw supply, with stable ties and pagination.
- [ ] **P1 GEN-TOK-002 — token empty/error/filter:** query error is retryable and
  distinct from no results; search, chain, listed/unlisted, casing, and empty
  chain filter preserve correct rows/links.
- [ ] **P1 GEN-TOP-001 — Top100 ranking:** exact rank, deduplication across
  chains, market-cap ordering, ties, missing price/supply, and chain/address
  links from the full query result.
- [ ] **P2 GEN-TOP-002 — Top100 desktop/mobile:** table↔card breakpoint preserves
  rank/identity/value/actions; loading, empty, partial, and error are distinct.
- [ ] **P2 GEN-BRG-001 — static bridge contract:** exact external/deep-link href,
  supported chain/token parameters, copyable address, `target`/`rel` safety,
  keyboard activation, and mobile layout. Do not add nonexistent form/quote
  cases—the current Bridge page is static.
- [ ] **P1 GEN-DEP-001 — coming-soon submission failure:** if the gate collects
  an email/request, success, validation, server failure, retry, and duplicate
  submit are visible rather than only `console.error`.

### M. Reliability, performance, and suite-maintenance tests

- [ ] **P1 META-001 — fixed-port exclusion:** a second suite receives an
  immediate lock/owner diagnostic and cannot reuse or kill the first suite's
  server; stale locks recover safely.
- [ ] **P1 META-002 — project/script contract:** `smoke`, `full`, and `mobile`
  select the documented projects exactly; generic `e2e` has an explicit desktop-
  only vs all-project meaning and no accidental duplication.
- [ ] **P1 META-003 — mobile policy enforcement:** if mobile is manual-only, docs
  and workflows make no nightly claim; if scheduled, a workflow test proves the
  mobile command is invoked without affecting PR latency.
- [ ] **P1 META-004 — no permissive committed modes:** static contract rejects
  `allowUnmocked: true`, spec-local broad routes, raw sleeps, raw clock calls,
  English-copy locators, `.only`, and unannotated skips/fixmes.
- [ ] **P1 META-005 — coverage-map reconciliation:** discovered domain specs,
  project tags, route/state IDs, and declared statuses cannot drift into claims
  such as “covered” from wrapper-only tests or “permission matrix” from two
  positive cases.
- [ ] **P2 META-006 — duplicate canonical coverage:** identify old/new specs with
  the same route/state/oracle and fail or report once a domain migration declares
  the new tree canonical.
- [ ] **P2 META-007 — request budget regression:** representative Home, Index
  Overview, Governance, Yield Overview, and SPA navigation stay within reviewed
  API/subgraph/RPC counts and do not refetch indefinitely after settling.
- [ ] **P2 META-008 — cleanup after navigation:** no pending holds, timers,
  React Query polling, replay mode, wallet state, frozen time, console errors, or
  transaction outcomes leak into the next test/route.
- [ ] **P2 META-009 — retry determinism:** run high-risk lifecycle and write
  specs repeatedly with five workers and randomized file order; zero retries are
  required before calling them stable.
- [ ] **P2 META-010 — fixture refresh drift:** after a no-change recapture,
  semantic identities/counts and unrelated file bytes remain stable; intentional
  protocol changes produce a focused reviewed diff rather than snapshot churn.
- [ ] **P3 META-011 — runtime budget:** record per-spec wall time and fail/report
  regressions beyond reviewed thresholds; keep positive write/lifecycle cases out
  of PR smoke when they do not protect boot-critical behavior.
- [ ] **P3 META-012 — console/page error contract:** unexpected console errors,
  unhandled rejections, failed resources, and error-boundary fallbacks fail every
  committed test even when the asserted parent wrapper remains visible.

### Cases deliberately not worth adding

- Another outer-wrapper-only render for a route already reached by the suite.
- The same desktop visibility assertion repeated under `@mobile` without a
  mobile-specific layout, interaction, or overflow contract.
- One lifecycle test per page when several pages use the identical boundary and
  skeleton architecture; cover the architecture once and page-specific states
  semantically.
- Copy/text assertions for Lingui-localized labels; assert structural state,
  values, hrefs, calldata, and accessible behavior.
- Tests that duplicate a production formula in the fixture and then compare the
  UI to that same formula. Use independent reviewed vectors or snapshot truth.
- A “Whitelist proposal” create test or Bridge form/quote tests for surfaces that
  do not exist.
- More positive-only writes that assert `txLog.length > 0` and inspect `last()`.
  Strengthen or parameterize the existing write family instead.
