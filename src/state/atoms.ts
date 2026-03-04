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

// Index DTF icons used globally by token-logo component
import { atom } from 'jotai'
export const indexDTFIconsAtom = atom<Record<number, Record<string, string>>>(
  {}
)
