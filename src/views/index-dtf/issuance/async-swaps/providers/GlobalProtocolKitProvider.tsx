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

type GlobalProtocolKitContextType = {
  orderBookApi: OrderBookApi | null
}

const GlobalProtocolKitContext = createContext<GlobalProtocolKitContextType>({
  orderBookApi: null,
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

  useEffect(() => {
    if (chainId) {
      setOrderBookApi(
        new OrderBookApi({
          chainId: chainId,
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
      }}
    >
      {children}
    </GlobalProtocolKitContext.Provider>
  )
}
