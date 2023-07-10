/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import { BigNumber } from '@ethersproject/bignumber'
import { stRSRVotesInterface } from 'abis'
import { StRSRVotes } from 'abis/types'
import { atom } from 'jotai'
import { AccountPosition, AccountToken } from 'types'
import { getContract } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { RSR } from 'utils/constants'
import rTokenAtom from '../rtoken/atoms/rTokenAtom'
import rTokenContractsAtom from '../rtoken/atoms/rTokenContractsAtom'
import { getValidWeb3Atom, walletAtom } from '../chain/atoms/chainAtoms'
import { readContracts } from 'wagmi'
import Main from 'abis/Main'
import { stringToHex } from 'viem'

const defaultBalance = {
  value: BigNumber.from(0),
  decimals: 18,
  balance: '0',
}

// Tracks rToken/collaterals/stRSR/RSR balances for a connected account
// export const balancesAtom = atom((get) => {
//   const rToken = get(rTokenAtom)
//   if (rToken == null) {
//     return {}
//   }
//   const tokens = getTokens(rToken)
//   const balances = tokens.map((t) =>
//     get(tokenBalancesStore.getBalanceAtom(utils.getAddress(t[0])))
//   )

//   return Object.fromEntries(
//     balances
//       .map((atomValue, i) => ({
//         atomValue,
//         decimals: tokens[i][1],
//       }))
//       .map((entry) => [
//         entry.atomValue.address,
//         {
//           value: entry.atomValue.value ?? ethers.constants.Zero,
//           decimals: entry.decimals,
//           balance: formatUnits(
//             entry.atomValue.value ?? ethers.constants.Zero,
//             entry.decimals
//           ),
//         },
//       ])
//   )
// })

// TODO: Fix balances
export const balancesAtom = atom({} as any)

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
