import useIndexDTF from '@/hooks/useIndexDTF'
import { useIndexBasket } from '@/hooks/useIndexPrice'
import { chainIdAtom, walletChainAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  IndexDTFBrand,
  indexDTFBrandAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
  iTokenAddressAtom,
  indexDTF7dChangeAtom,
  indexDTFBasket7dChangeAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { NETWORKS, RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useReadContract, useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'
import GovernanceUpdater from './governance/updater'
import FeedbackButton from '@/components/feedback-button'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useIndexDTFPriceHistory from './overview/hooks/use-dtf-price-history'

const useChainWatch = () => {
  const { switchChain } = useSwitchChain()
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    if (chainId !== walletChain && walletChain) {
      switchChain({ chainId })
    }
  }, [chainId])
}

const IndexDTFMetadataUpdater = () => {
  const token = useAtomValue(iTokenAddressAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setIndexDTFBrand = useSetAtom(indexDTFBrandAtom)
  const { data } = useIndexDTF(token, chainId)
  const { data: brandData } = useQuery({
    queryKey: ['brand', data?.id],
    queryFn: async () => {
      if (!data) return undefined

      const res = await fetch(
        `${RESERVE_API}folio-manager/read?folio=${data.id.toLowerCase()}&chainId=${chainId}`
      )

      const response = await res.json()

      if (response.status !== 'ok')
        throw new Error('Failed to fetch brand data')

      return response.parsedData as IndexDTFBrand
    },
    enabled: !!data,
  })

  useEffect(() => {
    if (data) {
      setIndexDTF(data)
    }
  }, [data])

  useEffect(() => {
    if (brandData) {
      setIndexDTFBrand(brandData)
    }
  }, [brandData])

  return null
}

const IndexDTFBasketUpdater = () => {
  const token = useAtomValue(iTokenAddressAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketPrices = useSetAtom(indexDTFBasketPricesAtom)
  const setBasketAmounts = useSetAtom(indexDTFBasketAmountsAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)
  const setRebalanceControl = useSetAtom(indexDTFRebalanceControlAtom)

  const { data } = useIndexBasket(token, chainId)
  // 4.0 onwards
  const { data: rebalanceControl } = useReadContract({
    abi: dtfIndexAbiV4,
    address: token,
    functionName: 'rebalanceControl',
    chainId,
  })

  useEffect(() => {
    if (data) {
      setBasket(
        data.basket.sort(
          (a, b) =>
            Number(data.shares[b.address]) - Number(data.shares[a.address])
        )
      )
      setBasketPrices(data.prices)
      setBasketAmounts(data.amounts)
      setBasketShares(data.shares)
    }
  }, [data])

  useEffect(() => {
    if (rebalanceControl) {
      setRebalanceControl({
        weightControl: rebalanceControl[0],
        priceControl: rebalanceControl[1],
      })
    }
  }, [rebalanceControl])

  return null
}

const IndexDTFPerformanceUpdater = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  const setBasket7dChange = useSetAtom(indexDTFBasket7dChangeAtom)

  const currentHour = Math.floor(Date.now() / 1_000 / 3_600) * 3_600

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    from: currentHour - 604_800, // 7 days
    to: currentHour,
    interval: '1h' as const,
  })

  useEffect(() => {
    if (history?.timeseries?.length && basket) {
      const filtered = history.timeseries.filter(({ price }) => Boolean(price))

      if (filtered.length > 0) {
        // Calculate overall DTF 7d change
        const firstPrice = filtered[0].price
        const lastPrice = filtered[filtered.length - 1].price
        const dtfChange = firstPrice === 0 ? undefined : (lastPrice - firstPrice) / firstPrice
        set7dChange(dtfChange)

        // Calculate individual collateral changes
        // Find first and last entries with basket data
        let firstWithBasket = filtered.find(entry => entry.basket && entry.basket.length > 0)
        let lastWithBasket = [...filtered].reverse().find(entry => entry.basket && entry.basket.length > 0)

        // If no basket data at all, try to get it from the full history
        if (!firstWithBasket || !lastWithBasket) {
          firstWithBasket = history.timeseries.find(entry => entry.basket && entry.basket.length > 0)
          lastWithBasket = [...history.timeseries].reverse().find(entry => entry.basket && entry.basket.length > 0)
        }

        const basket7dChanges: Record<string, number | null> = {}

        if (firstWithBasket?.basket && lastWithBasket?.basket) {
          basket.forEach(token => {
            const firstEntry = firstWithBasket.basket.find(
              (b: any) => b.address.toLowerCase() === token.address.toLowerCase()
            )
            const lastEntry = lastWithBasket.basket.find(
              (b: any) => b.address.toLowerCase() === token.address.toLowerCase()
            )

            if (firstEntry && lastEntry && firstEntry.price > 0) {
              const change = (lastEntry.price - firstEntry.price) / firstEntry.price
              basket7dChanges[token.address] = change
            } else {
              // Token not in 7d snapshot, set to 0 as requested
              basket7dChanges[token.address] = 0
            }
          })
        } else {
          // No basket data available, set all to 0
          basket.forEach(token => {
            basket7dChanges[token.address] = 0
          })
        }

        setBasket7dChange(basket7dChanges)
      }
    }
  }, [history, basket, set7dChange, setBasket7dChange])

  return null
}

const resetStateAtom = atom(null, (get, set) => {
  set(indexDTFBasketAtom, undefined)
  set(indexDTFBasketPricesAtom, {})
  set(indexDTFBasketAmountsAtom, {})
  set(indexDTFBasketSharesAtom, {})
  set(indexDTFAtom, undefined)
  set(indexDTFBrandAtom, undefined)
  set(indexDTFRebalanceControlAtom, undefined)
  set(indexDTF7dChangeAtom, undefined)
  set(indexDTFBasket7dChangeAtom, {})
})

export const indexDTFRefreshFnAtom = atom<(() => void) | null>(null)

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  const { chain, tokenId } = useParams()
  const navigate = useNavigate()
  const setChain = useSetAtom(chainIdAtom)
  const setIndexDTFVersion = useSetAtom(indexDTFVersionAtom)
  const [currentToken, setTokenAddress] = useAtom(iTokenAddressAtom)
  const resetAtoms = useSetAtom(resetStateAtom)
  const setRefreshFn = useSetAtom(indexDTFRefreshFnAtom)
  const chainId = NETWORKS[chain ?? '']
  const [key, setKey] = useState(0)

  const { data: version } = useReadContract({
    address: currentToken,
    abi: dtfIndexAbi,
    functionName: 'version',
    chainId,
    query: {
      enabled: !!currentToken,
    },
  })

  useChainWatch()

  const resetState = () => {
    // Remove duplicates
    resetAtoms()
  }

  const refreshIndexDTF = () => {
    setKey((k) => k + 1)
  }

  useEffect(() => {
    setRefreshFn(() => refreshIndexDTF)
  }, [])

  // Handle token change
  useEffect(() => {
    const tokenAddress = isAddress(tokenId ?? '')

    if (!supportedChains.has(chainId) || !tokenAddress) {
      navigate(ROUTES.NOT_FOUND)
    }

    if (tokenAddress !== currentToken) {
      resetState()
      if (chainId) {
        setChain(chainId as AvailableChain)
      }
      setTokenAddress(tokenAddress ?? undefined)
    }
  }, [tokenId, chainId])

  useEffect(() => {
    if (version) {
      setIndexDTFVersion(version)
    }
  }, [version])

  // Reset state on unmount
  useEffect(() => resetState, [])

  return (
    <div key={key}>
      <IndexDTFMetadataUpdater />
      <IndexDTFBasketUpdater />
      <IndexDTFPerformanceUpdater />
      <GovernanceUpdater />
    </div>
  )
}

const IndexDTFContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-16 lg:mb-0">
    <FeedbackButton />
    <Updater />
    <IndexDTFNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default IndexDTFContainer
