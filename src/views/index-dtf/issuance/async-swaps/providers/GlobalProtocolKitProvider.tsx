import { chainIdAtom } from '@/state/atoms'
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { useAtomValue } from 'jotai'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { createUniversalSdkWrapper } from './universal'
import { ChainId } from '@/utils/chains'

export type UniversalRelayerWithRateLimiter = ReturnType<
  typeof createUniversalSdkWrapper
>

type GlobalProtocolKitContextType = {
  orderBookApi: OrderBookApi | null
  universalSdk: UniversalRelayerWithRateLimiter | null
}

const GlobalProtocolKitContext = createContext<GlobalProtocolKitContextType>({
  orderBookApi: null,
  universalSdk: null,
})

export const useGlobalProtocolKit = () => useContext(GlobalProtocolKitContext)

interface GlobalProtocolKitProviderProps {
  children: ReactNode
}

export function GlobalProtocolKitProvider({
  children,
}: GlobalProtocolKitProviderProps) {
  const chainId = useAtomValue(chainIdAtom)

  const [orderBookApi, setOrderBookApi] = useState<OrderBookApi | null>(null)
  const [universalSdk, setUniversalSdk] = useState<ReturnType<
    typeof createUniversalSdkWrapper
  > | null>(null)

  useEffect(() => {
    if (chainId) {
      setUniversalSdk(createUniversalSdkWrapper())
      setOrderBookApi(
        new OrderBookApi({
          chainId,
          limiterOpts: {
            tokensPerInterval: 4,
            interval: 'second',
          },
          backoffOpts: {
            numOfAttempts: 3,
            maxDelay: Infinity,
            jitter: 'full',
          },
        })
      )
    } else {
      setOrderBookApi(
        new OrderBookApi({
          chainId: ChainId.Base,
          limiterOpts: {
            tokensPerInterval: 4,
            interval: 'second',
          },
          backoffOpts: {
            numOfAttempts: 3,
            maxDelay: Infinity,
            jitter: 'full',
          },
        })
      )
    }
  }, [chainId])

  return (
    <GlobalProtocolKitContext.Provider
      value={{
        orderBookApi,
        universalSdk,
      }}
    >
      {children}
    </GlobalProtocolKitContext.Provider>
  )
}
