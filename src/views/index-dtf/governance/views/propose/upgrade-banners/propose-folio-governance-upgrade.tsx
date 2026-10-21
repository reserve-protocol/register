import { Button } from '@/components/ui/button'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { trackClick } from '@/hooks/useTrackPage'
import { getCurrentTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import { useVoteLockUpgradeReads } from './propose-vote-lock-upgrade'
import {
  FOLIO_GOVERNANCE_UPGRADE_MESSAGE,
  buildFolioGovernanceUpgradeProposal,
  getFolioGovernanceUpgradeEligibility,
  hasLiveVoteLockUpgrade,
  nextVoteLockUpgradeDescription,
} from './vote-lock-upgrade'

const CHANGELOG_URL =
  'https://github.com/reserve-protocol/reserve-governor/releases/tag/r1.1.0'

export default function ProposeFolioGovernanceUpgrade() {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const vault = dtf?.stToken?.id as Address | undefined
  const governor = dtf?.ownerGovernance?.id as Address | undefined
  const chainId = dtf?.chainId
  const { isProposeAllowed } = useIsProposeAllowed(governor)
  const { registry, timelock, reads } = useVoteLockUpgradeReads(
    chainId,
    vault,
    governor
  )

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt, isSuccess, error: receiptError } =
    useWaitForTransactionReceipt({ hash, chainId })
  const isSubmitted =
    (!!hash && !receipt && !receiptError) || receipt?.status === 'success'

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  useEffect(() => {
    if (!isSuccess || receipt?.status !== 'success' || !governor) return

    const notify = () => {
      toast(t`Proposal created!`, {
        description: t`Governance 1.1.0 upgrade proposal created`,
        icon: '🎉',
      })
      refetch()
    }

    void handleRecentProposalReceipt({
      receipt,
      governor,
      onSuccess: notify,
      onFallback: () => setTimeout(notify, 10000),
    })
  }, [governor, handleRecentProposalReceipt, isSuccess, receipt, refetch, t])

  if (
    !dtf ||
    status !== 'active' ||
    !chainId ||
    !vault ||
    !governor ||
    !registry ||
    !timelock ||
    !isProposeAllowed ||
    !proposals ||
    !getFolioGovernanceUpgradeEligibility({
      ...reads,
      chainId,
      vault,
      ownerGovernor: governor,
      tradingGovernor: dtf.tradingGovernance?.id as Address | undefined,
    }) ||
    hasLiveVoteLockUpgrade(proposals, FOLIO_GOVERNANCE_UPGRADE_MESSAGE)
  ) {
    return null
  }

  const symbol = dtf.token.symbol

  const handlePropose = () => {
    trackClick('governance', 'propose_folio_governance_upgrade', dtf.id, symbol, chainId)
    const { governor: governorImpl, timelock: timelockImpl } =
      reads.implementations!
    writeContract(
      buildFolioGovernanceUpgradeProposal({
        chainId,
        governor,
        timelock,
        registry,
        implementations: { governor: governorImpl!, timelock: timelockImpl! },
        description: nextVoteLockUpgradeDescription(
          proposals,
          FOLIO_GOVERNANCE_UPGRADE_MESSAGE
        ),
      })
    )
  }

  return (
    <div
      data-testid="governance-folio-governance-upgrade"
      className="sm:w-[408px] p-4 rounded-3xl bg-primary/10"
    >
      <div className="flex flex-row items-center gap-2">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>{symbol} governance 1.1.0 available</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              Upgrades the {symbol} governor and timelock to release 1.1.0,
              which adds a proposal throttle and a time-weighted vote check
              against proposal spam. See the{' '}
              <a
                className="text-primary underline"
                href={CHANGELOG_URL}
                target="_blank"
                rel="noreferrer"
              >
                changelog
              </a>{' '}
              for details.
            </Trans>
          </p>
        </div>
      </div>
      <Button
        data-testid="governance-folio-governance-upgrade-btn"
        disabled={isPending || isSubmitted}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose ${symbol} upgrade`}
      </Button>
    </div>
  )
}
