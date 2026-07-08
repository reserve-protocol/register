import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useVotingPower } from './use-voting-power'
import { formatEther } from 'viem'
import { getDTFSettingsGovernance } from '../governance-helpers'
import { useReadContract } from 'wagmi'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { chainIdAtom } from '@/state/atoms'

export const useIsProposeAllowed = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { votingPowerRaw, isLoading } = useVotingPower()
  const governance = getDTFSettingsGovernance(dtf)
  const { data: proposalThreshold, isLoading: isProposalThresholdLoading } =
    useReadContract({
      address: governance?.id,
      abi: DTFIndexGovernance,
      functionName: 'proposalThreshold',
      chainId,
      query: {
        enabled: !!governance?.id && !!chainId,
      },
    })
  const formattedProposalThreshold =
    proposalThreshold !== undefined
      ? Number(formatEther(proposalThreshold))
      : undefined

  return {
    isProposeAllowed:
      !!governance?.id &&
      proposalThreshold !== undefined &&
      votingPowerRaw >= proposalThreshold,
    isLoading:
      isLoading ||
      isProposalThresholdLoading ||
      typeof formattedProposalThreshold === 'undefined',
  }
}
