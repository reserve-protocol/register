import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { TEST_ADDRESS } from '../../../helpers/registry'

const DGI = '0x9a1741e151233a82cf69209a2f1bc7442b1fb29c'
const FIRST = '0x0000000000000000000000000000000000000202'
const proposal = {
  description: '# Coverage regression fixture',
  state: 'ACTIVE',
  isOptimistic: false,
  proposer: TEST_ADDRESS,
  creationTime: '100',
  voteStart: '100',
  voteEnd: '99999999999',
  quorumVotes: '100',
  forWeightedVotes: '0',
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: '0',
  queueTime: null,
  executionETA: null,
}

// Synthetic response intentionally models a delegated-only shared vault; it is
// not a claim about the current state or payload of a live DGI proposal.
test('portfolio includes delegated-only proposals and opens the owning DTF @mobile', async ({
  page,
  overrides,
}, testInfo) => {
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
          name: 'Shared governance vault',
          symbol: 'vlTEST',
          chainId: 1,
          amount: '0',
          value: 0,
          votingPower: '10',
          votingWeight: 0.1,
          apy: 0,
          underlying: {
            address: FIRST,
            name: 'Test underlying',
            symbol: 'TEST',
          },
          dtfs: [
            { address: FIRST, name: 'First DTF', symbol: 'FIRST' },
            { address: DGI, name: 'DGI', symbol: 'DGI' },
          ],
          locks: [],
          rewards: [],
          activeProposals: [
            {
              ...proposal,
              id: '123',
              dtfAddress: DGI,
              dtfName: 'DGI',
              dtfSymbol: 'DGI',
              creationTime: '200',
            },
            { ...proposal, id: '456' }, // Legacy vault proposal without metadata.
          ],
        },
      ],
    }
  )
  await page.goto('/portfolio')
  await connectWallet(page)
  const section = page.getByTestId('portfolio-active-proposals')
  await expect(section).toBeVisible()
  await expect(section).toHaveAttribute('data-proposal-count', '2')
  const dtfRow = section.locator('tbody tr').first()
  await expect(dtfRow.locator('td').first()).toHaveText('DGI')
  await expect(
    section.locator('tbody tr').nth(1).locator('td').first()
  ).toHaveText('FIRST')
  await page.evaluate(() => {
    window.open = (url) => {
      document.documentElement.dataset.portfolioOpenedUrl = String(url)
      return null
    }
  })
  await dtfRow.click()
  await expect(page.locator('html')).toHaveAttribute(
    'data-portfolio-opened-url',
    `/ethereum/index-dtf/${DGI}/governance/proposal/123`
  )
  await section.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('proposal-coverage.png') })
})
