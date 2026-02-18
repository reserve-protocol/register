import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { mapToAssets } from '../utils'
import { FOLIO_VERSION_V5, getFolioVersion } from '../utils/transforms'

const useRebalanceInitialData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const versionString = useAtomValue(indexDTFVersionAtom)

  const folioVersion = useMemo(
    () => getFolioVersion(versionString),
    [versionString]
  )
  const abi = folioVersion === FOLIO_VERSION_V5 ? dtfIndexAbiV5 : dtfIndexAbiV4

  return useReadContracts({
    contracts: [
      {
        abi,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
        args: [],
      },

      {
        abi,
        address: dtf?.id,
        functionName: 'totalAssets',
        chainId: dtf?.chainId,
        args: [],
      },
    ],
    blockNumber: BigInt(rebalance?.proposal.creationBlock ?? '0'),
    allowFailure: false,
    query: {
      enabled: !!rebalance?.proposal.creationBlock && !!dtf?.id,
      select: (data) => {
        const [supply, assetsData] = data as [
          bigint,
          readonly [readonly `0x${string}`[], readonly bigint[]],
        ]

        const [assets, balances] = assetsData

        return {
          supply,
          initialAssets: mapToAssets(assets, balances),
        }
      },
    },
  })
}

export default useRebalanceInitialData
