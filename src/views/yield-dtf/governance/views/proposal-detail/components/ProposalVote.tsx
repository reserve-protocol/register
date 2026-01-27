import { Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import { Button } from '@/components/ui/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { chainIdAtom, stRsrBalanceAtom, walletAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, zeroAddress } from 'viem'
import DelegateModal from '@/views/yield-dtf/governance/components/DelegateModal'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import useProposalDetail from '../useProposalDetail'
import ProposalCancel from './ProposalCancel'
import ProposalExecute from './ProposalExecute'
import ProposalQueue from './ProposalQueue'
import ProposalAlert from './ProposalAlert'
import VoteModal from './VoteModal'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import DelegateIcon from 'components/icons/DelegateIcon'
import { useReadContract } from 'wagmi'
import { cn } from '@/lib/utils'

const ViewExecuteTxButton = () => {
  const { proposalId } = useParams()
  const chainId = useAtomValue(chainIdAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')

  if (!proposal?.executionTxnHash) return null

  return (
    <Button
      variant="outline"
      className="flex items-center justify-center border-2"
      onClick={() =>
        window.open(
          getExplorerLink(
            proposal.executionTxnHash,
            chainId,
            ExplorerDataType.TRANSACTION
          ),
          '_blank'
        )
      }
    >
      <span className="mr-2">View execute tx</span>
      <ExternalArrowIcon />
    </Button>
  )
}

const FINAL_STATES = [
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.EXPIRED,
  PROPOSAL_STATES.CANCELED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
  PROPOSAL_STATES.SUCCEEDED,
]

const STATES_WITH_ACTIONS = [
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.EXECUTED,
]

interface ProposalVoteProps {
  className?: string
}

// TODO: Validate voting power first?
const ProposalVote = ({ className }: ProposalVoteProps) => {
  const account = useAtomValue(walletAtom)
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  const [isVoteVisible, setVoteVisible] = useState(false)
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const { balance } = useAtomValue(stRsrBalanceAtom)

  const { data: delegate } = useReadContract({
    address: account ? (rToken?.stToken?.address as Address) : undefined,
    abi: StRSRVotes,
    functionName: 'delegates',
    chainId,
    args: account ? [account as Address] : undefined,
  })

  const hasNoDelegates = !delegate || delegate === zeroAddress

  const hasUndelegatedBalance =
    !!account &&
    votePower &&
    !Number(votePower) &&
    !!Number(balance) &&
    hasNoDelegates

  return (
    <div
      className={cn(
        'flex flex-col text-center h-full justify-between p-2 gap-2 border rounded-xl border-secondary',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col h-full rounded-lg',
          STATES_WITH_ACTIONS.includes(state) && 'border border-secondary',
          !FINAL_STATES.includes(state) && 'bg-muted'
        )}
      >
        {!FINAL_STATES.includes(state) && (
          <div className="flex items-center gap-2 p-3 justify-between text-xs flex-wrap border-b border-secondary">
            <div className="flex items-center gap-1">
              <AsteriskIcon />
              <span>Your voting power:</span>
              <span className="font-bold">
                {formatCurrency(votePower ? +votePower : 0)}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1',
                hasUndelegatedBalance
                  ? 'text-primary cursor-pointer'
                  : 'text-muted-foreground cursor-default'
              )}
              onClick={() => hasUndelegatedBalance && setDelegateVisible(true)}
            >
              <DelegateIcon />
              <span className="font-bold">Delegate</span>
            </div>
          </div>
        )}
        <div className="flex-grow p-3">
          <ProposalAlert />
        </div>
      </div>
      {(state === PROPOSAL_STATES.PENDING ||
        state === PROPOSAL_STATES.ACTIVE) && (
        <div>
          {hasUndelegatedBalance ? (
            <Button
              className="w-full"
              onClick={() => setDelegateVisible(true)}
            >
              <Trans>Delegate voting power for future votes</Trans>
            </Button>
          ) : (
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
          )}
        </div>
      )}
      {state === PROPOSAL_STATES.EXECUTED && <ViewExecuteTxButton />}
      {state === PROPOSAL_STATES.SUCCEEDED && <ProposalQueue />}
      {state === PROPOSAL_STATES.QUEUED && (
        <div className="flex flex-col gap-1">
          <ProposalCancel />
          <ProposalExecute />
        </div>
      )}
      {isVoteVisible && <VoteModal onClose={() => setVoteVisible(false)} />}
      {isDelegateVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setDelegateVisible(false)}
        />
      )}
    </div>
  )
}

export default ProposalVote
