import FacadeRead from 'abis/FacadeRead'
import { atom } from 'jotai'
import {
  chainIdAtom,
  isModuleLegacyAtom,
  rTokenAssetsAtom,
  rTokenAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { safeParseEther } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { formatUnits, getAddress, parseEther, parseUnits } from 'viem'
import { redeemAmountDebouncedAtom } from '@/views/rtoken/issuance/atoms'
import { simulateContract } from 'wagmi/actions'

interface RedeemQuote {
  [x: string]: { amount: bigint; targetAmount: bigint; loss: number }
}

// UI element controller
export const customRedeemNonceAtom = atom<null | number>(null)

export const customRedeemModalAtom = atom(false)

// If custom is set return that nonce
export const redeemNonceAtom = atom((get) => {
  return get(customRedeemNonceAtom) || get(rTokenStateAtom).basketNonce
})

export const redeemQuotesAtom = atomWithLoadable(async (get) => {
  const currentNonce = get(rTokenStateAtom).basketNonce
  const assets = get(rTokenAssetsAtom)
  const rToken = get(rTokenAtom)
  const { issuance: isLegacy } = get(isModuleLegacyAtom)
  const { isCollaterized } = get(rTokenStateAtom)
  const amount = get(redeemAmountDebouncedAtom)
  const chainId = get(chainIdAtom)
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
          targetAmount: 0n,
          loss: 0,
        },
      },
    }
  }

  if (!rToken || !assets) {
    return null
  }

  const parsedAmount = safeParseEther(amount)

  // TODO: Legacy remove after migration
  if (isLegacy) {
    const {
      result: [tokens, deposits],
    } = await simulateContract(wagmiConfig, {
      abi: FacadeRead,
      address: FACADE_ADDRESS[chainId],
      functionName: 'issue',
      args: [rToken.address, parsedAmount],
      chainId,
    })

    quotes[currentNonce.toString()] = tokens.reduce(
      (prev, current, currentIndex) => {
        prev[getAddress(current)] = {
          amount: deposits[currentIndex],
          targetAmount: 0n,
          loss: 0,
        }
        return prev
      },
      {} as RedeemQuote
    )
  } else {
    const {
      result: [tokens, withdrawals, available],
    } = await simulateContract(wagmiConfig, {
      abi: FacadeRead,
      address: FACADE_ADDRESS[chainId],
      functionName: 'redeem',
      args: [rToken.address, parsedAmount],
      chainId,
    })

    quotes[currentNonce.toString()] = tokens.reduce(
      (prev, current, currentIndex) => {
        const assetAddress = getAddress(current)
        const amount = available[currentIndex]
        const targetAmount = withdrawals[currentIndex]
        let loss = 0

        if (amount !== targetAmount) {
          loss = +formatUnits(
            targetAmount - amount,
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
      const {
        result: [tokens, withdrawals],
      } = await simulateContract(wagmiConfig, {
        abi: FacadeRead,
        address: FACADE_ADDRESS[chainId],
        functionName: 'redeemCustom',
        args: [
          rToken.address,
          parsedAmount,
          [currentNonce - 1],
          [parseEther('1')],
        ],
        chainId,
      })

      quotes[currentNonce - 1] = tokens.reduce(
        (prev, current, currentIndex) => {
          prev[getAddress(current)] = {
            amount: withdrawals[currentIndex],
            targetAmount: 0n,
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
