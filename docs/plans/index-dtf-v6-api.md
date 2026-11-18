# Index DTF v6 — Reserve API integration addendum

**2026-09-17. Status: API scope added; full release acceptance pending.** This extends the [integration contract](index-dtf-v6-integration.md) and [handoff](index-dtf-v6-handoff.md) to `reserve-protocol/reserve-api`. The original 69 tasks and 146 catalog cases keep their IDs and scope. The API acceptance obligations below are additional requirements attached to S4, S6 and S7; they are not results or replacements for the catalog.

## Baseline and ownership

The API checkout is `~/projects/reserve-api`, outside the interface hub. On 2026-09-17 it was fast-forwarded from `4bfddd6` to `origin/main` at `7f1a76b` (29 commits) and work continues on `feature/index-dtf-v6`; the prior vote-lock branch was preserved. Recapture HEAD and working-tree digests for the release candidate. The updated API uses Hono on Cloudflare Workers. Do not use the older Fastify route/test layout.

The tracked API support contract is `reserve-api/docs/wiki/domains/index-dtf-rebalance.md`; API session plans under `docs/plans/` are ignored and are not durable release references. Its owner implements and verifies backend changes; Register owns consumer compatibility and UI evidence. This documentation update does not certify the API implementation, production deployment or Register fixes.

| Owner / surface | Scope and boundary |
| --- | --- |
| API `src/services/indexDtfService.ts` | Version-aware RPC rebalance reads and `RebalanceStarted` / `AuctionOpened` decoding for exact supported v4/v5/v6 versions; explicit rejection of unknown versions. |
| API analytics and Hono response contracts | Carry correctly decoded history into rebalance metrics; preserve field names, units, token order, serialization and documented unavailable/error behavior consumed by Register. |
| SDK / API proposal hydration | API currently pins `@reserve-protocol/sdk` `0.3.1` for proposal hydration. Local rebalance read fixes do not require a package bump. V6 proposal hydration needs a separate compatibility audit and verified SDK candidate before being claimed supported. |
| Register | Verify rebalance/history/metrics consumers against API responses; retain RPC as live auction, permission and execution truth. |
| Standalone Zapper worker | Own simple/zap deployment payloads and v6 deployer compatibility. API `src/worker/routes/zapper.ts` forwards these operations; the compatibility proxy does not build their calldata. |

## Rebalance and history acceptance (S4)

- Select the read ABI from `version()` at the requested historical block, not the current implementation. Read the rebalance at that same block. For event decoding, resolve version at the event block. Exercise a proxy upgraded from v4 to v5/v6 so current version cannot accidentally pass the historical test.
- Preserve v4 `4.0.0` / `4.0.1` behavior and v5 `5.0.0` behavior; route v6 `6.0.0` through its verified read/event layout. The old `version[0] !== '5'` fallback must not send v6 or unknown versions to v4. Shared v5/v6 signatures need protocol-source evidence and decoded fixtures; this does not establish write/deployment ABI compatibility.
- Cover RPC/archive failure, unresolved/unsupported version, absent or nonmatching logs, rebalance nonce selection and empty data. Failures must remain distinguishable from valid historical values; a fallback to latest state cannot satisfy a historical request.
- Test the analytics consumer with actual v4/v5/v6 decoded fixtures and independent expected token amounts/weights/metrics. A mocked service response or isolated ABI test does not prove analytics compatibility. Keep price timestamps and missing-price behavior explicit.
- Test the Hono response boundary and schema for successful rebalance analytics and failure/unavailable responses, including large integer serialization, field/array shape and old-client compatibility. Add Register consumer evidence where output semantics change.
- Run the API's current unit and Worker suites, typechecks and Worker build from its own scripts; record exact commands/results and candidate identity in the release evidence. Pair Register scoped checks with any changed queries/types. Historical fork/upgrade evidence remains required by the parent release gate.

## Simple/zap deployment acceptance (S6)

Inventory the standalone Zapper worker's request/response contract, SDK/router dependencies and deployed per-chain deployers before enabling v6 simple creation. Execute both governed and ungoverned v6 output and verify deployed version, roles and seed amounts on each supported chain. API proxy tests establish forwarding and response behavior only. Missing upstream support remains an explicit S6 dependency, with the affected Register capability gated.

## Release dependency (S7)

Record API commit/diff, response-contract evidence and deployment identity beside SDK, React SDK, subgraph and Register candidates. Preserve existing v4/v5 clients throughout rollout. Deploy compatible API reads/analytics before enabling Register behavior that depends on them; treat standalone Zapper readiness separately. If an SDK bump becomes necessary for API proposal hydration, build/test the API against that exact package and report publication and pinning separately. No package publication, push or deployment is implied by source changes or this plan.

API completion cannot close the existing Register review blockers: v6 metrics and Ondo-limit calculations omit the required `auctionLength`, and both launch buttons can remain enabled after a cached RPC read fails. Those findings remain open until fixed with regression evidence. SDK publication/pinning and v6 basket proposal support also remain deferred. **Engineer review required** for the API contract, historical decoding and rebalance behavior before shipping.
