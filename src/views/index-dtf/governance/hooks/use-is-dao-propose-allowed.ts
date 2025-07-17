import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useDAOVotingPower } from './use-dao-voting-power'

export const useIsDAOProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const { votingPower, isLoading } = useDAOVotingPower()

  // For DAO governance, we need to check the stToken governance parameters
  const voteSupply = dtf?.stToken?.voteSupply
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