import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useBatchApproval } from '@/hooks/use-batch-approval'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { basketAtom } from '@/views/index-dtf/deploy/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { parseUnits } from 'viem'
import {
  basketRequiredAmountsAtom,
  deployBatchApprovalStateAtom,
  tokensNeedingApprovalForDeployAtom,
} from '../atoms'

const ApproveAllDeployButton = () => {
  const { watch } = useFormContext()
  const chainId = watch('chain')
  const basket = useAtomValue(basketAtom)
  const tokensNeedingApproval = useAtomValue(tokensNeedingApprovalForDeployAtom)
  const requiredAmounts = useAtomValue(basketRequiredAmountsAtom)
  const setBatchState = useSetAtom(deployBatchApprovalStateAtom)

  // Build approval items for the hook
  const approvalItems = useMemo(() => {
    if (!chainId) return []

    return tokensNeedingApproval.map((token) => {
      const amount = requiredAmounts[token.address] ?? 0
      // 2x buffer for approval amount, same as individual approve
      const approvalAmount = parseUnits((amount * 2).toString(), token.decimals)

      return {
        token: token.address,
        spender: INDEX_DEPLOYER_ADDRESS[chainId],
        amount: approvalAmount,
      }
    })
  }, [tokensNeedingApproval, chainId, requiredAmounts])

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
  const totalCount =
    isProcessing || hasFailures ? batchSize : tokensNeedingApproval.length

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

  // Don't render if no tokens need approval
  if (tokensNeedingApproval.length === 0 && !isProcessing && !hasFailures) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <TransactionButtonContainer chain={chainId}>
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

export default ApproveAllDeployButton
