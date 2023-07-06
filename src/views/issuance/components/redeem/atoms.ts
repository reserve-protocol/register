import { FacadeInterface } from 'abis'
import { Facade } from 'abis/types'
import { BigNumber } from 'ethers'
import { formatUnits, getAddress, parseUnits } from 'ethers/lib/utils'
import { atom } from 'jotai'
import {
  basketNonceAtom,
  getValidWeb3Atom,
  isModuleLegacyAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { getContract, safeParseEther } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { redeemAmountDebouncedAtom } from 'views/issuance/atoms'

interface RedeemQuote {
  [x: string]: { amount: BigNumber; targetAmount: BigNumber; loss: number }
}

// UI element controller
export const customRedeemNonceAtom = atom<null | number>(null)

export const customRedeemModalAtom = atom(false)

// If custom is set return that nonce
export const redeemNonceAtom = atom((get) => {
  return get(customRedeemNonceAtom) || get(basketNonceAtom)
})

export const redeemQuotesAtom = atomWithLoadable(async (get) => {
  const currentNonce = get(basketNonceAtom)
  const assets = get(rTokenAssetsAtom)
  const rToken = get(rTokenAtom)
  const { issuance: isLegacy } = get(isModuleLegacyAtom)
  const { isCollaterized } = get(rTokenStateAtom)
  const amount = get(redeemAmountDebouncedAtom)
  const { provider, chainId } = get(getValidWeb3Atom)
  const quotes: { [x: string]: RedeemQuote } = {}

  if (isNaN(+amount) || Number(amount) <= 0) {
    return { [currentNonce.toString()]: {} } // empty default to 0 on UI but no loading state
  }

  // TODO: Remove RSV case when is fully deprecated
  if (rToken && !rToken.main) {
    return {
      [currentNonce.toString()]: {
        [rToken.collaterals[0].address]: {
          amount: parseUnits(amount, 6),
          targetAmount: BigNumber.from(0),
          loss: 0,
        },
      },
    }
  }

  if (!provider || !rToken || !assets) {
    return null
  }

  const facadeReadContract = getContract(
    FACADE_ADDRESS[chainId],
    FacadeInterface,
    provider
  ) as Facade
  const parsedAmount = safeParseEther(amount)

  // TODO: Legacy remove after migration
  if (isLegacy) {
    const quote = await facadeReadContract.callStatic.issue(
      rToken.address,
      parsedAmount
    )
    quotes[currentNonce.toString()] = quote.tokens.reduce(
      (prev, current, currentIndex) => {
        prev[getAddress(current)] = {
          amount: quote.deposits[currentIndex],
          targetAmount: BigNumber.from(0),
          loss: 0,
        }
        return prev
      },
      {} as RedeemQuote
    )
  } else {
    const quote = await facadeReadContract.callStatic.redeem(
      rToken.address,
      parsedAmount
    )
    quotes[currentNonce.toString()] = quote.tokens.reduce(
      (prev, current, currentIndex) => {
        const assetAddress = getAddress(current)
        const amount = quote.available[currentIndex]
        const targetAmount = quote.withdrawals[currentIndex]
        let loss = 0

        if (!amount.eq(targetAmount)) {
          loss = +formatUnits(
            targetAmount.sub(amount),
            assets[assetAddress].token.decimals
          )
        }

        prev[assetAddress] = {
          amount,
          targetAmount,
          loss,
        }
        return prev
      },
      {} as RedeemQuote
    )

    // Quote previous nonce
    if (!isCollaterized) {
      const prevQuote = await facadeReadContract.callStatic.redeemCustom(
        rToken.address,
        parsedAmount,
        [BigNumber.from(currentNonce - 1)],
        [BigNumber.from('1')]
      )

      quotes[currentNonce - 1] = prevQuote.tokens.reduce(
        (prev, current, currentIndex) => {
          prev[getAddress(current)] = {
            amount: prevQuote.withdrawals[currentIndex],
            targetAmount: BigNumber.from(0),
            loss: 0,
          }
          return prev
        },
        {} as RedeemQuote
      )
    }
  }

  return quotes
})
