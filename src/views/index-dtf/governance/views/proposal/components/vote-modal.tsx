import GoTo from '@/components/ui/go-to'
import TransactionButton from '@/components/ui/transaction-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ModalProps } from 'components'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { t, Trans } from '@lingui/macro'
import { useIndexDtfVoteCall } from '@reserve-protocol/react-sdk'
import { Modal } from 'components'
import useContractWrite from 'hooks/useContractWrite'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  CheckCircle,
  ExternalLink,
  Slash,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { getProposalTitle } from 'utils'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from 'utils/getExplorerLink'
import EnsName from '@/components/utils/ens-name'
import { accountVotesAtom, proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

export const VOTE_TYPE = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
}

const VOTE_LABEL: Record<number, string> = {
  [VOTE_TYPE.AGAINST]: 'AGAINST',
  [VOTE_TYPE.FOR]: 'FOR',
  [VOTE_TYPE.ABSTAIN]: 'ABSTAIN',
}

// TODO: Move to tailwind
const VoteModal = (props: ModalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const [vote, setVote] = useState(-1)
  const proposal = useAtomValue(proposalDetailAtom)
  const isValid = proposal?.id && vote !== -1
  const refreshProposal = useRefreshProposal()
  const setAccountVotes = useSetAtom(accountVotesAtom)
  const call = useIndexDtfVoteCall(
    isValid && proposal
      ? {
          chainId: proposal.chainId,
          governance: proposal.governor,
          proposalId: proposal.id,
          support: vote as 0 | 1 | 2,
        }
      : undefined
  )

  const { hash, isLoading, isReady, write } = useContractWrite(
    call
      ? {
          address: call.contract.address,
          chainId: call.chainId,
          functionName: call.contract.functionName,
          abi: call.contract.abi,
          args: call.contract.args,
        }
      : undefined
  )

  const voteOptions = [
    { label: t`For`, value: VOTE_TYPE.FOR },
    { label: t`Against`, value: VOTE_TYPE.AGAINST },
    { label: t`Abstain`, value: VOTE_TYPE.ABSTAIN },
  ]

  const { status, isMining } = useWatchTransaction({
    hash,
    label: t`Vote`,
  })

  useEffect(() => {
    if (status === 'success') {
      setAccountVotes((current) => ({
        ...current,
        vote: VOTE_LABEL[vote] ?? current.vote,
      }))
      refreshProposal()
    }
  }, [refreshProposal, setAccountVotes, status, vote])

  // TODO: Signed modal should be its own component
  // TODO: reused on other modals
  if (hash && status === 'success') {
    return (
      <Modal {...props}>
        <div className="flex flex-col items-center justify-center p-4">
          <CheckCircle size={36} />
          <br />
          <span>Transaction successful!</span>
          <br />
          <a
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
            target="_blank"
            rel="noreferrer"
            className="text-sm flex items-center gap-1"
          >
            <ExternalLink size={12} /> <Trans>View on</Trans>{' '}
            {ETHERSCAN_NAMES[chainId]}
          </a>
        </div>
      </Modal>
    )
  }

  return (
    <Modal {...props} title={t`Voting`} style={{ maxWidth: 420 }}>
      <div className="flex flex-col items-center">
        <span className="text-xl font-medium">
          "
          {proposal?.description
            ? getProposalTitle(proposal.description)
            : 'Loading...'}
        </span>
        <div className="flex items-center mt-2">
          <span className="text-legend">
            <Trans>Proposed by</Trans>:
          </span>
          <span className="ml-1">
            <EnsName address={proposal?.proposer?.address ?? ''} />
          </span>
          <GoTo
            className="ml-2"
            href={getExplorerLink(
              proposal?.proposer?.address ?? '',
              chainId,
              ExplorerDataType.ADDRESS
            )}
          />
        </div>
      </div>
      <Separator className="my-4 -mx-4 w-[calc(100%+2rem)]" />
      {voteOptions.map((option, index) => (
        <div
          className={`flex items-center ${index ? 'mt-2' : ''}`}
          key={option.value}
        >
          {option.value === VOTE_TYPE.FOR && <ThumbsUp size={16} />}
          {option.value === VOTE_TYPE.AGAINST && <ThumbsDown size={16} />}
          {option.value === VOTE_TYPE.ABSTAIN && <Slash size={16} />}
          <span className="font-semibold ml-2">
            {option.label}
          </span>
          <label className="ml-auto cursor-pointer">
            <Checkbox
              checked={vote === option.value}
              onCheckedChange={() => setVote(option.value)}
              disabled={isLoading || isMining}
            />
          </label>
        </div>
      ))}

      <Separator className="my-4 -mx-4 w-[calc(100%+2rem)]" />
      <TransactionButton
        loading={isLoading || isMining}
        variant={!!hash ? 'accent' : 'default'}
        text={t`Vote`}
        loadingText={isMining ? t`Confirming...` : undefined}
        className="w-full"
        onClick={write}
        disabled={!isReady || isLoading || isMining}
      />
    </Modal>
  )
}

export default VoteModal
