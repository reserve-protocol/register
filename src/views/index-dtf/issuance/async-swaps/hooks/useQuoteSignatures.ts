import { chainIdAtom, walletAtom } from '@/state/atoms'
import { OrderBalance } from '@cowprotocol/contracts'
import {
  OrderCreation,
  OrderSigningUtils,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, encodeFunctionData, erc20Abi, Hex, maxUint256 } from 'viem'
import { useSendCalls } from 'wagmi'
import {
  currentAsyncSwapTabAtom,
  ordersAtom,
  quotesAtom,
  selectedTokenOrDefaultAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import { QuoteProvider } from '../types'
import CowswapSettlement from '@/abis/CowSwapSettlement'

const COWSWAP_SETTLEMENT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41' as const
const COWSWAP_VAULT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const

export function useQuoteSignatures() {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const zapDirection = useAtomValue(currentAsyncSwapTabAtom)
  const quoteToken = useAtomValue(selectedTokenOrDefaultAtom).address
  const quotes = Object.values(useAtomValue(quotesAtom))
  const setOrders = useSetAtom(ordersAtom)

  const { orderBookApi } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()

  return useMutation({
    mutationFn: async () => {
      if (!address || !orderBookApi || !chainId) {
        console.error('No global kit')
        return {
          orders: [],
        }
      }

      const successfulQuotes = quotes.filter((quote) => quote.success)

      console.log({ successfulQuotes })

      if (successfulQuotes.length === 0) {
        return {
          orders: [],
        }
      }

      // Generate order IDs and hashed messages for all quotes
      const orderData = await Promise.all(
        successfulQuotes.map(async (quote) => {
          if (quote.success && quote.type === QuoteProvider.CowSwap) {
            if (quote.data.quote.sellAmount === '0') {
              return null
            }

            const modifiedQuote = {
              ...quote.data.quote,
              feeAmount: '0',
              buyAmount:
                zapDirection === 'mint'
                  ? quote.data.quote.buyAmount
                  : (
                      (BigInt(quote.data.quote.buyAmount) * 98n) /
                      100n
                    ).toString(),
              sellAmount:
                zapDirection === 'mint'
                  ? (
                      (BigInt(quote.data.quote.sellAmount) * 101n) /
                      100n
                    ).toString()
                  : quote.data.quote.sellAmount,
              from: address,
              receiver: address!,
              signature: address!,
              signingScheme: SigningScheme.PRESIGN,
            } as const satisfies OrderCreation

            const orderId = await OrderSigningUtils.generateOrderId(
              chainId,
              {
                ...modifiedQuote,
                sellTokenBalance: OrderBalance.ERC20,
                buyTokenBalance: OrderBalance.ERC20,
              },
              {
                owner: address,
              }
            )

            const encodedPreSignTx = encodeFunctionData({
              abi: CowswapSettlement,
              functionName: 'setPreSignature',
              args: [orderId.orderId as Hex, true],
            })

            return {
              type: QuoteProvider.CowSwap,
              data: {
                orderId: orderId.orderId,
                quote: modifiedQuote,
                preSignTx: encodedPreSignTx,
                sellToken: modifiedQuote.sellToken,
                amount: modifiedQuote.sellAmount,
              },
            }
          }

          return null
        })
      )

      const validOrderData = orderData.filter((data) => data !== null)

      const txData = validOrderData
        .map(({ type, data }) => {
          if (type === QuoteProvider.CowSwap) {
            return [
              zapDirection === 'redeem'
                ? {
                    to: data.sellToken as Address,
                    data: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'approve',
                      args: [COWSWAP_VAULT, BigInt(data.amount)],
                    }),
                    value: 0n,
                  }
                : null,
              {
                to: COWSWAP_SETTLEMENT,
                data: data.preSignTx,
                value: 0n,
              },
            ].filter((e) => e !== null)
          }

          return null
        })
        .filter((data) => data !== null)
        .flat()

      if (zapDirection === 'mint') {
        txData.unshift({
          to: quoteToken,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [COWSWAP_VAULT, maxUint256],
          }),
          value: 0n,
        })
      }

      // TODO: tx confirmation checks
      const txBundle = await sendCallsAsync({
        calls: txData,
        account: address,
        forceAtomic: true,
      })

      // TODO: Turns out this is buggy
      // const receipt = await walletClient.waitForCallsStatus({
      //   id: txBundle.id,
      // });

      console.log({ txBundle })

      // TODO: Wait here until Safe tx is onchain
      // I wonder if this is better suited for a different hook tbh

      // TODO: Create an order Index which is independently managed
      await Promise.all(
        orderData
          .filter((e) => e != null)
          .map(async ({ data }) => {
            const e = await orderBookApi.sendOrder({
              ...data.quote,
              from: address,
              signature: address,
              signingScheme: SigningScheme.PRESIGN,
            })
            console.log(data, e)
            return e
          })
      )

      setOrders(validOrderData.map(({ data }) => data.orderId))

      return {
        orders: validOrderData.map(({ data }) => data.orderId),
      }
    },
    onError(error) {
      console.error(error)
    },
  })
}
