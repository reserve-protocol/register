import { walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

const useERC20Balance = (address: Address | undefined) => {
  const wallet = useAtomValue(walletAtom)

  return useReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    query: { enabled: !!(wallet && address) },
  })
}

export default useERC20Balance
