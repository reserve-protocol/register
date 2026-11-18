import { encodeAbiParameters, encodeFunctionData, parseEther } from 'viem'
import RToken from '../../../../src/abis/RToken'
import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

const eusd = YIELD_REGISTRY.find((dtf) => dtf.symbol === 'eUSD')!
const availableCall = encodeFunctionData({
  abi: RToken,
  functionName: 'redemptionAvailable',
})
const capacityResponse = (amount: string) =>
  encodeAbiParameters([{ type: 'uint256' }], [parseEther(amount)])

test.use({ wallet: false })

test('zap explains the live redemption throttle, including replenishment @mobile', async ({
  harness,
}, testInfo) => {
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  harness.mock.ethCall(eusd.address, availableCall, capacityResponse('5000000'))
  await harness.gotoYield(eusd, 'issuance')
  await expect(harness.page.getByTestId('zap-redeem-tab')).toBeVisible({
    timeout: 15_000,
  })
  await harness.page.getByTestId('zap-redeem-tab').click()
  const input = harness.page.getByTestId('zap-amount-input')
  const warning = harness.page.getByTestId('zap-throttle-warning')
  await input.fill('5000000')
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
  await expect(warning).toHaveCount(0)

  await input.fill('5000001')
  await expect(warning).toBeVisible()
  await expect(warning).toContainText('5000000')
  expect(
    await warning.evaluate(
      (element) => element.scrollWidth <= element.clientWidth
    )
  ).toBe(true)
  await harness.page.screenshot({
    path: testInfo.outputPath('throttle-warning.png'),
    fullPage: true,
  })

  harness.mock.ethCall(eusd.address, availableCall, capacityResponse('5000001'))
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
  await expect(warning).toHaveCount(0)
  expect(harness.tx.log).toHaveLength(0)
})

test('zap warns on estimated Mint above issuance capacity @mobile', async ({
  harness,
}) => {
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  harness.mock.ethCall(
    eusd.address,
    encodeFunctionData({ abi: RToken, functionName: 'issuanceAvailable' }),
    capacityResponse('1')
  )
  await harness.gotoYield(eusd, 'issuance')
  const input = harness.page.getByTestId('zap-amount-input')
  await expect(input).toBeVisible({ timeout: 15_000 })
  await input.fill('1')
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
  await expect(harness.page.getByTestId('zap-throttle-warning')).toBeVisible()
  await input.fill('0')
  await expect(harness.page.getByTestId('zap-throttle-warning')).toHaveCount(0)
  expect(harness.tx.log).toHaveLength(0)
})
