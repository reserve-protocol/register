# Vote-lock migration UI (Erik's design, live)

Fixed point: `feat/index-dtf-v6` at `60138dbd3`. Design source: `codex/v6-votelock-unlock-relock-ui` (`981196255`, `docs/plans/vote-lock-migration-ui-handoff.md` there) — the designer's prototype is the target.

## Goal

A holder of a retired, RSR-backed per-DTF vote-lock moves it into the chain's shared vlRSR from Governance, Overview or Portfolio, through Erik's card + stepper (redeem → approve when needed → lock), on live reads, wallet and receipts, keeping their delegate.

## Current state

`src/views/index-dtf/components/vote-lock-migration/` has a DTF-scoped banner and a Timeline modal (redeem/approve/deposit) on live reads; it self-delegates, keeps progress only in component state, and has no Portfolio or disconnected surface.

## Non-goals

Non-RSR vote-locks; migrating positions of other accounts (Portfolio impersonation shows no action); a migration indexer.

## Decisions

- Delegation is preserved: standard = existing vlRSR delegate, else the old vault's `delegates(account)`, else self; optimistic = existing vlRSR optimistic delegate, else the standard one. When the account already delegates both on vlRSR, deposit plainly (`deposit`) so its delegation is untouched; otherwise `depositAndDelegate(amount, delegatee, optimisticDelegatee)`.
- Recovery: a per-viewer record (chain, old vault, account) in `localStorage` holds the redeem hash, received RSR and the delegate captured before redeeming, plus pending/complete hashes. The redeem receipt is re-read on load; storage alone never advances a step. Without a record, zero old shares shows nothing.
- Amount locked = min(received RSR, wallet RSR). Approval is exact and only when allowance is short.

## Acceptance evidence

- Unit: record parsing/keys, step derivation (incl. recovery and completion), delegate choice, eligibility from vault reads.
- Base fork lane (`optimistic-governance-upgrade.fork.spec.ts`): card on Governance/Overview, three steps executed, delegate preserved on vlRSR, reload mid-flow resumes at approve/lock, completion acknowledgment.
- Visual: card (affected, recovering, complete, disconnected), modal each step, Portfolio banner + row, mobile sheet.

## Test seams

Pure modules (`migration-record.ts`, `migration-state.ts`, delegate choice) under vitest; the Base fork lane for the real wallet/receipt path.

## Slices

- Slice 1 — generic migration core (eligibility by vault, record, steps, delegation) with tests; blocked by: none.
- Slice 2 — card + modal per Erik on Governance/Overview, disconnected prompt; blocked by: 1.
- Slice 3 — Portfolio banner + row action; blocked by: 1, 2.
- Slice 4 — fork lane update and evidence; blocked by: 2.

## Unresolved decisions

None blocking. Engineer review required (vote-lock writes, delegation).

## Status (2026-10-07)

Slices 1–4 implemented: shared module `src/components/vote-lock/migration/`, Governance/Overview/Portfolio mounts, Base fork lane green on a clean Anvil (Governance card replaces the vote-lock action, Portfolio banner + row, mobile sheet, redeem → reload → approve → lock, delegate preserved, completion acknowledgment, vote-lock action back after Done). Not covered on chain: a holder whose old-vault delegate is someone else (unit-tested) and a migration resumed in another browser (no record → nothing shown; the RSR stays in the wallet and the regular vote-lock action is available).
