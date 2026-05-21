import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useBasketVotingPower } from './use-basket-voting-power'
import { indexGovernanceOverviewAtom } from '../atoms'

export const useIsBasketProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const governance = useAtomValue(indexGovernanceOverviewAtom)
  const { votingPower, isLoading } = useBasketVotingPower()

  // For basket governance, we need to check the tradingGovernance parameters
  const voteSupply = governance?.voteSupply
  const proposalThreshold =
    dtf?.tradingGovernance?.proposalThreshold === undefined
      ? undefined
      : dtf.tradingGovernance.proposalThreshold / 100

  return {
    isProposeAllowed:
      !!voteSupply &&
      proposalThreshold !== undefined &&
      votingPower / voteSupply >= proposalThreshold,
    isLoading:
      isLoading ||
      typeof voteSupply === 'undefined' ||
      typeof proposalThreshold === 'undefined',
  }
}
