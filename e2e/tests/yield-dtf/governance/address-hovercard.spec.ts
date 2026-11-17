import {
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  parseAbi,
  zeroAddress,
} from 'viem'
import { test, expect } from '../../../harness'
import { TEST_ADDRESS, YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield governance uses the same address hovercard as Index: the track record
// comes from Reserve API /v1/portfolio/{address}/governance (type "yield" entry).

const eusd = YIELD_REGISTRY.find((dtf) => dtf.symbol === 'eUSD')!
const PROPOSER = '0x49b4f9b2a4a1d6b77e4d4dbbf4b5f1f0fbc96c52'
const STRSR = '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8' // eUSD stRSR
const stRsrVotesAbi = parseAbi([
  'function getVotes(address account) view returns (uint256)',
  'function delegates(address account) view returns (address)',
  'function balanceOf(address account) view returns (uint256)',
])

const proposal = {
  id: '1',
  description: '# eUSD revenue share update',
  proposer: { address: PROPOSER },
  creationTime: '1762650000',
  state: 'EXECUTED',
  governance: eusd.address.toLowerCase(),
  forWeightedVotes: '545000000',
  abstainWeightedVotes: '0',
  againstWeightedVotes: '0',
  executionETA: null,
  quorumVotes: '323000000',
  startBlock: '1762660000',
  endBlock: '1762900000',
  governanceFramework: { name: 'Governor Anastasius' },
}

// WHY: the governance overview reads the connected wallet's governor getVotes
// at the mock's per-call block counter, so its calldata has no fixed value.
test.use({ allowUnmocked: true })

test.beforeEach(async ({ harness, overrides }) => {
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  overrides.subgraph({ operationName: 'getProposals' }, { proposals: [proposal] })
  overrides.subgraph({ operationName: 'getVoters' }, { delegates: [] })
  overrides.subgraph(
    { operationName: 'getGovernanceStats' },
    { governance: { id: eusd.address.toLowerCase(), totalTokenSupply: '0', totalTokenHolders: '0', totalDelegates: '0', proposals: '1' } }
  )
  // Hovercard voter state: getVotes, delegates and balanceOf on stRSR for the proposer.
  for (const [fn, result] of [
    ['getVotes', 78_040_000n * 10n ** 18n],
    ['balanceOf', 0n],
  ] as const) {
    overrides.ethCall(
      STRSR,
      encodeFunctionData({ abi: stRsrVotesAbi, functionName: fn, args: [getAddress(PROPOSER)] }),
      encodeAbiParameters([{ type: 'uint256' }], [result])
    )
  }
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: stRsrVotesAbi, functionName: 'delegates', args: [getAddress(PROPOSER)] }),
    encodeAbiParameters([{ type: 'address' }], [getAddress(PROPOSER)])
  )
  // Safe probe: the yield replay has no wildcard table, so answer "not a Safe" here.
  overrides.ethCall(PROPOSER, '0xe75235b8', encodeAbiParameters([{ type: 'uint256' }], [0n]))
  // The page's own "Delegated to" panel for the connected test wallet.
  overrides.ethCall(
    STRSR,
    encodeFunctionData({ abi: stRsrVotesAbi, functionName: 'delegates', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'address' }], [zeroAddress])
  )
  const profile = {
    address: getAddress(PROPOSER),
    totals: { proposals: 36, executed: 30, defeated: 2, vetoed: 0, canceled: 0, votes: 162 },
    firstActionAt: 1751068800,
    lastActionAt: 1794614400,
    dtfs: [
      {
        chainId: eusd.chainId,
        address: getAddress(eusd.address),
        symbol: 'eUSD',
        type: 'yield',
        proposals: 21,
        executed: 18,
        defeated: 2,
        vetoed: 0,
        canceled: 0,
        votes: 37,
        votingPowerSince: 1751846400,
        delegators: 0,
      },
    ],
    truncated: false,
    degradedChains: [],
  }
  for (const casing of new Set([PROPOSER, getAddress(PROPOSER)])) {
    overrides.api({ pathname: `/v1/portfolio/${casing}/governance` }, profile)
  }
})

test('yield proposal row hovercard shows the eUSD track record @mobile', async ({
  harness,
}, testInfo) => {
  const page = harness.page
  await harness.gotoYield(eusd, 'governance')

  // The yield harness freezes the clock; pump it so query results render.
  const trigger = page.getByTestId('address-hovercard-trigger').first()
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(trigger).toBeVisible()
  }).toPass()
  const card = page.getByTestId('address-profile-card')
  await expect(async () => {
    if (!(await card.isVisible())) {
      if (testInfo.project.name === 'mobile') await trigger.tap()
      else await trigger.hover()
    }
    await harness.chain.advance(4_000)
    await expect(card).toContainText('36')
  }).toPass()
  await expect(card).toContainText('21')
  await expect(card).toContainText('18')
  await expect(card).toContainText('36')
  await expect(card).toContainText('162')
})
