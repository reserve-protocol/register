import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useVotingPower } from './use-voting-power'
import { formatEther } from 'viem'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from '../governance-helpers'
import { useGovernanceTokenSupply } from './use-governance-token-supply'

export const useIsProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const { votingPower, isLoading } = useVotingPower()
  const governance = getDTFSettingsGovernance(dtf)
  const governanceTokenAddress = getGovernanceVoteTokenAddress(
    governance,
    dtf?.stToken?.id
  )
  const { voteSupply, isLoading: isVoteSupplyLoading } =
    useGovernanceTokenSupply(governanceTokenAddress)

  const proposalThreshold =
    Number(formatEther(BigInt(governance?.proposalThreshold || 0))) /
    100

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
