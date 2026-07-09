---
title: Referral Tracking
updated: 2026-07-03
type: domain
sources:
  - src/utils/referral.ts
---

Influencer campaign attribution, **Mixpanel-only** (the reserve-api piece was
built, reviewed, then cut — see [[decisions]]). Links land on
`/?referral=<code>`; everything the campaign needs lives in Mixpanel events,
extracted later via the Mixpanel export API. Conversions are settled
post-campaign from on-chain data (subgraph transfers), never from client
events.

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
  Every subsequent Mixpanel event (transactions, zaps, clicks, pageviews)
  carries the latest code via the `referral` super property.
- `linkWalletToReferral()` fires in `AtomUpdater` on wallet connect:
  `referral_wallet_linked` with explicit `{ wallet, code }` — THE attribution
  record. Deduped once per wallet+code via an in-memory session set plus a
  localStorage flag scoped by the Mixpanel project key (staging-project flags
  can't suppress the prod event).

Gotchas:
- All localStorage access goes through safeGet/safeSet — bare calls throw in
  Safari Private Mode and would crash the init effect.
- Marketing funnels must key on `referral_landed`; the automatic first
  pageview of a landing always lacks the `referral` prop (init-order).
