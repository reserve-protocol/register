import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { indexGovernanceOverviewAtom } from '../atoms'
import { useVotingPower } from './use-voting-power'

export const useIsProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const { votingPower, isLoading } = useVotingPower()

  const voteSupply = governance?.voteSupply
  const proposalThreshold =
    (dtf?.ownerGovernance?.proposalThreshold || 0) /
    (dtf?.ownerGovernance?.quorumDenominator || 1) /
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
