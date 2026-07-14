import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  maxUint256,
  parseAbi,
  type Address,
  type Hex,
} from 'viem'
import type { Page } from '@playwright/test'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import type { TxRecord } from '../../helpers/provider'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// FAILURE paths for manual issuance (mint / redeem) on base/lcap. Sibling of
// issuance-manual (success). Reject = wallet throws before recording; revert =
// tx mined with receipt.status 0x0. See failures-governance for the shared
// mock-wallet contract and the systemic success-on-revert FINDING.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const INDEX_DEPLOYER = '0x3451fD177E9a8bB4Eb8271E627A804BD22A816F9'
const DTF = findDtfByAddress(DTF_ADDRESS)!
const SYMBOL = '0x95d89b41'

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

const encUint = (v: bigint): Hex => encodeAbiParameters([{ type: 'uint256' }], [v])
const encBool = (v: boolean): Hex => encodeAbiParameters([{ type: 'bool' }], [v])
const encString = (v: string): Hex => encodeAbiParameters([{ type: 'string' }], [v])

function basketRates() {
  const state = loadSnapshot<ChainState>(`${DTF.snapshotDir}/chain-state.json`)
  const supply = BigInt(state.totalSupply)
  return state.totalAssets.tokens.map((address, i) => ({
    address: address as Address,
    rate: (BigInt(state.totalAssets.amounts[i]) * 10n ** 18n) / supply,
  }))
}

function seedFolio(overrides: MockOverrides, rates: ReturnType<typeof basketRates>) {
  overrides.ethCall(
    DTF_ADDRESS,
    encodeFunctionData({ abi: ISSUANCE_READ_ABI, functionName: 'toAssets', args: [10n ** 18n, 0] }),
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [rates.map((r) => r.address), rates.map((r) => r.rate)]
    )
  )
  overrides.ethCall(DTF_ADDRESS, SYMBOL, encString('LCAP'))
}

function seedWalletState(
  overrides: MockOverrides,
  rates: ReturnType<typeof basketRates>,
  opts: { balancePerToken: (rate: bigint) => bigint; allowance: bigint }
) {
  for (const { address, rate } of rates) {
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: ISSUANCE_READ_ABI, functionName: 'balanceOf', args: [TEST_ADDRESS] }),
      encUint(opts.balancePerToken(rate))
    )
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: ISSUANCE_READ_ABI, functionName: 'allowance', args: [TEST_ADDRESS, DTF_ADDRESS] }),
      encUint(opts.allowance)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: ISSUANCE_READ_ABI, functionName: 'approve', args: [INDEX_DEPLOYER, 1n] }),
      encBool(true)
    )
  }
}

// Land a submitted send at its terminal receipt (pending poll -> receipt).
async function drainReceipt(page: Page, txLog: TxRecord[], index: number) {
  await expect.poll(() => txLog.length).toBeGreaterThan(index)
  await advanceTime(page, 10_000)
  await advanceTime(page, 10_000)
}

// Settle a reverted send: seed the revert-reason re-call viem issues against the
// reverted tx (to+data — unmocked otherwise, and the strict teardown would fail
// on it), then pump the receipt-poll cycles so the button leaves "Confirming…".
async function settleRevert(page: Page, overrides: MockOverrides, txLog: TxRecord[]) {
  await expect.poll(() => txLog.length).toBe(1)
  overrides.ethCall(txLog[0].to, txLog[0].data, ('0x' + '0'.repeat(64)) as Hex)
  for (let i = 0; i < 6; i++) await advanceTime(page, 5_000)
}

// Reach a mint page where the submit slot is the Mint button (allowances are
// already max, so no Approve-All step) with "1" entered.
async function openMintReady(page: Page, overrides: MockOverrides) {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 2000n,
    allowance: maxUint256,
  })
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)
  await advanceTime(page, 5_000)
  await expect(page.getByTestId('issuance-max-amount')).not.toHaveText('0')
  await page.getByTestId('issuance-amount-input').fill('1')
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  return submit
}

// Reach a redeem page (mode sell, 100 shares held) with "1" entered.
async function openRedeemReady(page: Page, overrides: MockOverrides) {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, { balancePerToken: () => 0n, allowance: 0n })
  overrides.ethCall(
    DTF_ADDRESS,
    encodeFunctionData({ abi: ISSUANCE_READ_ABI, functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    encUint(100n * 10n ** 18n)
  )
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)
  await advanceTime(page, 5_000)
  await page.getByTestId('issuance-mode-sell').click()
  await advanceTime(page, 2_000)
  await expect(page.getByTestId('issuance-max-amount')).toHaveText('100.00')
  await page.getByTestId('issuance-amount-input').fill('1')
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  return submit
}

// ---------------------------------------------------------------------------
// MINT
// ---------------------------------------------------------------------------

test('mint: user rejects the wallet request — error surfaced, input kept, retry mints', async ({
  page,
  overrides,
  txLog,
}) => {
  const submit = await openMintReady(page, overrides)
  const input = page.getByTestId('issuance-amount-input')

  overrides.transaction({ kind: 'reject' })
  await submit.click()
  await advanceTime(page, 5_000)

  // The wallet rejected: the sign error renders the destructive Alert (role,
  // not copy), nothing was recorded, and the amount is preserved for a retry.
  await expect(page.getByRole('alert')).toBeVisible()
  expect(txLog).toHaveLength(0)
  await expect(input).toHaveValue('1')
  await expect(submit).toBeEnabled()

  // Retry (queue empty -> default success) mints and clears the input.
  await submit.click()
  await drainReceipt(page, txLog, 0)
  await expect(input).toHaveValue('')
  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('success')
  const decoded = decodeFunctionData({ abi: FOLIO_MINT_ABI, data: txLog[0].data as Hex })
  expect(decoded.functionName).toBe('mint')
})

// A reverted mint must NOT be surfaced as success: no toast + reset (the amount
// input keeps its value), the destructive Alert shows, and the button recovers.
test('mint: reverted tx surfaces failure and keeps the form', async ({
  page,
  overrides,
  txLog,
}) => {
  const submit = await openMintReady(page, overrides)
  const input = page.getByTestId('issuance-amount-input')

  overrides.transaction({ kind: 'revert' })
  await submit.click()
  await settleRevert(page, overrides, txLog)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  // Not-cleared input is the reliable "did NOT succeed" signal (success resets it).
  await expect(input).toHaveValue('1')
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(submit).toBeEnabled()
})

// ---------------------------------------------------------------------------
// REDEEM
// ---------------------------------------------------------------------------

test('redeem: user rejects the wallet request — error surfaced, input kept, retry redeems', async ({
  page,
  overrides,
  txLog,
}) => {
  const submit = await openRedeemReady(page, overrides)
  const input = page.getByTestId('issuance-amount-input')

  overrides.transaction({ kind: 'reject' })
  await submit.click()
  await advanceTime(page, 5_000)

  await expect(page.getByRole('alert')).toBeVisible()
  expect(txLog).toHaveLength(0)
  await expect(input).toHaveValue('1')
  await expect(submit).toBeEnabled()

  await submit.click()
  await drainReceipt(page, txLog, 0)
  await expect(input).toHaveValue('')
  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('success')
  const decoded = decodeFunctionData({ abi: FOLIO_REDEEM_ABI, data: txLog[0].data as Hex })
  expect(decoded.functionName).toBe('redeem')
})

// A reverted redeem must NOT be surfaced as success (same contract as mint).
test('redeem: reverted tx surfaces failure and keeps the form', async ({
  page,
  overrides,
  txLog,
}) => {
  const submit = await openRedeemReady(page, overrides)
  const input = page.getByTestId('issuance-amount-input')

  overrides.transaction({ kind: 'revert' })
  await submit.click()
  await settleRevert(page, overrides, txLog)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  await expect(input).toHaveValue('1')
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(submit).toBeEnabled()
})
