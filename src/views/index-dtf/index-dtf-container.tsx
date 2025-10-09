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
  indexDTFBasketPerformanceChangeAtom,
  performanceTimeRangeAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFNewlyAddedAssetsAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { NETWORKS, RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState, useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useReadContract, useSwitchChain } from 'wagmi'
import { Address } from 'viem'
import IndexDTFNavigation from './components/navigation'
import GovernanceUpdater from './governance/updater'
import FeedbackButton from '@/components/feedback-button'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useIndexDTFPriceHistory from './overview/hooks/use-dtf-price-history'
import useIndexDTFTransactions from '@/hooks/useIndexDTFTransactions'
import { TimeRange } from '@/types'

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

const IndexDTFMetadataUpdater = ({ tokenAddress, chainId }: { tokenAddress?: string; chainId: number }) => {
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setIndexDTFBrand = useSetAtom(indexDTFBrandAtom)
  const { data } = useIndexDTF(tokenAddress, chainId as AvailableChain)
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

const IndexDTFBasketUpdater = ({ tokenAddress, chainId }: { tokenAddress?: string; chainId: number }) => {
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketPrices = useSetAtom(indexDTFBasketPricesAtom)
  const setBasketAmounts = useSetAtom(indexDTFBasketAmountsAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)
  const setRebalanceControl = useSetAtom(indexDTFRebalanceControlAtom)

  const { data } = useIndexBasket(tokenAddress, chainId)
  // 4.0 onwards
  const { data: rebalanceControl } = useReadContract({
    abi: dtfIndexAbiV4,
    address: tokenAddress as Address,
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

const IndexDTFPerformanceUpdater = ({ chainId }: { chainId: number }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  const setBasketPerformanceChange = useSetAtom(
    indexDTFBasketPerformanceChangeAtom
  )
  const setPerformanceLoading = useSetAtom(indexDTFPerformanceLoadingAtom)
  const setNewlyAddedAssets = useSetAtom(indexDTFNewlyAddedAssetsAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)

  const currentHour = Math.floor(Date.now() / 1_000 / 3_600) * 3_600

  // Calculate time range based on selected period
  const timeRangeConfig: Record<
    TimeRange,
    { to: number; from: number; interval: '1h' | '1d' }
  > = {
    '24h': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
    '7d': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
    '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1h' },
    '3m': { to: currentHour, from: currentHour - 7_776_000, interval: '1d' },
    '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
    all: { to: currentHour, from: 0, interval: '1d' },
  }

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    from: timeRangeConfig[timeRange].from,
    to: currentHour,
    interval: timeRangeConfig[timeRange].interval,
  })

  // Identify newly added tokens (not in historical basket)
  const newlyAddedTokens = useMemo(() => {
    if (!history?.timeseries?.length || !basket) return []

    const firstWithBasket = history.timeseries.find(
      (entry) => entry.basket?.length > 0
    )
    if (!firstWithBasket?.basket) return []

    return basket
      .filter((token) => {
        const existedAtStart = firstWithBasket.basket.some(
          (b: any) => b.address.toLowerCase() === token.address.toLowerCase()
        )
        return !existedAtStart
      })
      .map((t) => t.address)
  }, [history, basket])

  // Fetch snapshot prices for newly added assets
  const { data: snapshotPrices } = useQuery({
    queryKey: [
      'asset-snapshot-prices',
      newlyAddedTokens,
      chainId,
      timeRangeConfig[timeRange].from,
    ],
    queryFn: async () => {
      if (!newlyAddedTokens.length) return {}

      const from = timeRangeConfig[timeRange].from
      const to = from + 3600 // 1 hour window
      const baseUrl = `${RESERVE_API}historical/prices?chainId=${chainId}&from=${from}&to=${to}&interval=1h&address=`

      const calls = newlyAddedTokens.map((token) =>
        fetch(`${baseUrl}${token}`).then((res) => res.json())
      )

      const responses = await Promise.all(calls)
      const result: Record<string, number> = {}

      for (const priceResult of responses) {
        if (priceResult.timeseries?.length > 0) {
          result[priceResult.address.toLowerCase()] =
            priceResult.timeseries[0].price
        }
      }

      return result
    },
    enabled: Boolean(newlyAddedTokens.length && chainId),
  })

  // Set loading when time range changes
  useEffect(() => {
    setPerformanceLoading(true)
  }, [timeRange, setPerformanceLoading])

  useEffect(() => {
    // Only process if we have basket data
    if (!basket) return

    // If history is still loading (undefined), keep loading state
    if (history === undefined) return

    // If history loaded but empty, set empty results and stop loading
    if (!history?.timeseries?.length) {
      const emptyChanges: Record<string, number | null> = {}
      const emptyNewlyAdded: Record<string, boolean> = {}
      basket.forEach((token) => {
        emptyChanges[token.address] = null
        emptyNewlyAdded[token.address] = false
      })
      setBasketPerformanceChange(emptyChanges)
      setNewlyAddedAssets(emptyNewlyAdded)
      setPerformanceLoading(false)
      return
    }

    const filtered = history.timeseries.filter(({ price }) => Boolean(price))

    if (filtered.length > 0) {
      // Calculate overall DTF change (maintain 7d for backward compatibility)
      if (timeRange === '7d') {
        const firstPrice = filtered[0].price
        const lastPrice = filtered[filtered.length - 1].price
        const dtfChange =
          firstPrice === 0 ? undefined : (lastPrice - firstPrice) / firstPrice
        set7dChange(dtfChange)
      }

      // Calculate individual collateral changes
      // Find first and last entries with basket data
      let firstWithBasket = filtered.find(
        (entry) => entry.basket && entry.basket.length > 0
      )
      let lastWithBasket = [...filtered]
        .reverse()
        .find((entry) => entry.basket && entry.basket.length > 0)

      // If no basket data at all, try to get it from the full history
      if (!firstWithBasket || !lastWithBasket) {
        firstWithBasket = history.timeseries.find(
          (entry) => entry.basket && entry.basket.length > 0
        )
        lastWithBasket = [...history.timeseries]
          .reverse()
          .find((entry) => entry.basket && entry.basket.length > 0)
      }

      const basketPerformanceChanges: Record<string, number | null> = {}
      const newlyAdded: Record<string, boolean> = {}

      if (firstWithBasket?.basket && lastWithBasket?.basket) {
        basket.forEach((token) => {
          const firstEntry = firstWithBasket.basket.find(
            (b: any) => b.address.toLowerCase() === token.address.toLowerCase()
          )
          const lastEntry = lastWithBasket.basket.find(
            (b: any) => b.address.toLowerCase() === token.address.toLowerCase()
          )

          if (firstEntry && lastEntry && firstEntry.price > 0) {
            // Token existed at start of period
            const change =
              (lastEntry.price - firstEntry.price) / firstEntry.price
            basketPerformanceChanges[token.address] = change
            newlyAdded[token.address] = false
          } else if (
            lastEntry &&
            snapshotPrices?.[token.address.toLowerCase()]
          ) {
            // Token was added during period, use snapshot price
            const snapshotPrice = snapshotPrices[token.address.toLowerCase()]
            const change =
              snapshotPrice > 0
                ? (lastEntry.price - snapshotPrice) / snapshotPrice
                : 0
            basketPerformanceChanges[token.address] = change
            newlyAdded[token.address] = true
          } else if (lastEntry) {
            // Have current price but no historical - mark as newly added
            basketPerformanceChanges[token.address] = null
            newlyAdded[token.address] = true
          } else {
            // No data available
            basketPerformanceChanges[token.address] = null
            newlyAdded[token.address] = false
          }
        })
      } else {
        // No basket data available
        basket.forEach((token) => {
          basketPerformanceChanges[token.address] = null
          newlyAdded[token.address] = false
        })
      }

      setBasketPerformanceChange(basketPerformanceChanges)
      setNewlyAddedAssets(newlyAdded)
    }

    setPerformanceLoading(false)
  }, [
    history,
    basket,
    snapshotPrices,
    timeRange,
    set7dChange,
    setBasketPerformanceChange,
    setNewlyAddedAssets,
    setPerformanceLoading,
    chainId,
  ])

  return null
}

const resetStateAtom = atom(null, (_, set) => {
  set(indexDTFBasketAtom, undefined)
  set(indexDTFBasketPricesAtom, {})
  set(indexDTFBasketAmountsAtom, {})
  set(indexDTFBasketSharesAtom, {})
  set(indexDTFAtom, undefined)
  set(indexDTFBrandAtom, undefined)
  set(indexDTFRebalanceControlAtom, undefined)
  set(indexDTF7dChangeAtom, undefined)
  set(indexDTFBasketPerformanceChangeAtom, {})
  set(indexDTFPerformanceLoadingAtom, false)
  set(indexDTFNewlyAddedAssetsAtom, {})
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
  useIndexDTFTransactions(currentToken ?? '', chainId)

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
      <IndexDTFMetadataUpdater tokenAddress={currentToken} chainId={chainId} />
      <IndexDTFBasketUpdater tokenAddress={currentToken} chainId={chainId} />
      <IndexDTFPerformanceUpdater chainId={chainId} />
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
