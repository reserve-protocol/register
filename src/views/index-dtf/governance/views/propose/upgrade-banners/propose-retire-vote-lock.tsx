import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { trackClick } from '@/hooks/useTrackPage'
import { chainIdAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { buildRetireProposal } from './migration-proposals'
import { useRetirableVoteLock } from './use-retirable-vote-lock'
import type { OldVoteLock } from '@/views/index-dtf/components/vote-lock-migration/governance-migration'

type RetireBannerProps = {
  voteLock: Required<OldVoteLock>
  spell: Address
  // True when holders move to the chain's shared vlRSR rather than a DTF's own vault.
  shared: boolean
  pending: readonly { symbol: string }[]
  description: string
  refetch: () => void
}

const RetireBanner = ({
  voteLock,
  spell,
  shared,
  pending,
  description,
  refetch,
}: RetireBannerProps) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const {
    data: receipt,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash, chainId })
  const isConfirming = !!hash && !receipt && !receiptError
  const isSubmitted = isConfirming || receipt?.status === 'success'
  const isBlocked = pending.length > 0

  const handlePropose = () => {
    if (!spell || isBlocked) return

    trackClick('governance', 'propose_retire_vote_lock', voteLock.address, undefined, chainId)
    writeContract(
      buildRetireProposal({
        chainId,
        governor: voteLock.governance,
        voteLock: voteLock.address,
        spell,
        description,
      })
    )
  }

  useEffect(() => {
    if (!isSuccess || receipt?.status !== 'success') return

    const notify = () => {
      toast(t`Proposal created!`, {
        description: t`Legacy vote-lock vault retirement proposal created`,
        icon: '🎉',
      })
      refetch()
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: voteLock.governance,
      onSuccess: notify,
      onFallback: () => setTimeout(notify, 10000),
    })
  }, [
    handleRecentProposalReceipt,
    isSuccess,
    receipt,
    refetch,
    t,
    voteLock.governance,
  ])

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>Retire the legacy vote-lock vault</Trans>
          </h4>
          <p className="text-sm">
            {shared ? (
              <Trans>
                Sets the old vault's unstaking delay to zero so voters can move
                their RSR to the shared vlRSR vault right away.
              </Trans>
            ) : (
              <Trans>
                Sets the old vault's unstaking delay to zero so voters can move
                to the new vote-lock vault right away.
              </Trans>
            )}
          </p>
        </div>
      </div>
      {isBlocked && (
        <Alert
          variant="warning"
          data-testid="governance-retire-vote-lock-pending"
          className="mt-3 rounded-2xl text-sm"
        >
          <TriangleAlert size={16} />
          <AlertDescription>
            <Trans>
              Still governed by this vault:{' '}
              {pending.map(({ symbol }) => symbol).join(', ')}. Each must pass
              its governance upgrade before the vault can be retired.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      <Button
        data-testid="governance-retire-vote-lock-btn"
        disabled={isBlocked || isPending || isSubmitted}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose vault retirement`}
      </Button>
    </div>
  )
}

export default function ProposeRetireVoteLock() {
  const proposals = useAtomValue(governanceProposalsAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  const retire = useRetirableVoteLock()

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  if (!retire || !proposals || !retire.isProposeAllowed || retire.isLive) return null
  // The spell does not check dependents, so the retirement is proposed only after this DTF's upgrade executes.
  if (retire.selfPending) return null

  return (
    <RetireBanner
      voteLock={retire.voteLock}
      spell={retire.spell}
      shared={retire.shared}
      pending={retire.othersPending}
      description={retire.description}
      refetch={refetch}
    />
  )
}
