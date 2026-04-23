import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useBasketVotingPower } from './use-basket-voting-power'
import { formatEther } from 'viem'
import { getGovernanceVoteTokenAddress } from '../governance-helpers'
import { useGovernanceTokenSupply } from './use-governance-token-supply'

export const useIsBasketProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = dtf?.tradingGovernance
  const { votingPower, isLoading } = useBasketVotingPower()
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
