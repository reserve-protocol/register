import type { Page } from '@playwright/test'
import { TEST_DTFS } from './test-data'

// Realistic DTF entity that makes pages render actual content
const MOCK_DTF = {
  id: TEST_DTFS.lcap.address,
  proxyAdmin: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2',
  timestamp: 1704067200,
  deployer: '0x8e0507c16435caca6cb71a7fb0e0636fd3891df4',
  ownerAddress: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
  mintingFee: '100000000000000000',
  tvlFee: '50000000000000000',
  annualizedTvlFee: '5000000000000000000',
  mandate: 'Large cap diversified index',
  auctionDelay: '0',
  auctionLength: '259200',
  auctionApprovers: ['0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9'],
  auctionLaunchers: ['0xd84e0c72dc2f8363b46d4adfc58bfd82e49222d9'],
  brandManagers: ['0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2'],
  totalRevenue: 1250000,
  protocolRevenue: 625000,
  governanceRevenue: 312500,
  externalRevenue: 312500,
  feeRecipients:
    '0x1111111111111111111111111111111111111111:500000000000000000,0x2222222222222222222222222222222222222222:500000000000000000',
  ownerGovernance: {
    id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d',
    votingDelay: 1,
    votingPeriod: 50400,
    proposalThreshold: 1000000000000000000,
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
    proposalThreshold: 500000000000000000,
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
      proposalThreshold: 1000000000000000000,
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

// Governance proposals — mix of states so tests can verify real rendering
const MOCK_PROPOSALS = [
  {
    id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d-1',
    description:
      'Update basket allocation to increase ETH weighting from 15% to 20%',
    creationTime: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    creationBlock: 19214567,
    state: 'Active',
    forWeightedVotes: 2500000000000000000000,
    abstainWeightedVotes: 300000000000000000000,
    againstWeightedVotes: 400000000000000000000,
    executionETA: Math.floor(Date.now() / 1000) + 172800, // 2 days from now
    executionTime: null,
    quorumVotes: 1000000000000000000000,
    voteStart: Math.floor(Date.now() / 1000) - 86400,
    voteEnd: Math.floor(Date.now() / 1000) + 259200, // 3 days from now
    executionBlock: null,
    proposer: { address: '0x03d03a026e71979be3b08d44b01eae4c5ff9da99' },
  },
  {
    id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d-2',
    description: 'Reduce minting fee from 0.1% to 0.08%',
    creationTime: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
    creationBlock: 19197483,
    state: 'Executed',
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
    id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d-3',
    description: 'Add new collateral type - Lido Staked Ether',
    creationTime: Math.floor(Date.now() / 1000) - 1209600, // 14 days ago
    creationBlock: 19180352,
    state: 'Defeated',
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
]

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
              id: MOCK_DTF.ownerGovernance.id,
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
