import { atom } from 'jotai'
import { InternalDTF } from './hooks/use-internal-dtf-list'
import { walletAtom } from '@/state/atoms'
import { Address } from 'viem'

// Pagination atoms
export const currentPageAtom = atom(0)
export const pageSizeAtom = atom(50)
export const totalCountAtom = atom(0)

// DTF list data
export const dtfListAtom = atom<InternalDTF[]>([])
export const isLoadingAtom = atom(false)
export const marketCapsAtom = atom<{ [key: string]: number }>({}) // key is `${chainId}-${address.toLowerCase()}`

// Filter atoms
export const isGovernorFilterAtom = atom(false)
export const isGuardianFilterAtom = atom(false) 
export const isCreatorFilterAtom = atom(false)
export const hasBalanceFilterAtom = atom(false)
export const dateFilterAtom = atom<'all' | '24h' | '7d' | '15d' | '30d'>('all')
export const chainFilterAtom = atom<'all' | number>('all')

// Helper function to check if wallet is guardian
const isWalletGuardian = (dtf: InternalDTF, wallet: Address): boolean => {
  const guardians: Address[] = []
  
  if (dtf.ownerGovernance?.timelock?.guardians) {
    guardians.push(...dtf.ownerGovernance.timelock.guardians)
  }
  if (dtf.tradingGovernance?.timelock?.guardians) {
    guardians.push(...dtf.tradingGovernance.timelock.guardians)
  }
  if (dtf.stToken?.governance?.timelock?.guardians) {
    guardians.push(...dtf.stToken.governance.timelock.guardians)
  }
  
  return guardians.some(g => g.toLowerCase() === wallet.toLowerCase())
}

// Helper function to check if wallet is governor (has governance)
const isWalletGovernor = (dtf: InternalDTF): boolean => {
  // For simplicity, we check if DTF has governance configured
  // In a real implementation, you'd check if wallet holds voting tokens
  return !!(dtf.ownerGovernance || dtf.tradingGovernance || dtf.stToken?.governance)
}

// Helper function to filter by date
const filterByDate = (dtf: InternalDTF, dateFilter: string): boolean => {
  if (dateFilter === 'all') return true
  
  const now = Date.now() / 1000 // Current time in seconds
  const dtfTime = dtf.timestamp
  const diff = now - dtfTime
  
  switch (dateFilter) {
    case '24h':
      return diff <= 86400 // 24 hours
    case '7d':
      return diff <= 604800 // 7 days
    case '15d':
      return diff <= 1296000 // 15 days
    case '30d':
      return diff <= 2592000 // 30 days
    default:
      return true
  }
}

// Filtered DTF list
export const filteredDtfListAtom = atom((get) => {
  const dtfList = get(dtfListAtom)
  const wallet = get(walletAtom)
  const isGovernorFilter = get(isGovernorFilterAtom)
  const isGuardianFilter = get(isGuardianFilterAtom)
  const isCreatorFilter = get(isCreatorFilterAtom)
  const hasBalanceFilter = get(hasBalanceFilterAtom)
  const dateFilter = get(dateFilterAtom)
  const chainFilter = get(chainFilterAtom)
  
  let filtered = dtfList
  
  // Apply chain filter
  if (chainFilter !== 'all') {
    filtered = filtered.filter(dtf => dtf.chainId === chainFilter)
  }
  
  // Apply date filter
  filtered = filtered.filter(dtf => filterByDate(dtf, dateFilter))
  
  // Apply balance filter
  if (hasBalanceFilter) {
    filtered = filtered.filter(dtf => dtf.hasBalance === true)
  }
  
  // Apply wallet filters if wallet is connected
  if (wallet && (isGovernorFilter || isGuardianFilter || isCreatorFilter)) {
    filtered = filtered.filter(dtf => {
      if (isCreatorFilter && dtf.deployer.toLowerCase() === wallet.toLowerCase()) {
        return true
      }
      if (isGuardianFilter && isWalletGuardian(dtf, wallet)) {
        return true
      }
      if (isGovernorFilter && isWalletGovernor(dtf)) {
        return true
      }
      return false
    })
  }
  
  return filtered
})

// Total pages based on filtered results
export const totalPagesAtom = atom((get) => {
  const totalCount = get(totalCountAtom)
  const pageSize = get(pageSizeAtom)
  return Math.ceil(totalCount / pageSize)
})

// Reset filters atom
export const resetFiltersAtom = atom(null, (get, set) => {
  set(isGovernorFilterAtom, false)
  set(isGuardianFilterAtom, false)
  set(isCreatorFilterAtom, false)
  set(hasBalanceFilterAtom, false)
  set(dateFilterAtom, 'all')
  set(chainFilterAtom, 'all')
  set(currentPageAtom, 0)
})