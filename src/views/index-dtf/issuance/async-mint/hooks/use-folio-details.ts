import dtfIndexAbi from '@/abis/dtf-index-abi'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { parseUnits } from 'viem'
import { useReadContracts } from 'wagmi'

interface UseFolioDetailsProps {
  shares?: bigint
}

export function useFolioDetails({
  shares = parseUnits('1', 18),
}: UseFolioDetailsProps) {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!indexDTF) {
    return {
      data: {
        assets: [],
        redeemValues: [],
        mintValues: [],
      },
    }
  }

  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: dtfIndexAbi,
        address: indexDTF.id,
        functionName: 'toAssets',
        args: [shares, 0],
        chainId,
      },
      {
        abi: dtfIndexAbi,
        address: indexDTF.id,
        functionName: 'toAssets',
        args: [shares, 1],
        chainId,
      },
    ],
    query: {
      select(data) {
        return {
          assets: data[0][0],
          redeemValues: data[0][1],
          mintValues: data[1][1],
        }
      },
    },
  })
}
