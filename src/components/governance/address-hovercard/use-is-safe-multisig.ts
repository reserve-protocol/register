import { isSafeAccountCode } from '@/hooks/use-is-safe-account'
import type { Address } from 'viem'
import { useBytecode, useReadContract } from 'wagmi'

const SAFE_THRESHOLD_ABI = [
  {
    type: 'function',
    name: 'getThreshold',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

// Contract code alone also matches governors and other smart wallets; only a
// Safe answers getThreshold, so the tag never mislabels them.
export const useIsSafeMultisig = (
  chainId: number,
  address: Address,
  enabled: boolean
) => {
  const { data: code } = useBytecode({
    address,
    chainId,
    query: { enabled, staleTime: Infinity },
  })
  const isContract = isSafeAccountCode(code)
  const { data: threshold } = useReadContract({
    address,
    chainId,
    abi: SAFE_THRESHOLD_ABI,
    functionName: 'getThreshold',
    query: { enabled: enabled && isContract, retry: false, staleTime: Infinity },
  })
  return isContract && threshold !== undefined && threshold > 0n
}
