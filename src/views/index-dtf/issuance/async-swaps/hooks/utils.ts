import { wagmiConfig } from '@/state/chain'
import { AvailableChain } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { Address, encodeFunctionData, erc20Abi, Hex } from 'viem'
import { getPublicClient } from 'wagmi/actions'
import { COWSWAP_SETTLEMENT } from './useQuoteSignatures'
import { notifyError } from '@/hooks/useNotification'

export async function getApprovalCallIfNeeded({
  chainId,
  address,
  token,
  requiredAmount,
  approvalAmount = requiredAmount,
  spender,
}: {
  chainId: AvailableChain
  address: Address
  token: Address
  requiredAmount: bigint
  approvalAmount?: bigint
  spender: Address
}): Promise<{ to: Address; data: Hex; value: bigint } | null> {
  const publicClient = getPublicClient(wagmiConfig, { chainId })
  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, spender],
  })
  if (allowance < requiredAmount) {
    return {
      to: token,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, approvalAmount],
      }),
      value: 0n,
    }
  }
  return null
}

type TokenPrice = {
  address: Address
  price: number
  timestamp: number
  source: string
}

export async function getAssetPrice(
  chainId: number,
  token: Address
): Promise<TokenPrice | undefined> {
  const response = await fetch(
    `${RESERVE_API}current/prices?tokens=${token}&chainId=${chainId}`
  )
  const data = (await response.json()) as TokenPrice[]
  return data[0]
}

// Function to handle sendCallsAsync with retry logic for user rejections
export const sendCallsWithRetry = async (
  sendCallsAsync: any,
  chainId: number,
  calls: any[],
  account: Address,
  maxRetries: number = 2
) => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const txBundle = await sendCallsAsync({
        chainId,
        calls,
        account,
        forceAtomic: true,
      })
      console.log({ txBundle })
      return txBundle
    } catch (error) {
      lastError = error as Error

      // Check if it's a user rejection error
      if (
        error instanceof Error &&
        error.message.includes('User rejected transaction')
      ) {
        notifyError(
          'Transaction rejected',
          `User rejected transaction (attempt ${attempt + 1}/${maxRetries + 1})`
        )

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw new Error('USER_CANCELLED_TX')
        }

        // Otherwise, continue to next attempt
        continue
      }

      // For other errors, throw immediately
      throw error
    }
  }

  // This should never be reached, but just in case
  throw lastError || new Error('Unknown error in sendCallsWithRetry')
}

// Helper functions for info messages
export const getTransactionInfoMessage = (
  txData: any[],
  isFallback = false
): string | undefined => {
  const approvals = txData.filter(
    (tx) => tx.to !== COWSWAP_SETTLEMENT && tx.data?.includes('0xa9059cbb') // approve function signature
  ).length
  const cowswapSwaps = txData.filter(
    (tx) => tx.to === COWSWAP_SETTLEMENT
  ).length

  if (approvals === 0 && cowswapSwaps === 0) {
    return undefined
  }

  let message = ''

  if (approvals > 0) {
    message += `Signing ${approvals} approval${approvals !== 1 ? 's' : ''}`
  }

  if (cowswapSwaps > 0) {
    message += approvals > 0 ? ' and ' : 'Signing '
    const fallbackText = isFallback
      ? ` (fallback${cowswapSwaps !== 1 ? 's' : ''})`
      : ''
    message += `${cowswapSwaps} swap${cowswapSwaps !== 1 ? 's' : ''} via Cowswap${fallbackText}`
  }

  message += `...`

  return message
}

export const getCowswapOrdersInfoMessage = (
  cowswapOrders: any[]
): string | undefined => {
  if (cowswapOrders.length > 0) {
    return `Sending ${cowswapOrders.length} swap${cowswapOrders.length !== 1 ? 's' : ''} via Cowswap...`
  }
  return undefined
}

