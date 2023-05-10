import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

/**
 * ######################
 * ? Utility to clean-up storage in case of breaking changes
 * ######################
 */
const VERSION = '1'

if (
  !localStorage.getItem('version') ||
  localStorage.getItem('version') !== VERSION
) {
  localStorage.clear()
  localStorage.setItem('version', VERSION)
}

export const searchParamsAtom = atom(
  new URLSearchParams(window.location.search)
)
export const searchParamAtom = atomFamily(
  (key: string) => atom((get) => get(searchParamsAtom).get(key)),
  (l, r) => l === r
)

/**
 * ##################
 * Price related atom
 * ##################
 */

export const ethPriceAtom = atom(1)
export const gasPriceAtomBn = atom(ethers.constants.Zero)
export const gasPriceAtom = atom((get) =>
  Number(formatEther(get(gasPriceAtomBn)))
)

/**
 * #################
 * Wallet Management
 * #################
 */

// RSV Metrics
export interface RPayTx {
  id: string
  type: string
  amountUSD: string
  timestamp: number
}

export const rpayTransactionsAtom = atom<RPayTx[]>([])

export const rpayOverviewAtom = atom({
  volume: 0,
  txCount: 0,
  holders: 0,
  dayVolume: 0,
  dayTxCount: 0,
})

export const RSVOverview = {
  dayVolume: 0,
  dayTxCount: 0,
  volume: 5784335728,
  txCount: 12640025,
  holders: 0,
}

export * from './atoms/accountAtoms'
export * from './atoms/chainAtoms'
export * from './atoms/rTokenAtoms'
export * from './atoms/transactionAtoms'
