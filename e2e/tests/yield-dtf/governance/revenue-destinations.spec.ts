import { encodeFunctionData, encodeFunctionResult, parseUnits } from 'viem'
import RevenueRouter from '../../../../src/abis/RevenueRouter'
import Governance from '../../../../src/abis/Governance'
import type { RevenueDestination } from '../../../../src/views/yield-dtf/governance/views/proposal/utils/revenue-router'
import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

const router = '0xdfD0CF858afe6010C83238461C6d7142d1b5265d'
const eusd = YIELD_REGISTRY.find((d) => d.symbol === 'eUSD')!
const holder = '0x00000000000000000000000000000000000000AA'
const recipient = '0x00000000000000000000000000000000000000bb'
const other = '0x00000000000000000000000000000000000000cc'
const current: RevenueDestination[] = [
  { holder, recipient, multiplier: parseUnits('1', 18) },
  { holder: other, recipient, multiplier: parseUnits('2', 18) },
]
const readData = encodeFunctionData({
  abi: RevenueRouter,
  functionName: 'destinations',
})
const result = (destinations: RevenueDestination[]) =>
  encodeFunctionResult({
    abi: RevenueRouter,
    functionName: 'destinations',
    result: destinations,
  })

test.beforeEach(async ({ harness, overrides }) => {
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  overrides.ethCall(router, readData, result([]))
})

test('eUSD destinations: live empty default, add, validation and discard @mobile', async ({
  harness,
}) => {
  await harness.gotoYield(eusd, 'governance/proposal')
  const page = harness.page
  const editor = page.getByTestId('yield-revenue-destinations')
  const prepare = page.getByTestId('yield-proposal-prepare')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(editor).toContainText('Currently configured: 0 / 100')
  }).toPass()
  await expect(prepare).toBeDisabled()
  await editor.getByTestId('destination-add').click()
  await editor.getByTestId('destination-holder').fill(holder)
  await editor.getByTestId('destination-recipient').fill(recipient)
  await expect(prepare).toBeEnabled()
  for (const invalid of [
    '0',
    '1.0000000000000000001',
    '79228162514.264337593543950336',
  ]) {
    await editor.getByTestId('destination-multiplier').fill(invalid)
    await expect(prepare).toBeDisabled()
  }
  await editor.getByTestId('destination-multiplier').fill('1.25')
  await expect(prepare).toBeEnabled()
  await editor
    .getByTestId('destination-holder')
    .fill('0xA0D69E286B938E21CBF7E51D71F6A4C8918F482E') // bad checksum
  await expect(editor.getByTestId('destination-holder')).toHaveAttribute(
    'aria-invalid',
    'true'
  )
  await expect(prepare).toBeDisabled()
  await editor.getByTestId('destination-holder').fill(holder)
  await expect(prepare).toBeEnabled()
  await editor.getByTestId('destination-add').click()
  await editor
    .getByTestId('destination-holder')
    .last()
    .fill(holder.toLowerCase())
  await editor.getByTestId('destination-recipient').last().fill(recipient)
  await expect(prepare).toBeDisabled() // duplicate holder, not recipient
  await expect(editor.getByTestId('destination-holder').last()).toHaveAttribute(
    'aria-invalid',
    'true'
  )
  await expect(
    editor.getByTestId('destination-recipient').last()
  ).toHaveAttribute('aria-invalid', 'false')
  await editor
    .getByTestId('yield-revenue-destination-row')
    .last()
    .getByRole('button')
    .click()
  await expect(prepare).toBeEnabled()
  await editor.getByTestId('destinations-discard').click()
  await expect(editor.getByTestId('yield-revenue-destination-row')).toHaveCount(
    0
  )
  await expect(prepare).toBeDisabled()
  expect(harness.tx.log).toHaveLength(0)
})

test('eUSD destinations: current list, combined delta, exact proposal calldata @mobile', async ({
  harness,
  overrides,
  boundaryRequests,
}, testInfo) => {
  overrides.ethCall(router, readData, result(current))
  const proposed = [{ ...current[0], multiplier: parseUnits('1.25', 18) }]
  const calls = [
    encodeFunctionData({
      abi: RevenueRouter,
      functionName: 'removeDestinations',
      args: [[holder, other]],
    }),
    encodeFunctionData({
      abi: RevenueRouter,
      functionName: 'addDestinations',
      args: [proposed],
    }),
  ]
  const proposal = encodeFunctionData({
    abi: Governance,
    functionName: 'propose',
    args: [[router, router], [0n, 0n], calls, ''],
  })
  overrides.ethCallRevert(
    '0x96dc1c14d3d5e2ddaa52368adfe6e6b20b976832',
    proposal,
    'Governor: proposer votes below proposal threshold'
  )
  await harness.gotoYield(eusd, 'governance/proposal')
  const page = harness.page
  const editor = page.getByTestId('yield-revenue-destinations')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(editor.getByTestId('destination-holder').first()).toHaveValue(
      holder
    )
  }).toPass()
  await expect(editor.getByTestId('destination-multiplier').last()).toHaveValue(
    '2'
  )
  await expect(page.getByTestId('yield-proposal-prepare')).toBeDisabled()
  await editor.getByTestId('destination-multiplier').first().fill('1.25')
  await editor
    .getByTestId('yield-revenue-destination-row')
    .last()
    .getByRole('button')
    .click()
  await expect(page.getByTestId('yield-proposal-prepare')).toBeEnabled()
  await editor.screenshot({
    path: testInfo.outputPath('revenue-destinations-editor.png'),
  })
  const bounds = await editor.evaluate((e) => ({
    width: e.clientWidth,
    content: e.scrollWidth,
  }))
  expect(bounds.content).toBeLessThanOrEqual(bounds.width)
  const preview = page.getByTestId('yield-revenue-destinations-preview')
  await preview.locator(':scope > div').first().click()
  await expect(preview).toContainText('1.25×')
  await page.getByTestId('yield-proposal-prepare').click()
  await expect(
    page.getByText('removeDestinations(holders: address[])', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('addDestinations(dests: tuple[])', { exact: true })
  ).toBeVisible()
  await expect(
    page.locator(`a[href="https://etherscan.io/address/${router}"]`).last()
  ).toBeVisible()
  await expect(async () => {
    await harness.chain.advance(4_000)
    expect(
      boundaryRequests.some(
        (r) =>
          r.boundary === 'rpc' &&
          r.method === 'eth_call' &&
          JSON.stringify(r.params)
            .toLowerCase()
            .includes(proposal.toLowerCase())
      )
    ).toBe(true)
  }).toPass()
  await page.screenshot({
    path: testInfo.outputPath('revenue-destinations-confirmation.png'),
  })
  expect(harness.tx.log).toHaveLength(0)
})

test('eUSD destinations: remove-only uses removeDestinations without addDestinations @mobile', async ({
  harness,
  overrides,
}) => {
  overrides.ethCall(router, readData, result(current))
  const calls = [
    encodeFunctionData({
      abi: RevenueRouter,
      functionName: 'removeDestinations',
      args: [[holder, other]],
    }),
  ]
  const proposal = encodeFunctionData({
    abi: Governance,
    functionName: 'propose',
    args: [[router], [0n], calls, ''],
  })
  overrides.ethCallRevert(
    '0x96dc1c14d3d5e2ddaa52368adfe6e6b20b976832',
    proposal,
    'Governor: proposer votes below proposal threshold'
  )
  await harness.gotoYield(eusd, 'governance/proposal')
  const editor = harness.page.getByTestId('yield-revenue-destinations')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(
      editor.getByTestId('yield-revenue-destination-row')
    ).toHaveCount(2)
  }).toPass()
  await editor
    .getByTestId('yield-revenue-destination-row')
    .last()
    .getByRole('button')
    .click()
  await editor
    .getByTestId('yield-revenue-destination-row')
    .last()
    .getByRole('button')
    .click()
  await expect(editor).toContainText('cannot forward revenue')
  await harness.page.getByTestId('yield-proposal-prepare').click()
  await expect(
    harness.page.getByText('removeDestinations(holders: address[])', {
      exact: true,
    })
  ).toBeVisible()
  await expect(
    harness.page.getByText('addDestinations(dests: tuple[])', { exact: true })
  ).toHaveCount(0)
  expect(harness.tx.log).toHaveLength(0)
})

test('eUSD destinations: a failed read hides the editor without blocking unrelated proposals', async ({
  harness,
  overrides,
}) => {
  overrides.ethCall(router, readData, '0x')
  await harness.gotoYield(eusd, 'governance/proposal')
  const page = harness.page
  const editor = page.getByTestId('yield-revenue-destinations')
  await expect(async () => {
    await harness.chain.advance(10_000)
    await expect(editor).toContainText('Unable to load current destinations')
  }).toPass()
  await expect(editor.getByTestId('destination-add')).toHaveCount(0)
  await page.locator('input[name="tradingDelay"]').fill('1')
  await harness.chain.advance(4_000)
  await expect(page.getByTestId('yield-proposal-prepare')).toBeEnabled()
  expect(harness.tx.log).toHaveLength(0)
})
