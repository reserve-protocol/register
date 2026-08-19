import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { FolioVersion } from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { mapToAssets } from '../utils'
import { isAuctionOngoingAtom } from '../atoms'
import {
  extractBidsEnabledFromV5,
  FOLIO_VERSION_V5,
  getFolioVersion,
  transformV4Rebalance,
  transformV5Rebalance,
} from '../utils/transforms'

export type RebalanceCurrentData = {
  supply: bigint
  rebalance: RebalanceV4 | RebalanceV5
  currentAssets: Record<string, bigint>
  folioVersion: FolioVersion
  bidsEnabled: boolean
}

const useRebalanceCurrentData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const versionString = useAtomValue(indexDTFVersionAtom)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)

  const folioVersion = useMemo(
    () => getFolioVersion(versionString),
    [versionString]
  )
  const isV5 = folioVersion === FOLIO_VERSION_V5
  const abi = isV5 ? dtfIndexAbiV5 : dtfIndexAbiV4

  const result = useReadContracts({
    contracts: [
      {
        abi,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
      },
      {
        abi,
        address: dtf?.id,
        functionName: 'getRebalance',
        chainId: dtf?.chainId,
      },
      {
        abi,
        address: dtf?.id,
        functionName: 'totalAssets',
        args: [],
        chainId: dtf?.chainId,
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!dtf?.id,
      select: (data): RebalanceCurrentData => {
        const [supply, rebalanceRaw, assetsData] = data as unknown as [
          bigint,
          readonly unknown[],
          readonly [readonly `0x${string}`[], readonly bigint[]],
        ]

        const [assets, balances] = assetsData

        // Transform based on version
        const rebalance = isV5
          ? transformV5Rebalance(rebalanceRaw)
          : transformV4Rebalance(rebalanceRaw)

        // v5: extract from getRebalance response (index 5), v4: always enabled
        const bidsEnabled = isV5
          ? extractBidsEnabledFromV5(rebalanceRaw)
          : true

        return {
          supply,
          rebalance,
          currentAssets: mapToAssets(assets, balances),
          folioVersion,
          bidsEnabled,
        }
      },
    },
  })

  // Refetch every 10s during active auction
  useEffect(() => {
    if (isAuctionOngoing) {
      const interval = setInterval(() => {
        result.refetch()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [isAuctionOngoing, result.refetch])

  return result
}

export default useRebalanceCurrentData
