---
title: Referral Tracking
updated: 2026-07-03
type: domain
sources:
  - src/utils/referral.ts
---

Influencer campaign attribution. Links land on `/?referral=<code>`; the app
stores the code and reports wallet↔code to reserve-api. Conversions are NOT
computed here or in reserve-api — they are settled post-campaign from on-chain
data (subgraph transfers), so client data is attribution-only and safe to lose.

Flow:
- `storeReferralFromUrl()` runs in `src/index.tsx` BEFORE React renders —
  capture must beat React's effects: child effects (AtomUpdater wallet-link,
  legacy `Redirects` navigation that strips the query string) run before
  App's own effects and would otherwise see stale/no code. Reads both link
  forms: `/?referral=x` and hash-embedded `#/?referral=x` (even with a
  pre-hash query string). Keeps the code in module memory too, so a session
  with blocked storage still attributes.
- `registerReferralSuperProperty()` runs inside `useMixpanelInit` right after
  `mixpanel.init` — the auto pageview at init fires BEFORE the super property
  exists, so `referral_landed` is the reliable landing event, not pageviews.
- Last-touch: a new `?referral=` always overwrites `localStorage
  register:referral` (bare code string, no expiry — multi-month campaign).
  Every subsequent Mixpanel event carries the latest code via the `referral`
  super property.
- `linkWalletToReferral()` fires in `AtomUpdater` on wallet connect: one POST
  to reserve-api `POST /referrals/link` per wallet+code. Dedupe = in-memory
  session set (guards concurrent effect re-runs) + localStorage flag
  `register:referral-linked:<RESERVE_API>:<wallet>:<code>` — the API base is
  in the key so staging-era flags can't suppress prod POSTs after the
  staging pin flips. Server keeps full link history (PK code+wallet,
  code-first: settlement reads are "wallets by code").

Gotchas:
- Code regex `/^[a-zA-Z0-9_-]{1,32}$/` must stay in sync with reserve-api
  `src/routes/referrals/link` (drift = permanent 400 retry on every connect).
- All localStorage access goes through safeGet/safeSet — bare calls throw in
  Safari Private Mode and would crash the init effect.
- reserve-api endpoint is origin-filtered (reserve.org hosts + localhost) via
  an `onRequest` guard — spoofable deterrent, acceptable because credit is
  settled on-chain. See [[project]] for the API base URL staging-pin risk.
