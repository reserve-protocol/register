import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from '@usedapp/core'
import {
  ERC20 as ERC20Abi,
  Main as MainAbi,
  StRSR as StRSRAbi,
  Facade as FacadeAbi,
  BasketHandler as BasketHandlerAbi,
} from 'abis'
import { BasketHandler } from 'abis/types/BasketHandler'
import { useMemo } from 'react'
import RTOKEN_ABI from '../abis/RToken.json'
import { ERC20, Facade, Main, RToken, StRsr } from '../abis/types'
import { CHAIN_ID } from '../constants'
import { getContract } from '../utils'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account } = useEthers()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[CHAIN_ID]
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
  }, [addressOrAddressMap, ABI, library, withSignerIfPossible, account]) as T
}

export function useMainContract(
  address?: string,
  withSignerIfPossible?: boolean
): Main | null {
  return useContract<Main>(address, MainAbi, withSignerIfPossible)
}

export function useFacadeContract(
  address?: string,
  withSignerIfPossible?: boolean
): Facade | null {
  return useContract<Facade>(address, FacadeAbi, withSignerIfPossible)
}

export function useStakingContract(
  address?: string,
  withSignerIfPossible?: boolean
): StRsr | null {
  return useContract<StRsr>(address, StRSRAbi, withSignerIfPossible)
}

export function useRTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): RToken | null {
  return useContract<RToken>(tokenAddress, RTOKEN_ABI, withSignerIfPossible)
}

export function useBasketHandlerContract(
  address?: string,
  withSignerIfPossible?: boolean
): BasketHandler | null {
  return useContract<BasketHandler>(
    address,
    BasketHandlerAbi,
    withSignerIfPossible
  )
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): ERC20 | null {
  return useContract<ERC20>(tokenAddress, ERC20Abi, withSignerIfPossible)
}
