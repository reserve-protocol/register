import dtfIndexAbi from '@/abis/dtf-index-abi'
import { chainIdAtom, walletChainAtom } from '@/state/atoms'
import {
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
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { erc20Abi, formatEther } from 'viem'
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
            {
              address: token,
              abi: dtfIndexAbi,
              functionName: 'mintingFee',
            },
          ],
          allowFailure: false,
          query: {
            select: (data) => {
              const [name, symbol, folioFee, mintingFee] = data

              return {
                name,
                symbol,
                folioFee: Number((folioFee / 43959105336n) * 100n),
                mintingFee: Number(formatEther(mintingFee * 100n)),
              }
            },
          },
        }
      : undefined
  )

  console.log('error?', error)

  // Temporal, individual hooks for each atom
  const setTokenData = useSetAtom(iTokenAtom)
  const setTokenMeta = useSetAtom(iTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(iTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(iTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(iTokenBasketAtom)

  useEffect(() => {
    console.log('token meta?', { token, data })
    if (token && data) {
      setTokenData({
        symbol: data.symbol,
        name: data.name,
        address: token,
        decimals: 18,
        chain: chainId,
      })
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
  useChainWatch()

  const resetState = () => {
    setTokenData(undefined)
    setTokenMeta(undefined)
    setTokenConfiguration(undefined)
    setTokenGovernance(undefined)
    setTokenBasket(undefined)
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
      <DTFContextUpdater />
    </>
  )
}

const IndexDTFContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-[72px] h-full lg:mb-0">
    <Updater />
    <IndexDTFNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default IndexDTFContainer
