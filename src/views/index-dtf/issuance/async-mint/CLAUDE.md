# Async Mint / Redeem Wizard

> Local context only. The root router (`CLAUDE.md`/`AGENTS.md`) and `docs/wiki/project.md` remain authoritative — especially for tests, size limits, SDK boundaries, and engineer-review flags.

Wizard for minting and redeeming Index DTFs through the
`@reserve-protocol/async-zap-sdk` (CoWSwap under the hood). Reached at
`/issuance/automated`.

## Architecture

The SDK owns all quoting, order submission, signing and lifecycle. This module
is just UI + thin wiring. **No `@cowprotocol/*` imports here** — the SDK
encapsulates it.

```
index.tsx            → AsyncZapProvider + WizardRouter
async-zap-context.tsx→ single invocation of useFolioMintZap + useFolioRedeemZap,
                       active one shared via context (useAsyncZap)
atoms.ts             → UI state only (operation, amounts, slippage, toggle)
types.ts             → WizardStep
steps/               → configure-mint, quote-summary, success, gnosis-required
hooks/use-dust.ts    → leftover dust calc (balances before/after, USD valued)
hooks/use-price-impact.ts → per-leg price impact (CoW quote price vs Reserve
                       API reference price), signed: + favorable / − worse
```

## Flow

`gnosis-check → configure → quote-summary → success`

- `gnosis-check`: gated by `useAtomicBatch` (EIP-5792). Auto-skips when the
  wallet supports atomic batch.
- `configure`: tabs mint/redeem, amount input (USD for mint / DTF shares for
  redeem), "use my wallet balances" toggle.
- `quote-summary`: drives the **whole execution lifecycle in place** (there is no
  separate processing step). Shows the SDK `quote` (shares, budget used) plus a
  per-leg list driven by `legStates` (each leg loads individually — skeleton
  while `pending`/`idle`, final amounts + price impact on `success`). On submit
  it calls `execution.run()` *without navigating away*: the button becomes a
  loading button labelled by `execution.step`, and each leg row gains a status
  icon read from `execution.ordersByLegId[leg.id].phase` (spinner → check / X).
  On `execution.step === 'error'` (incl. a rejected signature) the screen stays
  put and shows the error inline with **Try again** (`execution.run()` — the SDK
  resumes from where it stopped) and **Start over** (`reset()` → configure). It
  advances to `success` only when `execution.step === 'complete'`.
- `success`: minted shares / received quote token + **leftover dust**.

## Context (`useAsyncZap`)

Both `useFolioMintZap` and `useFolioRedeemZap` are invoked once in
`AsyncZapProvider` (their `execution` is instance state, so they must be shared,
not called per-step). `enabled` is toggled by `operationAtom`. The active
result is exposed as `{ operation, quote, quoteQuery, legStates, execution }`
(`legStates` is the per-leg status array used for per-asset loading).

SDK params: `mode: 'maxInput'` + `inputAmount` for mint, `shares` for redeem;
`slippageBps`, `useExistingBalances`. The SDK resolves folio price internally
(no `folioPrice` param).

## Key SDK facts (see also the `async-zap-sdk` memory)

- **Mint uses SELL orders** (better liquidity), so swap outputs don't match
  basket proportions exactly → **leaves dust**. The SDK doesn't expose dust;
  `use-dust.ts` computes it by snapshotting balances before `run()`
  (`dustStartBalancesAtom`, captured in quote-summary) and diffing after
  completion, valued via the SDK's `fetchTokenPrices`.
- **No granular collateral selection** — only `useExistingBalances` (all-or-
  nothing). Approvals are `maxUint256`. The old per-token picker was removed.

## Tests

`npx vitest run src/views/index-dtf/issuance/async-mint` — atom tests only;
the SDK owns the previously-tested quoting/iteration logic.
