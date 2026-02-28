import type { Page } from '@playwright/test'
import { TEST_DTFS } from './test-data'

// Realistic DTF entity that makes pages render actual content
const MOCK_DTF = {
  id: TEST_DTFS.lcap.address,
  proxyAdmin: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2',
  timestamp: 1704067200,
  deployer: '0x8e0507c16435caca6cb71a7fb0e0636fd3891df4',
  ownerAddress: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  // Fee values are D18 fractions: formatEther(BigInt(x)) → decimal, * 100 → form %
  // mintFee form value: 0.003 * 100 = 0.3% (schema min 0.15, max 5)
  mintingFee: '3000000000000000',
  // tvlFee: 0.005 (display only)
  tvlFee: '5000000000000000',
  // folioFee form value: 0.01 * 100 = 1% (schema min 0.15, max 10)
  annualizedTvlFee: '10000000000000000',
  mandate: 'Large cap diversified index',
  auctionDelay: '0',
  // auctionLength in seconds: 1800/60 = 30 minutes (schema min 15, max 1440)
  auctionLength: '1800',
  auctionApprovers: ['0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9'],
  auctionLaunchers: ['0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9'],
  brandManagers: ['0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2'],
  totalRevenue: 1250000,
  protocolRevenue: 625000,
  governanceRevenue: 312500,
  externalRevenue: 312500,
  // WHY: feeRecipientsAtom matches addresses against deployer and stToken.id
  // Using real addresses so governance/deployer shares are correctly identified
  feeRecipients:
    '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1:500000000000000000,0x8e0507c16435caca6cb71a7fb0e0636fd3891df4:500000000000000000',
  ownerGovernance: {
    id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d',
    votingDelay: 1,
    votingPeriod: 50400,
    // WHY: useIndexDTF multiplies proposalThreshold by 100 before storing in atom.
    // 1e16 * 100 = 1e18 → formatEther → '1' → /100 = 0.01 (1% threshold)
    proposalThreshold: 10000000000000000,
    quorumNumerator: 4,
    quorumDenominator: 100,
    timelock: {
      id: '0x4a3f2e1d0c9b8a7f6e5d4c3b2a19f8e7d6c5b4a3',
      guardians: ['0x03d03a026e71979be3b08d44b01eae4c5ff9da99'],
      executionDelay: 172800,
    },
  },
  legacyAdmins: [],
  tradingGovernance: {
    id: '0x6b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e',
    votingDelay: 1,
    votingPeriod: 50400,
    // WHY: useIndexDTF multiplies by 100. 5e15 * 100 = 5e17 → 0.5 → /100 = 0.005 (0.5%)
    proposalThreshold: 5000000000000000,
    quorumNumerator: 3,
    quorumDenominator: 100,
    timelock: {
      id: '0x5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1d0c9',
      guardians: ['0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9'],
      executionDelay: 86400,
    },
  },
  legacyAuctionApprovers: [],
  token: {
    id: TEST_DTFS.lcap.address,
    name: 'Large Cap Index DTF',
    symbol: 'LCAP',
    decimals: 18,
    totalSupply: '5000000000000000000000000',
    currentHolderCount: 2847,
  },
  stToken: {
    id: '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1',
    token: {
      name: 'Staked LCAP',
      symbol: 'stLCAP',
      decimals: 18,
      totalSupply: '2500000000000000000000000',
    },
    underlying: {
      name: 'Large Cap Index DTF',
      symbol: 'LCAP',
      address: TEST_DTFS.lcap.address,
      decimals: 18,
    },
    governance: {
      id: '0x8f7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2',
      votingDelay: 1,
      votingPeriod: 50400,
      // WHY: useIndexDTF multiplies by 100. 1e16 * 100 = 1e18 → 0.01 (1%)
      proposalThreshold: 10000000000000000,
      quorumNumerator: 4,
      quorumDenominator: 100,
      timelock: {
        id: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        guardians: ['0x03d03a026e71979be3b08d44b01eae4c5ff9da99'],
        executionDelay: 172800,
      },
    },
    legacyGovernance: [],
    rewards: [
      {
        rewardToken: {
          address: '0xfbd70d29d26efc3d7d23a9f433f7079e8f6b08b9',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    ],
  },
}

const GOVERNANCE_ID = '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d'

// On-chain proposal IDs (uint256 hashes, stored as decimal strings in subgraph)
// BigInt-compatible — used by proposalVotes() on-chain call
const PROPOSAL_IDS = [
  '98374650192837465019283746501928374650',
  '87263541098726354109872635410987263541',
  '76152432098715243209871524320987152432',
  '65041323098604132309860413230986041323',
  '53930214098593021409859302140985930214',
]

// Governance proposals — mix of states so tests can verify real rendering
const MOCK_PROPOSALS = [
  {
    id: PROPOSAL_IDS[0],
    description:
      'Update basket allocation to increase ETH weighting from 15% to 20%',
    creationTime: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    creationBlock: 19214567,
    state: 'ACTIVE',
    forWeightedVotes: 2500000000000000000000,
    abstainWeightedVotes: 300000000000000000000,
    againstWeightedVotes: 400000000000000000000,
    executionETA: null,
    executionTime: null,
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 86400,
    voteEnd: Math.floor(Date.now() / 1000) + 259200, // 3 days from now
    executionBlock: null,
    proposer: { address: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99' },
  },
  {
    id: PROPOSAL_IDS[1],
    description: 'Reduce minting fee from 0.1% to 0.08%',
    creationTime: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
    creationBlock: 19197483,
    state: 'EXECUTED',
    forWeightedVotes: 3500000000000000000000,
    abstainWeightedVotes: 200000000000000000000,
    againstWeightedVotes: 100000000000000000000,
    executionETA: Math.floor(Date.now() / 1000) - 432000,
    executionTime: String(Math.floor(Date.now() / 1000) - 345600),
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 604800,
    voteEnd: Math.floor(Date.now() / 1000) - 518400,
    executionBlock: '19208345',
    proposer: { address: '0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9' },
  },
  {
    id: PROPOSAL_IDS[2],
    description: 'Add new collateral type - Lido Staked Ether',
    creationTime: Math.floor(Date.now() / 1000) - 1209600, // 14 days ago
    creationBlock: 19180352,
    state: 'DEFEATED',
    forWeightedVotes: 1200000000000000000000,
    abstainWeightedVotes: 400000000000000000000,
    againstWeightedVotes: 2100000000000000000000,
    executionETA: null,
    executionTime: null,
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 1209600,
    voteEnd: Math.floor(Date.now() / 1000) - 1123200,
    executionBlock: null,
    proposer: { address: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2' },
  },
  {
    id: PROPOSAL_IDS[3],
    description: 'Increase redemption fee to 0.15%',
    creationTime: Math.floor(Date.now() / 1000) - 432000, // 5 days ago
    creationBlock: 19205000,
    state: 'SUCCEEDED',
    forWeightedVotes: 3000000000000000000000,
    abstainWeightedVotes: 500000000000000000000,
    againstWeightedVotes: 200000000000000000000,
    executionETA: null,
    executionTime: null,
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 432000,
    voteEnd: Math.floor(Date.now() / 1000) - 345600, // voting ended
    executionBlock: null,
    proposer: { address: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99' },
  },
  {
    id: PROPOSAL_IDS[4],
    description: 'Lower auction delay from 3 days to 1 day',
    creationTime: Math.floor(Date.now() / 1000) - 518400, // 6 days ago
    creationBlock: 19200000,
    state: 'QUEUED',
    forWeightedVotes: 2800000000000000000000,
    abstainWeightedVotes: 100000000000000000000,
    againstWeightedVotes: 300000000000000000000,
    executionETA: Math.floor(Date.now() / 1000) - 3600, // ETA passed (1 hour ago)
    executionTime: null,
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 518400,
    voteEnd: Math.floor(Date.now() / 1000) - 432000,
    executionBlock: null,
    queueBlock: '19210000',
    queueTime: String(Math.floor(Date.now() / 1000) - 172800),
    proposer: { address: '0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9' },
  },
]

/**
 * Build proposal detail response for `getProposalDetail` / `proposal(id:` queries.
 * Extends the list proposal with fields needed by the detail view.
 */
function getProposalDetail(proposalId: string) {
  const proposal = MOCK_PROPOSALS.find((p) => p.id === proposalId)
  if (!proposal) return null

  // Fake calldata + targets for queue/execute tx arg computation
  const targets = ['0x4a3f2e1d0c9b8a7f6e5d4c3b2a19f8e7d6c5b4a3']
  const calldatas = ['0xabcdef01']

  // Generate some votes for the detail view
  const votes = [
    {
      choice: 'For',
      voter: { address: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99' },
      weight: String(BigInt(1500) * BigInt(10) ** BigInt(18)),
    },
    {
      choice: 'For',
      voter: { address: '0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9' },
      weight: String(BigInt(1000) * BigInt(10) ** BigInt(18)),
    },
    {
      choice: 'Against',
      voter: { address: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2' },
      weight: String(BigInt(400) * BigInt(10) ** BigInt(18)),
    },
  ]

  return {
    ...proposal,
    timelockId: '0x' + BigInt(proposalId).toString(16).padStart(64, '0'),
    calldatas,
    targets,
    votes,
    cancellationTime: null,
    forDelegateVotes: '2',
    abstainDelegateVotes: '0',
    againstDelegateVotes: '1',
    executionTxnHash:
      proposal.state === 'EXECUTED'
        ? '0xexec1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
        : null,
    governance: { id: GOVERNANCE_ID },
  }
}

// Exported for use in tests that need proposal IDs
export { GOVERNANCE_ID, MOCK_PROPOSALS }

// Transaction history
const MOCK_TRANSFER_EVENTS = [
  {
    id: '0xabc-1',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234',
    amount: '1500000000000000000000',
    timestamp: String(Math.floor(Date.now() / 1000) - 3600),
    to: { id: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    from: { id: '0x0000000000000000000000000000000000000000' },
    type: 'MINT',
  },
  {
    id: '0xabc-2',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1235',
    amount: '2500000000000000000000',
    timestamp: String(Math.floor(Date.now() / 1000) - 7200),
    to: { id: '0x0000000000000000000000000000000000000000' },
    from: { id: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    type: 'REDEEM',
  },
  {
    id: '0xabc-3',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1236',
    amount: '3000000000000000000000',
    timestamp: String(Math.floor(Date.now() / 1000) - 14400),
    to: { id: '0xcccccccccccccccccccccccccccccccccccccccc' },
    from: { id: '0x0000000000000000000000000000000000000000' },
    type: 'MINT',
  },
]

// Staking token with delegates
const MOCK_STAKING_TOKEN = {
  id: '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1',
  totalDelegates: 412,
  token: { decimals: 18, totalSupply: '2500000000000000000000000' },
  delegates: [
    {
      address: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
      delegatedVotes: 450000000000000000000,
      numberVotes: 45,
    },
    {
      address: '0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9',
      delegatedVotes: 380000000000000000000,
      numberVotes: 38,
    },
    {
      address: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2',
      delegatedVotes: 325000000000000000000,
      numberVotes: 32,
    },
  ],
}

/**
 * Detect which query is being run from the POST body and return
 * query-specific mock data. Falls back to empty response for unknown queries.
 */
function getResponseForQuery(body: string, url: string) {
  const isIndexDtfSubgraph = url.includes('dtf-index')

  // Index DTF subgraph — return realistic data
  if (isIndexDtfSubgraph) {
    // getDTF query (useIndexDTF.ts)
    if (body.includes('getDTF') || body.includes('dtf(id:')) {
      return { data: { dtf: MOCK_DTF } }
    }

    // Proposal detail query (use-proposal-detail.ts)
    if (
      body.includes('getProposalDetail') ||
      body.includes('proposal(id:')
    ) {
      // Extract proposal ID from the query variables
      const idMatch = body.match(/"id"\s*:\s*"([^"]+)"/)
      const proposalId = idMatch?.[1] ?? ''
      const detail = getProposalDetail(proposalId)
      return { data: { proposal: detail } }
    }

    // transferEvents query (useIndexDTFTransactions.ts)
    if (body.includes('transferEvents')) {
      return { data: { transferEvents: MOCK_TRANSFER_EVENTS } }
    }

    // getGovernanceStats query (governance/updater.tsx)
    if (body.includes('getGovernanceStats') || body.includes('governances(')) {
      return {
        data: {
          governances: [
            {
              id: GOVERNANCE_ID,
              proposals: MOCK_PROPOSALS,
              proposalCount: MOCK_PROPOSALS.length,
            },
          ],
          stakingToken: MOCK_STAKING_TOKEN,
        },
      }
    }

    // Rebalance queries
    if (body.includes('rebalances') || body.includes('rebalance(')) {
      return {
        data: {
          rebalances: [
            {
              id: `${TEST_DTFS.lcap.address}-1`,
              nonce: '1',
              tokens: [
                {
                  id: '0x4200000000000000000000000000000000000006',
                  name: 'Wrapped Ether',
                  symbol: 'WETH',
                  decimals: 18,
                },
                {
                  id: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
                  name: 'USD Coin',
                  symbol: 'USDC',
                  decimals: 6,
                },
              ],
              priceControl: '0',
              weightLowLimit: ['1000000000000000000', '2000000000000000000'],
              weightSpotLimit: ['2000000000000000000', '3500000000000000000'],
              weightHighLimit: ['3000000000000000000', '5000000000000000000'],
              rebalanceLowLimit: '900000000000000000',
              rebalanceSpotLimit: '1000000000000000000',
              rebalanceHighLimit: '1100000000000000000',
              priceLowLimit: ['2400000000000000000000', '990000000000000000'],
              priceHighLimit: ['2600000000000000000000', '1010000000000000000'],
              restrictedUntil: '0',
              availableUntil: String(
                Math.floor(Date.now() / 1000) - 604800
              ), // 7 days ago (historical)
              transactionHash:
                '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
              blockNumber: '19208345', // matches Executed proposal
              timestamp: String(Math.floor(Date.now() / 1000) - 604800),
            },
          ],
        },
      }
    }
  }

  // Yield DTF subgraph or unknown — return safe empty data
  return {
    data: {
      tokens: [],
      tokenDailySnapshots: [],
      proposals: [],
      votes: [],
      governances: [],
      ownerGovernance: null,
      tradingGovernance: null,
      vaultGovernance: null,
      stakingToken: null,
      delegates: [],
      trades: [],
      rebalances: [],
      auctions: [],
      entries: [],
      accounts: [],
      stakeEvents: [],
      unstakeEvents: [],
      dtf: null,
      rtoken: null,
      governance: null,
      token: null,
      folio: null,
      transferEvents: [],
    },
  }
}

/**
 * Mock all Goldsky subgraph GraphQL endpoints.
 * Index DTF queries return realistic data; yield/other queries return safe empty data.
 */
export async function mockSubgraphRoutes(page: Page) {
  await page.route('**/api.goldsky.com/**', (route) => {
    const request = route.request()

    if (request.method() === 'POST') {
      const url = request.url()
      const body = request.postData() || ''
      const response = getResponseForQuery(body, url)

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }
  })
}
