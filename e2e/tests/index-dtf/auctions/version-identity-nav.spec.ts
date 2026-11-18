import { encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { expect, test } from '../../../harness'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { rebalanceTime } from '../../../helpers/clock'
import { loadSnapshot } from '../../../helpers/snapshots'
import {
  encodeActiveRebalance,
  loadRebalances,
  proposalIdFor,
} from '../../../helpers/rebalance-tuple'

// Version identity across SPA navigation: A(v5) → B(v5) → back to A. The
// route reset clears indexDTFVersionAtom; A's cached version string is
// unchanged, so a writer keyed only on the string would never restore it and
// every version-gated surface (here: the launch button) would stay pending.
const cmc20 = REGISTRY.find((d) => d.slug === 'cmc20')!
const photon = REGISTRY.find((d) => d.slug === 'photon')!

test.use({ walletChain: 56 })

const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'

interface DtfSnapshot {
  dtf: { auctionLaunchers: string[]; token: { symbol: string } }
}

test('auctions: the launch button recovers after A→B→A navigation with a cached same-version DTF', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  const latest = loadRebalances(cmc20)[0]
  const cmc20Snap = loadSnapshot<DtfSnapshot>(`${cmc20.snapshotDir}/dtf.json`)
  const photonSymbol = loadSnapshot<DtfSnapshot>(`${photon.snapshotDir}/dtf.json`)
    .dtf.token.symbol

  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
  overrides.subgraph(
    { operationName: 'GetIndexDTF', variables: { id: cmc20.address.toLowerCase() } },
    {
      dtf: {
        ...cmc20Snap.dtf,
        auctionLaunchers: [
          ...cmc20Snap.dtf.auctionLaunchers,
          TEST_ADDRESS.toLowerCase(),
        ],
      },
    }
  )
  overrides.api({ pathname: '/zapper/tokens' }, [])
  overrides.api(
    { method: 'POST', pathname: '/rebalance/liquidity' },
    { market: null, totals: { sellUsd: 0, buyUsd: 0 }, assets: [] }
  )
  overrides.ethCall(
    BSC_USDT,
    encodeFunctionData({
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )
  overrides.ethCall(cmc20.address, '0xaa3b5568', encodeActiveRebalance(cmc20, latest))

  const expectLaunchEnabled = async () => {
    const launch = page.getByTestId('auctions-launch-btn')
    await expect(async () => {
      await harness.chain.advance(5_000)
      await expect(launch).toBeVisible()
      await expect(launch).toBeEnabled()
    }).toPass({ timeout: 30_000 })
  }

  await harness.goto(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, latest)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await expectLaunchEnabled()

  // Direct DTF→DTF navigation through the command menu keeps the DTF container
  // mounted (discover in between would remount it and hide the bug). The menu
  // preserves the current section, so both hops land on the auctions list.
  const goToViaCommandMenu = async (symbol: string) => {
    await page.keyboard.press('Control+k')
    const input = page.locator('[cmdk-input]')
    await expect(input).toBeVisible()
    await input.fill(symbol)
    await page.locator('[cmdk-item]').filter({ hasText: symbol }).first().click()
    await expect(async () => {
      await harness.chain.advance(5_000)
      await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible()
    }).toPass({ timeout: 30_000 })
  }

  await goToViaCommandMenu(photonSymbol)
  await goToViaCommandMenu(cmc20Snap.dtf.token.symbol)

  const activeItem = page.getByTestId('auctions-active-item').first()
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(activeItem).toBeVisible()
  }).toPass({ timeout: 30_000 })
  await activeItem.click()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await expectLaunchEnabled()
})
