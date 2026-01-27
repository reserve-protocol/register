import { t, Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { Modal } from 'components'
import GoTo from '@/components/ui/go-to'
import TransactionButton from '@/components/ui/transaction-button'
import { ModalProps } from 'components'
import useContractWrite from 'hooks/useContractWrite'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import {
  CheckCircle,
  ExternalLink,
  Slash,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { chainIdAtom, rTokenGovernanceAtom } from 'state/atoms'
import { getProposalTitle, shortenAddress } from 'utils'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from 'utils/getExplorerLink'
import { proposalDetailAtom } from '../atom'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

export const VOTE_TYPE = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
}

const VoteModal = (props: ModalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const [vote, setVote] = useState(-1)
  const proposal = useAtomValue(proposalDetailAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const isValid = governance.governor && proposal?.id && vote !== -1

  const { hash, isLoading, isReady, write } = useContractWrite(
    isValid
      ? {
          address: governance.governor,
          functionName: 'castVote',
          abi: Governance,
          args: [BigInt(proposal.id), vote],
        }
      : undefined
  )

  const voteOptions = [
    { label: t`For`, value: VOTE_TYPE.FOR },
    { label: t`Against`, value: VOTE_TYPE.AGAINST },
    { label: t`Abstain`, value: VOTE_TYPE.ABSTAIN },
  ]

  // TODO: Signed modal should be its own component
  // TODO: reused on other modals
  if (hash) {
    return (
      <Modal {...props}>
        <div className="flex flex-col items-center justify-center p-6">
          <CheckCircle size={36} />
          <br />
          <span>Transactions signed!</span>
          <br />
          <a
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
            target="_blank"
            rel="noreferrer"
            className="text-xs"
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
          <span className="ml-1">{shortenAddress(proposal?.proposer || '')}</span>
          <GoTo
            className="ml-2"
            href={getExplorerLink(
              proposal?.proposer ?? '',
              chainId,
              ExplorerDataType.ADDRESS
            )}
          />
        </div>
      </div>
      <Separator className="my-6 -mx-6 w-auto" />
      {voteOptions.map((option, index) => (
        <div
          className={`flex items-center ${index ? 'mt-2' : ''}`}
          key={option.value}
        >
          {option.value === VOTE_TYPE.FOR && <ThumbsUp size={16} />}
          {option.value === VOTE_TYPE.AGAINST && <ThumbsDown size={16} />}
          {option.value === VOTE_TYPE.ABSTAIN && <Slash size={16} />}
          <span className="font-semibold ml-2">{option.label}</span>
          <label className="ml-auto cursor-pointer">
            <Checkbox
              checked={vote === option.value}
              onCheckedChange={() => setVote(option.value)}
            />
          </label>
        </div>
      ))}

      <Separator className="my-6 -mx-6 w-auto" />
      <TransactionButton
        loading={isLoading}
        variant={!!hash ? 'accent' : 'default'}
        text={t`Vote`}
        className="w-full"
        onClick={write}
        disabled={!isReady}
      />
    </Modal>
  )
}

export default VoteModal
