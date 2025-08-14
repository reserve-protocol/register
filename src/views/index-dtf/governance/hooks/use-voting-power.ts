import { Address, formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'

export const useVotingPower = () => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: votes, isLoading } = useReadContract({
    address: dtf?.ownerGovernance?.id ?? '0x',
    functionName: 'getVotes',
    abi: dtfIndexGovernance,
    args: [account as Address, BigInt(getCurrentTime() - 12)],
    chainId,
    query: {
      enabled: !!account && !!dtf?.stToken?.id && !!chainId,
    },
  })

  return { votingPower: votes ? +formatEther(votes) : 0, isLoading }
}
