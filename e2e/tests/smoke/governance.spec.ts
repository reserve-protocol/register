import { parseUnits } from 'viem'
import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the Index DTF governance page renders snapshot-derived proposal rows
// fully offline. The @smoke gate fails on ANY unmocked boundary call, so a green
// run proves the whole governance surface (proposal list + the sidebar's
// vote-lock/account/stats/roles/delegates updaters) mounts from the governance
// snapshot without touching a live RPC/subgraph/API.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

interface GovernanceEntry {
  id: string
  proposalCount?: number
  proposals: Array<
    Record<string, unknown> & {
      id: string
      description: string
      creationTime: string
    }
  >
}
interface GovernanceSnapshot {
  governances: GovernanceEntry[]
  stakingToken: {
    id: string
    totalDelegates: string
    token: { totalSupply: string }
    delegates: Array<{
      address: string
      delegatedVotes: string
      numberVotes: number
    }>
  } | null
}
interface GovLike {
  id: string
  timelock?: { id: string }
}
interface DtfSnapshot {
  dtf: {
    token: { name: string; symbol: string }
    stToken: { id: string; governance?: GovLike }
    ownerGovernance?: GovLike
    tradingGovernance?: GovLike
  }
}

// Default proposal-list page size (governance-proposal-list slices to 10 before
// the "Show all" toggle).
const DEFAULT_PAGE_SIZE = 10

// GetIndexDtfDelegates wants raw vote weights + optimistic fields the capture
// query under-selects. Rebuild them from the snapshot's formatted votes (18
// decimals) with optimistic zeros. (Reported as a capture/subgraph gap.)
function delegatesOverlay(gov: GovernanceSnapshot) {
  const st = gov.stakingToken!
  return {
    stakingToken: {
      id: st.id,
      totalDelegates: st.totalDelegates,
      currentDelegates: st.totalDelegates,
      totalOptimisticDelegates: '0',
      currentOptimisticDelegates: '0',
      token: { totalSupply: st.token.totalSupply },
      delegates: st.delegates.map((d) => ({
        address: d.address,
        delegatedVotesRaw: parseUnits(d.delegatedVotes, 18).toString(),
        optimisticDelegatedVotesRaw: '0',
        numberVotes: d.numberVotes,
        numberOptimisticVotes: 0,
        hasBeenStandardDelegate: true,
        hasBeenOptimisticDelegate: false,
        tokenHoldersRepresentedAmount: 0,
        optimisticTokenHoldersRepresentedAmount: 0,
      })),
    },
  }
}

test.beforeEach(async ({ overrides }) => {
  const gov = loadSnapshot<GovernanceSnapshot>(
    `${dtf.snapshotDir}/governance.json`
  )
  const { dtf: dtfData } = loadSnapshot<DtfSnapshot>(
    `${dtf.snapshotDir}/dtf.json`
  )

  overrides.subgraph(
    { operationName: 'GetIndexDtfDelegates' },
    delegatesOverlay(gov)
  )
  // Vote-lock sidebar asks which DTFs this vote lock governs — this one.
  overrides.subgraph(
    { operationName: 'GetGovernedDtfs' },
    {
      dtfs: [
        {
          id: DTF_ADDRESS.toLowerCase(),
          token: {
            name: dtfData.token.name,
            symbol: dtfData.token.symbol,
          },
        },
      ],
    }
  )
})

test('governance page renders snapshot proposal rows offline @smoke', async ({
  page,
}) => {
  const { governances } = loadSnapshot<GovernanceSnapshot>(
    `${dtf.snapshotDir}/governance.json`
  )
  const uniqueProposalIds = new Set(
    governances.flatMap((g) => g.proposals.map((p) => p.id))
  )
  const expectedRows = Math.min(uniqueProposalIds.size, DEFAULT_PAGE_SIZE)

  await page.goto(dtfPath(dtf, 'governance'))

  await expect(page.getByTestId('dtf-governance')).toBeVisible()

  // The proposal list mounts from the (enriched) governance snapshot. Rows are
  // the ProposalListItem links; the snapshot has >10 proposals so the default
  // view slices to DEFAULT_PAGE_SIZE.
  const proposals = page.getByTestId('governance-proposals')
  await expect(proposals).toBeVisible()

  const rows = proposals.locator('a[href*="/proposal/"]')
  await expect(rows).toHaveCount(expectedRows)

  // A snapshot-derived data point beyond mere row count: the newest proposal's
  // title text reaches the page (rows are sorted by creationTime desc).
  const allProposals = governances.flatMap((g) => g.proposals)
  const newest = [...allProposals].sort(
    (a, b) => Number(b.creationTime) - Number(a.creationTime)
  )[0]
  const title = newest.description.split(/\r?\n/)[0].replaceAll('#', '').trim()
  await expect(rows.first()).toContainText(title.slice(0, 40))
})
