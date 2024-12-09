import { chainIdAtom, walletChainAtom } from '@/state/atoms'
import {
  fTokenAddressAtom,
  fTokenAtom,
  fTokenBasketAtom,
  fTokenConfigurationAtom,
  fTokenGovernanceAtom,
  fTokenMetaAtom,
} from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { AvailableChain, supportedChains } from '@/utils/chains'
import { NETWORKS, ROUTES } from '@/utils/constants'
import TokenNavigation from 'components/layout/navigation/TokenNavigation'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useSwitchChain } from 'wagmi'

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
  const token = useAtomValue(fTokenAddressAtom)
  const chainId = useAtomValue(chainIdAtom)

  // Temporal, individual hooks for each atom
  const setTokenData = useSetAtom(fTokenAtom)
  const setTokenMeta = useSetAtom(fTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(fTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(fTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(fTokenBasketAtom)

  useEffect(() => {
    if (token) {
      setTokenData({
        symbol: 'MEME500',
        name: 'ETH Meme Index 500',
        address: token,
        decimals: 18,
        chain: chainId,
      })
      setTokenMeta({
        description:
          'The ETH Meme Index 500 is a basket of the top 500 meme tokens on Ethereum.',
        tags: ['meme'],
        logo: 'https://storage.reserve.org/dtf-default.png',
        website: 'https://ethmemeindex500.com',
        telegram: 'https://t.me/ethmemeindex500',
        twitter: 'https://twitter.com/ethmemeindex500',
        deployerNote: 'This is a test token.',
      })
      setTokenConfiguration({
        fee: 0.01,
        IsManaged: true,
      })
      setTokenGovernance({
        address: '0x1234567890123456789012345678901234567890',
        deployer: '0x1234567890123456789012345678901234567890',
      })
      setTokenBasket({
        tokens: [
          {
            symbol: 'MEME',
            name: 'Meme Coin',
            address: '0x1234567890123456789012345678901234567890',
            decimals: 18,
          },
        ],
        weights: [100n],
      })
    }
  }, [token])

  return null
}

// TODO: Hook currently re-renders a lot because of a wagmi bug, different component to avoid tree re-renders
const Updater = () => {
  const { chain, tokenId } = useParams()
  const navigate = useNavigate()
  const setChain = useSetAtom(chainIdAtom)
  const [currentToken, setTokenAddress] = useAtom(fTokenAddressAtom)
  const setTokenData = useSetAtom(fTokenAtom)
  const setTokenMeta = useSetAtom(fTokenMetaAtom)
  const setTokenConfiguration = useSetAtom(fTokenConfigurationAtom)
  const setTokenGovernance = useSetAtom(fTokenGovernanceAtom)
  const setTokenBasket = useSetAtom(fTokenBasketAtom)
  useChainWatch()

  const resetState = () => {
    setTokenData(null)
    setTokenMeta(null)
    setTokenConfiguration(null)
    setTokenGovernance(null)
    setTokenBasket(null)
  }

  // Handle token change
  useEffect(() => {
    const tokenAddress = isAddress(tokenId ?? '')

    if (!supportedChains.has(NETWORKS[chain ?? ''] || 0) || !tokenAddress) {
      navigate(ROUTES.NOT_FOUND)
    }

    if (tokenAddress !== currentToken) {
      resetState()
      setChain(Number(chain) as AvailableChain)
      setTokenAddress(tokenAddress)
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

const DTFContainer = () => (
  <div className="container flex flex-col-reverse md:flex-row mb-[72px] md:mb-0">
    <Updater />
    <TokenNavigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default DTFContainer
