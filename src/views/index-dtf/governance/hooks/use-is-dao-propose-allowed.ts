import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useDAOVotingPower } from './use-dao-voting-power'
import { indexGovernanceOverviewAtom } from '../atoms'

export const useIsDAOProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const { votingPower, isLoading } = useDAOVotingPower()

  // For DAO governance, we need to check the stToken governance parameters
  const voteSupply = governance?.voteSupply
  const proposalThreshold = dtf?.stToken?.governance?.proposalThreshold

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
