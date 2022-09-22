import { CHAIN_ID } from 'utils/chains'
/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import { BigNumber } from '@ethersproject/bignumber'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import {
  AccountPosition,
  AccountToken,
  MulticallState,
  RawCall,
  ReserveToken,
  TransactionMap,
  TransactionState,
} from 'types'
import { RSR, RTOKEN_STATUS, TRANSACTION_STATUS } from 'utils/constants'
import { WalletTransaction } from './../types/index'

/**
 * ######################
 * ? RToken related atoms
 * ######################
 */

// Store rToken meta into localStorage for fast fetching using cache
export const reserveTokensAtom = atomWithStorage<{
  [x: string]: ReserveToken
}>('reserveTokens', {})

// Current selected rToken address
export const selectedRTokenAtom = atomWithStorage('selectedRToken', '')

// Grab rToken data from the atom list
export const rTokenAtom = atom<ReserveToken | null>((get) =>
  get(reserveTokensAtom) && get(reserveTokensAtom)[get(selectedRTokenAtom)]
    ? get(reserveTokensAtom)[get(selectedRTokenAtom)]
    : null
)

// Token APY
export const rTokenYieldAtom = atom({ tokenApy: 0, stakingApy: 0 })

// Current rToken status
export const rTokenStatusAtom = atom(RTOKEN_STATUS.SOUND)
export const isRTokenDisabledAtom = atom<boolean>((get) => {
  const status = get(rTokenStatusAtom)

  return status === RTOKEN_STATUS.FROZEN || status === RTOKEN_STATUS.PAUSED
})

// Get rToken main contract, not available for RSV
export const rTokenMainAtom = atom<string | null>((get) => {
  const rToken = get(rTokenAtom)

  return rToken?.main || null
})

export const rTokenCollateralDist = atom<{
  [x: string]: { share: number; targetUnit: string }
}>({})

// Get rToken collateral distribution
export const rTokenDistributionAtom = atom<{
  backing: number
  insurance: number
}>({
  backing: 0,
  insurance: 0,
})

/**
 * ##############################
 * ? Wallet/Account related atoms
 * ##############################
 */

// Tracks walletModal visible status
export const isWalletModalVisibleAtom = atom(false)

// Tracks current account role related to the selected rToken
export const accountRoleAtom = atom({
  owner: false,
  pauser: false,
  freezer: false,
})
export const isManagerAtom = atom<boolean>((get) => {
  const role = get(accountRoleAtom)

  return role.owner || role.pauser || role.freezer
})

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number | undefined>(CHAIN_ID)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(0)

/**
 * ##################
 * Price related atom
 * ##################
 */
export const ethPriceAtom = atom(0)
export const rsrPriceAtom = atom(0)
export const gasPriceAtom = atom(0)
export const rTokenPriceAtom = atom(0)
export const rsrExchangeRateAtom = atom(1)

/**
 * #################
 * Wallet Management
 * #################
 */

// Tracks current connected address
export const walletAtom = atom('')

// Tracks rToken/collaterals/stRSR/RSR balances for a connected account
export const balancesAtom = atom<{ [x: string]: number }>({})

// Get balance for current rToken for the selected account
export const rTokenBalanceAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && get(balancesAtom)[rToken.address]) {
    return get(balancesAtom)[rToken.address]
  }

  return 0
})

export const stRsrBalanceAtom = atom((get) => {
  const stRSR = get(rTokenAtom)?.stToken?.address

  if (stRSR) {
    return get(balancesAtom)[stRSR] || 0
  }

  return 0
})

export const rsrBalanceAtom = atom((get) => {
  return get(balancesAtom)[RSR.address] || 0
})

// Tracks allowance for stRSR/RSR and Collaterals/rToken
export const allowanceAtom = atom<{ [x: string]: BigNumber }>({})

// Store current rToken holdings for an account
export const accountTokensAtom = atom<AccountToken[]>([])

// Store current stToken holdings (stake) for an account
export const accountPositionsAtom = atom<AccountPosition[]>([])

// Store how much RSR is staked for a given account across the whole protocol
export const accountHoldingsAtom = atom(0)

// List of pending user issuances for the selected rToken
export const pendingIssuancesAtom = atom<any[]>([])
export const pendingIssuancesSummary = atom((get) => {
  const pending = get(pendingIssuancesAtom)
  const currentBlock = get(blockAtom) ?? 0

  // TODO: Correct timestamp formatting
  return pending.reduce(
    (acc, issuance) => {
      acc.index = issuance.index
      acc.availableAt = issuance.availableAt

      if (currentBlock >= issuance.availableAt) {
        acc.availableAmount += issuance.amount
        acc.availableIndex = issuance.index
      } else {
        acc.pendingAmount += issuance.amount
      }

      return acc
    },
    {
      index: BigNumber.from(0),
      availableIndex: BigNumber.from(0),
      pendingAmount: 0,
      availableAmount: 0,
      availableAt: 0,
    }
  )
})

// List of unstake cooldown for the selected rToken
export const pendingRSRAtom = atom<any[]>([])
export const pendingRSRSummaryAtom = atom((get) => {
  const currentTime = get(blockTimestampAtom)
  return get(pendingRSRAtom).reduce(
    (acc, unstake) => {
      acc.index = unstake.index
      acc.availableAt = unstake.availableAt

      if (currentTime >= unstake.availableAt) {
        acc.availableAmount += unstake.amount
        acc.availableIndex = acc.availableAt
      } else {
        acc.pendingAmount += unstake.amount
      }

      return acc
    },
    {
      index: BigNumber.from(0),
      availableIndex: BigNumber.from(0),
      pendingAmount: 0,
      availableAt: 0,
      availableAmount: 0,
    }
  )
})

/**
 * ############################
 * ? Transactions related atoms
 * ############################
 */

// Store multicalls, fetched on every block
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

// Transactions storage layer
const txStorage = createJSONStorage<TransactionMap>(() => localStorage)
txStorage.getItem = (key: string): TransactionMap => {
  const data = localStorage?.getItem(key)

  if (!data) return {}

  try {
    const parsed = JSON.parse(data) as TransactionMap

    return Object.keys(parsed).reduce((txMap, chainId) => {
      txMap[chainId] = Object.keys(parsed[chainId]).reduce((txs, wallet) => {
        txs[wallet] = parsed[chainId][wallet].map((tx) => {
          if (
            tx.status === TRANSACTION_STATUS.SIGNING ||
            tx.status === TRANSACTION_STATUS.PENDING
          ) {
            return { ...tx, status: TRANSACTION_STATUS.UNKNOWN }
          }

          return tx
        })

        return txs
      }, {} as WalletTransaction)

      return txMap
    }, {} as TransactionMap)
  } catch (e) {
    console.error('Error parsing transaction', e)
    localStorage.setItem(key, JSON.stringify({}))
    return {}
  }
}

// List of recent user transactions
export const txAtom = atomWithStorage<TransactionMap>(
  'transactions',
  {},
  txStorage
)
export const currentTxAtom = atom((get) => {
  const chain = get(chainIdAtom) ?? CHAIN_ID
  const account = get(walletAtom) ?? ''
  const txs = get(txAtom)

  return txs[chain] && txs[chain][account] ? txs[chain][account] : []
})

// Return list of transactions ordered by status
export const pendingTxAtom = atom((get) => {
  const result = {
    pending: <[number, TransactionState][]>[],
    signing: <[number, TransactionState][]>[],
    mining: <[number, TransactionState][]>[],
  }

  return get(currentTxAtom).reduce((acc, current, index) => {
    if (current.status === TRANSACTION_STATUS.PENDING) {
      acc.pending = [...acc.pending, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.MINING) {
      acc.mining = [...acc.mining, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.SIGNING) {
      acc.signing = [...acc.signing, [index, current]]
    }

    return acc
  }, result)
})

// Add transaction to queue
export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        ...(txs[chainId] ?? {}),
        [account]: [...currentTx, ...tx].slice(-50),
      },
    })
  }
)

// Update tx status
export const updateTransactionAtom = atom(
  null,
  (get, set, data: [number, Partial<TransactionState>]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)
    const [index, newData] = data

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        [account]: [
          ...currentTx.slice(0, index),
          { ...currentTx[index], ...newData },
          ...currentTx.slice(index + 1),
        ],
      },
    })
  }
)

// RSV Metrics
export interface RPayTx {
  id: string
  type: string
  amount: string
  timestamp: string
}

export const rpayTransactionsAtom = atom<{
  [x: string]: RPayTx
}>({})

export const rpayOverviewAtom = atom({
  volume: 0,
  txCount: 0,
  holders: 0,
})
