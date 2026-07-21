import SEO from '@/components/seo'
import useFavicon from '@/hooks/useFavicon'
import useIndexDTFTransactions from '@/hooks/useIndexDTFTransactions'
import { chainIdAtom, walletChainAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
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
import { resetIndexDTFAtomsAtom } from '@/state/dtf/reset-index-dtf-atoms'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { isAddress } from '@/utils'
import { AvailableChain } from '@/utils/chains'
import { NETWORKS, RESERVE_API, ROUTES, ZAPPER_API } from '@/utils/constants'
import {
  IndexDtfProvider,
  type Amount,
  useCurrentIndexDtf,
  useIndexCatalog,
  useIndexDtfExposure,
  useIndexDtfIdentity,
  useIndexDtfPlatformFee,
  useIndexDtfStatus,
  useIndexDtfVersion,
  supportedChainIds,
  type IndexDtfData,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Address } from 'viem'
import { useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'
import ConfirmEligibilityModal from './components/confirm-eligibility-modal'
import GovernanceUpdater from './governance/updater'
import YieldIndexUpdater from '@/state/updaters/yield-index-updater'
import { resolveIndexDtfRouteToken } from './utils/resolve-index-dtf-route-token'
import ZapperWrapper from './components/zapper/zapper-wrapper'
import { indexDTFQuoteSourceAtom } from './issuance'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'
import IndexCTAsOverviewMobile from './overview/components/index-ctas-overview-mobile'

const DEFAULT_DESCRIPTION =
  'Reserve is the leading platform for permissionless DTFs and asset-backed currencies. Create, manage & trade tokenized indexes with 24/7 transparency.'

const isIndexDtfChain = (chainId: number): chainId is SupportedChainId =>
  supportedChainIds.includes(chainId as SupportedChainId)

const getBasketState = (dtf: IndexDtfData) => {
  const prices: Record<string, number> = {
    [dtf.id.toLowerCase()]: dtf.market.price,
  }
  const amounts: Record<string, Amount> = {}
  const shares: Record<string, string> = {}
  const basket = Object.values(dtf.basket)
    .map((asset) => {
      // The SDK returns checksummed addresses; the app-wide convention (since
      // the pre-SDK API) is lowercase for basket token addresses and every
      // basket map key, and consumers index these maps with `token.address`
      // directly — keep both sides lowercase so they always match.
      const address = asset.token.address.toLowerCase() as Address

      prices[address] = asset.price
      amounts[address] = asset.amount
      shares[address] = asset.weight

      return {
        ...asset.token,
        address,
        price: asset.price,
      }
    })
    .sort((a, b) => Number(shares[b.address]) - Number(shares[a.address]))

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
  }, [chainId, walletChain, switchChain])
}

// The atoms stay because each SDK read has several consumers that can't take the hook directly yet.
const IndexDtfUpdaters = () => {
  const identity = useIndexDtfIdentity()
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setIndexDTFBrand = useSetAtom(indexDTFBrandAtom)
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketPrices = useSetAtom(indexDTFBasketPricesAtom)
  const setBasketAmounts = useSetAtom(indexDTFBasketAmountsAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)
  const setRebalanceControl = useSetAtom(indexDTFRebalanceControlAtom)
  const setIndexDTFVersion = useSetAtom(indexDTFVersionAtom)
  const setFee = useSetAtom(indexDTFFeeAtom)
  const setExposureData = useSetAtom(indexDTFExposureDataAtom)
  const setPerformanceLoading = useSetAtom(indexDTFPerformanceLoadingAtom)
  const setStatus = useSetAtom(indexDTFStatusAtom)

  const { data } = useCurrentIndexDtf()
  const { data: version } = useIndexDtfVersion(identity)
  // A failed registry read flags 'unavailable' — consumers render it explicitly, never a fabricated fee.
  const { data: fee, isError: feeUnavailable } = useIndexDtfPlatformFee(identity)
  const period = useAtomValue(performanceTimeRangeAtom)
  const { data: exposureData, isLoading: exposureLoading } = useIndexDtfExposure(
    { ...identity, period }
  )
  const status = useIndexDtfStatus(identity)

  useEffect(() => {
    if (!data) return

    const { basket, prices, amounts, shares } = getBasketState(data)

    setIndexDTF(data)
    setIndexDTFBrand(data.brand)
    setBasket(basket)
    setBasketPrices(prices)
    setBasketAmounts(amounts)
    setBasketShares(shares)
    setRebalanceControl({
      weightControl: data.rebalance.weightControl,
      priceControl: data.rebalance.priceControl,
    })
  }, [
    data,
    setBasket,
    setBasketAmounts,
    setBasketPrices,
    setBasketShares,
    setIndexDTF,
    setIndexDTFBrand,
    setRebalanceControl,
  ])

  useEffect(() => {
    if (version) {
      setIndexDTFVersion(version)
    }
  }, [version, setIndexDTFVersion])

  useEffect(() => {
    if (fee) {
      setFee(fee.percent)
    } else if (feeUnavailable) {
      setFee('unavailable')
    }
  }, [fee, feeUnavailable, setFee])

  useEffect(() => {
    if (exposureData) {
      setExposureData(
        exposureData.map((group) => ({ ...group, tokens: [...group.tokens] }))
      )
    }
  }, [exposureData, setExposureData])

  useEffect(() => {
    setPerformanceLoading(exposureLoading)
  }, [exposureLoading, setPerformanceLoading])

  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])

  return null
}

export const indexDTFRefreshFnAtom = atom<(() => void) | null>(null)

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  const { address: tokenAddress, chainId } = useIndexDtfIdentity()
  const setChain = useSetAtom(chainIdAtom)
  const currentChainId = useAtomValue(chainIdAtom)
  const [currentToken, setTokenAddress] = useAtom(iTokenAddressAtom)
  const resetAtoms = useSetAtom(resetIndexDTFAtomsAtom)
  const setRefreshFn = useSetAtom(indexDTFRefreshFnAtom)
  const [key, setKey] = useState(0)
  useIndexDTFTransactions(tokenAddress, chainId)

  useChainWatch()

  const resetState = useCallback(() => {
    // Remove duplicates
    resetAtoms()
  }, [resetAtoms])

  const refreshIndexDTF = useCallback(() => {
    setKey((k) => k + 1)
  }, [])

  useEffect(() => {
    setRefreshFn(() => refreshIndexDTF)
  }, [refreshIndexDTF, setRefreshFn])

  // Handle token change
  useLayoutEffect(() => {
    if (tokenAddress !== currentToken || chainId !== currentChainId) {
      resetState()
      setChain(chainId as AvailableChain)
      setTokenAddress(tokenAddress)
    }
  }, [
    tokenAddress,
    chainId,
    currentChainId,
    currentToken,
    resetState,
    setChain,
    setTokenAddress,
  ])

  // Reset state on unmount
  useEffect(() => resetState, [resetState])

  return (
    <div key={key}>
      <IndexDtfUpdaters />
      <YieldIndexUpdater chainId={chainId} />
      <GovernanceUpdater />
    </div>
  )
}

const InvalidIndexDTFRoute = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ROUTES.NOT_FOUND)
  }, [navigate])

  return null
}

const IndexDTFMobileActions = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const isRestricted = useIsComplianceRestricted()
  const { pathname } = useLocation()
  // WHY: issuance mounts its own inline ZapperWrapper with a different config
  // (debug, inline prompt) — never mount a second instance there, or the two
  // fight over shared zapper state. One Zapper per route.
  const isIssuanceRoute = pathname.includes(`/${ROUTES.ISSUANCE}`)

  if (!indexDTF) return null

  return (
    <>
      <IndexCTAsOverviewMobile />
      {!isIssuanceRoute && (
        <ZapperWrapper
          chain={indexDTF.chainId}
          dtfAddress={indexDTF.id}
          mode="modal"
          apiUrl={RESERVE_API}
          zapperApiUrl={ZAPPER_API}
          defaultSource={quoteSource}
          sellOnly={isDeprecated}
          disabled={isRestricted}
        />
      )}
    </>
  )
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
  const { data: catalog = [], isLoading } = useIndexCatalog(catalogParams, {
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
      <div className="container flex min-h-full flex-col-reverse md:flex-row mb-16 lg:mb-0">
        <IndexDTFSEO />
        <Updater />
        <ConfirmEligibilityModal />
        <IndexDTFNavigation />
        <IndexDTFMobileActions />
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
    </IndexDtfProvider>
  )
}

export default IndexDTFContainer
