import { isAddress } from '@ethersproject/address'
import { Web3Provider } from '@ethersproject/providers'
import {
  Distributor as DistributorAbi,
  ERC20 as ERC20Abi,
  Facade as FacadeAbi,
  FacadeWrite as FacadeWriteAbi,
  Governance as GovernanceAbi,
  Main as MainAbi,
  RToken as RTokenAbi,
  StRSR as StRSRAbi,
  Timelock as TimelockAbi,
} from 'abis'
import { Contract } from 'ethers'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { getValidWeb3Atom } from 'state/atoms'
import {
  Distributor,
  ERC20,
  Facade,
  FacadeWrite,
  Governance,
  Main,
  RToken,
  StRsr,
  Timelock,
} from '../abis/types'
import { getContract } from '../utils'
import { FACADE_ADDRESS, FACADE_WRITE_ADDRESS } from './../utils/addresses'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useAtomValue(getValidWeb3Atom)

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
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
  return useContract<Facade>(FACADE_ADDRESS, FacadeAbi, true)
}

export function useFacadeWriteContract(): FacadeWrite | null {
  return useContract<FacadeWrite>(FACADE_WRITE_ADDRESS, FacadeWriteAbi, true)
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

export function useMainContract(
  mainAddress?: string,
  withSignerIfPossible?: boolean
): Main | null {
  return useContract<Main>(mainAddress, MainAbi, withSignerIfPossible)
}

export function useDistributorContract(
  distributorAddress?: string,
  withSignerIfPossible?: boolean
): Distributor | null {
  return useContract<Distributor>(
    distributorAddress,
    DistributorAbi,
    withSignerIfPossible
  )
}

export function useTimelockContract(
  timelockAddress?: string,
  withSignerIfPossible?: boolean
): Timelock | null {
  return useContract<Timelock>(
    timelockAddress,
    TimelockAbi,
    withSignerIfPossible
  )
}

export function useGovernanceContract(
  governanceAddress?: string,
  withSignerIfPossible?: boolean
): Governance | null {
  return useContract<Governance>(
    governanceAddress,
    GovernanceAbi,
    withSignerIfPossible
  )
}
