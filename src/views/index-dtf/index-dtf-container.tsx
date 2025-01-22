import dtfIndexAbi from '@/abis/dtf-index-abi'
import { useIndexBasket } from '@/hooks/useIndexPrice'
import {
  chainIdAtom,
  INDEX_DTF_SUBGRAPH_URL,
  walletChainAtom,
} from '@/state/atoms'
import {
  IndexDTF,
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  indexDTFFeeAtom,
  iTokenAddressAtom,
  iTokenAtom,
  iTokenBasketAtom,
  iTokenConfigurationAtom,
  iTokenGovernanceAtom,
  iTokenMetaAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Address, erc20Abi, formatEther } from 'viem'
import { useReadContracts, useSwitchChain } from 'wagmi'
import IndexDTFNavigation from './components/navigation'

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

const DTFContextUpdater = () => {
  const token = useAtomValue(iTokenAddressAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data, error, isLoading } = useReadContracts(
    token
      ? {
          contracts: [
            {
              address: token,
              abi: erc20Abi,
              functionName: 'name',
              chainId,
            },
            {
              address: token,
              abi: erc20Abi,
              functionName: 'symbol',
              chainId,
            },
            {
              address: token,
              abi: dtfIndexAbi,
              functionName: 'folioFee',
            },
          ],
          allowFailure: false,
          query: {
            select: (data) => {
              const [name, symbol, folioFee] = data

              return {
                name,
                symbol,
                folioFee: Number((folioFee / 43959105336n) * 100n),
              }
            },
          },
        }
      : undefined
  )

  console.log('error?', error)

  // Temporal, individual hooks for each atom
  const setTokenData = useSetAtom(iTokenAtom)
  const setFee = useSetAtom(indexDTFFeeAtom)
  const setTokenMeta = useSetAtom(iTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(iTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(iTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(iTokenBasketAtom)

  useEffect(() => {
    console.log('data', data)
    if (token && data) {
      setTokenData({
        symbol: data.symbol,
        name: data.name,
        address: token,
        decimals: 18,
        chain: chainId,
      })
      setFee(data.folioFee)
    }
  }, [token, chainId, data])

  // useEffect(() => {
  //   if (token) {
  //     setTokenData({
  //       symbol: 'MEME500',
  //       name: 'ETH Meme Index 500',
  //       address: token,
  //       decimals: 18,
  //       chain: chainId,
  //     })
  //     setTokenMeta({
  //       description:
  //         'The ETH Meme Index 500 is a basket of the top 500 meme tokens on Ethereum.',
  //       tags: ['meme'],
  //       logo: 'https://storage.reserve.org/dtf-default.png',
  //       website: 'https://ethmemeindex500.com',
  //       telegram: 'https://t.me/ethmemeindex500',
  //       twitter: 'https://twitter.com/ethmemeindex500',
  //       deployerNote: 'This is a test token.',
  //     })
  //     setTokenConfiguration({
  //       fee: 0.01,
  //       IsManaged: true,
  //     })
  //     setTokenGovernance({
  //       address: '0x1234567890123456789012345678901234567890',
  //       deployer: '0x1234567890123456789012345678901234567890',
  //       token: {
  //         symbol: 'RSR',
  //         name: 'Reserve Rights',
  //         address: '0x1234567890123456789012345678901234567890',
  //         decimals: 18,
  //       },
  //     })
  //     setTokenBasket({
  //       tokens: [
  //         {
  //           symbol: 'MEME',
  //           name: 'Meme Coin',
  //           address: '0x1234567890123456789012345678901234567890',
  //           decimals: 18,
  //         },
  //         {
  //           symbol: 'MEME 2',
  //           name: 'Meme Coin',
  //           address: '0x1234567890123456789012345678901234567890',
  //           decimals: 18,
  //         },
  //         {
  //           symbol: 'MEME 3',
  //           name: 'Meme Coin',
  //           address: '0x1234567890123456789012345678901234567890',
  //           decimals: 18,
  //         },
  //         {
  //           symbol: 'MEME 4',
  //           name: 'Meme Coin',
  //           address: '0x1234567890123456789012345678901234567890',
  //           decimals: 18,
  //         },
  //         {
  //           symbol: 'MEME 6',
  //           name: 'Meme Coin',
  //           address: '0x1234567890123456789012345678901234567890',
  //           decimals: 18,
  //         },
  //       ],
  //       weights: [20n, 20n, 20n, 20n, 20n],
  //       percents: ['20', '20', '20', '20', '20'],
  //     })
  //   }
  // }, [token])

  return null
}

type DTFQueryResponse = {
  dtf: IndexDTF
}

const dtfQuery = gql`
  query getDTF($id: String!) {
    dtf(id: $id) {
      id
      deployer
      ownerAddress
      ownerGovernance {
        id
        votingDelay
        votingPeriod
        timelock {
          id
          guardians
          executionDelay
        }
      }
      tradingGovernance {
        id
        votingDelay
        votingPeriod
        timelock {
          id
          guardians
          executionDelay
        }
      }
      token {
        id
        name
        symbol
        decimals
        totalSupply
      }
      stToken {
        id
        token {
          name
          symbol
          decimals
          totalSupply
        }
        underlying {
          name
          symbol
          address
          decimals
        }
      }
    }
  }
`

const IndexDTFMetadataUpdater = () => {
  const token = useAtomValue(iTokenAddressAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setIndexDTF = useSetAtom(indexDTFAtom)

  const { data, error } = useQuery({
    queryKey: ['index-dtf-metadata', token, chainId],
    queryFn: async () => {
      if (!token) return undefined

      const response: DTFQueryResponse = await request(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        dtfQuery,
        {
          id: token.toLowerCase(),
        }
      )

      return response
    },
    enabled: !!token,
  })

  console.log('error', error)

  useEffect(() => {
    if (data) {
      setIndexDTF(data.dtf)
    }
  }, [data])

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
      setBasket(data.basket)
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
  const setTokenData = useSetAtom(iTokenAtom)
  const setTokenMeta = useSetAtom(iTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(iTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(iTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(iTokenBasketAtom)
  const resetAtoms = useSetAtom(resetStateAtom)
  useChainWatch()

  const resetState = () => {
    setTokenData(undefined)
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

    if (!supportedChains.has(Number(chain)) || !tokenAddress) {
      navigate(ROUTES.NOT_FOUND)
    }

    if (tokenAddress !== currentToken) {
      resetState()
      setChain(Number(chain) as AvailableChain)
      setTokenAddress(tokenAddress ?? undefined)
    }
  }, [tokenId, chain])

  // Reset state on unmount
  useEffect(() => resetState, [])

  return (
    <>
      <IndexDTFMetadataUpdater />
      <IndexDTFBasketUpdater />
      <DTFContextUpdater />
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
