import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { mapToAssets } from '../utils'

const useRebalanceInitialData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)

  return useReadContracts({
    contracts: [
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
        args: [],
      },

      {
        abi: dtfIndexAbiV4,
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
        const [supply, [assets, balances]] = data

        return {
          supply,
          initialAssets: mapToAssets(assets, balances),
        }
      },
    },
  })
}

export default useRebalanceInitialData
