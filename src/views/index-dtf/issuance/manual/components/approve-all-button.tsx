import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useBatchApproval } from '@/hooks/use-batch-approval'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { BIGINT_MAX } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import {
  assetAmountsMapAtom,
  batchApprovalStateAtom,
  tokensNeedingApprovalAtom,
  unlimitedApprovalAtom,
} from '../atoms'

const ApproveAllButton = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const tokensNeedingApproval = useAtomValue(tokensNeedingApprovalAtom)
  const isUnlimited = useAtomValue(unlimitedApprovalAtom)
  const requiredAmounts = useAtomValue(assetAmountsMapAtom)
  const setBatchState = useSetAtom(batchApprovalStateAtom)

  // Build approval items for the hook
  const approvalItems = useMemo(() => {
    if (!indexDTF) return []

    return tokensNeedingApproval.map((token) => ({
      token: token.address,
      spender: indexDTF.id,
      amount: isUnlimited
        ? BIGINT_MAX
        : (requiredAmounts[token.address] ?? 0n) * 2n,
    }))
  }, [tokensNeedingApproval, indexDTF, isUnlimited, requiredAmounts])

  const {
    states,
    approveAll,
    retryFailed,
    isProcessing,
    hasFailures,
    completedCount,
  } = useBatchApproval({
    items: approvalItems,
    chainId,
  })

  // Sync states to atom for ApproveAsset components to read
  useEffect(() => {
    setBatchState(states)
  }, [states, setBatchState])

  // Determine button state
  // Use states length when processing (captures initial batch size), otherwise use current tokens needing approval
  const batchSize = Object.keys(states).length
  const totalCount = isProcessing || hasFailures ? batchSize : tokensNeedingApproval.length

  let label: string
  let onClick: () => void
  let disabled = false

  if (isProcessing) {
    label = `Awaiting approvals... (${completedCount}/${totalCount})`
    onClick = () => {}
    disabled = true
  } else if (hasFailures) {
    const failedCount = Object.values(states).filter(
      (s) => s.status === 'error'
    ).length
    label = `${failedCount} approval${failedCount > 1 ? 's' : ''} failed - Retry`
    onClick = retryFailed
  } else {
    label = `Approve All (${totalCount})`
    onClick = approveAll
  }

  return (
    <div className="flex flex-col gap-2">
      <TransactionButtonContainer>
        <Button disabled={disabled} className="gap-2 w-full" onClick={onClick}>
          {isProcessing && <Spinner />}
          {label}
        </Button>
      </TransactionButtonContainer>

      {hasFailures && !isProcessing && (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            One or more approvals failed
          </AlertTitle>
          <AlertDescription className="ml-6">
            Click retry or use individual approve buttons below.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ApproveAllButton
