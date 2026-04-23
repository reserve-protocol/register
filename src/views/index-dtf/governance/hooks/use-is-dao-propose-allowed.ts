import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useDAOVotingPower } from './use-dao-voting-power'
import { formatEther } from 'viem'
import { getGovernanceVoteTokenAddress } from '../governance-helpers'
import { useGovernanceTokenSupply } from './use-governance-token-supply'

export const useIsDAOProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = dtf?.stToken?.governance
  const { votingPower, isLoading } = useDAOVotingPower()
  const governanceTokenAddress = getGovernanceVoteTokenAddress(
    governance,
    dtf?.stToken?.id
  )
  const { voteSupply, isLoading: isVoteSupplyLoading } =
    useGovernanceTokenSupply(governanceTokenAddress)

  const proposalThreshold =
    Number(
      formatEther(BigInt(governance?.proposalThreshold || 0))
    ) / 100

  return {
    isProposeAllowed:
      !!voteSupply &&
      !!proposalThreshold &&
      votingPower / voteSupply >= proposalThreshold,
    isLoading:
      isLoading ||
      isVoteSupplyLoading ||
      typeof voteSupply === 'undefined' ||
      typeof proposalThreshold === 'undefined',
  }
}
