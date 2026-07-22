# Follow-ups

The forward queue after the hardening × SDK-integration effort (history: git,
PRs #1053/#1054/#1055/#1063, SDK PR #27). Delete items as they land.

## Release boundary (blocks master)

1. Merge SDK PR #27 → publish via changesets (minor; all changesets written).
2. Pin published `@reserve-protocol/{sdk,react-sdk}` in register, drop the local
   `link:`, clean `pnpm install` — CI green for the first time.
3. Full gates against the pinned SDK (typecheck/unit/e2e; re-sync the e2e
   capture `GetIndexDTF` query if it changed — see [[sdk]] wiki).
4. `feature/hardening` → master PR.
5. After merge: reserve-api PR #227 (strip stale server-side `votingState`) —
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

## Standing questions (product/engineer)

- `auctionLength` on-chain floor semantics.
- Fee-recipients proposal preview silently omits the section when the fee is
  unavailable (better than fabricating; explicit marker is optional polish).
- Async-mint wizard e2e (no testids, CoW lifecycle) — deliberate gap, revisit
  with the wizard's next iteration.
