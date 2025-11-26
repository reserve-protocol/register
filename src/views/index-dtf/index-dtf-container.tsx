import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import FeedbackButton from '@/components/feedback-button'
import SEO from '@/components/seo'
import useFavicon from '@/hooks/useFavicon'
import useIndexDTF from '@/hooks/useIndexDTF'
import useIndexDTFTransactions from '@/hooks/useIndexDTFTransactions'
import { useIndexBasket } from '@/hooks/useIndexPrice'
import { chainIdAtom, walletChainAtom } from '@/state/atoms'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  IndexDTFBrand,
  indexDTFBrandAtom,
  indexDTFExposureDataAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
  iTokenAddressAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { NETWORKS, RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Address } from 'viem'
import { useReadContract, useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'
import GovernanceUpdater from './governance/updater'

const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'

const IndexDTFSEO = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const location = useLocation()

  const title = dtf
    ? `${dtf.token.symbol} - ${dtf.token.name} | Reserve Protocol`
    : 'Reserve Protocol | DTFs'

  const description = brand?.dtf?.description || DEFAULT_DESCRIPTION
  const image = brand?.dtf?.icon || undefined

  useFavicon(brand?.dtf?.icon)

  return <SEO title={title} description={description} image={image} url={location.pathname} />
}

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

const IndexDTFMetadataUpdater = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress?: string
  chainId: number
}) => {
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

const IndexDTFBasketUpdater = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress?: string
  chainId: number
}) => {
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

const IndexDTFExposureUpdater = ({ chainId }: { chainId: number }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const setExposureData = useSetAtom(indexDTFExposureDataAtom)
  const setPerformanceLoading = useSetAtom(indexDTFPerformanceLoadingAtom)
  const period = useAtomValue(performanceTimeRangeAtom)

  const { data: exposureData, isLoading } = useQuery({
    queryKey: ['dtf-exposure', dtf?.id, chainId, period],
    queryFn: async () => {
      if (!dtf?.id) return null

      const response = await fetch(
        `${RESERVE_API}dtf/exposure?chainId=${chainId}&address=${dtf.id}&period=${period}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch exposure data: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!dtf?.id && !!chainId,
    refetchInterval: 60000,
  })

  useEffect(() => {
    if (exposureData) {
      setExposureData(exposureData)
    }
  }, [exposureData, setExposureData])

  useEffect(() => {
    setPerformanceLoading(isLoading)
  }, [isLoading])

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
  set(indexDTFPerformanceLoadingAtom, false)
  set(indexDTFExposureDataAtom, null)
  set(performanceTimeRangeAtom, '7d')
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
      <IndexDTFExposureUpdater chainId={chainId} />
      <GovernanceUpdater />
    </div>
  )
}

const IndexDTFContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-16 lg:mb-0">
    <IndexDTFSEO />
    <FeedbackButton />
    <Updater />
    <IndexDTFNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default IndexDTFContainer
