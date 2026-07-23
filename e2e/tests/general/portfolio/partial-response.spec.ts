import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { TEST_ADDRESS } from '../../../helpers/registry'

// A partial 200 portfolio response with one malformed proposal row must not
// blank the route: the page renders, the healthy proposal survives, the
// malformed one is dropped.
// RED: revert the parseWei guard in portfolio atoms — BigInt('') throws during
// atom evaluation and the route crashes (section and count disappear).

const STAKED_POSITION = {
  address: '0x0000000000000000000000000000000000000101',
  stRSRAddress: '0x0000000000000000000000000000000000000102',
  name: 'Test RToken',
  symbol: 'TRSR',
  chainId: 1,
  amount: '10',
  rsrAmount: '10',
  value: 10,
  performance7d: null,
  apy: null,
  votingPower: '10',
  votingWeight: 0,
  delegate: null,
  pendingWithdrawals: [],
}

const proposal = (id: string, forWeightedVotes: string) => ({
  id,
  description: 'Test proposal',
  state: 'ACTIVE',
  proposer: '0x0000000000000000000000000000000000000001',
  creationTime: '1',
  voteStart: '100',
  voteEnd: '99999999999',
  quorumVotes: '100',
  forWeightedVotes,
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: forWeightedVotes,
  queueTime: null,
  executionETA: null,
})

test('portfolio survives a malformed proposal row and keeps the healthy one', async ({
  page,
  overrides,
}) => {
  overrides.api(
    { pathname: `/v1/portfolio/${TEST_ADDRESS}` },
    {
      totalHoldingsUSD: 10,
      indexDTFs: [],
      yieldDTFs: [],
      voteLocks: [],
      rsrBalances: [],
      stakedRSR: [
        {
          ...STAKED_POSITION,
          activeProposals: [
            proposal('healthy', '1000'),
            proposal('malformed', ''), // non-integer wei — the I-01 crash input
          ],
        },
      ],
    }
  )

  await page.goto('/portfolio')
  await connectWallet(page)

  const section = page.getByTestId('portfolio-active-proposals')
  await expect(section).toBeVisible({ timeout: 15_000 })
  await expect(section).toHaveAttribute('data-proposal-count', '1')
})
