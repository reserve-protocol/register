import { decodeFunctionData, encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { test, expect } from '../../../harness'
import { YIELD_REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield staking UNSTAKE write (mainnet/eUSD). unstake() burns the wallet's own
// stRSR — no approval — so it's the cleanest yield write to prove the harness
// drives a wallet-connected yield flow over the record/replay map. The connected
// wallet's stRSR balance is a per-test seed (the replay map is wallet-agnostic).
const eusd = YIELD_REGISTRY.find((d) => d.symbol === 'eUSD')!

test.use({ walletChain: 1 })

const UNSTAKE_ABI = parseAbi(['function unstake(uint256 amount)'])
const BALANCE_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
])

test('yield staking: unstake submits unstake() to stRSR @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))

  // Seed the connected wallet's stRSR balance (eUSD stRSR) so the unstake amount
  // validates — the replay map is wallet-agnostic; per-test ethCall wins.
  const STRSR = '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8'
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: BALANCE_ABI, functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'uint256' }], [100n * 10n ** 18n])
  )
  // wagmi simulates unstake() before enabling the confirm button — StRSR.unstake
  // is void, so the simulation returns empty on success.
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: UNSTAKE_ABI, functionName: 'unstake', args: [10n ** 18n] }),
    '0x'
  )

  await harness.gotoYield(eusd, 'staking')
  await harness.wallet.connect()
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)

  await page.getByTestId('staking-tab-unstake').click()
  await page.getByTestId('unstake-amount-input').fill('1')
  for (let i = 0; i < 3; i++) await harness.chain.advance(4_000)

  const open = page.getByTestId('unstake-open-btn')
  await expect(open).toBeEnabled({ timeout: 15_000 })
  await open.click()

  // The modal mounts ConfirmUnstakeButton → useSimulateContract fires; pump the
  // frozen clock so the simulation resolves and isReady flips true.
  const confirm = page.getByTestId('unstake-confirm-btn')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(confirm).toBeEnabled()
  }).toPass({ timeout: 20_000 })
  harness.tx.confirm()
  await confirm.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBeGreaterThan(0)
  const sent = harness.tx.last()!
  const decoded = decodeFunctionData({
    abi: UNSTAKE_ABI,
    data: sent.data as `0x${string}`,
  })
  expect(decoded.functionName).toBe('unstake')
  expect(decoded.args[0]).toBe(10n ** 18n) // 1 stRSR
})
