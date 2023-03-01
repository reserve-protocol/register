import { BigNumber } from 'ethers'
import { atom } from 'jotai'
import { safeParseEther } from 'utils'
import { BI_ZERO } from 'utils/constants'
import { rsrBalanceAtom, stRsrBalanceAtom } from './../../state/atoms'

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
