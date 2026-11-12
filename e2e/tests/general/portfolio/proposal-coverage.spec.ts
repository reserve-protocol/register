import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { REGISTRY, TEST_ADDRESS, dtfPath } from '../../../helpers/registry'

// Two DTFs sharing one vote-lock vault: FIRST is dtfs[0] (the old fallback
// label), OWNER is the DTF whose governor created the proposal.
const FIRST = REGISTRY.find((d) => d.slug === 'deprecated')!
const OWNER = REGISTRY.find((d) => d.slug === 'lcap')!
// The page derives proposal state from the browser clock, so the voting
// window is anchored to the test's start rather than fixed epoch values.
const now = Math.floor(Date.now() / 1000)
const proposal = {
  description: '# Coverage regression fixture',
  state: 'ACTIVE',
  isOptimistic: false,
  proposer: TEST_ADDRESS,
  creationTime: String(now - 3600),
  voteStart: String(now - 3600),
  voteEnd: String(now + 7 * 86400),
  quorumVotes: '100',
  forWeightedVotes: '0',
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: '0',
  queueTime: null,
  executionETA: null,
}

// Synthetic response intentionally models a delegated-only shared vault; it is
// not a claim about the current state or payload of a live proposal.
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
          chainId: OWNER.chainId,
          amount: '0',
          value: 0,
          votingPower: '10',
          votingWeight: 0.1,
          apy: 0,
          underlying: {
            address: FIRST.address,
            name: 'Test underlying',
            symbol: 'TEST',
          },
          dtfs: [
            { address: FIRST.address, name: 'First DTF', symbol: 'FIRST' },
            { address: OWNER.address, name: 'Owner DTF', symbol: 'OWNER' },
          ],
          locks: [],
          rewards: [],
          activeProposals: [
            {
              ...proposal,
              id: '123',
              dtfAddress: OWNER.address,
              dtfName: 'Owner DTF',
              dtfSymbol: 'OWNER',
              creationTime: String(now - 60),
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
  await expect(dtfRow.locator('td').first()).toHaveText('OWNER')
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
    // The app routes with the lowercased address; the registry keeps checksums.
    dtfPath(OWNER, 'governance/proposal/123').toLowerCase()
  )
  await section.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('proposal-coverage.png') })
})
