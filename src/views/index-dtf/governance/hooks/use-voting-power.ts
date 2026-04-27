import { Address, formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import reserveOptimisticGovernorAbi from '@/abis/reserve-optimistic-governor'
import votesTokenAbi from '@/abis/votes-token'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from '../governance-helpers'

export const useVotingPower = () => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const governance = getDTFSettingsGovernance(dtf)
  const governanceAddress = governance?.id
  const voteTokenAddress = getGovernanceVoteTokenAddress(
    governance,
    dtf?.stToken?.id
  )

  const { data: votes, isLoading } = useReadContract({
    address: governanceAddress ?? '0x',
    functionName: 'getVotes',
    abi: dtfIndexGovernance,
    args: [account as Address, BigInt(getCurrentTime() - 12)],
    chainId,
    query: {
      enabled: !!account && !!governanceAddress && !!chainId,
    },
  })
  const { data: optimisticParams } = useReadContract({
    address: governanceAddress,
    functionName: 'optimisticParams',
    abi: reserveOptimisticGovernorAbi,
    chainId,
    query: {
      enabled: !!governanceAddress && !!chainId,
      retry: false,
    },
  })
  const isOptimisticGovernance = optimisticParams !== undefined
  const { data: optimisticVotes, isLoading: isOptimisticLoading } =
    useReadContract({
      address: voteTokenAddress,
      functionName: 'getOptimisticVotes',
      abi: votesTokenAbi,
      args: account ? [account as Address] : undefined,
      chainId,
      query: {
        enabled:
          !!account &&
          !!voteTokenAddress &&
          !!chainId &&
          isOptimisticGovernance,
      },
    })

  return {
    votingPower: votes ? +formatEther(votes) : 0,
    optimisticVotingPower: optimisticVotes ? +formatEther(optimisticVotes) : 0,
    isOptimisticGovernance,
    isLoading,
    isOptimisticLoading,
  }
}
