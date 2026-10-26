import {
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  encodeFunctionResult,
  type Hex,
} from 'viem'
import Governance from '../../../../src/abis/Governance'
import RToken from '../../../../src/abis/RToken'
import RevenueRouter from '../../../../src/abis/RevenueRouter'
import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { loadSnapshot } from '../../../helpers/snapshots'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

const eusd = YIELD_REGISTRY.find((dtf) => dtf.symbol === 'eUSD')!
const replay = loadSnapshot<Record<string, Hex>>(
  `${eusd.snapshotDir}/rtoken-chain-state.json`
)
const currentMandate = decodeAbiParameters(
  [{ type: 'string' }],
  replay[`${eusd.address.toLowerCase()}:0x39b1b96d`]
)[0]
const proposedMandate = `${currentMandate}\nPreserve capital while earning sustainable yield.`

test.beforeEach(async ({ harness, overrides }) => {
  overrides.ethCall(
    '0xdfD0CF858afe6010C83238461C6d7142d1b5265d',
    encodeFunctionData({ abi: RevenueRouter, functionName: 'destinations' }),
    encodeFunctionResult({
      abi: RevenueRouter,
      functionName: 'destinations',
      result: [],
    })
  )
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
})

test('yield mandate proposal: edit, discard, validation and execution preview @mobile', async ({
  harness,
  overrides,
  boundaryRequests,
}, testInfo) => {
  const page = harness.page
  const governor = '0x96dc1c14d3d5e2ddaa52368adfe6e6b20b976832'
  const calldata = encodeFunctionData({
    abi: RToken,
    functionName: 'setMandate',
    args: [proposedMandate],
  })
  const proposal = encodeFunctionData({
    abi: Governance,
    functionName: 'propose',
    args: [[eusd.address as Hex], [0n], [calldata], ''],
  })
  overrides.ethCallRevert(
    governor,
    proposal,
    'Governor: proposer votes below proposal threshold'
  )
  await harness.gotoYield(eusd, 'governance/proposal')
  const mandate = page.locator('textarea[name="mandate"]')
  const prepare = page.getByTestId('yield-proposal-prepare')
  const preview = page.getByTestId('yield-proposal-parameters')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(mandate).toHaveValue(currentMandate)
  }).toPass()
  await expect(prepare).toBeDisabled()
  await expect(preview).toHaveCount(0)

  await mandate.fill(proposedMandate)
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(prepare).toBeEnabled()
  }).toPass()
  await preview.locator(':scope > div').first().click()
  await expect(preview).toContainText(currentMandate)
  await expect(preview).toContainText(proposedMandate)
  await preview.getByRole('button').click()
  await expect(mandate).toHaveValue(currentMandate)
  await expect(preview).toHaveCount(0)
  await expect(prepare).toBeDisabled()

  for (const invalid of ['', '   \n']) {
    await mandate.fill(invalid)
    await harness.chain.advance(4_000)
    await expect(prepare).toBeDisabled()
    expect(harness.tx.log).toHaveLength(0)
  }

  await mandate.fill(proposedMandate)
  await harness.chain.advance(4_000)
  await expect(prepare).toBeEnabled()
  await page
    .getByTestId('yield-proposal-mandate')
    .screenshot({ path: testInfo.outputPath('mandate-editor.png') })
  await prepare.click()
  await expect(
    page.getByText('setMandate(mandate_: string)', { exact: true })
  ).toBeVisible()
  await expect(page.getByText(proposedMandate, { exact: true })).toBeVisible()
  await expect(
    page
      .locator(`a[href="https://etherscan.io/address/${eusd.address}"]`)
      .last()
  ).toBeVisible()
  await expect(async () => {
    await harness.chain.advance(4_000)
    expect(
      boundaryRequests.some(
        (request) =>
          request.boundary === 'rpc' &&
          request.method === 'eth_call' &&
          JSON.stringify(request.params)
            .toLowerCase()
            .includes(proposal.toLowerCase())
      )
    ).toBe(true)
  }).toPass()
  await page.screenshot({
    path: testInfo.outputPath('mandate-confirmation.png'),
  })
  expect(harness.tx.log).toHaveLength(0)
})

test('yield mandate proposal: unsupported RToken version stays hidden @mobile', async ({
  harness,
  overrides,
}) => {
  overrides.ethCall(
    eusd.address,
    '0x54fd4d50',
    encodeAbiParameters([{ type: 'string' }], ['4.1.0'])
  )
  await harness.gotoYield(eusd, 'governance/proposal')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(
      harness.page.locator('input[name="tradingDelay"]')
    ).toHaveValue('0')
  }).toPass()
  await expect(harness.page.getByTestId('yield-proposal-mandate')).toHaveCount(
    0
  )
  await expect(
    harness.page.getByTestId('yield-proposal-prepare')
  ).toBeDisabled()
  await harness.page.locator('input[name="tradingDelay"]').fill('1')
  await harness.chain.advance(4_000)
  await expect(harness.page.getByTestId('yield-proposal-prepare')).toBeEnabled()
  expect(harness.tx.log).toHaveLength(0)
})
