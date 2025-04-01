import { Button } from '@/components/ui/button'
import { walletAtom } from '@/state/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import DelegateModal from '../../../components/delegate-modal'
import { accountVotesAtom, proposalStateAtom } from '../atom'
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
  const state = useAtomValue(proposalStateAtom)

  if (hasUndelegatedBalance) {
    return <DelegateButton />
  }

  return (
    <>
      <Button
        disabled={
          !account ||
          !!vote ||
          state !== PROPOSAL_STATES.ACTIVE ||
          !votePower ||
          votePower === '0.0'
        }
        className="w-full"
        onClick={() => setVoteVisible(true)}
      >
        {!account ? (
          'Please connect your wallet'
        ) : vote ? (
          `You voted "${vote}"`
        ) : (
          <Trans>Vote on-chain</Trans>
        )}
      </Button>

      {isVoteVisible && <VoteModal onClose={() => setVoteVisible(false)} />}
    </>
  )
}

export default ProposalVoteButton
