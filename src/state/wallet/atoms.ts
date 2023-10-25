/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import Main from 'abis/Main'
import StRSRVotes from 'abis/StRSRVotes'
import { atom } from 'jotai'
import { AccountPosition, AccountToken } from 'types'
import { RSR_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, stringToHex, zeroAddress } from 'viem'
import { readContracts } from 'wagmi'
import { chainIdAtom, walletAtom } from '../chain/atoms/chainAtoms'
import rTokenAtom from '../rtoken/atoms/rTokenAtom'
import rTokenContractsAtom from '../rtoken/atoms/rTokenContractsAtom'
import { readContract } from 'wagmi/actions'
import { AccountRTokenPosition } from './updaters/AccountUpdater'

const defaultBalance = {
  value: 0n,
  decimals: 18,
  balance: '0',
}

export interface TokenBalance {
  value: bigint
  balance: string // formatted balance
  decimals: number
}

export interface TokenBalanceMap {
  [x: Address]: TokenBalance
}

export const balancesAtom = atom<TokenBalanceMap>({})

// Get balance for current rToken for the selected account
export const rTokenBalanceAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && get(balancesAtom)[rToken.address]) {
    return get(balancesAtom)[rToken.address]
  }

  return defaultBalance
})

export const stRsrBalanceAtom = atom((get) => {
  const stRSR = get(rTokenAtom)?.stToken?.address

  if (stRSR) {
    return get(balancesAtom)[stRSR] || defaultBalance
  }

  return defaultBalance
})

export const rsrBalanceAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  return get(balancesAtom)[RSR_ADDRESS[chainId]] || defaultBalance
})

// Store account related rtokens
export const accountRTokensAtom = atom<
  { address: string; name: string; symbol: string }[]
>([])

// Store current rToken holdings for an account
export const accountTokensAtom = atom<AccountRTokenPosition[]>([])

// Store current stToken holdings (stake) for an account
export const accountPositionsAtom = atom<AccountPosition[]>([])

// Store how much RSR is staked for a given account across the whole protocol
export const accountHoldingsAtom = atom(0)

// Tracks walletModal visible status
export const isWalletModalVisibleAtom = atom(false)

// Tracks current account role related to the selected rToken
export const accountRoleAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const account = get(walletAtom)

  if (!rToken?.main || !account) {
    return null
  }

  const call = {
    abi: Main,
    address: rToken.main,
  }

  const [owner, pauser, shortFreezer, longFreezer] = await readContracts({
    contracts: [
      {
        ...call,
        args: [stringToHex('OWNER', { size: 32 }), account],
        functionName: 'hasRole',
      },
      {
        ...call,
        args: [stringToHex('PAUSER', { size: 32 }), account],
        functionName: 'hasRole',
      },
      {
        ...call,
        args: [stringToHex('SHORT_FREEZER', { size: 32 }), account],
        functionName: 'hasRole',
      },
      {
        ...call,
        args: [stringToHex('LONG_FREEZER', { size: 32 }), account],
        functionName: 'hasRole',
      },
    ],
    allowFailure: false,
  })

  return {
    owner,
    pauser,
    shortFreezer,
    longFreezer,
  }
})

export const accountDelegateAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const account = get(walletAtom)

  if (!contracts?.stRSR || !account) {
    return null
  }

  const delegate = await readContract({
    address: contracts.stRSR.address,
    abi: StRSRVotes,
    functionName: 'delegates',
    args: [account],
  })

  return delegate !== zeroAddress ? delegate : null
})

export const isSmartWalletAtom = atom(false)
