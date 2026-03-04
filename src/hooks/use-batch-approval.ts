import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useConfig } from 'wagmi'
import { erc20Abi, Address, Hex } from 'viem'
import { useState, useEffect, useCallback, useRef } from 'react'

// Token approval state for batch operations
export type ApprovalStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

export interface TokenApprovalState {
  status: ApprovalStatus
  hash?: Hex
  error?: string
}

export interface ApprovalItem {
  token: Address
  spender: Address
  amount: bigint
}

export interface UseBatchApprovalOptions {
  items: ApprovalItem[]
  chainId: number
  onSuccess?: () => void
}

export interface UseBatchApprovalReturn {
  states: Record<string, TokenApprovalState>
  approveAll: () => void
  retryFailed: () => void
  reset: () => void
  isProcessing: boolean
  hasFailures: boolean
  pendingCount: number
  completedCount: number
}

export const useBatchApproval = (
  options: UseBatchApprovalOptions
): UseBatchApprovalReturn => {
  const [states, setStates] = useState<Record<string, TokenApprovalState>>({})
  const config = useConfig()

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const updateState = useCallback(
    (token: Address, update: Partial<TokenApprovalState>) => {
      if (!isMounted.current) return
      setStates((prev) => ({
        ...prev,
        [token.toLowerCase()]: { ...prev[token.toLowerCase()], ...update },
      }))
    },
    []
  )

  const approveToken = useCallback(
    async (item: ApprovalItem) => {
      // Mark as pending immediately
      updateState(item.token, {
        status: 'pending',
        hash: undefined,
        error: undefined,
      })

      try {
        // Write the approval transaction
        const hash = await writeContract(config, {
          abi: erc20Abi,
          address: item.token,
          functionName: 'approve',
          args: [item.spender, item.amount],
          chainId: options.chainId,
        })

        // Update to confirming with hash
        updateState(item.token, { status: 'confirming', hash })

        // Wait for confirmation
        await waitForTransactionReceipt(config, {
          hash,
          chainId: options.chainId,
        })

        // Success!
        updateState(item.token, { status: 'success' })
      } catch (error: unknown) {
        // Handle user rejection and other errors
        const err = error as { shortMessage?: string; message?: string }
        const errorMessage =
          err?.shortMessage || err?.message || 'Transaction failed'
        updateState(item.token, { status: 'error', error: errorMessage })
      }
    },
    [config, options.chainId, updateState]
  )

  const approveAll = useCallback(() => {
    if (!options.items.length) return

    // Reset all states to idle first, then fire all in parallel
    const initialStates: Record<string, TokenApprovalState> = {}
    options.items.forEach((item) => {
      initialStates[item.token.toLowerCase()] = { status: 'idle' }
    })
    setStates(initialStates)

    // Fire all approvals in parallel (don't await - let them run concurrently)
    options.items.forEach((item) => {
      approveToken(item)
    })
  }, [options.items, approveToken])

  const retryFailed = useCallback(() => {
    const failedItems = options.items.filter(
      (item) => states[item.token.toLowerCase()]?.status === 'error'
    )
    failedItems.forEach((item) => approveToken(item))
  }, [options.items, states, approveToken])

  const reset = useCallback(() => {
    setStates({})
  }, [])

  // Computed values
  const stateValues = Object.values(states)
  const isProcessing = stateValues.some(
    (s) => s.status === 'pending' || s.status === 'confirming'
  )
  const hasFailures = stateValues.some((s) => s.status === 'error')
  const pendingCount = stateValues.filter(
    (s) => s.status === 'pending' || s.status === 'confirming'
  ).length
  const completedCount = stateValues.filter(
    (s) => s.status === 'success'
  ).length

  // Call onSuccess when all complete successfully
  useEffect(() => {
    const itemCount = options.items.length
    if (
      itemCount > 0 &&
      completedCount === itemCount &&
      !hasFailures &&
      !isProcessing
    ) {
      options.onSuccess?.()
    }
  }, [completedCount, options.items.length, hasFailures, isProcessing, options])

  return {
    states,
    approveAll,
    retryFailed,
    reset,
    isProcessing,
    hasFailures,
    pendingCount,
    completedCount,
  }
}
