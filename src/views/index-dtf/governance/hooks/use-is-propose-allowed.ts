import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useVotingPower } from './use-voting-power'
import { indexGovernanceOverviewAtom } from '../atoms'

export const useIsProposeAllowed = (): boolean | undefined => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const votingPower = useVotingPower()

  const voteSupply = governance?.voteSupply
  const proposalThreshold = dtf?.ownerGovernance?.proposalThreshold

  return (
    !!voteSupply &&
    !!proposalThreshold &&
    votingPower / voteSupply >= proposalThreshold / 1e18
  )
}
