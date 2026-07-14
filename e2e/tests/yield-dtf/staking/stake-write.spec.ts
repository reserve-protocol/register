import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  maxUint256,
  parseAbi,
} from 'viem'
import { test, expect } from '../../../harness'
import { YIELD_REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield staking STAKE write (mainnet/eUSD). Reuses the connected-wallet-yield
// mock layer built for unstake, plus: RSR balance (validates the amount), MAX RSR
// allowance (so the confirm button skips the approve step and goes straight to
// stake), and the stake() simulation. Stake is the DEFAULT tab — no tab switch.
const eusd = YIELD_REGISTRY.find((d) => d.symbol === 'eUSD')!

test.use({ walletChain: 1 })

const RSR = '0x320623b8E4fF03373931769A31Fc52A4E78B5d70' // mainnet RSR
const STRSR = '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8' // eUSD stRSR
const STAKE_ABI = parseAbi(['function stake(uint256 amount)'])
const STAKE_AND_DELEGATE_ABI = parseAbi([
  'function stakeAndDelegate(uint256 amount, address delegate)',
])
const ERC20 = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256)',
])
const DELEGATES_ABI = parseAbi(['function delegates(address) view returns (address)'])
const uint = (v: bigint) => encodeAbiParameters([{ type: 'uint256' }], [v])

test('yield staking: stake submits stake() to stRSR @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))

  // Wallet holds RSR and has already approved stRSR (MAX) → the confirm button
  // skips the approve step. Both seeds win over the silent-zero default.
  overrides.ethCall(
    RSR,
    encodeFunctionData({ abi: ERC20, functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    uint(1_000n * 10n ** 18n)
  )
  overrides.ethCall(
    RSR,
    encodeFunctionData({ abi: ERC20, functionName: 'allowance', args: [TEST_ADDRESS, STRSR] }),
    uint(maxUint256)
  )
  // Self-delegate: delegates(account) == account → the app uses plain stake()
  // (not stakeAndDelegate), matching the simulation we seed below.
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: DELEGATES_ABI, functionName: 'delegates', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'address' }], [TEST_ADDRESS])
  )
  // useApproveAndExecute prepares the approve() simulation even when allowance is
  // already sufficient — answer it (approve returns bool true).
  overrides.ethCall(
    RSR,
    encodeFunctionData({ abi: ERC20, functionName: 'approve', args: [STRSR, 10n ** 18n] }),
    encodeAbiParameters([{ type: 'bool' }], [true])
  )
  // wagmi simulates stake() before enabling the confirm button (void success).
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: STAKE_ABI, functionName: 'stake', args: [10n ** 18n] }),
    '0x'
  )

  await harness.gotoYield(eusd, 'staking')
  await harness.wallet.connect()
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)

  // Stake tab is the default — fill the amount directly.
  await page.getByTestId('stake-amount-input').fill('1')
  for (let i = 0; i < 3; i++) await harness.chain.advance(4_000)

  const open = page.getByTestId('stake-open-btn')
  await expect(open).toBeEnabled({ timeout: 15_000 })
  await open.click()

  const confirm = page.getByTestId('stake-confirm-btn')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(confirm).toBeEnabled()
  }).toPass({ timeout: 20_000 })
  harness.tx.confirm()
  await confirm.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBeGreaterThan(0)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(STRSR.toLowerCase())
  // Delegate defaults to the connected account (== currentDelegate) so the app
  // uses stake(); accept stakeAndDelegate() too in case the delegate read differs.
  const decoded = decodeFunctionData({
    abi: [...STAKE_ABI, ...STAKE_AND_DELEGATE_ABI],
    data: sent.data as `0x${string}`,
  })
  expect(['stake', 'stakeAndDelegate']).toContain(decoded.functionName)
  expect(decoded.args[0]).toBe(10n ** 18n) // 1 RSR
})
