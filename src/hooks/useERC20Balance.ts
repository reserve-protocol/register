import { walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi } from 'viem'
import {
  useWatchReadContract,
  useWatchReadContracts,
} from './useWatchReadContract'

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

type TokenBalance = {
  address: Address
  chainId: number
}

export const useERC20Balances = (tokens: TokenBalance[]) => {
  const wallet = useAtomValue(walletAtom)

  return useWatchReadContracts({
    contracts: tokens.map(({ address, chainId }) => ({
      abi: erc20Abi,
      address,
      chainId,
      functionName: 'balanceOf',
      args: [wallet ?? '0x'],
    })),
    allowFailure: false,
  })
}

export default useERC20Balance
