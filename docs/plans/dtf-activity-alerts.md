# DTF activity event instrumentation

**Date:** 2026-09-01  
**State:** active  
**Backend contract:** `reserve-api/docs/plans/dtf-activity-alerts.md`

## Goal

Emit privacy-minimal semantic events to Reserve API for wallet connection transitions, actual DTF video playback, and confirmed Index DTF buy/sell transactions. Event delivery must never block or alter the user flow.

## Current state

Register associates analytics with connected wallets and records modal-open and generic transaction events, but it does not emit dedicated activity events. The video modal does not prove playback. `react-zapper` does not expose a confirmed-transaction callback to consumers.

## Outcome

Emit privacy-minimal semantic events to Reserve API for wallet connection transitions, actual DTF video playback, and confirmed Index DTF buy/sell transactions. Event delivery must never block or alter the user flow.

## Slices

1. Add a feature-local `activity-events` client using `fetch(..., { keepalive: true })`. It sends only typed wallet/chain/DTF/video/transaction metadata; no IP or geo fields.
2. Emit `wallet_connected` on a disconnected/unavailable → connected address transition, not on every render or chain change.
3. Extend the shared YouTube modal with an `onPlay` callback backed by the YouTube IFrame API and emit `video_played` once per modal/player mount after the player enters `PLAYING`. Opening the modal is not a watch.
4. Consume a typed transaction-confirmed callback from `@reserve-protocol/react-zapper`; send `dtf_buy`/`dtf_sell` only after a confirmed receipt/fill supplies a transaction hash. The package change is a separate PR/release gate.
5. Emit confirmed manual and automated mint/redeem events from their existing receipt/completion seams.
6. Model the event POST centrally in the strict Playwright API harness and assert successful manual events plus rejection suppression.

## Failure semantics

- Fire-and-forget: network/CORS/5xx failures are silently ignored and never affect wallet, video, or transaction UI.
- Backend performs company-wallet filtering, country derivation, dedupe, and trade verification. The browser does not duplicate policy.
- React Strict Mode and rerenders must not duplicate events; backend dedupe remains the final guard.

## Non-goals

- Client-side company-wallet filtering or geography.
- Exposing Slack credentials to the browser.
- Claiming complete third-party onchain trade coverage.

## Acceptance evidence

- One wallet event fires for a disconnected-to-connected transition and not for rerenders or chain-only changes.
- Opening a video emits nothing; YouTube `PLAYING` emits once per player mount.
- Confirmed Zapper buy/sell events include wallet, chain, DTF, and transaction hash.
- Confirmed manual and automated mint/redeem events use the same backend-verified trade contract.
- Delivery failures do not alter or block UI behavior.
- Mapped unit/e2e tests and the repository scope gate pass.

## Test seams

Injected/global fetch at the event client, pure transition helper or hook harness, mocked YouTube player lifecycle, and Zapper callback contract tests.

## Unresolved decisions

- Register trade instrumentation is gated on a reviewed and released `react-zapper` callback version.
- The backend endpoint and dedicated Slack webhook must be deployed before live proof.

## Verification

- Unit tests for event payloads, failed delivery, wallet transition behavior, and one `onPlay` callback per player mount.
- Existing overview/video, manual issuance, and zap smoke tests remain green.
- Gates through `node scripts/ci/scope.mjs --gate` plus mapped e2e specs.
- Live staging proof requires the Reserve API endpoint and Slack webhook to be configured first.

## Foundation review

Forced constraints: no browser Slack secret; no client-supplied geo; video is actual `PLAYING`, not modal open; transaction events require a confirmed hash; observability cannot break user flows. Complete third-party trade coverage is explicitly outside this browser slice and would require an onchain/indexer service.
