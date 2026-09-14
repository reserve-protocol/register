# Auction-size editing affordance — September 13

Bounded lab follow-up to the weight comparison candidate, base `289b2af86`.
The collapsed Max Auction Size per Token control now uses the canonical
secondary Button with pencil and expansion cues, over the existing Radix
disclosure behavior. The production USD/default explanation is restored using
its existing translated message. No new product wording or shared defaults.
Fields, validation, values and save/discard behavior are unchanged.

The owner inspected closed/open 1400px light and 320px dark viewport captures.
The title wraps on the phone without truncation; the real control remains at
least 44px high. Inline expansion keeps all eight token limits available.

[Browser report](browser-report.json): 12/12 passed, covering keyboard opening,
non-preset limit edits, resize, save/reopen, discard, rejection retention,
CSV validation, current/target references, reload and translated editor layouts.
App/E2E typecheck, scoped oxlint, Prettier and diff checks passed. The new checks
characterize retained behavior; this presentation change makes no RED-fix claim.
No transaction requests were sent by the limit-editing journeys.

Low-profile self-review: the existing control looked like read-only information;
the local composition now exposes its editing purpose without a new container or
new workflow. This is human-review-required, not production adoption or proof of
execution-unit correctness. The user's preview remains on 3005; the isolated
3022 verification server stopped after the run. Earlier receipts retain their
original source and captures.
