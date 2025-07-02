import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect } from 'react'
import { useIndexBasket } from '../hooks/use-index-basket'
import { useIndexDTF } from '../hooks/use-index-dtf'
import {
  chainIdAtom,
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  indexDTFBrandAtom,
  indexDTFIconsAtom,
  walletAtom,
} from '../state/atoms'
import TokenBalancesUpdater from './updaters/token-balances-updater'
import { useAccount } from 'wagmi'

const RESERVE_API = 'https://api.reserve.org/'

type IndexDTFBrand = {
  dtf?: {
    icon?: string
  }
}

interface UpdatersProps {
  dtfAddress: string
  chainId: number
}

const IndexDTFMetadataUpdater: React.FC<{
  dtfAddress: string
}> = ({ dtfAddress }) => {
  const chainId = useAtomValue(chainIdAtom)
  const setIndexDTF = useSetAtom(indexDTFAtom)
  const setIndexDTFBrand = useSetAtom(indexDTFBrandAtom)
  const { data } = useIndexDTF(dtfAddress, chainId)

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
  }, [data, setIndexDTF])

  useEffect(() => {
    if (brandData) {
      setIndexDTFBrand(brandData)
    }
  }, [brandData, setIndexDTFBrand])

  return null
}

const IndexDTFBasketUpdater: React.FC<{
  dtfAddress: string
}> = ({ dtfAddress }) => {
  const chainId = useAtomValue(chainIdAtom)
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketPrices = useSetAtom(indexDTFBasketPricesAtom)
  const setBasketAmounts = useSetAtom(indexDTFBasketAmountsAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)

  const basketResult = useIndexBasket(dtfAddress, chainId)

  useEffect(() => {
    if (basketResult && !basketResult.isLoading && basketResult.data) {
      setBasket(
        basketResult.data.basket.sort(
          (a: any, b: any) =>
            Number(basketResult.data.shares[b.address]) -
            Number(basketResult.data.shares[a.address])
        )
      )
      setBasketPrices(basketResult.data.prices)
      setBasketAmounts(basketResult.data.amounts)
      setBasketShares(basketResult.data.shares)
    }
  }, [
    basketResult,
    setBasket,
    setBasketPrices,
    setBasketAmounts,
    setBasketShares,
  ])

  return null
}

const ChainIdUpdater: React.FC<{ chainId: number }> = ({ chainId }) => {
  const setChainId = useSetAtom(chainIdAtom)

  useEffect(() => {
    setChainId(chainId)
  }, [chainId, setChainId])

  return null
}

const WalletUpdater = () => {
  const setWallet = useSetAtom(walletAtom)
  const { address } = useAccount()

  useEffect(() => {
    setWallet(address)
  }, [address, setWallet])

  return null
}

const IndexDTFIconsUpdater = () => {
  const setIcons = useSetAtom(indexDTFIconsAtom)

  const { data } = useQuery({
    queryKey: ['icons'],
    queryFn: async () => {
      const res = await fetch(RESERVE_API + 'dtf/icons')
      return res.json()
    },
  })

  useEffect(() => {
    if (data) {
      setIcons(data)
    }
  }, [data])

  return null
}

const Updaters: React.FC<UpdatersProps> = ({ dtfAddress, chainId }) => {
  return (
    <>
      <WalletUpdater />
      <ChainIdUpdater chainId={chainId} />
      <IndexDTFMetadataUpdater dtfAddress={dtfAddress} />
      <IndexDTFBasketUpdater dtfAddress={dtfAddress} />
      <IndexDTFIconsUpdater />
      <TokenBalancesUpdater dtfAddress={dtfAddress} />
    </>
  )
}

export default Updaters
