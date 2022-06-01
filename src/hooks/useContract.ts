import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import {
  ERC20 as ERC20Abi,
  Facade as FacadeAbi,
  RToken as RTokenAbi,
  StRSR as StRSRAbi,
} from 'abis'
import { useMemo } from 'react'
import { CHAIN_ID } from 'utils/chains'
import { ERC20, Facade, RToken, StRsr } from '../abis/types'
import { getContract } from '../utils'
import { FACADE_ADDRESS } from './../utils/addresses'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[CHAIN_ID]
    if (!address || !isAddress(address)) return null
    try {
      return getContract(
        address,
        ABI,
        provider as Web3Provider,
        withSignerIfPossible && account ? account : undefined
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, withSignerIfPossible, account]) as T
}

export function useFacadeContract(): Facade | null {
  return useContract<Facade>(FACADE_ADDRESS[CHAIN_ID], FacadeAbi, true)
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
  return useContract<RToken>(tokenAddress, RTokenAbi, withSignerIfPossible)
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): ERC20 | null {
  return useContract<ERC20>(tokenAddress, ERC20Abi, withSignerIfPossible)
}
