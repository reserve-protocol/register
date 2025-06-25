import { wagmiConfig } from '@/state/chain'
import { AvailableChain } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { Address, encodeFunctionData, erc20Abi, Hex } from 'viem'
import { getPublicClient } from 'wagmi/actions'

export function convertTypeDataToBigInt(obj: any, isInDomain = false): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTypeDataToBigInt(item, isInDomain))
  }

  if (obj && typeof obj === 'object') {
    // If we're inside the domain object, don't convert numbers
    if (isInDomain) {
      return obj
    }

    // Convert BigNumber
    if (obj._isBigNumber && typeof obj._hex === 'string') {
      return BigInt(obj._hex)
    }

    const result: Record<string, any> = {}
    for (const key in obj) {
      // If the key is 'domain', pass true to indicate we're inside the domain
      result[key] = convertTypeDataToBigInt(obj[key], key === 'domain')
    }
    return result
  }

  // Convert numbers to BigInt if we're not in domain
  if (!isInDomain && typeof obj === 'number') {
    return BigInt(obj)
  }

  return obj
}

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
  calls: any[],
  account: Address,
  maxRetries: number = 2
) => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const txBundle = await sendCallsAsync({
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
        console.log(
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

// Function to handle signTypedDataAsync with retry logic for user rejections
export const signTypedDataWithRetry = async (
  signTypedDataAsync: any,
  typedData: any,
  maxRetries: number = 2
) => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const signature = await signTypedDataAsync(typedData)
      return signature
    } catch (error) {
      lastError = error as Error

      // Check if it's a user rejection error
      if (
        error instanceof Error &&
        error.message.includes('User rejected signature')
      ) {
        console.log(
          `User rejected signature (attempt ${attempt + 1}/${maxRetries + 1})`
        )

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw new Error('USER_CANCELLED_SIGNATURE')
        }

        // Otherwise, continue to next attempt
        continue
      }

      // For other errors, throw immediately
      throw error
    }
  }

  // This should never be reached, but just in case
  throw lastError || new Error('Unknown error in signTypedDataWithRetry')
}
