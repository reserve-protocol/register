import type { Page } from '@playwright/test'
import {
  encodeAbiParameters,
  maxUint256,
  type Address,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { freezeTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  chainIdForUrl,
  handleRpcMethod,
  RPC_HOST_PATTERNS,
  type RpcContext,
} from '../../helpers/rpc'
import { loadSnapshot } from '../../helpers/snapshots'

// Manual issuance (mint/redeem) write flows on base/lcap. Mirrors the
// governance-vote reference: frozen clock + pumps, mock wallet, per-test
// overrides staged BEFORE the action that triggers the refetch.
//
// One extra piece the mint flow needs that vote didn't: the manual updater
// refreshes balances/allowances only when blockAtom changes (useWatchReadContracts
// keys refetches off the block number), but the shared RPC mock serves a
// CONSTANT block. This spec registers its own RPC route (last-registered wins)
// that answers block-number methods with an incrementing counter and delegates
// everything else to the shared handleRpcMethod dispatch — so approve → mint
// and post-tx balance transitions become observable.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const DTF = findDtfByAddress(DTF_ADDRESS)!

// Selectors driven by this spec (beyond what the shared mock seeds).
const BALANCE_OF = '0x70a08231' // balanceOf(address)
const ALLOWANCE = '0xdd62ed3e' // allowance(address,address)
const APPROVE = '0x095ea7b3' // approve(address,uint256) — useIsUSDT simulate probe
const TO_ASSETS = '0xd17618bf' // toAssets(uint256,uint8) — manual updater's per-share quote

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

const SYMBOL = '0x95d89b41' // symbol() — read on the folio once a wallet connects

const encUint = (v: bigint): Hex => encodeAbiParameters([{ type: 'uint256' }], [v])
const encBool = (v: boolean): Hex => encodeAbiParameters([{ type: 'bool' }], [v])
const encString = (v: string): Hex => encodeAbiParameters([{ type: 'string' }], [v])

// Per-share basket rates derived from the captured chain state: how much of
// each basket token one DTF share requires (floor division, like toAssets).
function basketRates() {
  const state = loadSnapshot<ChainState>(`${DTF.snapshotDir}/chain-state.json`)
  const supply = BigInt(state.totalSupply)
  return state.totalAssets.tokens.map((address, i) => ({
    address: address as Address,
    rate: (BigInt(state.totalAssets.amounts[i]) * 10n ** 18n) / supply,
  }))
}

// toAssets(1e18, 0) → the exact (assets, amounts) quote the manual updater
// turns into required-per-share amounts. Also answers the folio's symbol(),
// which connected flows read but the shared chain-state seed doesn't cover.
function seedFolio(overrides: MockOverrides, rates: ReturnType<typeof basketRates>) {
  overrides.ethCall(
    DTF_ADDRESS,
    TO_ASSETS,
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [rates.map((r) => r.address), rates.map((r) => r.rate)]
    )
  )
  overrides.ethCall(DTF_ADDRESS, SYMBOL, encString('LCAP'))
}

// Seed wallet-facing reads for every basket token: balance, allowance and the
// approve-simulate probe (useIsUSDT runs approve(spender, 1) per token; a bool
// answer keeps it deterministic and off the unmocked log).
function seedWalletState(
  overrides: MockOverrides,
  rates: ReturnType<typeof basketRates>,
  opts: { balancePerToken: (rate: bigint) => bigint; allowance: bigint }
) {
  for (const { address, rate } of rates) {
    overrides.ethCall(address, BALANCE_OF, encUint(opts.balancePerToken(rate)))
    overrides.ethCall(address, ALLOWANCE, encUint(opts.allowance))
    overrides.ethCall(address, APPROVE, encBool(true))
  }
}

// Spec-owned RPC route: incrementing block numbers, everything else delegated
// to the shared dispatch (same overrides, same fail-loud logging).
async function installTickingBlocks(
  page: Page,
  overrides: MockOverrides,
  unmockedCalls: string[]
) {
  let block = 0x1000001
  const log = (message: string, detail?: Record<string, unknown>) => {
    unmockedCalls.push(`[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`)
  }

  const answer = (
    req: { id: number; method: string; params?: unknown[] },
    ctx: RpcContext
  ) => {
    if (req.method === 'eth_blockNumber') {
      block += 1
      return { jsonrpc: '2.0', id: req.id, result: '0x' + block.toString(16) }
    }
    if (req.method === 'eth_getBlockByNumber') {
      block += 1
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          number: '0x' + block.toString(16),
          hash: '0x' + '0'.repeat(64),
          timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
          baseFeePerGas: '0x3b9aca00',
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          transactions: [],
        },
      }
    }
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: handleRpcMethod(req.method, req.params, ctx),
    }
  }

  for (const pattern of RPC_HOST_PATTERNS) {
    await page.route(pattern, async (route) => {
      const request = route.request()
      if (request.method() !== 'POST') return route.fallback()
      let body: unknown
      try {
        body = request.postDataJSON()
      } catch {
        return route.fallback()
      }
      const ctx: RpcContext = { chainId: chainIdForUrl(request.url()), log, overrides }
      const payload = Array.isArray(body)
        ? (body as Array<{ id: number; method: string; params?: unknown[] }>).map((r) =>
            answer(r, ctx)
          )
        : answer(body as { id: number; method: string; params?: unknown[] }, ctx)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      })
    })
  }
}

// The provider fixture answers every eth_sendTransaction with the SAME fixed
// hash. viem dedupes waitForTransactionReceipt observers by hash, so a second
// tx re-using the hash of an already-settled one (mint after the approve batch)
// joins a dead observer and never resolves. Wrap the injected provider so each
// send returns a unique hash; the RPC receipt mock answers any hash.
async function installUniqueTxHashes(page: Page) {
  await page.addInitScript(() => {
    let n = 0
    const eth = (window as unknown as { ethereum?: { request: (r: unknown) => Promise<unknown> } })
      .ethereum
    if (!eth) return
    const orig = eth.request.bind(eth)
    eth.request = (req: unknown) => {
      if ((req as { method?: string })?.method === 'eth_sendTransaction') {
        n += 1
        return Promise.resolve('0x' + n.toString(16).padStart(64, '0'))
      }
      return orig(req)
    }
  })
}

test('switch from the swap panel to manual mint', async ({ page, overrides }) => {
  // The manual page probes every basket token (balances, allowances, the
  // useIsUSDT approve simulate) as soon as it mounts — seed them so this test
  // stays unmocked-clean even though it only asserts navigation.
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, { balancePerToken: () => 0n, allowance: 0n })

  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance'))

  // Pump — flush react-query so the SDK's index-dtf query reaches React and the
  // issuance panel (gated on indexDTF) mounts.
  await page.clock.runFor(5_000)

  await expect(page.getByTestId('dtf-issuance')).toBeVisible()

  // The switch link lives under the swap panel and routes to /issuance/manual.
  await page.getByTestId('issuance-mode-switch').click()

  // Pump — flush the manual page's initial queries (toAssets quote) so the
  // input box renders with live atoms.
  await page.clock.runFor(5_000)

  await expect(page).toHaveURL(/\/issuance\/manual$/)
  await expect(page.getByTestId('issuance-mode-buy')).toBeVisible()
  await expect(page.getByTestId('issuance-amount-input')).toBeVisible()
})

test('mint: approve all basket tokens, then mint through the full tx flow', async ({
  page,
  overrides,
  unmockedCalls,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  // Wallet holds ~2000 shares' worth of every basket token, nothing approved yet.
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 2000n,
    allowance: 0n,
  })
  await installTickingBlocks(page, overrides, unmockedCalls)
  await installUniqueTxHashes(page)

  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)

  // Pump — flush react-query: connected-account reads (balances, allowances,
  // toAssets) resolve but only reach React once the clock advances.
  await page.clock.runFor(5_000)

  // Balances landed: the Max readout reflects ~2000 mintable shares (not 0).
  const maxAmount = page.getByTestId('issuance-max-amount')
  await expect(maxAmount).not.toHaveText('0')

  await page.getByTestId('issuance-amount-input').fill('1')

  // With zero allowances the submit slot shows Approve All, not Mint.
  const approveAll = page.getByTestId('issuance-approve-all-btn')
  await expect(approveAll).toBeVisible()
  await expect(page.getByTestId('issuance-submit-btn')).toHaveCount(0)

  // Stage the post-approval allowances BEFORE acting: once the approvals
  // confirm and a new block ticks, the updater refetches allowances and reads
  // these (the standard post-tx overlay recipe).
  for (const { address } of rates) {
    overrides.ethCall(address, ALLOWANCE, encUint(maxUint256))
  }

  await approveAll.click()

  // Pump — receipt polling: each batched approval waits on
  // waitForTransactionReceipt, whose polling interval never elapses under the
  // frozen clock.
  await page.clock.runFor(10_000)
  // Pump — block poll + allowance refetch: blockAtom ticks (spec-owned route),
  // useWatchReadContracts refetches allowances against the staged overrides.
  await page.clock.runFor(10_000)

  // All approvals landed: the slot flips from Approve All to the Mint button.
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeVisible()
  await expect(submit).toBeEnabled()

  await submit.click()

  // Pump — receipt polling for the mint tx: pending → confirming → success.
  await page.clock.runFor(10_000)
  // Pump — success effects: the success handler resets the amount (the sonner
  // toast also fires, but its 4s auto-dismiss elapses inside these pumps, so
  // the persistent reset is the reliable success signal).
  await page.clock.runFor(5_000)

  await expect(page.getByTestId('issuance-amount-input')).toHaveValue('')
})

test('redeem: sell DTF shares through the full tx flow', async ({
  page,
  overrides,
  unmockedCalls,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, {
    balancePerToken: () => 0n,
    allowance: 0n,
  })
  // The wallet holds exactly 100 DTF shares.
  overrides.ethCall(DTF_ADDRESS, BALANCE_OF, encUint(100n * 10n ** 18n))
  await installTickingBlocks(page, overrides, unmockedCalls)
  await installUniqueTxHashes(page)

  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)

  // Pump — flush react-query: balance/allowance/toAssets reads reach React.
  await page.clock.runFor(5_000)

  await page.getByTestId('issuance-mode-sell').click()

  // Pump — mode switch re-derives atoms from already-fetched maps; one pump
  // flushes any straggling query notifications.
  await page.clock.runFor(2_000)

  // Redeem max = the wallet's DTF balance.
  const maxAmount = page.getByTestId('issuance-max-amount')
  await expect(maxAmount).toHaveText('100.00')

  await page.getByTestId('issuance-amount-input').fill('1')

  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()

  // Stage the post-redeem balance BEFORE submitting: after the receipt lands
  // and a block ticks, the updater refetches and the Max readout must show the
  // reduced holding.
  overrides.ethCall(DTF_ADDRESS, BALANCE_OF, encUint(99n * 10n ** 18n))

  await submit.click()

  // Pump — receipt polling: pending → confirming → success for the redeem tx.
  await page.clock.runFor(10_000)
  // Pump — success effects (toast + amount reset) and the block-driven balance
  // refetch that picks up the staged 99-share balance.
  await page.clock.runFor(10_000)

  await expect(page.getByTestId('issuance-amount-input')).toHaveValue('')

  // Post-tx state change observed by the user: Max dropped from 100 to 99.
  await expect(maxAmount).toHaveText('99.00')
})
