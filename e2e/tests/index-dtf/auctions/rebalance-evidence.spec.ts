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

// Screenshot evidence for stage handoffs, never a CI gate: set E2E_EVIDENCE_DIR
// to capture the launcher's active rebalance detail on bsc/cmc20 (v5).
const evidenceDir = process.env.E2E_EVIDENCE_DIR
test.skip(!evidenceDir, 'E2E_EVIDENCE_DIR not set')

const dtf = REGISTRY.find((d) => d.slug === 'cmc20')!
test.use({ walletChain: 56 })

const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'

test('evidence: launcher sees the active cmc20 rebalance detail', async ({
  harness,
  overrides,
}, testInfo) => {
  const page = harness.page
  const latest = loadRebalances(dtf)[0]
  const { dtf: dtfObj } = loadSnapshot<{ dtf: { auctionLaunchers: string[] } }>(
    `${dtf.snapshotDir}/dtf.json`
  )

  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
  overrides.subgraph(
    { operationName: 'GetIndexDTF' },
    {
      dtf: {
        ...dtfObj,
        auctionLaunchers: [...dtfObj.auctionLaunchers, TEST_ADDRESS.toLowerCase()],
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
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(dtf, latest))

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, latest)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })

  const launch = page.getByTestId('auctions-launch-btn')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(launch).toBeVisible()
    await expect(launch).toBeEnabled()
  }).toPass({ timeout: 30_000 })

  const project = testInfo.project.name
  await page.screenshot({
    path: `${evidenceDir}/cmc20-active-detail-${project}.png`,
    fullPage: true,
  })

  await harness.goto(dtf, 'auctions')
  await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible({
    timeout: 20_000,
  })
  await harness.chain.advance(5_000)
  await page.screenshot({
    path: `${evidenceDir}/cmc20-list-${project}.png`,
    fullPage: true,
  })
})
