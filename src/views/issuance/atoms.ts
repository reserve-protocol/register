import { BigNumber } from 'ethers'
import { atom } from 'jotai'
import { safeParseEther } from 'utils'
import { BI_ZERO } from 'utils/constants'
import { rTokenBalanceAtom } from './../../state/atoms'
import { BigNumberMap } from './../../types/index'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'

const isValid = (value: BigNumber, max: BigNumber) =>
  value.gt(BI_ZERO) && value.lte(max)

export const quantitiesAtom = atom<BigNumberMap>({})
export const issueAmountAtom = atom('')

export const redeemAmountAtom = atom('')
export const redeemAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(redeemAmountAtom)),
  400
).debouncedValueAtom
export const isValidRedeemAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(redeemAmountAtom) || '0'),
    get(rTokenBalanceAtom).value
  )
})
export const maxIssuableAtom = atom(BI_ZERO)

export const isValidIssuableAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(issueAmountAtom) || '0'),
    get(maxIssuableAtom)
  )
})
