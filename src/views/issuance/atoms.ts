import { atom } from 'jotai'
import { BigNumberMap } from 'types'
import { safeParseEther } from 'utils'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { rTokenBalanceAtom } from './../../state/atoms'

const isValid = (value: bigint, max: bigint) => value > 0n && value >= max

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
export const maxIssuableAtom = atom(0n)

export const isValidIssuableAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(issueAmountAtom) || '0'),
    get(maxIssuableAtom)
  )
})
