import { atom } from 'jotai'
import { formatEther } from 'viem'

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

/**
 * ##################
 * Price related atom
 * ##################
 */

export const ethPriceAtom = atom(1)
export const gasFeeAtom = atom<bigint | null>(null)
export const gasPriceAtom = atom((get) =>
  Number(formatEther(get(gasFeeAtom) || 0n))
)

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

export * from './wallet/atoms'
export * from './chain/atoms/chainAtoms'
export * from './rtoken/atoms/rTokenStateAtom'
export { default as rTokenAssetsAtom } from './rtoken/atoms/rTokenAssetsAtom'
export {
  default as rTokenAtom,
  selectedRTokenAtom,
} from './rtoken/atoms/rTokenAtom'
export { default as rTokenBackingDistributionAtom } from './rtoken/atoms/rTokenBackingDistributionAtom'
export { default as rTokenBackupAtom } from './rtoken/atoms/rTokenBackupAtom'
export { default as rTokenBasketAtom } from './rtoken/atoms/rTokenBasketAtom'
export { default as rTokenConfigurationAtom } from './rtoken/atoms/rTokenConfigurationAtom'
export { default as rTokenContractsAtom } from './rtoken/atoms/rTokenContractsAtom'
export { default as rTokenRevenueSplitAtom } from './rtoken/atoms/rTokenRevenueSplitAtom'
