import { decodeFunctionData, encodeAbiParameters, parseAbi, parseEther } from 'viem'
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Settings write flow on the harness: distributeFees() is permissionless — any
// connected wallet can submit it. Proves the harness tx dimension end-to-end
// (wallet.connect + tx.confirm + decoded txLog). Desktop (@smoke) — write timing.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!
const DISTRIBUTE_ABI = parseAbi(['function distributeFees()'])
const GET_PENDING_FEE_SHARES = '0x834e630f'
const pendingShares = (amount: bigint) => encodeAbiParameters([{ type: 'uint256' }], [amount])

test('settings: any wallet submits distributeFees() @smoke', async ({ harness }) => {
  const page = harness.page
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'settings')
  await expect(page.getByTestId('dtf-settings')).toBeVisible({ timeout: 15_000 })
  await harness.wallet.connect()
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  harness.tx.confirm()
  const button = page.getByTestId('settings-distribute-btn')
  await expect(button).toBeEnabled({ timeout: 15_000 })
  await button.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 10_000 }).toBeGreaterThan(0)
  const tx = harness.tx.last()!
  expect(tx.to).toBe(base.address.toLowerCase())
  expect(BigInt(tx.value)).toBe(0n)
  expect(
    decodeFunctionData({ abi: DISTRIBUTE_ABI, data: tx.data as `0x${string}` }).functionName
  ).toBe('distributeFees')
})

test('settings: the pending amount reads again after distributeFees() succeeds', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  overrides.ethCall(base.address, GET_PENDING_FEE_SHARES, pendingShares(parseEther('2.5')))
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'settings')
  await expect(page.getByTestId('dtf-settings')).toBeVisible({ timeout: 15_000 })
  await harness.wallet.connect()
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  // The share amount alone: the USD figure next to it can read 0.00 too.
  const pending = page.getByTestId('settings-pending-fees-amount')
  await expect(pending).toHaveText(/^2\.50 \$/, { timeout: 15_000 })

  overrides.ethCall(base.address, GET_PENDING_FEE_SHARES, pendingShares(0n))
  harness.tx.confirm()
  const button = page.getByTestId('settings-distribute-btn')
  await expect(button).toBeEnabled({ timeout: 15_000 })
  await button.click()
  await expect.poll(() => harness.tx.log.length, { timeout: 10_000 }).toBeGreaterThan(0)
  await harness.chain.advance(10_000)
  await harness.chain.advance(5_000)

  await expect(pending).toHaveText(/^0\.00 \$/, { timeout: 15_000 })
})
