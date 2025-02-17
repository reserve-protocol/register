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
  iTokenAddressAtom,
  iTokenBasketAtom,
  iTokenConfigurationAtom,
  iTokenGovernanceAtom,
  iTokenMetaAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { NETWORKS, RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'
import GovernanceUpdater from './governance/updater'

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

  const { data } = useIndexBasket(token, chainId)

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

  return null
}

const resetStateAtom = atom(null, (get, set) => {
  set(indexDTFBasketAtom, undefined)
  set(indexDTFBasketPricesAtom, {})
  set(indexDTFBasketAmountsAtom, {})
  set(indexDTFBasketSharesAtom, {})
  set(indexDTFAtom, undefined)
})

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  const { chain, tokenId } = useParams()
  const navigate = useNavigate()
  const setChain = useSetAtom(chainIdAtom)
  const [currentToken, setTokenAddress] = useAtom(iTokenAddressAtom)
  const setTokenMeta = useSetAtom(iTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(iTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(iTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(iTokenBasketAtom)
  const resetAtoms = useSetAtom(resetStateAtom)
  const chainId = NETWORKS[chain ?? ''] as AvailableChain

  useChainWatch()

  const resetState = () => {
    setTokenMeta(undefined)
    setTokenConfiguration(undefined)
    setTokenGovernance(undefined)
    setTokenBasket(undefined)

    // Remove duplicates
    resetAtoms()
  }

  // Handle token change
  useEffect(() => {
    const tokenAddress = isAddress(tokenId ?? '')

    if (!supportedChains.has(chainId) || !tokenAddress) {
      navigate(ROUTES.NOT_FOUND)
    }

    if (tokenAddress !== currentToken) {
      resetState()
      setChain(chainId)
      setTokenAddress(tokenAddress ?? undefined)
    }
  }, [tokenId, chainId])

  // Reset state on unmount
  useEffect(() => resetState, [])

  return (
    <>
      <IndexDTFMetadataUpdater />
      <IndexDTFBasketUpdater />
      <GovernanceUpdater />
    </>
  )
}

const IndexDTFContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-[72px] lg:mb-0">
    <Updater />
    <IndexDTFNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default IndexDTFContainer
