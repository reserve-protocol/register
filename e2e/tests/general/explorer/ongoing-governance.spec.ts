import { test, expect, type DtfHarness } from '../../../harness'
import { proposalTime } from '../../../helpers/clock'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

type DiscoverDtf = {
  address: string
  chainId: number
  status: string
  type: string
}

type GovernanceRef = {
  id: string
  timelock?: { id: string } | null
}

type DtfSnapshot = {
  dtf: Record<string, unknown> & {
    id: string
    ownerGovernance: GovernanceRef | null
    tradingGovernance: GovernanceRef | null
    legacyAdmins: string[]
    legacyAuctionApprovers: string[]
    stToken: {
      id: string
      legacyGovernance: string[]
      token: { id: string; symbol: string; decimals: number }
      underlying: { address: string; symbol: string; decimals: number }
      governance: GovernanceRef | null
    }
  }
}

type ProposalSummary = Record<string, unknown> & {
  id: string
  description: string
  voteStart: string
  voteEnd: string
  proposer: { address: string }
}

type GovernanceSnapshot = {
  governances: (Record<string, unknown> & {
    id: string
    proposals: ProposalSummary[]
  })[]
  stakingToken: unknown
}

type ProposalDetail = {
  proposal: ProposalSummary & {
    governance: { id: string }
    targets: string[]
    calldatas: string[]
    votes: { voter: { address: string } }[]
  }
}

const deprecated = REGISTRY.find((dtf) => dtf.deprecated)!
const activeProposalId =
  '91960843638633994549942325514029618623969667842970679214954734819875378715817'
const discoverDtfs = loadSnapshot<DiscoverDtf[]>('shared/discover-dtfs.json')
const discoverDtf = discoverDtfs.find(
  (dtf) => dtf.address.toLowerCase() === deprecated.address.toLowerCase()
)!
const dtfSnapshot = loadSnapshot<DtfSnapshot>(
  `${deprecated.snapshotDir}/dtf.json`
).dtf
const governanceSnapshot = loadSnapshot<GovernanceSnapshot>(
  `${deprecated.snapshotDir}/governance.json`
)
const proposalDetail = loadSnapshot<ProposalDetail>(
  `${deprecated.snapshotDir}/proposals/${activeProposalId}.json`
).proposal

const selectedProposal = governanceSnapshot.governances
  .flatMap((governance) => governance.proposals)
  .find((proposal) => proposal.id === activeProposalId)!

const governanceRefs = [
  dtfSnapshot.ownerGovernance,
  dtfSnapshot.tradingGovernance,
  dtfSnapshot.stToken.governance,
].filter((governance): governance is GovernanceRef => governance !== null)

const setupFullProposal = (
  harness: DtfHarness,
  description = selectedProposal.description
) => {
  const governances = governanceSnapshot.governances.map((governance) => {
    const governanceRef = governanceRefs.find(
      (candidate) => candidate.id.toLowerCase() === governance.id.toLowerCase()
    )

    return {
      ...governance,
      proposals: governance.proposals.map((proposal) => ({
        ...proposal,
        description:
          proposal.id === activeProposalId ? description : proposal.description,
        governance: {
          id: governance.id,
          token: { id: dtfSnapshot.stToken.token.id },
          timelock: {
            id:
              governanceRef?.timelock?.id ??
              dtfSnapshot.stToken.governance?.timelock?.id,
          },
        },
      })),
    }
  })

  harness.mock.api({ pathname: '/v1/discover/dtfs' }, [discoverDtf])
  harness.mock.subgraph(
    { operationName: 'getGovernanceStats', chain: deprecated.chainId },
    { governances, stakingToken: governanceSnapshot.stakingToken }
  )
  harness.mock.subgraph(
    {
      operationName: 'GetOngoingGovernanceDtfs',
      chain: deprecated.chainId,
    },
    {
      dtfs: [
        {
          ...dtfSnapshot,
          stToken: {
            ...dtfSnapshot.stToken,
            underlying: {
              ...dtfSnapshot.stToken.underlying,
              id: dtfSnapshot.stToken.underlying.address,
            },
          },
        },
      ],
    }
  )
  harness.mock.subgraph(
    {
      operationName: 'GetOngoingGovernanceEnrichment',
      chain: deprecated.chainId,
    },
    {
      proposals: [
        {
          id: proposalDetail.id,
          governance: proposalDetail.governance,
          proposer: proposalDetail.proposer,
          targets: proposalDetail.targets,
          calldatas: proposalDetail.calldatas,
          votes: proposalDetail.votes,
        },
      ],
    }
  )
}

const proposalCard = (harness: DtfHarness) =>
  harness.page.locator(
    `[data-testid="ongoing-governance-proposal-card"][data-proposal-id="${activeProposalId}"]`
  )

const waitForProposalCard = async (harness: DtfHarness) => {
  const card = proposalCard(harness)
  await expect
    .poll(async () => {
      await harness.chain.advance(250)
      return card.isVisible()
    })
    .toBe(true)
  return card
}

test.use({ wallet: false })

test('ongoing governance: loading lifecycle includes deprecated DTF proposals @smoke', async ({
  harness,
}) => {
  const page = harness.page
  setupFullProposal(harness)
  await harness.chain.freezeAt(proposalTime(selectedProposal, 'active'))
  const hold = harness.mock.hold({
    boundary: 'api',
    pathname: '/v1/discover/dtfs',
  })

  await page.goto('/explorer/governance/ongoing')
  await expect(page.getByTestId('ongoing-governance-loading')).toBeVisible()
  await expect.poll(() => hold.hits).toBeGreaterThan(0)

  hold.release()
  const card = await waitForProposalCard(harness)
  await expect(page.getByTestId('ongoing-governance-loading')).toHaveCount(0)
  await expect(card.locator('[data-dtf-status="deprecated"]')).toBeVisible()
})

test('ongoing governance: full proposal card exposes live proposal details @smoke', async ({
  harness,
}) => {
  const page = harness.page
  setupFullProposal(harness)
  await harness.chain.freezeAt(proposalTime(selectedProposal, 'active'))
  await page.goto('/explorer/governance/ongoing')

  const card = await waitForProposalCard(harness)
  await expect(card.getByTestId('ongoing-governance-state')).toHaveAttribute(
    'data-value',
    'active'
  )
  await expect(card.getByTestId('ongoing-governance-category')).toHaveAttribute(
    'data-value',
    'other'
  )
  await expect(
    card.getByTestId('ongoing-governance-has-votes')
  ).toHaveAttribute('data-value', 'true')
  await expect(
    card.getByTestId('ongoing-governance-proposer-voted')
  ).toHaveAttribute('data-value', 'true')
  await expect(
    card.getByTestId('ongoing-governance-vote-start')
  ).toHaveAttribute('data-timestamp', selectedProposal.voteStart)
  await expect(card.getByTestId('ongoing-governance-vote-end')).toHaveAttribute(
    'data-timestamp',
    selectedProposal.voteEnd
  )
  await expect(
    card.getByTestId('ongoing-governance-threshold-token')
  ).toHaveAttribute('data-raw', '0')
  await expect(
    card.getByTestId('ongoing-governance-pass-token')
  ).toHaveAttribute('data-raw', '0')
  await expect(
    card.getByTestId('ongoing-governance-defeat-usd')
  ).toHaveAttribute('data-available', 'true')
  await expect(
    card.getByTestId('ongoing-governance-proposal-link')
  ).toHaveAttribute(
    'href',
    new RegExp(
      `/base/index-dtf/${deprecated.address}/governance/proposal/${activeProposalId}$`,
      'i'
    )
  )
})

test('ongoing governance: empty discovery renders the empty state @smoke', async ({
  harness,
}) => {
  harness.mock.api({ pathname: '/v1/discover/dtfs' }, [])
  await harness.page.goto('/explorer/governance/ongoing')
  await expect(
    harness.page.getByTestId('ongoing-governance-empty')
  ).toBeVisible({ timeout: 15_000 })
})

test('ongoing governance: a failed chain preserves proposals from healthy chains @smoke', async ({
  harness,
}) => {
  const page = harness.page
  setupFullProposal(harness)
  const bsc = REGISTRY.find((dtf) => dtf.chainId === 56)!
  const bscDiscoverDtf = discoverDtfs.find(
    (dtf) => dtf.address.toLowerCase() === bsc.address.toLowerCase()
  )!
  harness.mock.api({ pathname: '/v1/discover/dtfs' }, [
    discoverDtf,
    bscDiscoverDtf,
  ])
  harness.mock.subgraph(
    { operationName: 'GetOngoingGovernanceDtfs', chain: bsc.chainId },
    {}
  )
  await harness.chain.freezeAt(proposalTime(selectedProposal, 'active'))
  await page.goto('/explorer/governance/ongoing')

  await waitForProposalCard(harness)
  const warning = page.getByTestId('ongoing-governance-warning')
  await expect
    .poll(async () => {
      await harness.chain.advance(1_000)
      return warning.isVisible()
    })
    .toBe(true)
})

test('ongoing governance: long proposal titles fit the mobile viewport @mobile', async ({
  harness,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only layout assertion')
  const page = harness.page
  setupFullProposal(harness, `# ${'GovernanceProposal'.repeat(30)}`)
  await harness.chain.freezeAt(proposalTime(selectedProposal, 'active'))
  await page.goto('/explorer/governance/ongoing')

  await waitForProposalCard(harness)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
})
