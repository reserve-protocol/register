import daoFeeRegistryAbi from '@/abis/dao-fee-registry-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import SEO from '@/components/seo'
import useFavicon from '@/hooks/useFavicon'
import useIndexDTFTransactions from '@/hooks/useIndexDTFTransactions'
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
  indexDTFFeeAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFRebalanceControlAtom,
  indexDTFStatusAtom,
  indexDTFVersionAtom,
  iTokenAddressAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import {
  indexDTFApyAtom,
  indexDTFPoolsDataAtom,
  indexDTFUnderlyingNamesAtom,
} from '@/state/dtf/yield-index-atoms'
import { useDTFStatus } from '@/hooks/use-dtf-status'
import { isAddress } from '@/utils'
import { AvailableChain } from '@/utils/chains'
import {
  FALLBACK_PLATFORM_FEES,
  NETWORKS,
  RESERVE_API,
  ROUTES,
} from '@/utils/constants'
import {
  IndexDtfProvider,
  type Amount,
  useCurrentIndexDtf,
  useIndexDtfList,
  useIndexDtfIdentity,
  useIndexDtfVersion,
  supportedChainIds,
  type IndexDtfBrand as SdkIndexDtfBrand,
  type IndexDtfData,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Address } from 'viem'
import { useReadContract, useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'
import ConfirmEligibilityModal from './components/confirm-eligibility-modal'
import GovernanceUpdater from './governance/updater'
import YieldIndexUpdater from '@/state/updaters/yield-index-updater'
import { resolveIndexDtfRouteToken } from './utils/resolve-index-dtf-route-token'

const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'

const isIndexDtfChain = (chainId: number): chainId is SupportedChainId =>
  supportedChainIds.includes(chainId as SupportedChainId)

const mapSdkBrand = (brand: SdkIndexDtfBrand | undefined) => {
  if (!brand) return undefined

  return {
    dtf: {
      icon: brand.icon ?? '',
      cover: brand.cover ?? '',
      mobileCover: brand.mobileCover ?? '',
      description: brand.description ?? '',
      notesFromCreator: brand.notesFromCreator ?? '',
      prospectus: brand.prospectus ?? '',
      tags: [...brand.tags],
      basketType:
        brand.basketType === 'unit-based' ? 'unit-based' : 'percentage-based',
    },
    creator: {
      name: brand.creator?.name ?? '',
      icon: brand.creator?.icon ?? '',
      link: brand.creator?.link ?? '',
    },
    curator: {
      name: brand.curator?.name ?? '',
      icon: brand.curator?.icon ?? '',
      link: brand.curator?.link ?? '',
    },
    socials: {
      twitter: brand.socials.twitter ?? '',
      telegram: brand.socials.telegram ?? '',
      discord: brand.socials.discord ?? '',
      website: brand.socials.website ?? '',
    },
  } satisfies IndexDTFBrand
}

const getBasketState = (dtf: IndexDtfData) => {
  const prices: Record<string, number> = {
    [dtf.id.toLowerCase()]: dtf.market.price,
  }
  const amounts: Record<string, Amount> = {}
  const shares: Record<string, string> = {}
  const basket = Object.values(dtf.basket)
    .map((asset) => {
      const address = asset.token.address.toLowerCase()

      prices[address] = asset.price
      amounts[address] = asset.amount
      shares[address] = asset.weight

      return {
        ...asset.token,
        price: asset.price,
      }
    })
    .sort((a, b) => Number(shares[b.address.toLowerCase()]) - Number(shares[a.address.toLowerCase()]))

  return { basket, prices, amounts, shares }
}

const IndexDTFSEO = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const location = useLocation()

  const title = dtf ? `Reserve | ${dtf.token.name}` : 'Reserve | DTFs'

  const description = brand?.dtf?.description || DEFAULT_DESCRIPTION
  const image = brand?.dtf?.icon || undefined

  useFavicon(brand?.dtf?.icon)

  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={location.pathname}
    />
  )
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

const IndexDTFDataUpdater = () => {
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setIndexDTFBrand = useSetAtom(indexDTFBrandAtom)
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketPrices = useSetAtom(indexDTFBasketPricesAtom)
  const setBasketAmounts = useSetAtom(indexDTFBasketAmountsAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)
  const setRebalanceControl = useSetAtom(indexDTFRebalanceControlAtom)
  const { data } = useCurrentIndexDtf()

  useEffect(() => {
    if (!data) return

    const { basket, prices, amounts, shares } = getBasketState(data)

    setIndexDTF(data)
    setIndexDTFBrand(mapSdkBrand(data.brand))
    setBasket(basket)
    setBasketPrices(prices)
    setBasketAmounts(amounts)
    setBasketShares(shares)
    setRebalanceControl({
      weightControl: data.rebalance.weightControl,
      priceControl: data.rebalance.priceControl,
    })
  }, [data])

  return null
}

const IndexDTFVersionUpdater = () => {
  const { address, chainId } = useIndexDtfIdentity()
  const setIndexDTFVersion = useSetAtom(indexDTFVersionAtom)

  const { data: version } = useIndexDtfVersion({ address, chainId })

  useEffect(() => {
    if (version) {
      setIndexDTFVersion(version)
    }
  }, [version])

  return null
}

const PlatformFeeUpdater = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress?: string
  chainId: number
}) => {
  const setFee = useSetAtom(indexDTFFeeAtom)

  const { data: registryAddress, isError: registryError } = useReadContract({
    address: tokenAddress as Address,
    abi: dtfIndexAbi,
    functionName: 'daoFeeRegistry',
    chainId,
    query: { enabled: !!tokenAddress },
  })

  const { data: feeDetails, isError: feeError } = useReadContract({
    address: registryAddress as Address,
    abi: daoFeeRegistryAbi,
    functionName: 'getFeeDetails',
    args: [tokenAddress as Address],
    chainId,
    query: { enabled: !!registryAddress && !!tokenAddress },
  })

  useEffect(() => {
    if (feeDetails) {
      const [, feeNumerator, feeDenominator] = feeDetails
      setFee(Number((feeNumerator * 100n) / feeDenominator))
    } else if (registryError || feeError) {
      setFee(FALLBACK_PLATFORM_FEES[chainId] ?? 50)
    }
  }, [feeDetails, registryError, feeError, chainId])

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
  set(indexDTFFeeAtom, undefined)
  set(indexDTF7dChangeAtom, undefined)
  set(indexDTFPerformanceLoadingAtom, false)
  set(indexDTFExposureDataAtom, null)
  set(indexDTFApyAtom, undefined)
  set(indexDTFPoolsDataAtom, undefined)
  set(indexDTFUnderlyingNamesAtom, {})
  set(performanceTimeRangeAtom, '7d')
  set(indexDTFStatusAtom, 'active')
})

const DeprecationStatusUpdater = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress?: string
  chainId: number
}) => {
  const status = useDTFStatus(tokenAddress, chainId)
  const setStatus = useSetAtom(indexDTFStatusAtom)

  useEffect(() => {
    setStatus(status)
  }, [status])

  return null
}

export const indexDTFRefreshFnAtom = atom<(() => void) | null>(null)

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  const { address: tokenAddress, chainId } = useIndexDtfIdentity()
  const setChain = useSetAtom(chainIdAtom)
  const currentChainId = useAtomValue(chainIdAtom)
  const [currentToken, setTokenAddress] = useAtom(iTokenAddressAtom)
  const resetAtoms = useSetAtom(resetStateAtom)
  const setRefreshFn = useSetAtom(indexDTFRefreshFnAtom)
  const [key, setKey] = useState(0)
  useIndexDTFTransactions(tokenAddress, chainId)

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
  useLayoutEffect(() => {
    if (tokenAddress !== currentToken || chainId !== currentChainId) {
      resetState()
      setChain(chainId as AvailableChain)
      setTokenAddress(tokenAddress)
    }
  }, [tokenAddress, chainId, currentChainId, currentToken])

  // Reset state on unmount
  useEffect(() => resetState, [])

  return (
    <div key={key}>
      <IndexDTFDataUpdater />
      <IndexDTFVersionUpdater />
      <PlatformFeeUpdater tokenAddress={tokenAddress} chainId={chainId} />
      <IndexDTFExposureUpdater chainId={chainId} />
      <YieldIndexUpdater chainId={chainId} />
      <DeprecationStatusUpdater tokenAddress={tokenAddress} chainId={chainId} />
      <GovernanceUpdater />
    </div>
  )
}

const InvalidIndexDTFRoute = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ROUTES.NOT_FOUND)
  }, [])

  return null
}

const IndexDTFContainer = () => {
  const { chain, tokenId } = useParams()
  const chainId = NETWORKS[chain ?? '']
  const indexDtfChainId = isIndexDtfChain(chainId) ? chainId : undefined
  const routeAddress = isAddress(tokenId ?? '')
  const shouldResolveAlias = !!indexDtfChainId && !!tokenId && !routeAddress
  const catalogParams = shouldResolveAlias
    ? { chainId: indexDtfChainId, status: 'active' as const }
    : undefined
  const { data: catalog = [], isLoading } = useIndexDtfList(catalogParams, {
    enabled: shouldResolveAlias,
  })

  if (!indexDtfChainId) {
    return <InvalidIndexDTFRoute />
  }

  const tokenAddress =
    routeAddress ??
    resolveIndexDtfRouteToken({
      catalog,
      chainId: indexDtfChainId,
      tokenId,
    })

  if (!tokenAddress) {
    if (shouldResolveAlias && isLoading) return null

    return <InvalidIndexDTFRoute />
  }

  return (
    <IndexDtfProvider address={tokenAddress} chainId={indexDtfChainId}>
      <div className="container flex flex-col-reverse md:flex-row mb-16 lg:mb-0">
        <IndexDTFSEO />
        <Updater />
        <ConfirmEligibilityModal />
        <IndexDTFNavigation />
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
    </IndexDtfProvider>
  )
}

export default IndexDTFContainer
