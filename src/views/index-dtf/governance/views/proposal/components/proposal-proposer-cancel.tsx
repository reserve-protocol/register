import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import TransactionButton from '@/components/ui/transaction-button'
import useContractWrite from '@/hooks/useContractWrite'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import type { ProposalDetail } from '@/lib/governance'
import { walletAtom } from '@/state/atoms'
import { getProposalTitle } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { prepareIndexDtfGovernorCancelProposal } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

const ProposerCancelDialog = ({ proposal }: { proposal: ProposalDetail }) => {
  const { t } = useLingui()
  const [open, setOpen] = useState(false)
  const setProposal = useSetAtom(proposalDetailAtom)
  const refreshProposal = useRefreshProposal()
  const { trackClick } = useTrackIndexDTFClick('governance', 'proposal')
  const call = useMemo(
    () =>
      prepareIndexDtfGovernorCancelProposal({
        chainId: proposal.chainId,
        proposal: {
          governance: proposal.governor,
          targets: proposal.targets,
          calldatas: proposal.calldatas,
          description: proposal.description,
        },
      }),
    [proposal]
  )
  const { write, isLoading, hash, isReady, validationError, error } =
    useContractWrite({
      abi: call.contract.abi,
      address: call.contract.address,
      chainId: call.chainId,
      functionName: call.contract.functionName,
      args: call.contract.args,
      query: { enabled: open },
    })
  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Proposal canceled by proposer',
  })
  const busy = isLoading || isMining

  useEffect(() => {
    if (status !== 'success') return
    refreshProposal()
    setProposal((current) =>
      current?.id === proposal.id && current.governor === proposal.governor
        ? {
            ...current,
            state: PROPOSAL_STATES.CANCELED,
            votingState: {
              ...current.votingState,
              state: PROPOSAL_STATES.CANCELED,
            },
            cancellationTime: Math.floor(Date.now() / 1000).toString(),
          }
        : current
    )
  }, [proposal.governor, proposal.id, refreshProposal, setProposal, status])

  return (
    <Dialog open={open} onOpenChange={(value) => !busy && setOpen(value)}>
      <DialogTrigger asChild>
        <Button
          data-testid="proposal-proposer-cancel-btn"
          variant="outline"
          className="h-11 text-destructive border-destructive"
          onClick={() =>
            trackClick('cancel_proposal', { proposal_id: proposal.id })
          }
        >
          <Trans>Cancel proposal</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent
        data-testid="proposal-cancel-dialog"
        restrict={busy}
        className="gap-4"
      >
        <DialogTitle>
          <Trans>Cancel proposal</Trans>
        </DialogTitle>
        <DialogDescription>
          <Trans>
            Canceling this proposal is permanent. It will no longer be eligible
            for voting or execution.
          </Trans>
        </DialogDescription>
        <div className="text-sm font-medium [overflow-wrap:anywhere]">
          {getProposalTitle(proposal.description)}
        </div>
        <div className="flex flex-col gap-2">
          <TransactionButton
            data-testid="proposal-cancel-confirm-btn"
            chain={proposal.chainId}
            variant="destructive"
            className="h-11 w-full"
            text={t`Cancel proposal`}
            loading={busy}
            mining={isMining}
            disabled={!isReady || busy || status === 'success'}
            error={validationError ?? error}
            onClick={() => {
              trackClick('confirm_cancel_proposal', {
                proposal_id: proposal.id,
              })
              write()
            }}
          />
          <Button
            data-testid="proposal-cancel-dismiss-btn"
            variant="outline"
            className="h-11"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            <Trans>Keep proposal</Trans>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ProposalProposerCancel = () => {
  const account = useAtomValue(walletAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  if (
    !account ||
    !proposal ||
    account.toLowerCase() !== proposal.proposer.address.toLowerCase()
  ) {
    return null
  }
  const state = proposal.votingState.state
  const canCancel =
    state === PROPOSAL_STATES.PENDING ||
    (proposal.isOptimistic &&
      (state === PROPOSAL_STATES.ACTIVE || state === PROPOSAL_STATES.SUCCEEDED))
  if (!canCancel) return null

  return (
    <ProposerCancelDialog
      key={`${proposal.chainId}:${proposal.governor}:${proposal.id}:${account}`}
      proposal={proposal}
    />
  )
}

export default ProposalProposerCancel
