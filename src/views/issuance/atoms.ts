import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { BI_ZERO } from 'utils/constants'
import { rTokenBalanceAtom } from './../../state/atoms'
import { BigNumberMap } from './../../types/index'

const isValid = (value: BigNumber, max: BigNumber) =>
  value.gt(BI_ZERO) && value.lte(max)

export const quantitiesAtom = atom<BigNumberMap>({})
export const issueAmountAtom = atom('')
export const redeemAmountAtom = atom('')
export const isValidRedeemAmountAtom = atom((get) => {
  return isValid(
    parseEther(get(redeemAmountAtom) || '0'),
    get(rTokenBalanceAtom).value
  )
})
export const maxIssuableAtom = atom(BI_ZERO)

export const isValidIssuableAmountAtom = atom((get) => {
  return isValid(parseEther(get(issueAmountAtom) || '0'), get(maxIssuableAtom))
})
