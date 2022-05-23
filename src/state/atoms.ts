import { RSR } from 'utils/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { TRANSACTION_STATUS } from 'utils/constants'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  MulticallState,
  RawCall,
  ReserveToken,
  TransactionState,
  Wallet,
} from 'types'

// TODO: Maybe its time to split up this atoms file
localStorage.setItem('trackedAccount', localStorage.trackedAccount || ' ')
localStorage.setItem('selectedAccount', localStorage.selectedAccount || ' ')
localStorage.setItem('selectedToken', localStorage.selectedToken || ' ')

// Prices
export const ethPriceAtom = atom(1)
export const rsrPriceAtom = atom(1)
export const gasPriceAtom = atom(1)
export const rTokenPriceAtom = atom(1)
export const rsrExchangeRate = atom(1)

export const reserveTokensAtom = atomWithStorage<{ [x: string]: ReserveToken }>(
  'reserveTokens',
  {}
)
export const selectedRTokenAtom = atomWithStorage('selectedRToken', '')
export const rTokenAtom = atom<ReserveToken | null>((get) =>
  get(reserveTokensAtom) && get(reserveTokensAtom)[get(selectedRTokenAtom)]
    ? get(reserveTokensAtom)[get(selectedRTokenAtom)]
    : null
)

export const walletsAtom = atomWithStorage<{ [x: string]: Wallet }>(
  'wallets',
  {}
)
export const selectedAccountAtom = atomWithStorage('trackedAccount', '')
export const connectedAccountAtom = atom('')

export const walletAtom = atom<Wallet | null>((get) =>
  get(walletsAtom) && get(walletsAtom)[get(selectedAccountAtom)]
    ? get(walletsAtom)[get(selectedAccountAtom)]
    : null
)

export const currentWalletAtom = atom<Wallet | null>(
  (get) => get(walletsAtom)[get(connectedAccountAtom)] || null
)

export const balancesAtom = atom<{ [x: string]: number }>({})
export const rTokenBalanceAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && get(balancesAtom)[rToken.token.address]) {
    return get(balancesAtom)[rToken.token.address]
  }

  return 0
})
export const rsrBalanceAtom = atom((get) => {
  return get(balancesAtom)[RSR.address] || 0
})
export const stRsrBalanceAtom = atom((get) => {
  const stRSR = get(rTokenAtom)?.insurance?.token.address

  if (stRSR) {
    return get(balancesAtom)[stRSR] || 0
  }

  return 0
})
export const allowanceAtom = atom<{ [x: string]: BigNumber }>({})
export const pendingIssuancesAtom = atom<any[]>([])
export const pendingIssuancesSummary = atom((get) => {
  const pending = get(pendingIssuancesAtom)

  // TODO: Correct timestamp formatting
  return pending.reduce(
    (acc, issuance) => {
      acc.index = issuance.index

      if (issuance.availableAt > Date.now()) {
        acc.pendingAmount += issuance.amount
      } else {
        acc.availableAmount += issuance.amount
      }

      return acc
    },
    {
      index: BigNumber.from(0),
      pendingAmount: 0,
      availableAmount: 0,
    }
  )
})

export const pendingRSRAtom = atom<any[]>([])
export const pendingRSRSummaryAtom = atom((get) => {
  return get(pendingRSRAtom).reduce(
    (acc, unstake) => {
      acc.index = unstake.index

      if (unstake.availableAt > Date.now()) {
        acc.pendingAmount += unstake.amount
      } else {
        acc.availableAmount += unstake.amount
      }

      return acc
    },
    {
      index: BigNumber.from(0),
      pendingAmount: 0,
      availableAmount: 0,
    }
  )
})

// Calls state
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

export const txAtom = atomWithStorage<{ [x: string]: TransactionState[] }>(
  'transactions',
  {}
)
export const currentTxAtom = atom((get) =>
  get(txAtom) && get(txAtom)[get(selectedAccountAtom)]
    ? get(txAtom)[get(selectedAccountAtom)]
    : []
)

export const pendingTxAtom = atom((get) => {
  const result = {
    pending: <[number, TransactionState][]>[],
    mining: <[number, TransactionState][]>[],
  }

  return get(currentTxAtom).reduce((acc, current, index) => {
    if (current.status === TRANSACTION_STATUS.PENDING) {
      acc.pending = [...acc.pending, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.MINING) {
      acc.mining = [...acc.mining, [index, current]]
    }

    return acc
  }, result)
})

export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    const txs = get(txAtom)
    const account = get(selectedAccountAtom)
    set(txAtom, { ...txs, [account]: [...(txs[account] ?? []), ...tx] })
  }
)

export const updateTransactionAtom = atom(
  null,
  (get, set, data: [number, Partial<TransactionState>]) => {
    const txs = get(txAtom)
    const account = get(selectedAccountAtom)
    const currentTx = txs[account]
    const [index, newData] = data

    set(txAtom, {
      ...txs,
      [account]: [
        ...currentTx.slice(0, index),
        { ...currentTx[index], ...newData },
        ...currentTx.slice(index + 1),
      ],
    })
  }
)
