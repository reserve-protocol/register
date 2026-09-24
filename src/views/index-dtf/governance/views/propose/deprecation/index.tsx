import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import TransactionButton from '@/components/ui/transaction-button'
import {
  indexDTFAtom,
  indexDTFStatusAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  prepareIndexDtfSubmitProposal,
  type IndexDtfData,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { buildDeprecationCalls, canDeprecate } from './proposal'

export default function ProposeDeprecation() {
  const dtf = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  if (!dtf || !proposals || status !== 'active' || !canDeprecate(dtf, version))
    return null

  const title = `Deprecate ${dtf.token.symbol} Index DTF`
  const previous = proposals.filter(
    (p) =>
      p.governance.toLowerCase() === dtf.ownerGovernance!.id.toLowerCase() &&
      (p.description === title || p.description.startsWith(`${title} #`))
  )
  if (
    previous.some((p) =>
      [
        PROPOSAL_STATES.PENDING,
        PROPOSAL_STATES.ACTIVE,
        PROPOSAL_STATES.SUCCEEDED,
        PROPOSAL_STATES.QUEUED,
        PROPOSAL_STATES.EXECUTED,
      ].includes(p.votingState.state)
    )
  )
    return null
  const nonce =
    previous.reduce(
      (max, p) =>
        Math.max(max, Number(p.description.slice(title.length + 2)) || 1),
      0
    ) + 1

  return (
    <DeprecationDialog
      key={dtf.id}
      dtf={dtf}
      description={`${title} #${nonce}`}
    />
  )
}

function DeprecationDialog({
  dtf,
  description,
}: {
  dtf: IndexDtfData
  description: string
}) {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { trackClick } = useTrackIndexDTFClick('governance', 'propose')
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()
  const handleReceipt = useRecentProposalReceipt()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    chainId: dtf.chainId,
  })
  const isConfirming = !!hash && !receipt && !receiptError
  const isSubmitted = receipt?.status === 'success'
  const governor = dtf.ownerGovernance!

  useEffect(() => {
    if (receipt?.status !== 'success') return
    void handleReceipt({
      receipt,
      governor: governor.id,
      onFallback: () => navigate('../governance'),
    })
  }, [receipt, governor.id, handleReceipt, navigate])

  const submit = () => {
    if (!isProposeAllowed || isPending || isConfirming || isSubmitted) return
    const call = prepareIndexDtfSubmitProposal({
      chainId: dtf.chainId,
      proposal: {
        governance: governor.id,
        ...buildDeprecationCalls(
          dtf.id,
          dtf.auctionApprovers,
          dtf.auctionLaunchers,
          governor.timelock.id
        ),
        description,
      },
    })
    trackClick('propose_deprecation')
    writeContract({ ...call.contract, chainId: call.chainId })
  }

  const roles = [
    { label: t`Rebalance managers`, accounts: dtf.auctionApprovers },
    { label: t`Auction launchers`, accounts: dtf.auctionLaunchers },
    { label: t`Admin`, accounts: [governor.timelock.id] },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          data-testid="deprecation-open"
          variant="outline"
          onClick={() => trackClick('review_deprecation')}
        >
          <Trans>Propose deprecation</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent
        data-testid="deprecation-dialog"
        className="max-h-[85vh] overflow-y-auto"
      >
        <DialogTitle>
          <Trans>Deprecate {dtf.token.symbol}</Trans>
        </DialogTitle>
        <DialogDescription>
          <Trans>
            If approved and executed, this permanently disables minting and
            revokes the roles below. Redemptions remain available.
          </Trans>
        </DialogDescription>
        <div className="space-y-3 my-3">
          {roles.map(({ label, accounts }) => (
            <div key={label}>
              <h4 className="text-sm font-semibold">{label}</h4>
              {accounts.map((account) => (
                <p
                  key={account}
                  className="text-xs font-mono break-all text-muted-foreground"
                >
                  {account}
                </p>
              ))}
            </div>
          ))}
        </div>
        <TransactionButton
          data-testid="deprecation-submit"
          className="w-full"
          chain={dtf.chainId}
          text={
            isLoading
              ? t`Checking voting power...`
              : !isProposeAllowed
                ? t`Not enough voting power`
                : isSubmitted
                  ? t`Proposal created!`
                  : t`Submit proposal onchain`
          }
          loading={isPending}
          loadingText={t`Pending, sign in wallet...`}
          mining={isConfirming}
          disabled={!isProposeAllowed || isSubmitted}
          error={
            error ||
            receiptError ||
            (receipt?.status === 'reverted'
              ? new Error(t`Transaction reverted. Please try again.`)
              : undefined)
          }
          onClick={submit}
        />
      </DialogContent>
    </Dialog>
  )
}
