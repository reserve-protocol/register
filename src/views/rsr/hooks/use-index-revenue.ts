import { useQuery } from '@tanstack/react-query'
import { gql, GraphQLClient } from 'graphql-request'
import { ChainId } from '@/utils/chains'
import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import useIndexDTFList from '@/hooks/use-index-dtf-list'

// Optimized query - only fetch what we need
const indexDTFRevenueQuery = gql`
  query GetIndexDTFRevenue {
    dtfs(first: 100, where: { totalRevenue_gt: "0" }) {
      id
      protocolRevenue
      governanceRevenue
      externalRevenue
      token {
        decimals
      }
    }
  }
`

interface IndexRevenueMetrics {
  totalRevenue: number
  governanceRevenue: number
  deployerRevenue: number
  externalRevenue: number
  governancePercentage: number
  deployerPercentage: number
  externalPercentage: number
  dtfCount: number
  totalTVL: number
}

export const useIndexRevenue = () => {
  const { data: indexDTFs, isLoading: loadingDTFs } = useIndexDTFList()

  return useQuery({
    queryKey: ['index-dtf-revenue'],
    queryFn: async (): Promise<IndexRevenueMetrics> => {
      const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]

      // Parallel fetch from all chains
      const results = await Promise.allSettled(
        chains.map(async (chainId) => {
          const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
          return client.request(indexDTFRevenueQuery)
        })
      )

      // Process only successful responses
      const validResults = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)

      // Create price map from indexDTFs
      const priceMap: Record<string, number> = {}
      let totalTVL = 0

      if (indexDTFs) {
        indexDTFs.forEach((dtf) => {
          priceMap[dtf.address.toLowerCase()] = dtf.price || 0
          totalTVL += dtf.marketCap || 0
        })
      }

      // Aggregate revenue data
      let totalGovernanceRevenue = 0
      let totalDeployerRevenue = 0
      let totalExternalRevenue = 0
      let dtfCount = 0

      validResults.forEach((data: any) => {
        if (data?.dtfs) {
          data.dtfs.forEach((dtf: any) => {
            const price = priceMap[dtf.id.toLowerCase()] || 0
            const decimals = dtf.token?.decimals || 18
            const divisor = Math.pow(10, decimals)

            totalGovernanceRevenue += (Number(dtf.governanceRevenue || 0) / divisor) * price
            totalDeployerRevenue += (Number(dtf.protocolRevenue || 0) / divisor) * price
            totalExternalRevenue += (Number(dtf.externalRevenue || 0) / divisor) * price
            dtfCount++
          })
        }
      })

      const totalRevenue = totalGovernanceRevenue + totalDeployerRevenue + totalExternalRevenue

      return {
        totalRevenue,
        governanceRevenue: totalGovernanceRevenue,
        deployerRevenue: totalDeployerRevenue,
        externalRevenue: totalExternalRevenue,
        governancePercentage: totalRevenue > 0 ? (totalGovernanceRevenue / totalRevenue) * 100 : 0,
        deployerPercentage: totalRevenue > 0 ? (totalDeployerRevenue / totalRevenue) * 100 : 0,
        externalPercentage: totalRevenue > 0 ? (totalExternalRevenue / totalRevenue) * 100 : 0,
        dtfCount,
        totalTVL,
      }
    },
    enabled: !!indexDTFs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  })
}