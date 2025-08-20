import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useReadContracts } from 'wagmi'
import { mapToAssets } from '../utils'
import { isAuctionOngoingAtom } from '../atoms'
import { useEffect } from 'react'

const useRebalanceCurrentData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)

  const result = useReadContracts({
    contracts: [
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'getRebalance',
        chainId: dtf?.chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalAssets',
        args: [],
        chainId: dtf?.chainId,
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!dtf?.id,
      select: (data) => {
        const [supply, rebalance, [assets, balances]] = data

        return {
          supply,
          rebalance,
          currentAssets: mapToAssets(assets, balances),
        }
      },
    },
  })

  useEffect(() => {
    if (isAuctionOngoing) {
      const interval = setInterval(() => {
        result.refetch()
      }, 10000) // 10 seconds

      return () => clearInterval(interval)
    }
  }, [isAuctionOngoing, result.refetch])

  return result
}

export default useRebalanceCurrentData
