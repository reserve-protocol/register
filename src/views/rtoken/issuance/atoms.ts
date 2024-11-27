import FacadeRead from 'abis/FacadeRead'
import { atom } from 'jotai'
import { BigNumberMap } from 'types'
import { safeParseEther } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { atomWithLoadable } from 'utils/atoms/utils'
import { quote } from 'utils/rsv'
import { getAddress } from 'viem'
import { chainIdAtom, rTokenAtom, rTokenBalanceAtom } from './../../state/atoms'
import { simulateContract } from 'wagmi/actions'
import { wagmiConfig } from 'state/chain'

export const wrapSidebarAtom = atom(false)

const isValid = (value: bigint, max: bigint) => value > 0n && value <= max

export const issueAmountAtom = atom('')
export const issueAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(issueAmountAtom)),
  500
).debouncedValueAtom

export const redeemAmountAtom = atom('')
export const redeemAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(redeemAmountAtom)),
  500
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
    get(maxIssuableAtom) ?? 0n
  )
})

export const quantitiesAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const amount = get(issueAmountDebouncedAtom)
  const chainId = get(chainIdAtom)

  if (!rToken || !(Number(amount) > 0)) {
    return null
  }

  // RSV quote
  if (!rToken.main) {
    return quote(amount)
  }

  const {
    result: [tokens, deposits],
  } = await simulateContract(wagmiConfig, {
    abi: FacadeRead,
    address: FACADE_ADDRESS[chainId],
    functionName: 'issue',
    args: [rToken.address, safeParseEther(amount)],
    chainId,
  })

  return tokens.reduce((prev, current, currentIndex) => {
    prev[getAddress(current)] = deposits[currentIndex]
    return prev
  }, {} as BigNumberMap)
})
