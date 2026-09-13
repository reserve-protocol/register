import { decodeFunctionData, parseAbi } from 'viem'
import { expect, test } from '../../../../e2e/harness'
import { rebalanceTime } from '../../../../e2e/helpers/clock'
import { dtfPath, TEST_ADDRESS } from '../../../../e2e/helpers/registry'
import { detailFills, encodeTuple, enrolLauncher, lcap, matched, proposalIdFor } from './fixtures'
import { clean, detailState, observations, pumpUntil, settle, shot, tabTrail } from './review-helpers'

// Hybrid weight management on base/lcap (curated hybrid, zero-width window):
// launcher entry, editor, validation, save, return, subsequent launch, reload.
const log = observations('hybrid-weights')
const OPEN_AUCTION_ABI = parseAbi([
  'function openAuction(uint256 rebalanceNonce, address[] tokens, (uint256 low, uint256 spot, uint256 high)[] newWeights, (uint256 low, uint256 high)[] newPrices, (uint256 low, uint256 spot, uint256 high) newLimits)',
])

test.use({ walletChain: 8453 })

async function openLcap(
  harness: import('../../../../e2e/harness').DtfHarness,
  requests: import('../../../../e2e/helpers/requests').BoundaryRequest[],
  options: { launcher: boolean; connect?: boolean }
) {
  const latest = matched(lcap)[0]
  if (options.launcher) enrolLauncher(harness.mock, lcap, TEST_ADDRESS)
  detailFills(harness.mock)
  harness.mock.ethCall(lcap.address, '0xaa3b5568', encodeTuple(lcap, latest))
  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
  await harness.page.setViewportSize({ width: 1400, height: 900 })
  await harness.page.goto(dtfPath(lcap, `auctions/rebalance/${proposalIdFor(lcap, latest)}`))
  if (options.connect !== false) await harness.wallet.connect()
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, requests)
  await expect(harness.page.getByTestId('auctions-rebalance-header')).toBeVisible({ timeout: 20_000 })
  await harness.chain.advance(5_000)
  return latest
}

test('launcher: manage weights entry, editor, save, return, launch, reload', async ({ harness, boundaryRequests }) => {
  const latest = await openLcap(harness, boundaryRequests, { launcher: true })
  await pumpUntil(harness.page, async () => (await harness.page.getByText('Specify Exact Basket Weights').count()) > 0)
  const entry = await detailState(harness.page)
  log.add('launcher.entry', { manageWeightsCard: entry.manageWeightsCard, launch: entry.launch, overview: entry.overview, round: entry.round, error: entry.error })
  await shot(harness.page, 'hybrid-weights', 'launcher-manage-weights-card-1400')
  const manage = harness.page.getByRole('button', { name: 'Manage Weights' })
  await manage.click()
  await harness.chain.advance(2_000)
  const unavailable = harness.page.getByTestId('manage-weights-unavailable')
  const editorHeader = harness.page.getByText('Manage Basket Weights')
  await pumpUntil(harness.page, async () => (await unavailable.count()) > 0 || (await editorHeader.count()) > 0)
  if (await unavailable.count()) {
    log.add('launcher.editor', { unavailable: clean(await unavailable.textContent()) })
    await shot(harness.page, 'hybrid-weights', 'manage-weights-unavailable-1400')
    return
  }
  const editor = harness.page.getByTestId('dtf-auctions')
  const inputs = editor.locator('table input, [role="table"] input, input[type="text"], input[inputmode]')
  const save = editor.getByRole('button', { name: /Save Weights/ })
  log.add('launcher.editor', {
    header: clean(await editor.locator('span:has-text("Manage Basket Weights")').first().textContent()),
    hero: (await editor.getByText('Manage weights before proceeding').count()) > 0,
    rows: await editor.locator('tbody tr').count(),
    inputs: await inputs.count(),
    csvImport: (await editor.getByText(/CSV/i).count()) > 0,
    maxAuctionSize: clean(await editor.locator('button:has-text("auction size"), button:has-text("Auction size"), button:has-text("Max")').first().textContent().catch(() => '')),
    save: { text: clean(await save.textContent()), disabled: await save.isDisabled() },
    tabTrail: await tabTrail(harness.page, 8, editor.locator('button').first()),
  })
  await shot(harness.page, 'hybrid-weights', 'editor-initial-1400')
  // Back arrow discards without saving.
  await editor.locator('button').first().click()
  await harness.chain.advance(1_000)
  const afterBack = await detailState(harness.page)
  log.add('launcher.backWithoutSave', { manageWeightsCard: afterBack.manageWeightsCard, overview: afterBack.overview })
  await manage.click()
  await pumpUntil(harness.page, async () => (await editorHeader.count()) > 0)
  // Edit the first unit value, then save.
  const first = inputs.first()
  const original = await first.inputValue()
  await first.fill(String(Number(original || '0') * 1.1 || 1))
  await harness.chain.advance(500)
  const afterEdit = { save: clean(await save.textContent()), disabled: await save.isDisabled(), original, edited: await first.inputValue() }
  log.add('launcher.afterEdit', afterEdit)
  await shot(harness.page, 'hybrid-weights', 'editor-edited-1400')
  await save.click()
  await harness.chain.advance(2_000)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-launch-btn').count()) > 0)
  const saved = await detailState(harness.page)
  log.add('launcher.afterSave', { overview: saved.overview, launch: saved.launch, round: saved.round, actionOverview: saved.actionOverview, manageWeightsCard: saved.manageWeightsCard })
  await shot(harness.page, 'hybrid-weights', 'after-save-ready-1400')
  // Re-open through the overview shortcut, then return.
  const yes = harness.page.getByTestId('dtf-auctions').locator('button:has-text("Yes")')
  log.add('launcher.reopenShortcut', await yes.count())
  if (await yes.count()) {
    await yes.click()
    await pumpUntil(harness.page, async () => (await editorHeader.count()) > 0)
    log.add('launcher.reopened', { firstInput: await inputs.first().inputValue(), save: clean(await save.textContent()) })
    await editor.locator('button').first().click()
    await harness.chain.advance(1_000)
  }
  // Launch with the saved weights (intercepted).
  const launch = harness.page.getByTestId('auctions-launch-btn')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(launch).toBeEnabled()
  }).toPass({ timeout: 30_000 })
  harness.tx.confirm()
  await launch.click()
  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBe(1)
  const sent = harness.tx.last()!
  const decoded = decodeFunctionData({ abi: OPEN_AUCTION_ABI, data: sent.data as `0x${string}` })
  log.add('launcher.launchCalldata', { to: sent.to, functionName: decoded.functionName, nonce: String(decoded.args[0]), tokens: decoded.args[1].length, weights: decoded.args[2].length, expectedNonce: latest.nonce })
  expect(decoded.functionName).toBe('openAuction')
  // Reload: saved weights live in memory only.
  await harness.page.reload()
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, boundaryRequests)
  await pumpUntil(harness.page, async () => (await harness.page.getByText('Specify Exact Basket Weights').count()) > 0 || (await harness.page.getByTestId('auctions-launch-btn').count()) > 0)
  const reloaded = await detailState(harness.page)
  log.add('launcher.afterReload', { manageWeightsCard: reloaded.manageWeightsCard, overview: reloaded.overview, launch: reloaded.launch })
})

test.describe('non-launcher view of a hybrid DTF', () => {
  test.use({ wallet: false })
  test('weights saved indicator and community availability', async ({ harness, boundaryRequests }) => {
    await openLcap(harness, boundaryRequests, { launcher: false, connect: false })
    const state = await detailState(harness.page)
    log.add('nonLauncher', { overview: state.overview, communityUnavailable: state.communityUnavailable, manageWeightsCard: state.manageWeightsCard, launch: state.launch, community: state.community })
    await shot(harness.page, 'hybrid-weights', 'non-launcher-1400')
  })
})
