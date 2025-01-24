import { walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi } from 'viem'
import { useWatchReadContract } from './useWatchReadContract'

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const useERC20Balance = (address: Address | undefined) => {
  const wallet = useAtomValue(walletAtom)

  return useWatchReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    query: { enabled: !!(wallet && address && address !== ETH_ADDRESS) },
  })
}

export default useERC20Balance
