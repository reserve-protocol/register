# Follow-ups

The forward queue after the hardening × SDK-integration effort (history: git,
PRs #1053/#1054/#1055/#1063, SDK PR #27). Delete items as they land.

## Remaining to ship

1. `feature/hardening` → master PR. Everything upstream is done: SDK 0.5.0
   published and pinned exact, `link:` entries gone, clean install proven,
   master merged in, full gates green on the merge result (2026-07-23).
2. After merge: reserve-api PR #227 (strip stale server-side `votingState`) —
   hold until confirmed reserve-ai does not read `votingState`.

## Next slices (in rough order)

- **Portfolio SDK adoption (chk-4)**: extend SDK `AccountPortfolio` to the full
  6-field shape + validated partial-body mappers (SDK-side fixtures), migrate
  register's raw `use-portfolio`/`use-historical-portfolio`/
  `useIndexDTFTransactions` fetches to the hooks. Open: the staking-vault APY
  compute site (register only displays the API's `apy` — confirm where the
  guard belongs); frozen-redeem gate (SDK read vs register patch).
- **Status unification**: one sync catalog hook for BOTH product lines
  (`dtf-catalog` has `yieldDtfs` too); migrate the ~28 `useDTFStatus` consumers,
  delete the raw `/discover` fetch + `KNOWN_DEPRECATED` list.
- **`useDtfSdk` escapees** (register must be hooks-only): `use-vote-lock-refresh`,
  `use-recent-proposal-receipt`, `use-proposal-type-eligibility` — each likely
  wants an invalidate/prefetch-style react-sdk primitive.
- **Deploy-flow fee fabrication**: `src/hooks/use-platform-fee.ts` still
  fabricates `?? 50` and divides unguarded — same disease cured elsewhere.
- **Atom-mirror drawdown** (standing rule, migrate-on-touch): new consumers take
  react-sdk hooks, never atoms; per-migration recipe = pin behavior first, swap,
  zero assertion edits, break-the-wiring RED, smoke.
- **Repo-wide YieldDtf rename**: `LISTED_RTOKEN_ADDRESSES` + ~270 files
  mentioning rtoken (tokens-view identifiers already renamed). Mechanical chore
  PR; GraphQL field names stay (yield subgraph schema).
- **S7 a11y/hygiene + S8 error boundaries**: remaining planned waves.
- **Performance pass**: profile first; suspects — the `setKey` full-remount
  refresh in the DTF container, discover-list refetch patterns,
  `JSON.stringify` deps.

## Deferred to protocol-vNext

- **Auctions SDK migration**: the remaining raw `/rebalance` fetches in the
  auctions views move to SDK reads alongside the version's heavy rebalance
  testing. Reminder: hybrid stays a curated allowlist (see log 2026-07-21) —
  do not re-derive from weightControl.

- **Zap max provider-seam regression**: the unavailable-max path is covered at
  the compute (`computeMaxTokenIn` → null) and button seams; a ZapProvider-
  mounted test asserting Max resolves to 0 (not the wallet balance) would pin
  the context wiring too. Advisable, not blocking.

## Standing questions (product/engineer)

- `auctionLength` on-chain floor semantics.
- Fee-recipients proposal preview silently omits the section when the fee is
  unavailable (better than fabricating; explicit marker is optional polish).
- Async-mint wizard e2e (no testids, CoW lifecycle) — deliberate gap, revisit
  with the wizard's next iteration.

## Pre-existing hardening backlog (reconciled from the cross-reviews, 2026-07-22)

Restored owners/acceptance criteria after the plan-doc retirement.
Per-finding detail: `docs/claude-hardening-review.md` +
`docs/codex-hardening-review.md` — both are superseded historical audits
(final disposition noted at their top); this file and `docs/wiki/progress.md`
are the current state.
All are pre-existing (not introduced by the effort); each is an engineer-review
surface unless noted.

- **Deploy basket prices** — a missing/zero price becomes a $0 deposit and the
  allowance gate accepts it. Accept: unpriced asset → indeterminate, deploy
  write blocked, token-specific reason; tests for zero/missing/mixed baskets.
- **Deploy platform fee** — `use-platform-fee.ts` fabricates `?? 50` and divides
  unguarded. Accept: loading/unavailable/value tri-state, `denominator > 0`,
  dependent form/write blocked while unavailable.
- **USDT-like approvals** — three paths emit one `approve(spender, amount)` on a
  non-zero insufficient allowance (`use-batch-approval`, `transaction-modal`,
  `submit-zap`). Accept: shared zero-first sequencing helper + ordered-tx tests
  from a seeded non-zero allowance.
- **Sticky high-impact consent** — zap consent is a global atom not keyed to
  quote identity. Accept: re-consent required after any amount/token/tab/
  endpoint change; test proves it.
- **Stale-signer zap quote** — identity is debounced into the endpoint while the
  old result stays submittable. Accept: input changes invalidate the visible
  result immediately; quote identity matched at the write handler.
- **Frozen Yield redeem** — confirm gates omit `frozen`; a pre-frozen amount can
  persist. Accept: one predicate incl. frozen at input+button+handler; test a
  live valid→frozen transition.
- **Staking-vault APY** — `StakingVaultRevenue.tsx` divides unguarded and uses
  `|| 1` denominators. Accept: guarded math → undefined → unavailable render;
  pure vectors.
- **Async-mint compliance** — restriction is a pointer/opacity gate; the quote
  screen's handlers never read `isRestricted`. Accept: gate in the real action
  handlers/buttons; browser test incl. late restriction. (Compliance surface.)
- **Version identity** — `indexDTFVersionAtom` initializes '4.0.0' and never
  resets; ABI/calldata consumers can read a stale/fabricated version during
  nav. Accept: undefined/pending + identity-tied; every consumer gates.
- **Transport validation** — discover list, historical portfolio, transactions,
  asset prices still cast raw JSON (chk-4 absorbs portfolio; discover +
  asset-prices explicit here). Malformed portfolio proposal rows — including
  optimistic veto/snapshot fields and non-finite timestamps — are already
  dropped at the atom guard (unit + browser pinned); the mappers themselves
  remain unvalidated. Accept: validated mappers with a deliberate
  partial-body policy.
- **Manual redeem dust legs** — small redeems can emit zero `minAmountsOut`
  (live `test.fixme` repro). Accept: product picks floor-or-block; the fixme
  becomes an active test.
- **`deriveDtfStatus` production drift** — helper is tested but unused;
  the hook duplicates the fallback inline. Accept: production routes through
  the helper, or the test targets the real seam.
- **Active `test.fixme` owners (2)** — (1) Market-Cap data-type hero shows unit
  price (`e2e/tests/index-dtf/overview/edge-cases.spec.ts`); (2) manual redeem
  zero-protection dust leg (above,
  `e2e/tests/flows/issuance-manual-boundaries.spec.ts`). Each keeps its
  `test.fixme` + this entry as owner until fixed.
