import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useVotingPower } from './use-voting-power'
import { indexGovernanceOverviewAtom } from '../atoms'

export const useIsProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const { votingPower, isLoading } = useVotingPower()

  const voteSupply = governance?.voteSupply
  const proposalThreshold = dtf?.ownerGovernance?.proposalThreshold

  return {
    isProposeAllowed:
      !!voteSupply &&
      !!proposalThreshold &&
      votingPower / voteSupply >= proposalThreshold / 1e20,
    isLoading:
      isLoading ||
      typeof voteSupply === 'undefined' ||
      typeof proposalThreshold === 'undefined',
  }
}
