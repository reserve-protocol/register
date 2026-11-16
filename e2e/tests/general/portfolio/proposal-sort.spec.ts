import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'

// Regression: rows were ordered by creation time only, so enough newer pending
// proposals pushed the active one below the collapsed 5-row view.
// RED: sort by creation time in active-proposals.tsx — the first row is a
// pending proposal and the active one is not visible until "Show all".
const DTF = REGISTRY.find((d) => d.slug === 'lcap')!
const now = Math.floor(Date.now() / 1000)
const DAY = 86400

const proposal = (id: string, title: string, overrides: object) => ({
  id,
  description: `# ${title}`,
  state: 'PENDING',
  isOptimistic: false,
  proposer: TEST_ADDRESS,
  quorumVotes: '100',
  forWeightedVotes: '0',
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: '0',
  queueTime: null,
  executionETA: null,
  ...overrides,
})

const pending = Array.from({ length: 6 }, (_, i) =>
  proposal(`${10 + i}`, `Pending fixture ${i}`, {
    creationTime: String(now - 3600 + i * 60),
    voteStart: String(now + DAY),
    voteEnd: String(now + 4 * DAY),
  })
)
const active = proposal('1', 'Active fixture', {
  state: 'ACTIVE',
  creationTime: String(now - 2 * DAY),
  voteStart: String(now - DAY),
  voteEnd: String(now + 2 * DAY),
})

test('portfolio lists active proposals ahead of newer pending ones @mobile', async ({
  page,
  overrides,
}) => {
  overrides.api(
    { pathname: `/v1/portfolio/${TEST_ADDRESS}` },
    {
      totalHoldingsUSD: 0,
      indexDTFs: [],
      yieldDTFs: [],
      stakedRSR: [],
      rsrBalances: [],
      voteLocks: [
        {
          stTokenAddress: '0x0000000000000000000000000000000000000201',
          name: 'Sort fixture vault',
          symbol: 'vlTEST',
          chainId: DTF.chainId,
          // Delegated-only: an owned balance triggers unmocked vault-migration reads.
          amount: '0',
          value: 0,
          votingPower: '10',
          votingWeight: 0.1,
          apy: 0,
          underlying: {
            address: DTF.address,
            name: 'Test underlying',
            symbol: 'TEST',
          },
          dtfs: [{ address: DTF.address, name: 'Sort DTF', symbol: 'SORT' }],
          locks: [],
          rewards: [],
          activeProposals: [...pending, active],
        },
      ],
    }
  )
  await page.goto('/portfolio')
  await connectWallet(page)

  const section = page.getByTestId('portfolio-active-proposals')
  await expect(section).toHaveAttribute('data-proposal-count', '7')
  const rows = section.locator('tbody tr')
  const titleOf = (index: number) =>
    rows.nth(index).locator('td').nth(1).locator('p')

  await expect(rows).toHaveCount(5)
  await expect(titleOf(0)).toHaveText('Active fixture')

  await section.getByTestId('proposal-sort-newest').click()
  await expect(titleOf(0)).toHaveText('Pending fixture 5')
  await expect(rows.locator('td p', { hasText: 'Active fixture' })).toHaveCount(
    0
  )

  await section.getByTestId('proposal-sort-status').click()
  await expect(titleOf(0)).toHaveText('Active fixture')
})
