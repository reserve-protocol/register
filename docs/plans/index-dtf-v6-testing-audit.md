# V6 subgraph and reusable testing suite audit

Date: 2026-09-21. Verdict: **not ready to serve as the reusable v6 regression gate**. The existing checks provide useful evidence, but there is a reproduced indexing defect, an empty-fixture false pass, and conflicting ownership of the persistent chain. This is an audit of current work, including uncommitted files; it does not certify the broader integration plan or implement fixes.

## Candidate and scope

| Repository | Reviewed candidate | Scope |
| --- | --- | --- |
| index-subgraph | `feat/index-dtf-v6-indexing-sandbox`, `ccaac71`, clean | V6 hydration/events, registry discovery, role history, replay tests, fork parity |
| sdk | `feat/index-dtf-v6-support`, `6b0db30`, clean | Unit and React tests, fixture validation, read-only and mutating fork suites |
| index-protocol | `feat/index-dtf-v6-sandbox`, `18706fb`, dirty, sandbox files untracked | Bootstrap, governance/upgrade/execution fixtures, verification, reset/reuse |
| register | `feat/index-dtf-v6`, `0a8647947`, dirty | Current stack runner, native-v6 and BSC lanes, offline launch coverage, CI and lab specifications |

Existing dirty work was preserved. No shared-chain broadcasts, resets, snapshot reversions, deployments, publication, or pushes were performed. The two hub-referenced protocol/product context files were unavailable; repository documentation and contract sources supplied context. Reserve API implementation was not re-audited here; its inclusion in the stack's evidence was reviewed.

## Findings requiring fixes

### F1 — P1: upgrade hydration duplicates roles and leaves revoked authority indexed

Sources: `index-subgraph/src/dtf/hydration.ts:45–55`, `src/dtf/handlers.ts:489–533`, and `src/dtf/mappings.ts:286–300`.

`Upgraded` hydrates role membership using contract calls at the event block. Those calls return the block's final state, including grants later in the transaction/block. Subsequent `RoleGranted` handlers append the same account unconditionally. Revocation removes only one occurrence, leaving an account indexed as authorized after its on-chain role is gone.

An isolated Matchstick regression using the current implementation reproduced a launcher list containing the same account twice after upgrade hydration followed by a grant, then a launcher remaining after revocation (expected `[]`, received `[CREATOR]`). The existing six hydration tests passed alongside the failing regression. The existing LCAP replay mocks intermediate-log role membership (`tests/lcap-replay.test.ts:149`), which does not model block-final contract calls and misses this boundary.

Required fix/evidence: make hydration and role replay compose correctly; cover a grant after upgrade in the same block and a later revoke. Assert exact role arrays against the RPC oracle, including absence after revocation. Preserve historical governance behavior. Run the regression red on this candidate, then green after the fix.

### F2 — P1: shared indexed chain is rewound by SDK tests and protocol reset

Sources: `sdk/packages/sdk/src/index-dtf/fork-smoke-v6.test.ts:40–41,253–319`; `register/e2e/fork/scripts/stack-lane.sh:37–41`; `index-protocol/script/sandbox/run.sh:72–76` and its README at line 23.

The SDK completion suite mines settings, deployment, and upgrade transactions inside `evm_snapshot`/`evm_revert` on the same Anvil followed by Graph Node. One case advances time 400 days. Both sandbox `all` and Register's verification step invoke this suite with Graph running. Restoring Anvil does not synchronously restore Graph; the assertion that the revert happens before the indexer notices is a timing assumption, not isolation. Revert success is also unchecked.

The protocol's documented `SANDBOX_RESET=1` path separately calls `anvil_reset` and deletes fixture evidence without coordinating Graph storage. This is a second entry point into the same ownership defect.

Required fix/evidence: use disposable, unindexed forks for reversible write tests; keep indexed scenarios append-only. Give one stack owner responsibility for coordinated reset. Verify that a deliberately slow mutation cannot affect the indexed lane, and test restart/reset with retained evidence. Do not solve this by relying on Graph polling speed.

### F3 — P1: parity reports success with no scenarios

Source: `index-subgraph/scripts/check-fork-parity.js:923–985`.

Schema-v1 normalization iterates whatever scenarios happen to exist and silently skips null/zero-address scenarios. It never enforces a declared required scenario set or execution count. In a temporary copy of the live manifest, replacing `scenarios` with `{}` produced exit 0 and:

```text
Fork parity passed ... 0 Folios, 0 upgrade proposals, 0 execution flows
```

The Graph health check still runs, but it proves no DTF behavior. Omitting execution evidence can similarly reduce coverage without failing the gate.

Required fix/evidence: declare the selected profile and required cases, validate their presence before network checks, and reconcile selected/passed/failed/skipped counts. Full-profile tests must reject an empty fixture, a missing upgrade, and a missing execution. Subset profiles must be explicit and cannot certify the full suite.

### F4 — P1: reuse can test old protocol code after a candidate change

Sources: `index-protocol/script/sandbox/run.sh:62–70`; `script/sandbox/MainnetAnvilSandbox.s.sol:249–252`.

Bootstrap reuse only checks that the recorded deployer has some code. It does not bind that code to the candidate implementation, compiler/build inputs, fork identity, or scenario configuration. Disabling reuse is insufficient: bootstrap can adopt the v6 deployer already registered on the old fork. A future implementation change can therefore be followed by a successful test of the previous deployment.

Required fix/evidence: record and validate build/runtime bytecode identities, repository and dirty-content fingerprints, scenario configuration, and pinned chain identity. Reject incompatible reuse and require a coordinated fresh stack. A mutation to the candidate implementation must either cause redeployment of that candidate or an explicit stale-fixture failure.

### F5 — P2: baseline verification fails after legitimate appended scenarios

Source: `index-protocol/script/sandbox/run.sh:358–381`.

The protocol verifier compares the base fixture's nonce to latest RPC state. Register intentionally appends further rebalances to the native fixture. Fresh `script/sandbox/run.sh verify` failed with `sandbox: v6Native rebalance nonce mismatch`: fixture nonce 1 at state block 25834903 versus live nonce 4 at block 25834927.

Subgraph parity correctly pins its reads to fixture block 25834903 and passes. These results have different reference blocks; the passing baseline parity does not validate the later Register operations.

Required fix/evidence: verify immutable baseline evidence at its recorded block; give each appended scenario its own operation manifest and indexed postconditions. Run baseline verification before and after two appended scenarios, and verify each new operation separately. Avoid overwriting history to make the old gate green.

## Additional integration defects

| Issue | Evidence and consequence | Required correction |
| --- | --- | --- |
| Diagnostic spec enters normal fork collection | `register/e2e/fork/tests/zz-diag.fork.spec.ts:6–8` reads the mainnet manifest at import time without a chain gate. Fresh `playwright ... --list` collects it as the third test. A clean BSC-only run without that mainnet file fails collection; with the file, this assertion-free diagnostic runs in the acceptance suite. | Move diagnostics outside test collection; assert nonzero required cases for the selected chain. Missing required fixture must fail explicitly rather than skip the acceptance case. |
| Default hub path is one directory short | `register/e2e/fork/scripts/stack-lane.sh:12` resolves `../../..` from `e2e/fork/scripts` to Register, then appends `/register`, `/sdk`, and `/index-subgraph`. | Correct the default and test invocation from different working directories with the override unset. The documented explicit `RESERVE_SANDBOX_ROOT` avoids this bug. |
| API override only reaches the browser | `propose-native-v6-rebalance.mjs:57–59` constructs the SDK without `apiBaseUrl`; `playwright.fork.config.ts:59` only sets the browser override. SDK client defaults to its production API in `sdk/packages/sdk/src/client/index.ts:31`. | Pass the same API/price configuration into proposal construction and browser consumption; prove endpoint identity in the result. |
| BSC proxy is not a historical subgraph | `register/e2e/fork/scripts/subgraph-proxy.mjs:14–30,41–48` filters returned arrays only when elements contain `blockNumber`; it forwards the original query against current production state. Mutable scalar fields and already-truncated latest-N lists are not reconstructed at the fork block. | Use block-pinned queries or a recorded/local indexed dataset. A source entity changed after the fork must not leak newer values into the scenario. Native-v6 uses a real local Graph and is not affected by this proxy. |
| Scenario subsets are not honored throughout execution | `index-protocol/script/sandbox/run.sh:188–242,574` always enters v5/native execution despite configurable bootstrap subsets. | Validate dependencies and run only declared scenarios, with explicit case accounting. |

## What the current suite proves, and what remains open

There is substantive coverage to keep: real standard-governance upgrades in both topologies; exact call order and reviewed spell identity; receipt/block/transaction linkage; v5/v6 RPC reads and calldata; block-pinned Graph parity for balances, roles, fees and execution events; and browser launch/gate behavior.

The current native browser lane proves an auction can open. Its Graph read-back asserts the auction ID (`launch-native-v6.fork.spec.ts:266–285`); the cold-reload assertion checks the RPC-derived ongoing gate. It does **not** assert all indexed auction fields or prove an economically completed rebalance. Neither browser fork case bids. Nonzero fills, partial fills, close/end, independent payment/rounding calculations, achieved basket, and value conservation are still required. The integration plan already says auction-open alone is insufficient.

Upgrade verification also needs independent before/after preservation checks for supply, basket balances, metadata, required roles, ProxyAdmin ownership, and fee checkpoint behavior. Matching Graph and RPC post-state alone cannot detect a protocol transition that changed both incorrectly.

The parity query includes owner/trading governance fields, but the schema-v1 expectations do not compare those links. Add exact linkage and self-fee revenue accounting assertions when expanding v6 parity; field presence in a query is not coverage.

The lab document is explicitly a specification, not an implemented scenario runner. Its catalog, three-chain real-DTF cohort, seeded price paths, bid policies, economic oracles, failure recovery, and per-case reporting must not be counted as executed coverage. SDK normal CI skips the opt-in fork tests, and Register's CI runs its offline suite, not the stack lane. Continuous fork certification is not established.

Current live production prices also make the stack lane unsuitable as a deterministic regression baseline: proposal inputs are printed, not saved as replayable price fixtures with digests. Keep live-price exploration as a separately labeled mode. A deterministic gate needs captured/scripted prices and recorded inputs, candidate artifacts, receipts, block hashes, and indexer deployment identity per run.

## Fresh verification

| Check | Result and limit |
| --- | --- |
| Subgraph `pnpm test` | 130 passed; isolated added role regression fails on current source |
| Subgraph `pnpm build:fork` | Passed |
| Subgraph `pnpm test:fork:parity` with current manifest | Passed: 4 Folios, 2 upgrades, 2 execution flows; baseline reads pinned at 25834903, Graph head 25834927 |
| Parity with temporary empty-scenario manifest | Incorrectly passed: 0 cases |
| SDK/React `pnpm exec turbo run typecheck test --force --filter=@reserve-protocol/sdk --filter=@reserve-protocol/react-sdk` | SDK 450 passed / 32 skipped; React 94 passed; typechecks and build dependencies passed |
| SDK opt-in `fork-smoke.test.ts` only | 8 read-only fork cases passed; mutating `fork-smoke-v6.test.ts` deliberately excluded from the shared indexed stack |
| Protocol `forge test --match-path test/sandbox/MainnetAnvilSandbox.t.sol` | 3 passed; these test source hash and selectors, not full scenario behavior |
| Protocol `bash -n script/sandbox/run.sh` | Passed |
| Protocol `script/sandbox/run.sh verify` | Failed: native-v6 nonce mismatch after appended scenarios |
| Register `pnpm exec tsc -p e2e/tsconfig.json --noEmit` | Passed |
| Register `pnpm exec vitest run e2e/helpers/tests` | 74 passed |
| Register `pnpm exec playwright test --project=smoke e2e/tests/index-dtf/auctions/launch-write.spec.ts` | 3 passed: v5 launcher, community launch, v6 launcher |
| Register fork test collection | 3 collected, including the unintended diagnostic |

No clean-reset end-to-end run, full Register suite, full protocol suite, live browser write, API fork analytics, or three-chain cohort run was performed in this audit. Existing receipts were inspected as artifacts, not represented as freshly executed transactions.

The isolated role regression is retained at `/var/folders/c7/kh5xsx0d7g514_sgf2v43n400000gn/T/subgraph-role-repro-lq16op`; run `./node_modules/.bin/graph test v6-hydration` there. It uses current source/generated files through symlinks, with a copied test file. The empty-scenario manifest is retained at `/var/folders/c7/kh5xsx0d7g514_sgf2v43n400000gn/T/subgraph-audit-z1c8o1/empty-fixture.json`; from index-subgraph, run `node scripts/check-fork-parity.js <that-path>` against the same live stack. These temporary reproductions should become committed negative regressions during implementation.

## Recommended implementation order and acceptance

1. Fix F1 with block-final hydration regressions. Require exact authority arrays and a revoke that leaves no phantom role.
2. Fix F2–F4 before adding more scenarios: one stack owner, separate disposable/indexed lanes, strict required-case validation, and candidate provenance. Add negative harness tests that prove each guard fails for the intended reason.
3. Fix F5 and runner integration defects. Establish immutable baseline and per-operation manifests; verify two append-only runs and restart/recovery without losing evidence.
4. Implement one complete deterministic v5/v6 rebalance with nonzero bids, close/end, independent arithmetic and final basket assertions. Add negative and boundary cases, then extend to the planned chains/cohort.
5. Wire the repeatable profile into CI, with required-case accounting and retained artifacts. Mutation probes must fail the intended behavioral assertion, not merely fixture setup. Finish with a clean candidate run after restoring each mutation.

Completion means the same candidate and inputs reproduce the same assertions, changing the candidate cannot silently reuse old contracts, missing cases cannot produce green, and indexed tests never depend on how quickly Graph observes a temporary chain.
