import ERC20 from '@/abis/ERC20'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { Address, formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export const useGovernanceTokenSupply = (tokenAddress?: Address) => {
  const chainId = useAtomValue(chainIdAtom)
  const { data, isLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20,
    functionName: 'totalSupply',
    chainId,
    query: {
      enabled: !!tokenAddress && !!chainId,
    },
  })

  return {
    voteSupply: data ? +formatEther(data) : undefined,
    isLoading,
  }
}
