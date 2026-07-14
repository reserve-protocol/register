import { decodeFunctionData, parseAbi } from 'viem'
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Issuance manual mint write: seedManualIssuance sets MAX allowance (no approval
// step), so a connected wallet mints directly. Proves the write dimension on the
// issuance surface (tx.confirm + decoded mint calldata). Desktop (write timing).
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!
const MINT_ABI = parseAbi(['function mint(uint256 shares, address receiver, uint256 minSharesOut)'])

test('issuance manual: mint submits mint() to the folio @smoke', async ({ harness }) => {
  const page = harness.page
  harness.seedManualIssuance(base)
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'issuance/manual')
  await harness.wallet.connect()
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  await page.getByTestId('issuance-amount-input').first().fill('1')
  harness.tx.confirm()
  const submit = page.getByTestId('issuance-submit-btn').first()
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 10_000 }).toBeGreaterThan(0)
  const tx = harness.tx.last()!
  expect(tx.to).toBe(base.address.toLowerCase())
  expect(decodeFunctionData({ abi: MINT_ABI, data: tx.data as `0x${string}` }).functionName).toBe('mint')
})

const REDEEM_ABI = parseAbi([
  'function redeem(uint256 shares, address receiver, address[] assets, uint256[] minAmountsOut)',
])

test('issuance manual: redeem submits redeem() to the folio @smoke', async ({ harness }) => {
  const page = harness.page
  harness.seedManualIssuance(base)
  harness.seedBalance(base, '100') // 100 DTF shares to sell
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'issuance/manual')
  await harness.wallet.connect()
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  await page.getByTestId('issuance-mode-sell').first().click()
  await page.getByTestId('issuance-amount-input').first().fill('1')
  harness.tx.confirm()
  const submit = page.getByTestId('issuance-submit-btn').first()
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 10_000 }).toBeGreaterThan(0)
  const tx = harness.tx.last()!
  expect(tx.to).toBe(base.address.toLowerCase())
  expect(decodeFunctionData({ abi: REDEEM_ABI, data: tx.data as `0x${string}` }).functionName).toBe('redeem')
})

test('issuance manual: rejected mint leaves txLog empty and recovers @smoke', async ({
  harness,
}) => {
  const page = harness.page
  harness.seedManualIssuance(base)
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'issuance/manual')
  await harness.wallet.connect()
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  await page.getByTestId('issuance-amount-input').first().fill('1')
  harness.tx.decline() // user rejects the signature in the wallet
  const submit = page.getByTestId('issuance-submit-btn').first()
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()
  await harness.chain.advance(5_000)

  // Rejected → no transaction was sent, and the control recovers (re-enabled).
  expect(harness.tx.log).toHaveLength(0)
  await expect(submit).toBeEnabled({ timeout: 10_000 })
})
