import { BigNumber } from 'ethers'
import { atom } from 'jotai'
import { safeParseEther } from 'utils'
import { BI_ZERO } from 'utils/constants'
import {
  blockTimestampAtom,
  rsrBalanceAtom,
  stRsrBalanceAtom,
} from './../../state/atoms'

const isValid = (value: BigNumber, max: BigNumber) =>
  value.gt(BI_ZERO) && value.lte(max)

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
