import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime, rebalanceTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import type { BoundaryRequest } from '../../helpers/requests'

// MULTICHAIN auctions coverage. The existing auctions specs pin base/lcap (v5);
// this one runs the historical/active bucketing recipe against the two chains
// nobody else covers:
//   - bsc/cmc20 (v5, chainId 56)
//   - mainnet/open (v4, chainId 1) — the suite's only v4 rebalance path.
// The rebalance LIST buckets purely on the subgraph history (rebalances.json)
// vs the frozen clock; live getRebalance() stays idle (the shared rpc `*:` entry
// answers idle for any registry DTF). The list only renders rebalances whose
// blockNumber matches a proposal executionBlock, so expected counts are derived
// from the snapshots, never hardcoded.

interface Rebalance {
  nonce: string
  restrictedUntil: string
  availableUntil: string
  blockNumber: string
  timestamp: string
}
interface RebalancesSnapshot {
  rebalances: Rebalance[]
}
interface GovernanceSnapshot {
  governances: Array<{ proposals: Array<{ executionBlock?: number | null }> }>
}

function loadRebalances(dtf: RegistryDTF): Rebalance[] {
  return loadSnapshot<RebalancesSnapshot>(`${dtf.snapshotDir}/rebalances.json`)
    .rebalances
}

// The blocks the app can match a rebalance to (proposal.executionBlock). The
// list drops any rebalance without a matching proposal, so this is the row
// universe — compute it the same way the app's rebalancesByProposalAtom does.
function matchableBlocks(dtf: RegistryDTF): Set<string> {
  const { governances } = loadSnapshot<GovernanceSnapshot>(
    `${dtf.snapshotDir}/governance.json`
  )
  const blocks = new Set<string>()
  for (const gov of governances) {
    for (const proposal of gov.proposals) {
      if (proposal.executionBlock !== undefined && proposal.executionBlock !== null) {
        blocks.add(String(proposal.executionBlock))
      }
    }
  }
  return blocks
}

function matchedRebalances(dtf: RegistryDTF): Rebalance[] {
  const blocks = matchableBlocks(dtf)
  return loadRebalances(dtf).filter((r) => blocks.has(String(r.blockNumber)))
}

function idleTime(dtf: RegistryDTF): number {
  const max = Math.max(...loadRebalances(dtf).map((r) => Number(r.availableUntil)))
  return max + 86_400
}

// List data resolves in two frozen-clock flush rounds: pump GetIndexDTF (which
// enables the dependent getRebalances + proposal-list queries), then pump those
// responses into React so rows can bucket. Same pump as auctions.spec.
async function settleListData(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await advanceTime(page, 5_000)
  await expect
    .poll(
      () =>
        boundaryRequests.filter(
          (request) =>
            request.boundary === 'subgraph' &&
            ['getRebalances', 'GetIndexDtfProposals'].includes(
              request.operationName
            )
        ).length
    )
    .toBeGreaterThanOrEqual(2)
  await advanceTime(page, 5_000)
}

const CHAIN_ADDRESSES = [
  '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', // bsc/cmc20 (v5)
  '0x323c03c48660fe31186fa82c289b0766d331ce21', // mainnet/open (v4)
]

for (const address of CHAIN_ADDRESSES) {
  const dtf = findDtfByAddress(address)!

  test.describe(`auctions multichain — ${dtf.snapshotDir}`, () => {
    test('historical rebalances render and the active section is empty (idle)', async ({
      page,
      overrides,
      boundaryRequests,
    }) => {
      const matched = matchedRebalances(dtf)
      expect(matched.length).toBeGreaterThan(0) // guard: snapshot has rows to show

      // Freeze past every window -> everything buckets historical; getRebalance
      // stays idle by default.
      await freezeTime(page, idleTime(dtf))

      // Serve a real-shaped metrics payload so the metric cells render values
      // instead of skeletons (the shared /dtf/rebalance mock returns []).
      overrides.api({ pathname: '/dtf/rebalance' }, [
        {
          id: 'rebalance-metrics',
          nonce: Number(matched[0].nonce),
          timestamp: Number(matched[0].timestamp),
          availableUntil: Number(matched[0].availableUntil),
          blockNumber: Number(matched[0].blockNumber),
          tokens: [],
          auctions: [],
          rebalanceAccuracy: 99.9,
          totalRebalancedUsd: 1_234_567,
          avgPriceImpactPercent: 0,
          totalPriceImpactUsd: 0,
          marketCapRebalanceImpact: 0,
        },
      ])

      await page.goto(dtfPath(dtf, 'auctions'))
      await expect(page.getByTestId('dtf-auctions')).toBeVisible()

      await settleListData(page, boundaryRequests)

      await expect(page.getByTestId('auctions-historical-item')).toHaveCount(
        matched.length
      )
      await expect(page.getByTestId('auctions-active-item')).toHaveCount(0)
      // Idle: the active section shows its empty state.
      await expect(
        page
          .getByTestId('auctions-active-section')
          .getByTestId('auctions-empty-state')
      ).toBeVisible()

      // Pump the per-row metrics queries (they fire after rows mount) and assert
      // the overlaid metrics render — proves the API metrics layer works on this
      // chain, values derived from the override payload not Lingui copy.
      await advanceTime(page, 5_000)
      const firstRow = page.getByTestId('auctions-historical-item').first()
      await expect(firstRow).toContainText('99.9%')
      await expect(firstRow).toContainText('1,234,567')
    })

    test('an in-window rebalance buckets as an active row', async ({
      page,
      boundaryRequests,
    }) => {
      const matched = matchedRebalances(dtf)
      // Newest matched rebalance (subgraph history is newest-first; confirm by
      // max availableUntil so the freeze lands only this one in-window).
      const latest = [...matched].sort(
        (a, b) => Number(b.availableUntil) - Number(a.availableUntil)
      )[0]

      // Freeze INSIDE the latest window (restricted phase). Captured windows are
      // zero-width (restrictedUntil == availableUntil), so 'restricted'
      // (restrictedUntil - 60) is the only in-window timestamp.
      await freezeTime(page, rebalanceTime(latest, 'restricted'))

      await page.goto(dtfPath(dtf, 'auctions'))
      await expect(page.getByTestId('dtf-auctions')).toBeVisible()

      await settleListData(page, boundaryRequests)

      await expect(page.getByTestId('auctions-active-item')).toHaveCount(1)
      await expect(page.getByTestId('auctions-historical-item')).toHaveCount(
        matched.length - 1
      )
      // The active section no longer shows its empty state.
      await expect(
        page
          .getByTestId('auctions-active-section')
          .getByTestId('auctions-empty-state')
      ).toHaveCount(0)
    })
  })
}
