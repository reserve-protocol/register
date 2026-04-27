import dtfIndexGovernance from '@/abis/dtf-index-governance'
import votesTokenAbi from '@/abis/votes-token'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { proposalDetailAtom } from '../atom'

const useVoterState = () => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const standardSnapshot = proposal
    ? BigInt(Math.min(proposal.voteStart - 1, getCurrentTime() - 1))
    : undefined
  const optimisticSnapshot = proposal
    ? BigInt(
        getCurrentTime() > proposal.voteStart
          ? proposal.voteStart
          : getCurrentTime() - 1
      )
    : undefined

  const { data: standardVotePower } = useReadContract({
    address: proposal?.governor,
    abi: dtfIndexGovernance,
    functionName: 'getVotes',
    chainId,
    args: account && standardSnapshot ? [account, standardSnapshot] : undefined,
    query: {
      enabled:
        !!account &&
        !!proposal?.governor &&
        proposal.isOptimistic === false &&
        !!standardSnapshot,
    },
  })

  const { data: optimisticVotePower } = useReadContract({
    address: proposal?.voteToken,
    abi: votesTokenAbi,
    functionName: 'getPastOptimisticVotes',
    chainId,
    args:
      account && optimisticSnapshot ? [account, optimisticSnapshot] : undefined,
    query: {
      enabled:
        !!account &&
        !!proposal?.voteToken &&
        proposal.isOptimistic === true &&
        !!optimisticSnapshot,
    },
  })

  return useMemo(() => {
    const votePower = proposal?.isOptimistic
      ? optimisticVotePower
      : standardVotePower

    if (
      !proposal ||
      proposal.isOptimistic === undefined ||
      votePower === undefined ||
      !account
    ) {
      return undefined
    }

    return {
      votePower: formatEther(votePower),
      vote:
        proposal.votes.find(
          (vote) => vote.voter.toLowerCase() === account.toLowerCase()
        )?.choice ?? null,
    }
  }, [proposal, standardVotePower, optimisticVotePower, account])
}

export default useVoterState
