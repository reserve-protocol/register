import rtokens from '@reserve-protocol/rtokens'
import RToken from 'abis/RToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom, walletChainAtom } from 'state/atoms'
import {
  rTokenMetaAtom,
  selectedRTokenAtom,
} from 'state/rtoken/atoms/rTokenAtom'
import { AvailableChain } from 'utils/chains'
import { NETWORKS, ROUTES } from 'utils/constants'
import { Address, getAddress } from 'viem'
import { useReadContracts, useSwitchChain } from 'wagmi'

const getListedRToken = (tokenId: string, chainId: number) => {
  if (!tokenId || !rtokens[chainId]) {
    return undefined
  }

  return Object.values(rtokens[chainId]).find(
    (token) =>
      token.symbol.toLowerCase() === tokenId.toLowerCase() ||
      token.address.toLowerCase() === tokenId.toLowerCase()
  )
}

const useRTokenContext = () => {
  const navigate = useNavigate()
  const { switchChain } = useSwitchChain()
  const walletChain = useAtomValue(walletChainAtom)
  const { chain, tokenId } = useParams()
  const chainId = NETWORKS[chain ?? ''] as AvailableChain
  const rToken = useMemo(() => {
    const listedToken = getListedRToken(tokenId as string, chainId)

    return listedToken
  }, [chain, tokenId])

  const setChain = useSetAtom(chainIdAtom)
  const setRToken = useSetAtom(rTokenMetaAtom)
  const selected = useAtomValue(selectedRTokenAtom)

  // TODO: This hook triggers unexpected re-renders, fixed on wagmiv2
  const unlistedToken = useReadContracts({
    allowFailure: false,
    query: { enabled: !rToken },
    contracts: [
      {
        address: tokenId as Address,
        abi: RToken,
        functionName: 'symbol',
        chainId,
      },
      {
        address: tokenId as Address,
        abi: RToken,
        functionName: 'name',
        chainId,
      },
      {
        address: tokenId as Address,
        abi: RToken,
        functionName: 'mandate',
        chainId,
      },
    ],
  })

  // Listed
  useEffect(() => {
    if (rToken) {
      setRToken({
        symbol: rToken.symbol,
        name: rToken.name,
        decimals: rToken.decimals,
        address: rToken.address as Address,
        chain: chainId,
        logo: `/svgs/${(rToken?.logo ?? 'default.svg').toLowerCase()}`,
      })
      setChain(chainId)
    }
  }, [rToken?.address])

  useEffect(() => {
    if (unlistedToken.isFetched && !rToken) {
      // Valid token set atom
      if (unlistedToken.data && tokenId) {
        const [symbol, name] = unlistedToken.data

        setRToken({
          symbol: symbol,
          name: name,
          decimals: 18,
          address: getAddress(tokenId),
          chain: chainId,
        })
        setChain(chainId)
      } else {
        navigate(ROUTES.NOT_FOUND)
      }
    }
  }, [unlistedToken.status])

  useEffect(() => {
    if (switchChain && chainId && selected && chainId !== walletChain) {
      switchChain({ chainId })
    }
  }, [chainId, selected])

  // Cleanup RToken
  useEffect(() => {
    return () => {
      setRToken(null)
    }
  }, [])
}

export default useRTokenContext
