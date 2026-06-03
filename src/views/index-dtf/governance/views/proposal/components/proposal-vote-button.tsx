import { Button } from '@/components/ui/button'
import { walletAtom } from '@/state/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import DelegateModal from '../../../components/delegate-modal'
import { accountVotesAtom, proposalDetailAtom, proposalStateAtom } from '../atom'
import useDelegateState from '../hooks/use-delegate-state'
import VoteModal from './vote-modal'

const DelegateButton = () => {
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { hasNoDelegates } = useDelegateState()

  return (
    <>
      <Button className="w-full" onClick={() => setDelegateVisible(true)}>
        <Trans>Delegate voting power for future votes</Trans>
      </Button>
      {isDelegateVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setDelegateVisible(false)}
        />
      )}
    </>
  )
}

const ProposalVoteButton = () => {
  const account = useAtomValue(walletAtom)
  const [isVoteVisible, setVoteVisible] = useState(false)
  const { hasUndelegatedBalance } = useDelegateState()
  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const state = useAtomValue(proposalStateAtom)
  const isOptimistic = !!proposal?.isOptimistic

  if (hasUndelegatedBalance && !isOptimistic) {
    return <DelegateButton />
  }

  const noVotingPower = votePower === '0.0' || votePower === '0'

  return (
    <>
      <Button
        disabled={
          !account ||
          !!vote ||
          state !== PROPOSAL_STATES.ACTIVE ||
          !votePower ||
          (!isOptimistic && noVotingPower)
        }
        className="w-full"
        onClick={() => setVoteVisible(true)}
      >
        {!account ? (
          'Please connect your wallet'
        ) : vote && isOptimistic ? (
          <Trans>Challenged</Trans>
        ) : vote ? (
          `You voted "${vote}"`
        ) : noVotingPower && !isOptimistic ? (
          <Trans>No voting power</Trans>
        ) : isOptimistic ? (
          <Trans>Vote to challenge</Trans>
        ) : (
          <Trans>Vote on-chain</Trans>
        )}
      </Button >
      {isVoteVisible && <VoteModal onClose={() => setVoteVisible(false)} />
      }
    </>
  )
}

export default ProposalVoteButton
