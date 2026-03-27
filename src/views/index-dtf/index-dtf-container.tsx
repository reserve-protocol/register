import daoFeeRegistryAbi from '@/abis/dao-fee-registry-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import FeedbackButton from '@/components/feedback-button'
import SEO from '@/components/seo'
import useFavicon from '@/hooks/useFavicon'
import useIndexDTF from '@/hooks/useIndexDTF'
import useIndexDTFTransactions from '@/hooks/useIndexDTFTransactions'
import { useIndexBasket } from '@/hooks/useIndexPrice'
import { wagmiConfig } from '@/state/chain'
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
  COLLATERAL_POOL_MAP,
  indexDTFApyAtom,
  indexDTFExposureDataAtom,
  indexDTFFeeAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFPoolsDataAtom,
  indexDTFRebalanceControlAtom,
  indexDTFUnderlyingNamesAtom,
  indexDTFVersionAtom,
  isYieldIndexDTFAtom,
  iTokenAddressAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { FALLBACK_PLATFORM_FEES, NETWORKS, RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
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

  const title = dtf ? `Reserve | ${dtf.token.name}` : 'Reserve | DTFs'

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
      setFee(Number(feeNumerator * 100n / feeDenominator))
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

const IndexDTFApyUpdater = ({ chainId }: { chainId: number }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const setApyData = useSetAtom(indexDTFApyAtom)

  const { data: apyData } = useQuery({
    queryKey: ['dtf-apy', dtf?.id, chainId],
    queryFn: async () => {
      if (!dtf?.id) return null

      const response = await fetch(
        `${RESERVE_API}v1/dtf/apy/${dtf.id}?chainId=${chainId}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch APY data: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!dtf?.id && !!chainId && isYieldIndexDTF,
    refetchInterval: 60000,
  })

  useEffect(() => {
    if (apyData) {
      setApyData(apyData)
    }
  }, [apyData, setApyData])

  return null
}

const IndexDTFPoolsUpdater = ({ chainId }: { chainId: number }) => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const setPoolsData = useSetAtom(indexDTFPoolsDataAtom)
  const setUnderlyingNames = useSetAtom(indexDTFUnderlyingNamesAtom)

  const poolIds =
    exposureData
      ?.flatMap((group) => group.tokens)
      .map((t) => COLLATERAL_POOL_MAP[t.address.toLowerCase()])
      .filter(Boolean) ?? []

  const { data: poolsData } = useQuery({
    queryKey: ['dtf-pools', ...poolIds],
    queryFn: async () => {
      const results = await Promise.all(
        poolIds.map(async (poolId) => {
          const response = await fetch(
            `https://yields.llama.fi/poolsEnriched?pool=${poolId}`
          )
          if (!response.ok) return null
          const json = await response.json()
          return json.data?.[0] ?? null
        })
      )
      return results.filter(Boolean)
    },
    enabled: isYieldIndexDTF && poolIds.length > 0,
    staleTime: 3600000,
  })

  useEffect(() => {
    if (poolsData) {
      setPoolsData(poolsData)
    }
  }, [poolsData, setPoolsData])

  // Fetch name/symbol for unique underlying tokens via multicall
  const underlyingAddresses = useMemo(() => {
    if (!poolsData) return []
    const seen = new Set<string>()
    return poolsData
      .flatMap((p) => p.underlyingTokens ?? [])
      .filter((addr) => {
        const key = addr.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }, [poolsData])

  const erc20Calls = useMemo(
    () =>
      underlyingAddresses.flatMap((addr) => [
        {
          address: addr as `0x${string}`,
          abi: [
            {
              name: 'name',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ type: 'string' }],
            },
          ] as const,
          functionName: 'name' as const,
          chainId: chainId as 1 | 8453 | 42161,
        },
        {
          address: addr as `0x${string}`,
          abi: [
            {
              name: 'symbol',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ type: 'string' }],
            },
          ] as const,
          functionName: 'symbol' as const,
          chainId: chainId as 1 | 8453 | 42161,
        },
      ]),
    [underlyingAddresses, chainId]
  )

  const { data: nameResults } = useQuery({
    queryKey: ['dtf-underlying-names', ...underlyingAddresses],
    queryFn: async () => {
      const { readContracts } = await import('wagmi/actions')
      return readContracts(wagmiConfig, { contracts: erc20Calls })
    },
    enabled: underlyingAddresses.length > 0,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!nameResults || !underlyingAddresses.length) return
    const names: Record<string, { name: string; symbol: string }> = {}
    for (let i = 0; i < underlyingAddresses.length; i++) {
      const nameResult = nameResults[i * 2]
      const symbolResult = nameResults[i * 2 + 1]
      names[underlyingAddresses[i].toLowerCase()] = {
        name: (nameResult?.result as string) || '',
        symbol: (symbolResult?.result as string) || '',
      }
    }
    setUnderlyingNames(names)
  }, [nameResults, underlyingAddresses, setUnderlyingNames])

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
      <PlatformFeeUpdater tokenAddress={currentToken} chainId={chainId} />
      <IndexDTFExposureUpdater chainId={chainId} />
      <IndexDTFApyUpdater chainId={chainId} />
      <IndexDTFPoolsUpdater chainId={chainId} />
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
