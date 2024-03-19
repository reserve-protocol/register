import StRSR from 'abis/StRSR'
import { atom } from 'jotai'
import { gasPriceAtom, rTokenAtom, stRsrBalanceAtom } from 'state/atoms'
import { isAmountValid, safeParseEther } from 'utils'

const UNSTAKE_GAS_ESTIMATE = 430000

export const unstakeGasEstimateAtom = atom((get) => {
  const gasPrice = get(gasPriceAtom)

  return UNSTAKE_GAS_ESTIMATE * gasPrice
})

export const unStakeAmountAtom = atom('')
export const isValidUnstakeAmountAtom = atom((get) => {
  return isAmountValid(
    safeParseEther(get(unStakeAmountAtom) || '0'),
    get(stRsrBalanceAtom).value
  )
})

export const unstakeTransactionAtom = atom((get) => {
  const isValid = get(isValidUnstakeAmountAtom)
  const amount = get(unStakeAmountAtom)
  const rToken = get(rTokenAtom)

  if (!rToken?.stToken || !isValid) {
    return undefined
  }

  return {
    abi: StRSR,
    address: rToken.stToken.address,
    functionName: 'unstake',
    args: [safeParseEther(amount)],
  }
})
