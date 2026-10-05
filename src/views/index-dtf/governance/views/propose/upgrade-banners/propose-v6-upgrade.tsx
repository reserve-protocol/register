import dtfAdminAbi from '@/abis/dtf-admin-abi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { isGovernanceMigrationPending } from '@/views/index-dtf/components/vote-lock-migration/governance-migration'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  INDEX_DTF_UPGRADE_SPELL_6_0_0_ADDRESS,
  useIndexDtfVersionDeployment,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'
import {
  buildV6UpgradeProposal,
  getV6UpgradeEligibility,
  hasLiveV6Upgrade,
  nextV6UpgradeDescription,
} from './v6-upgrade'

// Folio 6.0's MIN_AUCTION_LENGTH: the spell reverts below it.
const MIN_V6_AUCTION_LENGTH = 120

export default function ProposeV6Upgrade() {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const proposals = useAtomValue(governanceProposalsAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)
  const { isProposeAllowed } = useIsProposeAllowed()
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const chainId = dtf?.chainId
  const spell = chainId ? INDEX_DTF_UPGRADE_SPELL_6_0_0_ADDRESS[chainId] : undefined
  const { data: versionRegistry } = useReadContract({
    address: dtf?.proxyAdmin,
    abi: dtfAdminAbi,
    functionName: 'versionRegistry',
    chainId,
    query: { enabled: !!dtf && version === '5.0.0' },
  })
  const { data: deployment } = useIndexDtfVersionDeployment(
    chainId && versionRegistry
      ? { chainId, registry: versionRegistry, version: '6.0.0' }
      : undefined
  )
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt, isSuccess, error: receiptError } =
    useWaitForTransactionReceipt({ hash, chainId })
  const isSubmitted =
    (!!hash && !receipt && !receiptError) || receipt?.status === 'success'

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  const governor = dtf?.ownerGovernance?.id

  useEffect(() => {
    if (!isSuccess || receipt?.status !== 'success' || !governor) return

    const notify = () => {
      toast(t`Proposal created!`, {
        description: t`Folio 6.0.0 upgrade proposal created`,
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

  if (!dtf || !chainId || !governor || !isProposeAllowed || !proposals) {
    return null
  }

  const eligibility = getV6UpgradeEligibility({
    version,
    spell,
    deployment,
    isOptimistic: !!dtf.ownerGovernance?.isOptimistic,
    selectorRegistry: dtf.ownerGovernance?.optimistic?.selectorRegistry,
    migrationPending: isGovernanceMigrationPending({
      chainId,
      dtfAddress: dtf.id,
      ownerGovernor: dtf.ownerGovernance?.id,
      tradingGovernor: dtf.tradingGovernance?.id,
      oldVoteLockUnderlying: dtf.stToken?.underlying.address,
    }),
  })
  if (eligibility.status === 'hidden' || hasLiveV6Upgrade(proposals, governor)) {
    return null
  }

  const isOptimistic = !!dtf.ownerGovernance?.isOptimistic
  const isAuctionLengthTooShort = dtf.auctionLength < MIN_V6_AUCTION_LENGTH

  const handlePropose = () => {
    if (eligibility.status !== 'ready' || !spell) return
    writeContract(
      buildV6UpgradeProposal({
        chainId,
        folio: dtf.id,
        proxyAdmin: dtf.proxyAdmin,
        spell,
        governor,
        selectorRegistry: eligibility.selectorRegistry,
        description: nextV6UpgradeDescription(proposals),
      })
    )
  }

  return (
    <div
      data-testid="governance-v6-upgrade"
      className="sm:w-[408px] p-4 rounded-3xl bg-primary/10"
    >
      <div className="flex flex-row items-center gap-2">
        <AlertCircle size={24} className="text-primary shrink-0" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>Folio 6.0.0 available</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              Upgrades this DTF's contract implementation to 6.0.0.
              Governance, roles and fees stay as they are.
            </Trans>{' '}
            {isOptimistic && (
              <Trans>
                Optimistic rebalance permissions switch to the 6.0.0 rebalance
                call in the same proposal.
              </Trans>
            )}
          </p>
          <p className="text-sm text-legend mt-1">
            <Trans>
              Execution reverts if a rebalance, auction or state change is
              active at that moment, or if the auction length is under 2
              minutes.
            </Trans>
          </p>
        </div>
      </div>
      {eligibility.status === 'blocked' && (
        <Alert
          variant="destructive"
          data-testid="governance-v6-upgrade-blocked"
          className="mt-3 rounded-2xl text-sm"
        >
          <TriangleAlert size={16} />
          <AlertDescription>
            <Trans>
              Can't build this upgrade: the optimistic governor's selector
              registry couldn't be resolved.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      {eligibility.status === 'ready' && isAuctionLengthTooShort && (
        <Alert
          variant="warning"
          data-testid="governance-v6-upgrade-auction-length"
          className="mt-3 rounded-2xl text-sm"
        >
          <TriangleAlert size={16} />
          <AlertDescription>
            <Trans>
              The auction length is under 2 minutes, so this upgrade would
              revert. Raise it before proposing.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      <Button
        data-testid="governance-v6-upgrade-btn"
        disabled={
          eligibility.status !== 'ready' ||
          isAuctionLengthTooShort ||
          isPending ||
          isSubmitted
        }
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Propose 6.0.0 upgrade`}
      </Button>
    </div>
  )
}
