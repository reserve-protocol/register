import { getWriteContractParams } from '@/components/vote-lock/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import Timeline from '@/components/ui/timeline'
import { formatCurrency } from '@/utils'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  prepareVoteLockDeposit,
  prepareVoteLockDepositPlan,
  prepareVoteLockRedeem,
} from '@reserve-protocol/react-sdk'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { erc20Abi, formatUnits, isAddressEqual, parseAbi, parseEventLogs } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { getMigrationStep, type MigrationStep } from './migration-state'
import type { VoteLockMigration } from './use-vote-lock-migration'

const withdrawEventAbi = parseAbi([
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
])
const STEP_ORDER: MigrationStep[] = ['redeem', 'approve', 'deposit', 'done']

type Props = {
  migration: VoteLockMigration
  open: boolean
  onOpenChange: (open: boolean) => void
  onFinished: () => void
  subpage: string
}

const VoteLockMigrationModal = ({
  migration,
  open,
  onOpenChange,
  onFinished,
  subpage,
}: Props) => {
  const { t } = useLingui()
  const { trackClick } = useTrackIndexDTFClick('overview', subpage)
  const { chainId, account, oldVoteLock, newVoteLock, underlying } = migration
  const [redeemedAssets, setRedeemedAssets] = useState<bigint>()
  const [deposited, setDeposited] = useState(false)
  const [missingWithdraw, setMissingWithdraw] = useState(false)
  const {
    data: allowance,
    refetch: refetchAllowance,
    isFetching: isFetchingAllowance,
  } = useReadContract({
    address: underlying,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, newVoteLock],
    chainId,
    query: { enabled: redeemedAssets !== undefined },
  })
  const step = getMigrationStep({ redeemedAssets, allowance, deposited })
  const { writeContract, data: hash, isPending, error, reset } =
    useWriteContract()
  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash, chainId })
  const handledReceipt = useRef<string>()
  // The step can move while a tx is in flight (e.g. a late allowance read), so receipts resolve against what was sent.
  const submittedStep = useRef<MigrationStep>()

  useEffect(() => {
    if (!receipt || handledReceipt.current === receipt.transactionHash) return
    handledReceipt.current = receipt.transactionHash
    if (receipt.status !== 'success') return

    if (submittedStep.current === 'redeem') {
      const [withdraw] = parseEventLogs({
        abi: withdrawEventAbi,
        logs: receipt.logs,
        eventName: 'Withdraw',
      }).filter((log) => isAddressEqual(log.address, oldVoteLock))
      setMissingWithdraw(!withdraw)
      setRedeemedAssets(withdraw?.args.assets)
      migration.refetch()
    }
    if (submittedStep.current === 'approve') void refetchAllowance()
    if (submittedStep.current === 'deposit') {
      setDeposited(true)
      migration.refetch()
    }
    reset()
  }, [migration, oldVoteLock, receipt, refetchAllowance, reset])

  const amount = redeemedAssets ?? 0n
  const handleAction = () => {
    trackClick(`vote_lock_migration_${step}`)
    submittedStep.current = step
    if (step === 'redeem') {
      writeContract(
        getWriteContractParams(
          prepareVoteLockRedeem({
            chainId,
            stToken: oldVoteLock,
            shares: migration.shares,
            account,
          })
        )
      )
    }
    if (step === 'approve') {
      const plan = prepareVoteLockDepositPlan({
        chainId,
        stToken: newVoteLock,
        amount,
        delegateToSelf: true,
        approval: { underlying, amount },
      })
      if (plan.type === 'approval-required') {
        writeContract(getWriteContractParams(plan.approvals[0]))
      }
    }
    if (step === 'deposit') {
      writeContract(
        getWriteContractParams(
          prepareVoteLockDeposit({
            chainId,
            stToken: newVoteLock,
            amount,
            delegateToSelf: true,
          })
        )
      )
    }
  }

  const reached = (target: MigrationStep) =>
    STEP_ORDER.indexOf(step) > STEP_ORDER.indexOf(target)
  const isResolvingAllowance =
    redeemedAssets !== undefined && (allowance === undefined || isFetchingAllowance)
  const isBusy = isPending || isConfirming || isResolvingAllowance
  const shares = formatCurrency(Number(formatUnits(migration.shares, 18)))
  const actionLabel: Record<MigrationStep, string> = {
    redeem: t`Unlock ${migration.oldSymbol}`,
    approve: t`Approve RSR`,
    deposit: t`Lock RSR in vlRSR`,
    done: t`Done`,
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) =>
        !next && step === 'done' ? onFinished() : onOpenChange(next)
      }
    >
      <DialogContent
        data-testid="vote-lock-migration-modal"
        className="p-4 bg-secondary border-none shadow-lg max-w-full sm:max-w-[420px] top-[100%] translate-y-[-100%] sm:top-[50%] sm:translate-y-[-50%] rounded-b-none rounded-t-3xl sm:rounded-3xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
      >
        <DialogTitle className="text-xl font-semibold">
          <Trans>Migrate to vlRSR</Trans>
        </DialogTitle>
        <DialogDescription className="text-sm text-legend">
          <Trans>
            Move your {migration.oldSymbol} position to the shared vlRSR vault
            in three transactions. Your voting power is delegated to your own
            wallet.
          </Trans>
        </DialogDescription>
        <div className="py-2 pl-4">
          <Timeline
            items={[
              {
                title: t`Unlock ${migration.oldSymbol}`,
                rightText: shares,
                isActive: step === 'redeem',
                isCompleted: reached('redeem'),
              },
              {
                title: t`Approve RSR`,
                isActive: step === 'approve',
                isCompleted: reached('approve'),
              },
              {
                title: t`Lock RSR in vlRSR`,
                isActive: step === 'deposit',
                isCompleted: reached('deposit'),
              },
            ]}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {error.message.split('\n')[0]}
          </p>
        )}
        {missingWithdraw && (
          <p className="text-sm text-destructive">
            <Trans>
              Your RSR was unlocked but the amount could not be read. Refresh
              the page and lock it from the vote-lock panel.
            </Trans>
          </p>
        )}
        {receipt?.status === 'reverted' && (
          <p className="text-sm text-destructive">
            <Trans>Transaction reverted. Try again.</Trans>
          </p>
        )}
        {step === 'done' ? (
          <Button
            data-testid="vote-lock-migration-done"
            onClick={onFinished}
          >
            <Trans>Migration complete</Trans>
          </Button>
        ) : (
          <Button
            data-testid="vote-lock-migration-action-btn"
            data-step={step}
            disabled={isBusy || missingWithdraw}
            onClick={handleAction}
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isPending && t`Pending, sign in wallet...`}
            {!isPending && isConfirming && t`Waiting for confirmation...`}
            {!isPending && !isConfirming && isResolvingAllowance && t`Loading...`}
            {!isBusy && actionLabel[step]}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VoteLockMigrationModal
