import dtfIndexGovernance from '@/abis/dtf-index-governance'
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

  const { data: votePower } = useReadContract({
    address: proposal?.governor,
    abi: dtfIndexGovernance,
    functionName: 'getVotes',
    chainId,
    args:
      account && proposal
        ? [
            account,
            BigInt(Math.min(proposal?.voteStart - 1, getCurrentTime() - 1)),
          ]
        : undefined,
  })

  return useMemo(() => {
    if (!proposal || !votePower || !account) return undefined

    return {
      votePower: formatEther(votePower),
      vote:
        proposal.votes.find(
          (vote) => vote.voter.toLowerCase() === account.toLowerCase()
        )?.choice ?? null,
    }
  }, [proposal, votePower, account])
}

export default useVoterState
