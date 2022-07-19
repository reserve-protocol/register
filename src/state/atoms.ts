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
  TransactionRecord,
  TransactionState,
} from 'types'
import { RSR, TRANSACTION_STATUS } from 'utils/constants'
import { WalletTransaction } from './../types/index'

export const chainIdAtom = atom<number | undefined>(undefined)
export const blockAtom = atom<number | undefined>(undefined)
// Prices
export const ethPriceAtom = atom(1)
export const rsrPriceAtom = atom(1)
export const gasPriceAtom = atom(1)
export const rTokenPriceAtom = atom(1)
export const rsrExchangeRateAtom = atom(1)
export const blockTimestampAtom = atom<number>(0)

/**
 * RToken management
 */

// Cache layer for loaded tokens
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

/**
 * Wallet Management
 */
// tracks current connected address
export const walletAtom = atom('')
// tracks rToken/collaterals/stRSR/RSR balances for a connected account
export const balancesAtom = atom<{ [x: string]: number }>({})
export const rTokenBalanceAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && get(balancesAtom)[rToken.address]) {
    return get(balancesAtom)[rToken.address]
  }

  return 0
})
export const rsrBalanceAtom = atom((get) => {
  return get(balancesAtom)[RSR.address] || 0
})
export const stRsrBalanceAtom = atom((get) => {
  const stRSR = get(rTokenAtom)?.stToken?.address

  if (stRSR) {
    return get(balancesAtom)[stRSR] || 0
  }

  return 0
})
// trackks allowance for stRSR/RSR and Collaterals/rToken
export const allowanceAtom = atom<{ [x: string]: BigNumber }>({})

/**
 * Pending balances
 */
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

// Calls state
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

const txStorage = createJSONStorage<TransactionMap>(() => localStorage)

/**
 * Parse transactions from localStorage
 * Mark signing and pending transactions status to unknown
 */
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
    console.error('erorr parsing', e)
    localStorage.setItem(key, JSON.stringify({}))
    return {}
  }
}

export const txAtom = atomWithStorage<TransactionMap>(
  'transactions',
  {},
  txStorage
)

export const currentTxAtom = atom((get) => {
  const chain = get(chainIdAtom) ?? 0
  const account = get(walletAtom) ?? ''
  const txs = get(txAtom)

  return txs[chain] && txs[chain][account] ? txs[chain][account] : []
})

// TODO: Improve or split this atom
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

/**
 * Records - cache layer for record history pulled from theGraph
 */
export const recentProtocolRecordsAtom = atom<TransactionRecord[]>([])

export const recentTokenTransfersAtom = atom<TransactionRecord[]>([])

export const recentRTokenRecordsAtom = atom<TransactionRecord[]>([])

// TODO: Refactor this whole file clean it up

/**
 * Account rToken holdings and stake positions
 */
export const accountTokensAtom = atom<AccountToken[]>([])
export const accountPositionsAtom = atom<AccountPosition[]>([])
export const accountHoldingsAtom = atom(0)
