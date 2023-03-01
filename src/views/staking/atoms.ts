import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { BI_ZERO } from 'utils/constants'
import { rsrBalanceAtom, stRsrBalanceAtom } from './../../state/atoms'

const isValid = (value: BigNumber, max: BigNumber) =>
  value.gt(BI_ZERO) && value.lte(max)

export const stakeAmountAtom = atom('')
export const unStakeAmountAtom = atom('')
export const isValidStakeAmountAtom = atom((get) => {
  return isValid(
    parseEther(get(stakeAmountAtom) || '0'),
    get(rsrBalanceAtom).value
  )
})

export const isValidUnstakeAmountAtom = atom((get) => {
  return isValid(
    parseEther(get(unStakeAmountAtom) || '0'),
    get(stRsrBalanceAtom).value
  )
})
