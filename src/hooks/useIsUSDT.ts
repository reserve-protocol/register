import { walletAtom } from '@/state/atoms'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi, parseEther } from 'viem'
import { useReadContract, useSimulateContract } from 'wagmi'

// This hook is used to check if the token is USDT or a fork of USDT
const useIsUSDT = (address: Address, chainId: number, spender?: Address) => {
  const account = useAtomValue(walletAtom)
  const { failureReason: simulationError } = useSimulateContract({
    abi: erc20Abi,
    address,
    functionName: 'approve',
    args: [INDEX_DEPLOYER_ADDRESS[chainId], 1n],
    chainId,
  })

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    functionName: 'allowance',
    address: address,
    args: [account!, spender!],
    chainId,
    query: { enabled: !!account && !!spender },
  })

  const isUSDT = String(simulationError)?.includes(
    'ContractFunctionExecutionError'
  )

  const needsRevoke =
    isUSDT &&
    Boolean(allowance && allowance > 0n && allowance < parseEther('1000000'))

  return { isUSDT, needsRevoke }
}

export default useIsUSDT
