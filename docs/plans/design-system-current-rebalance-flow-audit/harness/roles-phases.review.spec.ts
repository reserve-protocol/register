import { encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { expect, test } from '../../../../e2e/harness'
import { rebalanceTime } from '../../../../e2e/helpers/clock'
import { dtfPath, TEST_ADDRESS } from '../../../../e2e/helpers/registry'
import {
  BSC_USDT,
  cmc20,
  detailFills,
  encodeTuple,
  enrolLauncher,
  lcap,
  matched,
  proposalIdFor,
  windowed,
} from './fixtures'
import { clean, detailState, observations, settle, shot, tabTrail } from './review-helpers'

// Roles × phases on the cmc20 rebalance with a 24h restricted window (nonce 11)
// and the lcap zero-width window. Disconnected visitors use wallet:false;
// connected cases use the injected test wallet on the DTF's chain (or the
// wrong chain on purpose). Every write is intercepted; txLog is asserted.
const log = observations('roles-phases')

const seedUsdt = (mock: { ethCall: (a: string, c: string, r: `0x${string}`) => unknown }) =>
  mock.ethCall(
    BSC_USDT,
    encodeFunctionData({ abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )

async function openDetail(
  harness: import('../../../../e2e/harness').DtfHarness,
  requests: import('../../../../e2e/helpers/requests').BoundaryRequest[],
  at: number,
  options: { connect?: boolean; tuple?: `0x${string}` } = {}
) {
  const r = windowed(cmc20)
  detailFills(harness.mock)
  harness.mock.ethCall(cmc20.address, '0xaa3b5568', options.tuple ?? encodeTuple(cmc20, r))
  await harness.chain.freezeAt(at)
  await harness.page.setViewportSize({ width: 1400, height: 900 })
  await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}`))
  if (options.connect) await harness.wallet.connect()
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, requests)
  await expect(harness.page.getByTestId('auctions-rebalance-header')).toBeVisible({ timeout: 20_000 })
  await harness.chain.advance(5_000)
  return r
}

test.describe('disconnected visitor', () => {
  test.use({ wallet: false })

  test('restricted phase: countdown-only community control', async ({ harness, boundaryRequests }) => {
    const r = await openDetail(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'))
    const state = await detailState(harness.page)
    log.add('disconnected.restricted', state)
    expect(state.launch).toBeNull()
    expect(state.community).toBeNull()
    expect(state.permissionlessCountdown).toMatch(/Permissionless in:/)
    await harness.page.getByTestId('auctions-rebalance-header').scrollIntoViewIfNeeded()
    await shot(harness.page, 'roles-phases', 'disconnected-restricted-1400')
    log.add('disconnected.restricted.fixture', { nonce: r.nonce, restrictedUntil: r.restrictedUntil, availableUntil: r.availableUntil })
    expect(harness.tx.log).toHaveLength(0)
  })

  test('permissionless phase: enabled community button, clicked without a wallet', async ({ harness, boundaryRequests }) => {
    await openDetail(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'permissionless'))
    const before = await detailState(harness.page)
    log.add('disconnected.permissionless.before', before)
    expect(before.community).toEqual(expect.objectContaining({ disabled: false }))
    const button = harness.page.getByTestId('auctions-community-launch-btn')
    await button.click()
    await harness.chain.advance(2_000)
    const justAfter = await detailState(harness.page)
    await harness.chain.advance(20_000)
    const later = await detailState(harness.page)
    log.add('disconnected.permissionless.afterClick', {
      justAfter: { community: justAfter.community, toasts: justAfter.toasts },
      after22s: { community: later.community, toasts: later.toasts },
      txLog: harness.tx.log.length,
      connectPromptVisible: await harness.page.getByRole('button', { name: /Connect/i }).filter({ visible: true }).count(),
    })
    await shot(harness.page, 'roles-phases', 'disconnected-permissionless-after-click-1400')
    expect(harness.tx.log).toHaveLength(0)
  })

  test('lcap zero-width window: community launch not available', async ({ harness, boundaryRequests }) => {
    const latest = matched(lcap)[0]
    detailFills(harness.mock)
    harness.mock.ethCall(lcap.address, '0xaa3b5568', encodeTuple(lcap, latest))
    await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
    await harness.page.setViewportSize({ width: 1400, height: 900 })
    await harness.page.goto(dtfPath(lcap, `auctions/rebalance/${proposalIdFor(lcap, latest)}`))
    await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
    await settle(harness.page, boundaryRequests)
    await expect(harness.page.getByTestId('auctions-rebalance-header')).toBeVisible({ timeout: 20_000 })
    await harness.chain.advance(5_000)
    const state = await detailState(harness.page)
    log.add('disconnected.lcap.zeroWindow', state)
    expect(state.communityUnavailable).toBe(true)
    // The help control beside the message: keyboard reachable and readable.
    const help = harness.page.getByTestId('dtf-auctions').getByText('Community launch is not available').locator('xpath=..').locator('button')
    await help.focus()
    await harness.page.keyboard.press('Enter')
    log.add('disconnected.lcap.helpTooltip', clean(await harness.page.getByRole('tooltip').textContent().catch(() => '')))
    await shot(harness.page, 'roles-phases', 'disconnected-lcap-zero-window-1400')
  })
})

test.describe('connected non-launcher (cmc20 chain)', () => {
  test.use({ walletChain: 56 })

  test('restricted → permissionless crossing while mounted', async ({ harness, boundaryRequests }) => {
    const r = windowed(cmc20)
    seedUsdt(harness.mock)
    await openDetail(harness, boundaryRequests, Number(r.restrictedUntil) - 90, { connect: true })
    const before = await detailState(harness.page)
    log.add('nonLauncher.beforeCrossing', { countdown: before.permissionlessCountdown, community: before.community, launch: before.launch })
    await harness.chain.advance(120_000)
    await harness.chain.advance(2_000)
    const after = await detailState(harness.page)
    log.add('nonLauncher.afterCrossing', { countdown: after.permissionlessCountdown, community: after.community, headerPill: after.headerPill })
    expect(after.community).toEqual(expect.objectContaining({ disabled: false }))
    await shot(harness.page, 'roles-phases', 'non-launcher-after-crossing-1400')
    expect(harness.tx.log).toHaveLength(0)
  })

  test('permissionless launch rejected in the wallet', async ({ harness, boundaryRequests }) => {
    seedUsdt(harness.mock)
    await openDetail(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'permissionless'), { connect: true })
    const button = harness.page.getByTestId('auctions-community-launch-btn')
    await expect(button).toBeEnabled()
    harness.tx.decline()
    await button.click()
    await harness.chain.advance(3_000)
    const justAfter = await detailState(harness.page)
    await harness.chain.advance(20_000)
    const later = await detailState(harness.page)
    log.add('nonLauncher.rejected', {
      justAfter: { community: justAfter.community, toasts: justAfter.toasts },
      after23s: { community: later.community, toasts: later.toasts },
      txLog: harness.tx.log.length,
    })
    await shot(harness.page, 'roles-phases', 'non-launcher-rejected-1400')
    expect(harness.tx.log).toHaveLength(0)
  })
})

test.describe('launcher on the wrong network', () => {
  test.use({ walletChain: 8453 })

  test('cmc20 launcher connected on Base sees a switch-network control', async ({ harness, boundaryRequests }) => {
    enrolLauncher(harness.mock, cmc20, TEST_ADDRESS)
    await openDetail(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'), { connect: true })
    const state = await detailState(harness.page)
    const switchButton = harness.page.getByRole('button', { name: /Switch to/ })
    const switchRequests = boundaryRequests.filter((q) => q.boundary === 'rpc' && q.method === 'wallet_switchEthereumChain')
    log.add('launcher.wrongNetwork', {
      state: { launch: state.launch, community: state.community, round: state.round },
      switchButton: (await switchButton.count()) ? clean(await switchButton.first().textContent()) : null,
      switchButtonCount: await switchButton.count(),
      walletSwitchRequests: switchRequests.length,
      switchParams: switchRequests.slice(0, 2).map((q) => JSON.stringify(q.params)),
      note: 'The injected wallet was configured on Base (8453); the app requests wallet_switchEthereumChain on load and the mock wallet accepts, so the DTF-chain button renders. The decline path (Switch-network button) is source-inspected only.',
    })
    await shot(harness.page, 'roles-phases', 'launcher-wrong-network-1400')
    expect(harness.tx.log).toHaveLength(0)
  })
})

test.describe('launcher on the right network', () => {
  test.use({ walletChain: 56 })

  test('restricted phase: ready launch control, keyboard trail, help', async ({ harness, boundaryRequests }) => {
    enrolLauncher(harness.mock, cmc20, TEST_ADDRESS)
    seedUsdt(harness.mock)
    await openDetail(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'), { connect: true })
    const launch = harness.page.getByTestId('auctions-launch-btn')
    await expect(async () => {
      await harness.chain.advance(5_000)
      await expect(launch).toBeEnabled()
    }).toPass({ timeout: 30_000 })
    const state = await detailState(harness.page)
    log.add('launcher.restricted', state)
    log.add('launcher.restricted.tabTrail', await tabTrail(harness.page, 10, harness.page.getByTestId('auctions-rebalance-header').locator('a').first()))
    const hovers = harness.page.getByTestId('dtf-auctions').locator('h4:has-text("Selling:")').locator('xpath=..').locator('div').first()
    await hovers.hover()
    await harness.chain.advance(500)
    log.add('launcher.restricted.sellingHoverCard', clean(await harness.page.locator('[data-radix-popper-content-wrapper]').first().textContent().catch(() => '')).slice(0, 300))
    await shot(harness.page, 'roles-phases', 'launcher-restricted-selling-hover-1400')
    await harness.page.mouse.move(5, 5)
    expect(harness.tx.log).toHaveLength(0)
  })
})
