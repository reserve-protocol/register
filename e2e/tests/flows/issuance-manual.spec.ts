import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  maxUint256,
  parseAbi,
  parseEther,
  type Address,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import type { BoundaryRequest } from '../../helpers/requests'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Manual issuance (mint/redeem) write flows on base/lcap. Mirrors the
// governance-vote reference: frozen clock + pumps, mock wallet, per-test
// overrides staged BEFORE the action that triggers the refetch.
//
// Block ticking (approve → mint + post-tx balance transitions become observable)
// and unique per-tx hashes now come from the SHARED mock (helpers/rpc.ts ticks
// eth_blockNumber; helpers/provider.ts issues a unique hash per send), so this
// spec no longer needs the local RPC/init-script workarounds it used to carry.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
// Base INDEX_DEPLOYER_ADDRESS; useIsUSDT probes approve(deployer, 1).
const INDEX_DEPLOYER = '0x3451fD177E9a8bB4Eb8271E627A804BD22A816F9'
const DTF = findDtfByAddress(DTF_ADDRESS)!

// Selectors driven by this spec (beyond what the shared mock seeds).
const APPROVE = '0x095ea7b3' // approve(address,uint256) — useIsUSDT simulate probe

// Minimal ABIs for decoding the submitted approve/mint payloads.
const ERC20_APPROVE_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const FOLIO_MINT_ABI = parseAbi([
  'function mint(uint256 shares, address receiver, uint256 minSharesOut)',
])
const FOLIO_REDEEM_ABI = parseAbi([
  'function redeem(uint256 shares, address receiver, address[] assets, uint256[] minAmountsOut)',
])
const ISSUANCE_READ_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function toAssets(uint256 shares, uint8 rounding) view returns (address[], uint256[])',
])

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
    encodeFunctionData({
      abi: ISSUANCE_READ_ABI,
      functionName: 'toAssets',
      args: [10n ** 18n, 0],
    }),
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
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'balanceOf',
        args: [TEST_ADDRESS],
      }),
      encUint(opts.balancePerToken(rate))
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'allowance',
        args: [TEST_ADDRESS, DTF_ADDRESS],
      }),
      encUint(opts.allowance)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'approve',
        args: [INDEX_DEPLOYER, 1n],
      }),
      encBool(true)
    )
  }
}

async function settleDtfIdentity(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await advanceTime(page, 5_000) // flush route identity and enable GetIndexDTF
  await expect
    .poll(() =>
      boundaryRequests.some(
        (request) =>
          request.boundary === 'subgraph' &&
          request.operationName === 'GetIndexDTF'
      )
    )
    .toBe(true)
  await advanceTime(page, 5_000) // flush the DTF response into the issuance route
}

test('switch from the swap panel to manual mint', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
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
  await settleDtfIdentity(page, boundaryRequests)

  await expect(page.getByTestId('dtf-issuance')).toBeVisible()

  // The switch link lives under the swap panel and routes to /issuance/manual.
  await page.getByTestId('issuance-mode-switch').click()

  // Pump — flush the manual page's initial queries (toAssets quote) so the
  // input box renders with live atoms.
  await advanceTime(page, 5_000)

  await expect(page).toHaveURL(/\/issuance\/manual$/)
  await expect(page.getByTestId('issuance-mode-buy')).toBeVisible()
  await expect(page.getByTestId('issuance-amount-input')).toBeVisible()
})

test('mint: approve all basket tokens, then mint through the full tx flow', async ({
  page,
  overrides,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  // Wallet holds ~2000 shares' worth of every basket token, nothing approved yet.
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 2000n,
    allowance: 0n,
  })

  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)

  // Pump — flush react-query: connected-account reads (balances, allowances,
  // toAssets) resolve but only reach React once the clock advances.
  await advanceTime(page, 5_000)

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
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'allowance',
        args: [TEST_ADDRESS, DTF_ADDRESS],
      }),
      encUint(maxUint256)
    )
  }

  await approveAll.click()

  // Pump — receipt polling: each batched approval waits on
  // waitForTransactionReceipt, whose polling interval never elapses under the
  // frozen clock.
  await advanceTime(page, 10_000)
  // Pump — block poll + allowance refetch: blockAtom ticks (spec-owned route),
  // useWatchReadContracts refetches allowances against the staged overrides.
  await advanceTime(page, 10_000)

  // All approvals landed: the slot flips from Approve All to the Mint button.
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeVisible()
  await expect(submit).toBeEnabled()

  await submit.click()

  // Pump — receipt polling for the mint tx: pending → confirming → success.
  await advanceTime(page, 10_000)
  // Pump — success effects: the success handler resets the amount (the sonner
  // toast also fires, but its 4s auto-dismiss elapses inside these pumps, so
  // the persistent reset is the reliable success signal).
  await advanceTime(page, 5_000)

  await expect(page.getByTestId('issuance-amount-input')).toHaveValue('')

  // Payload assertions: one approve tx per basket token then the mint. Every
  // approve targets a basket token and grants the FOLIO as spender; the mint
  // targets the folio itself. Proves the write calldata (not just the UI flow).
  const folio = DTF_ADDRESS.toLowerCase()
  const basketAddrs = new Set(rates.map((r) => r.address.toLowerCase()))
  const approves = txLog.filter((t) => t.data.startsWith(APPROVE))
  expect(approves.length).toBe(rates.length)
  for (const tx of approves) {
    expect(tx.chainId).toBe(DTF.chainId)
    expect(basketAddrs.has(tx.to)).toBe(true)
    const { args } = decodeFunctionData({ abi: ERC20_APPROVE_ABI, data: tx.data as Hex })
    expect((args[0] as string).toLowerCase()).toBe(folio)
    expect(args[1]).toBe(maxUint256)
    expect(BigInt(tx.value)).toBe(0n)
  }
  const mint = txLog.find((t) => t.to === folio && !t.data.startsWith(APPROVE))
  expect(mint).toBeDefined()
  expect(txLog).toHaveLength(rates.length + 1)
  expect(mint!.chainId).toBe(DTF.chainId)
  expect(BigInt(mint!.value)).toBe(0n)
  const { functionName, args } = decodeFunctionData({
    abi: FOLIO_MINT_ABI,
    data: mint!.data as Hex,
  })
  expect(functionName).toBe('mint')
  expect(args[0]).toBe(parseEther('1'))
  expect(args[1].toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())
  expect(args[2]).toBeGreaterThan(0n)
  expect(args[2]).toBeLessThan(args[0])
})

test('redeem: sell DTF shares through the full tx flow', async ({
  page,
  overrides,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, {
    balancePerToken: () => 0n,
    allowance: 0n,
  })
  // The wallet holds exactly 100 DTF shares.
  const dtfBalanceCall = encodeFunctionData({
    abi: ISSUANCE_READ_ABI,
    functionName: 'balanceOf',
    args: [TEST_ADDRESS],
  })
  overrides.ethCall(DTF_ADDRESS, dtfBalanceCall, encUint(100n * 10n ** 18n))

  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)

  // Pump — flush react-query: balance/allowance/toAssets reads reach React.
  await advanceTime(page, 5_000)

  await page.getByTestId('issuance-mode-sell').click()

  // Pump — mode switch re-derives atoms from already-fetched maps; one pump
  // flushes any straggling query notifications.
  await advanceTime(page, 2_000)

  // Redeem max = the wallet's DTF balance.
  const maxAmount = page.getByTestId('issuance-max-amount')
  await expect(maxAmount).toHaveText('100.00')

  await page.getByTestId('issuance-amount-input').fill('1')

  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()

  // Stage the post-redeem balance BEFORE submitting: after the receipt lands
  // and a block ticks, the updater refetches and the Max readout must show the
  // reduced holding.
  overrides.ethCall(DTF_ADDRESS, dtfBalanceCall, encUint(99n * 10n ** 18n))

  await submit.click()

  // Pump — receipt polling: pending → confirming → success for the redeem tx.
  await advanceTime(page, 10_000)
  // Pump — success effects (toast + amount reset) and the block-driven balance
  // refetch that picks up the staged 99-share balance.
  await advanceTime(page, 10_000)

  await expect(page.getByTestId('issuance-amount-input')).toHaveValue('')

  // Post-tx state change observed by the user: Max dropped from 100 to 99.
  await expect(maxAmount).toHaveText('99.00')

  expect(txLog).toHaveLength(1)
  const redeem = txLog[0]
  expect(redeem.chainId).toBe(DTF.chainId)
  expect(redeem.to).toBe(DTF_ADDRESS.toLowerCase())
  expect(BigInt(redeem.value)).toBe(0n)
  const decoded = decodeFunctionData({
    abi: FOLIO_REDEEM_ABI,
    data: redeem.data as Hex,
  })
  expect(decoded.functionName).toBe('redeem')
  expect(decoded.args[0]).toBe(parseEther('1'))
  expect(decoded.args[1].toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())
  expect(decoded.args[2].map((address) => address.toLowerCase())).toEqual(
    rates.map((rate) => rate.address.toLowerCase())
  )
  expect(decoded.args[3]).toEqual(rates.map((rate) => (rate.rate * 95n) / 100n))
})
