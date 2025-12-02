import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { formatUnits } from 'viem'
import { rsrPriceAtom } from '@/state/atoms'
import { safeParseEther, isAmountValid } from '@/utils'

export type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
}

export type DTFInfo = {
  id: string
  symbol: string
  name: string
  logo?: string
}

export type StTokenExtended = {
  stToken: Token // stRSR token
  dtf: DTFInfo // DTF info
  chainId: number
}

// Main stToken atom that will be set from props
export const stTokenAtom = atomWithReset<StTokenExtended | undefined>(
  undefined
)

// Tab state
export const currentStakingTabAtom = atomWithReset<'stake' | 'unstake'>('stake')

// Input state
export const stakingInputAtom = atomWithReset<string>('')

// Prices - RSR price comes from global state
export const exchangeRateAtom = atomWithReset<number | undefined>(undefined) // RSR per stRSR

// Balances
export const rsrBalanceAtom = atomWithReset<bigint | undefined>(undefined)
export const stTokenBalanceAtom = atomWithReset<bigint | undefined>(undefined)

// UI state
export const unstakeDelayAtom = atomWithReset<number | undefined>(undefined) // in days
export const unstakeCheckboxAtom = atomWithReset<boolean>(false)

// Delegation state
export const currentDelegateAtom = atomWithReset<string>('')
export const delegateAtom = atomWithReset<string>('')
export const isLegacyAtom = atomWithReset<boolean>(false) // Whether the contract is legacy

// Atom to trigger drawer close from child components
export const closeDrawerAtom = atom(false)

// Error handling atom
export const errorMessageAtom = atomWithReset<string>('')

// Loading states
export const delegationLoadingAtom = atomWithReset<boolean>(true)

// Derived atoms
export const inputPriceAtom = atom<number>((get) => {
  const input = get(stakingInputAtom)
  const price = get(rsrPriceAtom)
  const currentTab = get(currentStakingTabAtom)

  if (!price || !input) return 0

  // For staking, input is RSR, for unstaking, we need to convert stRSR to RSR first
  if (currentTab === 'stake') {
    return price * Number(input)
  } else {
    const rate = get(exchangeRateAtom)
    if (!rate) return 0
    return price * Number(input) * rate // stRSR * rate = RSR equivalent
  }
})

export const rsrBalanceStringAtom = atom<string>((get) => {
  const balance = get(rsrBalanceAtom)
  return balance ? formatUnits(balance, 18) : '0'
})

export const stTokenBalanceStringAtom = atom<string>((get) => {
  const balance = get(stTokenBalanceAtom)
  const stToken = get(stTokenAtom)
  const decimals = stToken?.stToken.decimals || 18

  return balance ? formatUnits(balance, decimals) : '0'
})

// Output calculation atoms
export const stakeOutputAtom = atom<string>((get) => {
  const input = get(stakingInputAtom)
  const rate = get(exchangeRateAtom)

  if (!input || !rate) return '0'

  // RSR amount / exchange rate = stRSR amount
  const output = Number(input) / rate
  return output.toString()
})

export const unstakeOutputAtom = atom<string>((get) => {
  const input = get(stakingInputAtom)
  const rate = get(exchangeRateAtom)

  if (!input || !rate) return '0'

  // stRSR amount * exchange rate = RSR amount
  const output = Number(input) * rate
  return output.toString()
})

// Validation atoms
export const isValidStakeAmountAtom = atom<boolean>((get) => {
  const input = get(stakingInputAtom)
  const balance = get(rsrBalanceAtom)
  const checkbox = get(unstakeCheckboxAtom)

  if (!input || !balance) return false
  if (!checkbox) return false

  const amount = safeParseEther(input)
  return isAmountValid(amount, balance)
})

export const isValidUnstakeAmountAtom = atom<boolean>((get) => {
  const input = get(stakingInputAtom)
  const balance = get(stTokenBalanceAtom)

  if (!input || !balance) return false

  const amount = safeParseEther(input)
  return isAmountValid(amount, balance)
})