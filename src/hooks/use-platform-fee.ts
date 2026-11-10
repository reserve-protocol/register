import daoFeeRegistryAbi from '@/abis/dao-fee-registry-abi'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import { INDEX_V6_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { FALLBACK_PLATFORM_FEES } from '@/utils/constants'
import { Address, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'

// Two decimals, the precision of the share inputs: a 1/3 platform share must read 33.33, not 33.
export const toPlatformFeePercent = (numerator: bigint, denominator: bigint) =>
  Number((numerator * 10_000n) / denominator) / 100

const usePlatformFee = (chainId: number): number => {
  const deployerAddress = INDEX_V6_DEPLOYER_ADDRESS[chainId]
  const fallback = FALLBACK_PLATFORM_FEES[chainId] ?? 50

  const { data: registryAddress } = useReadContract({
    address: deployerAddress as Address,
    abi: dtfIndexDeployerAbi,
    functionName: 'daoFeeRegistry',
    chainId,
    query: { enabled: !!deployerAddress },
  })

  const { data: feeDetails } = useReadContract({
    address: registryAddress as Address,
    abi: daoFeeRegistryAbi,
    functionName: 'getFeeDetails',
    args: [zeroAddress],
    chainId,
    query: { enabled: !!registryAddress },
  })

  if (!feeDetails) return fallback

  const [, feeNumerator, feeDenominator] = feeDetails
  return toPlatformFeePercent(feeNumerator, feeDenominator)
}

export default usePlatformFee
