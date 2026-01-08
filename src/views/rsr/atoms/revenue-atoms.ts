import { gql } from 'graphql-request'
import { atomWithLoadable } from '@/utils/atoms/utils'
import { PROTOCOL_SLUG, supportedChainList } from '@/utils/constants'
import { ChainId } from '@/utils/chains'
import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { rsrPriceAtom } from '@/state/atoms'
import { atom } from 'jotai'

// Query for Yield DTF revenue
export const yieldDTFRevenueQuery = gql`
  query GetYieldDTFRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      totalRTokenUSD
      rsrStakedUSD
    }
  }
`

// Query for Index DTF revenue - fetches all DTFs with their revenue
export const indexDTFRevenueQuery = gql`
  query GetIndexDTFRevenue {
    dtfs(first: 1000) {
      id
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      feeRecipients
      token {
        symbol
        totalSupply
        decimals
      }
    }
  }
`

// Query for Index DTF token prices
export const indexDTFTokenPricesQuery = gql`
  query GetTokenPrices($ids: [String!]!) {
    tokens(where: { id_in: $ids }) {
      id
      symbol
      dailySnapshots(first: 1, orderBy: timestamp, orderDirection: desc) {
        priceUSD
      }
    }
  }
`

// Atom to fetch and aggregate Yield DTF revenue across all chains
export const yieldDTFRevenueAtom = atomWithLoadable(async (get) => {
  const rsrPrice = get(rsrPriceAtom) || 0

  try {
    // Fetch from all supported chains for Yield DTFs
    const chains = [ChainId.Mainnet, ChainId.Base, ChainId.Arbitrum]
    const results = await Promise.all(
      chains.map(async (chainId) => {
        // This would use the regular subgraph client
        // For now, returning mock structure
        return {
          holdersRevenueUSD: 0,
          stakersRevenueUSD: 0,
          stakersRevenueRSR: 0,
        }
      })
    )

    // Aggregate results
    const aggregated = results.reduce(
      (acc, curr) => ({
        holdersRevenueUSD: acc.holdersRevenueUSD + curr.holdersRevenueUSD,
        stakersRevenueUSD: acc.stakersRevenueUSD + curr.stakersRevenueUSD,
        stakersRevenueRSR: acc.stakersRevenueRSR + curr.stakersRevenueRSR,
      }),
      { holdersRevenueUSD: 0, stakersRevenueUSD: 0, stakersRevenueRSR: 0 }
    )

    const totalRevenue = aggregated.holdersRevenueUSD + aggregated.stakersRevenueUSD

    return {
      ...aggregated,
      totalRevenue,
      holdersPercentage: totalRevenue > 0 ? (aggregated.holdersRevenueUSD / totalRevenue) * 100 : 0,
      stakersPercentage: totalRevenue > 0 ? (aggregated.stakersRevenueUSD / totalRevenue) * 100 : 0,
    }
  } catch (error) {
    console.error('Error fetching Yield DTF revenue:', error)
    return {
      holdersRevenueUSD: 0,
      stakersRevenueUSD: 0,
      stakersRevenueRSR: 0,
      totalRevenue: 0,
      holdersPercentage: 0,
      stakersPercentage: 0,
    }
  }
})

// Atom to fetch and aggregate Index DTF revenue
export const indexDTFRevenueAtom = atomWithLoadable(async (get) => {
  try {
    // Fetch from Index DTF chains (no Arbitrum)
    const chains = [ChainId.Mainnet, ChainId.Base]

    const results = await Promise.all(
      chains.map(async (chainId) => {
        const client = INDEX_GRAPH_CLIENTS[chainId]

        // Fetch all DTFs and their revenue
        const dtfsData: any = await client.request(indexDTFRevenueQuery)

        if (!dtfsData?.dtfs || dtfsData.dtfs.length === 0) {
          return { governance: 0, deployer: 0, external: 0, tokenAddresses: [] }
        }

        // Get token addresses for price fetching
        const tokenAddresses = dtfsData.dtfs.map((dtf: any) => dtf.token.id || dtf.id)

        // Fetch token prices
        const pricesData: any = await client.request(indexDTFTokenPricesQuery, {
          ids: tokenAddresses,
        })

        // Create price map
        const priceMap: { [key: string]: number } = {}
        pricesData?.tokens?.forEach((token: any) => {
          const price = token.dailySnapshots?.[0]?.priceUSD
          if (price) {
            priceMap[token.id.toLowerCase()] = parseFloat(price)
          }
        })

        // Calculate revenue in USD
        let totalGovernanceRevenue = 0
        let totalDeployerRevenue = 0
        let totalExternalRevenue = 0

        dtfsData.dtfs.forEach((dtf: any) => {
          const tokenPrice = priceMap[dtf.id.toLowerCase()] || 0
          const decimals = dtf.token?.decimals || 18

          // Convert from token amounts to USD
          const governanceUSD = (Number(dtf.governanceRevenue || 0) / Math.pow(10, decimals)) * tokenPrice
          const protocolUSD = (Number(dtf.protocolRevenue || 0) / Math.pow(10, decimals)) * tokenPrice
          const externalUSD = (Number(dtf.externalRevenue || 0) / Math.pow(10, decimals)) * tokenPrice

          totalGovernanceRevenue += governanceUSD
          totalDeployerRevenue += protocolUSD
          totalExternalRevenue += externalUSD
        })

        return {
          governance: totalGovernanceRevenue,
          deployer: totalDeployerRevenue,
          external: totalExternalRevenue,
        }
      })
    )

    // Aggregate across chains
    const aggregated = results.reduce(
      (acc, curr) => ({
        governanceRevenue: acc.governanceRevenue + curr.governance,
        deployerRevenue: acc.deployerRevenue + curr.deployer,
        externalRevenue: acc.externalRevenue + curr.external,
      }),
      { governanceRevenue: 0, deployerRevenue: 0, externalRevenue: 0 }
    )

    const totalRevenue = aggregated.governanceRevenue + aggregated.deployerRevenue + aggregated.externalRevenue

    return {
      ...aggregated,
      totalRevenue,
      governancePercentage: totalRevenue > 0 ? (aggregated.governanceRevenue / totalRevenue) * 100 : 0,
      deployerPercentage: totalRevenue > 0 ? (aggregated.deployerRevenue / totalRevenue) * 100 : 0,
      externalPercentage: totalRevenue > 0 ? (aggregated.externalRevenue / totalRevenue) * 100 : 0,
    }
  } catch (error) {
    console.error('Error fetching Index DTF revenue:', error)
    return {
      governanceRevenue: 0,
      deployerRevenue: 0,
      externalRevenue: 0,
      totalRevenue: 0,
      governancePercentage: 0,
      deployerPercentage: 0,
      externalPercentage: 0,
    }
  }
})

// Combined revenue atom
export const combinedRevenueAtom = atom((get) => {
  const yieldRevenue = get(yieldDTFRevenueAtom)
  const indexRevenue = get(indexDTFRevenueAtom)

  // Check if both have data
  const hasYieldData = yieldRevenue && typeof yieldRevenue === 'object' && 'totalRevenue' in yieldRevenue
  const hasIndexData = indexRevenue && typeof indexRevenue === 'object' && 'totalRevenue' in indexRevenue

  if (!hasYieldData || !hasIndexData) {
    return {
      totalRevenue: 0,
      yieldRevenue: 0,
      indexRevenue: 0,
      yieldPercentage: 0,
      indexPercentage: 0,
      breakdown: {
        yieldHolders: 0,
        yieldStakers: 0,
        indexGovernance: 0,
        indexDeployer: 0,
        indexExternal: 0,
      }
    }
  }

  const yieldTotal = yieldRevenue.totalRevenue || 0
  const indexTotal = indexRevenue.totalRevenue || 0
  const combined = yieldTotal + indexTotal

  return {
    totalRevenue: combined,
    yieldRevenue: yieldTotal,
    indexRevenue: indexTotal,
    yieldPercentage: combined > 0 ? (yieldTotal / combined) * 100 : 0,
    indexPercentage: combined > 0 ? (indexTotal / combined) * 100 : 0,
    breakdown: {
      yieldHolders: yieldRevenue.holdersRevenueUSD || 0,
      yieldStakers: yieldRevenue.stakersRevenueUSD || 0,
      indexGovernance: indexRevenue.governanceRevenue || 0,
      indexDeployer: indexRevenue.deployerRevenue || 0,
      indexExternal: indexRevenue.externalRevenue || 0,
    }
  }
})