/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import { BigNumber } from '@ethersproject/bignumber'
import { ethers, utils } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { getTokens } from 'hooks/useTokensBalance'
import { atom } from 'jotai'
import { AccountPosition, AccountToken } from 'types'
import { RSR } from 'utils/constants'
import { tokenBalancesStore } from '../TokenBalancesUpdater'
import rTokenAtom from '../rtoken/atoms/rTokenAtom'
import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenContractsAtom from '../rtoken/atoms/rTokenContractsAtom'
import { getValidWeb3Atom } from './chainAtoms'
import { getContract } from 'utils'
import { stRSRVotesInterface } from 'abis'
import { StRSRVotes } from 'abis/types'
import { ZERO_ADDRESS } from 'utils/addresses'

const defaultBalance = {
  value: BigNumber.from(0),
  decimals: 18,
  balance: '0',
}

// Tracks rToken/collaterals/stRSR/RSR balances for a connected account
export const balancesAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  if (rToken == null) {
    return {}
  }
  const tokens = getTokens(rToken)
  const balances = tokens.map((t) =>
    get(tokenBalancesStore.getBalanceAtom(utils.getAddress(t[0])))
  )

  return Object.fromEntries(
    balances
      .map((atomValue, i) => ({
        atomValue,
        decimals: tokens[i][1],
      }))
      .map((entry) => [
        entry.atomValue.address,
        {
          value: entry.atomValue.value ?? ethers.constants.Zero,
          decimals: entry.decimals,
          balance: formatUnits(
            entry.atomValue.value ?? ethers.constants.Zero,
            entry.decimals
          ),
        },
      ])
  )
})

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
  return get(balancesAtom)[RSR.address] || defaultBalance
})

// Tracks allowance for stRSR/RSR and Collaterals/rToken
export const allowanceAtom = atom<{ [x: string]: BigNumber }>({})

// Store account related rtokens
export const accountRTokensAtom = atom<
  { address: string; name: string; symbol: string }[]
>([])

// Store current rToken holdings for an account
export const accountTokensAtom = atom<AccountToken[]>([])

// Store current stToken holdings (stake) for an account
export const accountPositionsAtom = atom<AccountPosition[]>([])

// Store how much RSR is staked for a given account across the whole protocol
export const accountHoldingsAtom = atom(0)

// Tracks walletModal visible status
export const isWalletModalVisibleAtom = atom(false)

// Tracks current account role related to the selected rToken
export const accountRoleAtom = atom({
  owner: false,
  pauser: false,
  shortFreezer: false,
  longFreezer: false,
})

export const accountDelegateAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const { provider, account } = get(getValidWeb3Atom)

  if (!contracts?.stRSR || !provider || !account) {
    return null
  }

  const contract = getContract(
    contracts.stRSR.address,
    stRSRVotesInterface,
    provider
  ) as StRSRVotes

  const delegate = await contract.delegates(account)

  return delegate !== ZERO_ADDRESS ? delegate : null
})
