import { walletAtom } from '@/state/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import {
  useIndexDtfIdentity,
  useIndexDtfProposalVoterState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { proposalDetailAtom } from '../atom'

const useVoterState = () => {
  const { chainId } = useIndexDtfIdentity()
  const account = useAtomValue(walletAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const hasOptimisticContext =
    proposal?.isOptimistic !== true || !!proposal.optimistic
  const canReadVoterState =
    proposal?.votingState.state === PROPOSAL_STATES.ACTIVE &&
    hasOptimisticContext

  const params =
    account && proposal && canReadVoterState
      ? {
          chainId,
          governance: proposal.governor,
          account,
          proposal: {
            id: proposal.id,
            voteStart: proposal.voteStart,
            voteToken: proposal.voteToken,
            votes: proposal.votes,
            ...(proposal.isOptimistic === undefined
              ? {}
              : { isOptimistic: proposal.isOptimistic }),
            ...(proposal.optimistic ? { optimistic: proposal.optimistic } : {}),
          },
        }
      : undefined

  const { data: voterState } = useIndexDtfProposalVoterState(params, {
    refetchInterval: 1000 * 60,
  })

  return useMemo(() => {
    if (!proposal || !account || !voterState) return undefined

    return {
      votePower: voterState.votingPower.formatted,
      vote: voterState.vote,
    }
  }, [proposal, voterState, account])
}

export default useVoterState
