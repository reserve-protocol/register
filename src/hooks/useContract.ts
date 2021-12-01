import { useEthers } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import ERC20_ABI from '../abis/ERC20.json'
import RTOKEN_ABI from '../abis/RToken.json'

import { getContract } from '../utils'
import { ERC20, RToken } from '../abis/types'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useEthers()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address || !isAddress(address)) return null
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [
    addressOrAddressMap,
    ABI,
    library,
    chainId,
    withSignerIfPossible,
    account,
  ]) as T
}

export function useRTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
) {
  return useContract<RToken>(tokenAddress, RTOKEN_ABI, withSignerIfPossible)
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
) {
  return useContract<ERC20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}
