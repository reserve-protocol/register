import CowswapSettlement from '@/abis/CowSwapSettlement'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { OrderBalance } from '@cowprotocol/contracts'
import {
  OrderCreation,
  OrderSigningUtils,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useMutation } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  Address,
  encodeFunctionData,
  erc20Abi,
  Hex,
  maxUint256,
  parseEther,
} from 'viem'
import { useSendCalls, useSignTypedData } from 'wagmi'
import {
  userInputAtom,
  asyncSwapResponseAtom,
  operationAtom,
  mintValueAtom,
  orderIdsAtom,
  quotesAtom,
  selectedTokenAtom,
  failedOrdersAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import { QuoteProvider } from '../types'
import { uuidv4 } from '@/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { generateTypedData } from 'universal-sdk'
import { CustomUniversalQuote } from '../providers/universal'

const COWSWAP_SETTLEMENT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41' as const
const COWSWAP_VAULT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const

export function useQuoteSignatures(refresh = false) {
  const { data: signature, signTypedData } = useSignTypedData()
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const operation = useAtomValue(operationAtom)
  const mintValue = useAtomValue(mintValueAtom)
  const inputAmount = useAtomValue(userInputAtom)
  const quoteToken = useAtomValue(selectedTokenAtom).address
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const setOrderIDs = useSetAtom(orderIdsAtom)
  const setAsyncSwapResponse = useSetAtom(asyncSwapResponseAtom)
  const { orderBookApi, universalSdk } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()
  const failedOrders = useAtomValue(failedOrdersAtom)

  return useMutation({
    mutationFn: async () => {
      if (!address || !orderBookApi || !chainId || !indexDTF || !universalSdk) {
        console.error('No global kit')
        return {
          orders: [],
        }
      }

      const successfulQuotes = Object.values(quotes).filter(
        (quote) => quote.success
      )

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
                operation === 'mint'
                  ? quote.data.quote.buyAmount
                  : (
                      (BigInt(quote.data.quote.buyAmount) * 98n) /
                      100n
                    ).toString(),
              sellAmount:
                operation === 'mint'
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

          if (quote.success && quote.type === QuoteProvider.Universal) {
            const uq = quote.data as CustomUniversalQuote
            const { typedData } = await generateTypedData(uq._originalQuote)

            await signTypedData(typedData)

            // const universalOrder = await universalSdk.submitOrder({
            //   ...uq._originalQuote,
            //   signature: signature!,
            // })

            // return {
            //   type: quote.type,
            //   data: universalOrder,
            // }
            console.log({ signature })
            return null
          }

          return null
        })
      )

      const validOrderData = orderData.filter((data) => data !== null)

      const txData = validOrderData
        .map(({ type, data }) => {
          if (type === QuoteProvider.CowSwap) {
            return [
              operation === 'redeem'
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

      if (operation === 'mint') {
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

      if (refresh) {
        // replace failed orders with new ones
        setOrderIDs((prev) => [
          ...prev.filter(
            (id) => !failedOrders.map((o) => o.orderId).includes(id)
          ),
          ...validOrderData.map(({ data }) => data.orderId),
        ])
        setAsyncSwapResponse((prev) => {
          if (!prev) return undefined
          return {
            ...prev,
            cowswapOrders: prev?.cowswapOrders.filter(
              (o) => !failedOrders.map((fo) => fo.orderId).includes(o.orderId)
            ),
            createdAt: new Date().toISOString(),
          }
        })
      } else {
        setOrderIDs(validOrderData.map(({ data }) => data.orderId))
        setAsyncSwapResponse({
          swapOrderId: uuidv4(),
          chainId,
          signer: address,
          dtf: indexDTF.id,
          inputAmount,
          amountOut: parseEther(mintValue.toString()).toString(),
          createdAt: new Date().toISOString(),
          universalOrders: [],
          cowswapOrders: [],
        })
      }
      setQuotes({})

      return {
        orders: validOrderData.map(({ data }) => data.orderId),
      }
    },
    onError(error) {
      console.error(error)
    },
  })
}
