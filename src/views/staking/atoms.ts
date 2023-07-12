import { atom } from 'jotai'
import { safeParseEther } from 'utils'
import {
  blockTimestampAtom,
  rsrBalanceAtom,
  stRsrBalanceAtom,
} from './../../state/atoms'

const isValid = (value: bigint, max: bigint) => value > 0n && value <= max

export const stakeAmountAtom = atom('')
export const unStakeAmountAtom = atom('')
export const isValidStakeAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(stakeAmountAtom) || '0'),
    get(rsrBalanceAtom).value
  )
})

export const isValidUnstakeAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(unStakeAmountAtom) || '0'),
    get(stRsrBalanceAtom).value
  )
})

// List of unstake cooldown for the selected rToken
export const pendingRSRAtom = atom<
  { availableAt: number; index: bigint; amount: number }[]
>([])
export const pendingRSRSummaryAtom = atom<{
  index: bigint
  availableIndex: bigint
  pendingAmount: number
  availableAt: number
  availableAmount: number
}>((get) => {
  const currentTime = get(blockTimestampAtom)
  return get(pendingRSRAtom).reduce(
    (acc, unstake) => {
      acc.index = unstake.index
      acc.availableAt = unstake.availableAt

      if (currentTime >= unstake.availableAt) {
        acc.availableAmount += unstake.amount
        acc.availableIndex = BigInt(acc.availableAt)
      } else {
        acc.pendingAmount += unstake.amount
      }

      return acc
    },
    {
      index: 0n,
      availableIndex: 0n,
      pendingAmount: 0,
      availableAt: 0,
      availableAmount: 0,
    }
  )
})
