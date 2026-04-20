import daoFeeRegistryAbi from '@/abis/dao-fee-registry-abi'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { FALLBACK_PLATFORM_FEES } from '@/utils/constants'
import { Address, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'

const usePlatformFee = (chainId: number): number => {
  const deployerAddress = INDEX_DEPLOYER_ADDRESS[chainId]
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
  return Number(feeNumerator * 100n / feeDenominator)
}

export default usePlatformFee
