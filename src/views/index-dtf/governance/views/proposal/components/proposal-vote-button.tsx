import { Button } from '@/components/ui/button'
import { CurrentDtfVoteLock } from '@/components/vote-lock'
import { walletAtom } from '@/state/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { accountVotesAtom, proposalDetailAtom, proposalStateAtom } from '../atom'
import useDelegateState from '../hooks/use-delegate-state'
import VoteModal from './vote-modal'

const DelegateButton = () => (
  <CurrentDtfVoteLock initialTab="delegate">
    <Button className="w-full">
      <Trans>Delegate voting power for future votes</Trans>
    </Button>
  </CurrentDtfVoteLock>
)

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
          <Trans>Please connect your wallet</Trans>
        ) : vote && isOptimistic ? (
          <Trans>Challenged</Trans>
        ) : vote ? (
          <Trans>You voted "{vote}"</Trans>
        ) : noVotingPower && !isOptimistic ? (
          <Trans>No voting power</Trans>
        ) : isOptimistic ? (
          <Trans>Vote to challenge</Trans>
        ) : (
          <Trans>Vote on-chain</Trans>
        )}
      </Button>
      {isVoteVisible && <VoteModal onClose={() => setVoteVisible(false)} />}
    </>
  )
}

export default ProposalVoteButton
