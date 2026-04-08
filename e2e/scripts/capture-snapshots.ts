/**
 * Snapshot capture script — fetches real data from production APIs and subgraph,
 * saves as JSON fixtures for e2e tests.
 *
 * Usage: npx tsx e2e/scripts/capture-snapshots.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const snapshotsDir = join(__dirname, '..', 'snapshots')

const RESERVE_API = 'https://api.reserve.org'

const SUBGRAPH_URLS: Record<number, string> = {
  1: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-mainnet/prod/gn',
  8453: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/prod/gn',
  56: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-bsc/prod/gn',
}

const DTF_CATALOG = [
  {
    address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
    slug: 'lcap',
    chainId: 8453,
    chainDir: 'base',
  },
  {
    address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
    slug: 'cmc20',
    chainId: 56,
    chainDir: 'bsc',
  },
  {
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
    slug: 'open',
    chainId: 1,
    chainDir: 'mainnet',
  },
  {
    address: '0x47686106181b3cefe4eaf94c4c10b48ac750370b',
    slug: 'deprecated',
    chainId: 8453,
    chainDir: 'base',
  },
]

// --- GraphQL queries (copied from app source) ---

const getDTFQuery = `
  query getDTF($id: String!) {
    dtf(id: $id) {
      id
      proxyAdmin
      timestamp
      deployer
      ownerAddress
      mintingFee
      tvlFee
      annualizedTvlFee
      mandate
      auctionDelay
      auctionLength
      auctionApprovers
      auctionLaunchers
      brandManagers
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      feeRecipients
      ownerGovernance {
        id
        votingDelay
        votingPeriod
        proposalThreshold
        quorumNumerator
        quorumDenominator
        timelock {
          id
          guardians
          executionDelay
        }
      }
      legacyAdmins
      tradingGovernance {
        id
        votingDelay
        votingPeriod
        proposalThreshold
        quorumNumerator
        quorumDenominator
        timelock {
          id
          guardians
          executionDelay
        }
      }
      legacyAuctionApprovers
      token {
        id
        name
        symbol
        decimals
        totalSupply
        currentHolderCount
      }
      stToken {
        id
        token {
          name
          symbol
          decimals
          totalSupply
        }
        underlying {
          name
          symbol
          address
          decimals
        }
        governance {
          id
          votingDelay
          votingPeriod
          proposalThreshold
          quorumNumerator
          quorumDenominator
          timelock {
            id
            guardians
            executionDelay
          }
        }
        legacyGovernance
        rewards(where: { active: true }) {
          rewardToken {
            address
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

const getGovernanceStatsQuery = `
  query getGovernanceStats($governanceIds: [String!]!, $stToken: String!) {
    governances(where: { id_in: $governanceIds }) {
      id
      proposals {
        id
        description
        creationTime
        state
        forWeightedVotes
        abstainWeightedVotes
        againstWeightedVotes
        executionETA
        executionTime
        quorumVotes
        voteStart
        voteEnd
        executionBlock
        creationBlock
        proposer {
          address
        }
      }
      proposalCount
    }
    stakingToken(id: $stToken) {
      id
      totalDelegates
      token {
        totalSupply
      }
      delegates(
        first: 10
        orderBy: delegatedVotes
        orderDirection: desc
        where: { address_not: "0x0000000000000000000000000000000000000000" }
      ) {
        address
        delegatedVotes
        numberVotes
      }
    }
  }
`

const getProposalDetailQuery = `
  query getProposalDetail($id: String!) {
    proposal(id: $id) {
      id
      timelockId
      description
      creationTime
      voteStart
      voteEnd
      queueBlock
      queueTime
      state
      executionETA
      executionTime
      creationBlock
      cancellationTime
      calldatas
      targets
      proposer {
        address
      }
      votes {
        choice
        voter {
          address
        }
        weight
      }
      forWeightedVotes
      againstWeightedVotes
      abstainWeightedVotes
      quorumVotes
      forDelegateVotes
      abstainDelegateVotes
      againstDelegateVotes
      executionTxnHash
      governance {
        id
      }
    }
  }
`

const getTransferEventsQuery = `
  query getTransferEvents($dtf: String!) {
    transferEvents(where: { token: $dtf, type_not: "TRANSFER" }, orderBy: timestamp, orderDirection: desc) {
      id
      hash
      amount
      timestamp
      to {
        id
      }
      from {
        id
      }
      type
    }
  }
`

const getRebalancesQuery = `
  query getRebalances($dtf: String!) {
    rebalances(where: { dtf: $dtf }, orderBy: timestamp, orderDirection: desc) {
      id
      nonce
      tokens {
        address
        name
        symbol
        decimals
      }
      priceControl
      weightLowLimit
      weightSpotLimit
      weightHighLimit
      rebalanceLowLimit
      rebalanceSpotLimit
      rebalanceHighLimit
      priceLowLimit
      priceHighLimit
      restrictedUntil
      availableUntil
      transactionHash
      blockNumber
      timestamp
    }
  }
`

// --- Helpers ---

function saveSnapshot(
  relativePath: string,
  source: string,
  data: unknown,
  extra: Record<string, unknown> = {}
) {
  const fullPath = join(snapshotsDir, relativePath)
  mkdirSync(dirname(fullPath), { recursive: true })

  const snapshot = {
    _meta: {
      source,
      capturedAt: new Date().toISOString(),
      ...extra,
    },
    data,
  }

  writeFileSync(fullPath, JSON.stringify(snapshot, null, 2))
  console.log(`  ✓ ${relativePath}`)
}

async function fetchAPI(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

async function fetchSubgraph(
  chainId: number,
  query: string,
  variables: Record<string, unknown>
) {
  const url = SUBGRAPH_URLS[chainId]
  if (!url) throw new Error(`No subgraph URL for chain ${chainId}`)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) throw new Error(`Subgraph ${res.status}: ${url}`)

  const json = await res.json()
  if (json.errors?.length) {
    console.warn(`  ⚠ Subgraph errors for chain ${chainId}:`, json.errors)
  }
  return json.data
}

// --- Main ---

async function captureShared() {
  console.log('\nShared endpoints:')

  const discoverUrl = `${RESERVE_API}/discover/dtfs?performance=true&brand=true`
  const discover = await fetchAPI(discoverUrl)
  saveSnapshot('shared/discover-dtfs.json', discoverUrl, discover)

  const metricsUrl = `${RESERVE_API}/protocol/metrics`
  const metrics = await fetchAPI(metricsUrl)
  saveSnapshot('shared/protocol-metrics.json', metricsUrl, metrics)
}

async function captureDTF(dtf: (typeof DTF_CATALOG)[number]) {
  const dir = `${dtf.chainDir}/${dtf.slug}`
  const addr = dtf.address.toLowerCase()
  console.log(`\n${dtf.slug.toUpperCase()} (${dtf.chainDir}, ${addr}):`)

  // API: current price + basket (reused for token-prices below)
  let currentPriceData: any = null
  try {
    const priceUrl = `${RESERVE_API}/current/dtf?address=${addr}&chainId=${dtf.chainId}`
    currentPriceData = await fetchAPI(priceUrl)
    saveSnapshot(`${dir}/current-price.json`, priceUrl, currentPriceData, {
      dtf: addr,
      chainId: dtf.chainId,
    })
  } catch (e) {
    console.warn(`  ⚠ Skipping current-price: ${(e as Error).message}`)
  }

  // API: folio manager (brand data)
  try {
    const folioUrl = `${RESERVE_API}/folio-manager/read?folio=${addr}&chainId=${dtf.chainId}`
    const folio = await fetchAPI(folioUrl)
    saveSnapshot(`${dir}/folio-manager.json`, folioUrl, folio, {
      dtf: addr,
      chainId: dtf.chainId,
    })
  } catch (e) {
    console.warn(`  ⚠ Skipping folio-manager: ${(e as Error).message}`)
  }

  // Subgraph: getDTF
  let dtfData: any = null
  try {
    dtfData = await fetchSubgraph(dtf.chainId, getDTFQuery, { id: addr })
    saveSnapshot(`${dir}/dtf.json`, SUBGRAPH_URLS[dtf.chainId], dtfData, {
      dtf: addr,
      chainId: dtf.chainId,
      query: 'getDTF',
    })
  } catch (e) {
    console.warn(`  ⚠ Skipping dtf subgraph: ${(e as Error).message}`)
  }

  // API: historical price (7-day, hourly)
  try {
    const now = Math.floor(Date.now() / 1000)
    const sevenDaysAgo = now - 7 * 24 * 3600
    const histUrl = `${RESERVE_API}/historical/dtf?chainId=${dtf.chainId}&address=${addr}&from=${sevenDaysAgo}&to=${now}&interval=1h`
    const hist = await fetchAPI(histUrl)
    saveSnapshot(`${dir}/historical-price.json`, histUrl, hist, {
      dtf: addr,
      chainId: dtf.chainId,
    })
  } catch (e) {
    console.warn(`  ⚠ Skipping historical-price: ${(e as Error).message}`)
  }

  // API: exposure data
  try {
    const exposureUrl = `${RESERVE_API}/dtf/exposure?chainId=${dtf.chainId}&address=${addr}&period=7d`
    const exposure = await fetchAPI(exposureUrl)
    saveSnapshot(`${dir}/exposure.json`, exposureUrl, exposure, {
      dtf: addr,
      chainId: dtf.chainId,
    })
  } catch (e) {
    console.warn(`  ⚠ Skipping exposure: ${(e as Error).message}`)
  }

  // API: token prices (basket tokens from current-price data captured above)
  if (currentPriceData) {
    try {
      const basketTokens = (currentPriceData?.basket || [])
        .map((t: any) => t.address)
        .filter(Boolean)

      if (basketTokens.length > 0) {
        const tokenPricesUrl = `${RESERVE_API}/current/prices?chainId=${dtf.chainId}&tokens=${basketTokens.join(',')}`
        const tokenPrices = await fetchAPI(tokenPricesUrl)
        saveSnapshot(`${dir}/token-prices.json`, tokenPricesUrl, tokenPrices, {
          dtf: addr,
          chainId: dtf.chainId,
        })
      }
    } catch (e) {
      console.warn(`  ⚠ Skipping token-prices: ${(e as Error).message}`)
    }
  }

  // Subgraph: transfer events
  try {
    const transferData = await fetchSubgraph(
      dtf.chainId,
      getTransferEventsQuery,
      { dtf: addr }
    )
    saveSnapshot(
      `${dir}/transfer-events.json`,
      SUBGRAPH_URLS[dtf.chainId],
      transferData,
      { dtf: addr, chainId: dtf.chainId, query: 'getTransferEvents' }
    )
  } catch (e) {
    console.warn(`  ⚠ Skipping transfer-events: ${(e as Error).message}`)
  }

  // Subgraph: rebalances
  try {
    const rebalanceData = await fetchSubgraph(
      dtf.chainId,
      getRebalancesQuery,
      { dtf: addr }
    )
    saveSnapshot(
      `${dir}/rebalances.json`,
      SUBGRAPH_URLS[dtf.chainId],
      rebalanceData,
      { dtf: addr, chainId: dtf.chainId, query: 'getRebalances' }
    )
  } catch (e) {
    console.warn(`  ⚠ Skipping rebalances: ${(e as Error).message}`)
  }

  // Subgraph: getGovernanceStats (needs governance IDs from getDTF)
  if (dtfData?.dtf) {
    const d = dtfData.dtf
    const governanceIds = [
      d.ownerGovernance?.id,
      ...(d.legacyAdmins || []),
      d.tradingGovernance?.id,
      ...(d.legacyAuctionApprovers || []),
      d.stToken?.governance?.id,
      ...(d.stToken?.legacyGovernance || []),
    ].filter(Boolean)

    const stToken = d.stToken?.id ?? ''

    try {
      const govData = await fetchSubgraph(
        dtf.chainId,
        getGovernanceStatsQuery,
        { governanceIds, stToken }
      )
      saveSnapshot(
        `${dir}/governance.json`,
        SUBGRAPH_URLS[dtf.chainId],
        govData,
        { dtf: addr, chainId: dtf.chainId, query: 'getGovernanceStats' }
      )

      // Capture individual proposals
      const proposals =
        govData?.governances?.flatMap((g: any) => g.proposals ?? []) ?? []
      console.log(`  Found ${proposals.length} proposals`)

      for (const proposal of proposals.slice(0, 10)) {
        try {
          const proposalData = await fetchSubgraph(
            dtf.chainId,
            getProposalDetailQuery,
            { id: proposal.id }
          )
          saveSnapshot(
            `${dir}/proposals/${proposal.id}.json`,
            SUBGRAPH_URLS[dtf.chainId],
            proposalData,
            {
              dtf: addr,
              chainId: dtf.chainId,
              query: 'getProposalDetail',
              proposalId: proposal.id,
            }
          )
        } catch (e) {
          console.warn(
            `  ⚠ Skipping proposal ${proposal.id}: ${(e as Error).message}`
          )
        }
      }
    } catch (e) {
      console.warn(`  ⚠ Skipping governance: ${(e as Error).message}`)
    }
  }
}

async function main() {
  console.log('Capturing e2e snapshots from production...')

  await captureShared()

  for (const dtf of DTF_CATALOG) {
    await captureDTF(dtf)
  }

  // Write meta file
  saveSnapshot('_meta.json', 'capture-snapshots.ts', {
    capturedAt: new Date().toISOString(),
    dtfs: DTF_CATALOG.map((d) => ({
      slug: d.slug,
      address: d.address,
      chainId: d.chainId,
    })),
  })

  console.log('\nDone! Snapshots saved to e2e/snapshots/')
}

main().catch((e) => {
  console.error('Capture failed:', e)
  process.exit(1)
})
