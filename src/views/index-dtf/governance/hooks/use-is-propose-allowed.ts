import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { indexGovernanceOverviewAtom } from '../atoms'
import { useVotingPower } from './use-voting-power'
import { formatEther } from 'viem'

export const useIsProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const { votingPower, isLoading } = useVotingPower()

  const voteSupply = governance?.voteSupply
  const proposalThreshold =
    Number(formatEther(BigInt(dtf?.ownerGovernance?.proposalThreshold || 0))) /
    100

  return {
    isProposeAllowed:
      !!voteSupply &&
      !!proposalThreshold &&
      votingPower / voteSupply >= proposalThreshold,
    isLoading:
      isLoading ||
      typeof voteSupply === 'undefined' ||
      typeof proposalThreshold === 'undefined',
  }
}
