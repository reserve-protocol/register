import { Provider, Web3Provider } from '@ethersproject/providers'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useEthers } from '@usedapp/core'
import { Contract, ethers } from 'ethers'
import ERC20 from '../abis/ERC20.json'

type IBasketToken = {
  address: string
  poolIndex: number
  genesisQuantity: string
  maxTrade: string
  priceInRToken: string
  rateLimit: string
  slippageTolerance: string
}

const getBasketToken = async (
  RTokenContract: Contract,
  provider: ethers.providers.Web3Provider | undefined,
  tokenIndex: number
): Promise<IBasketToken> => {
  const tokenInfo = await RTokenContract.basketToken(tokenIndex)
  const token = new ethers.Contract(tokenInfo.tokenAddress, ERC20, provider)

  return {
    address: token.address,
    poolIndex: tokenIndex,
    genesisQuantity: ethers.utils.formatEther(tokenInfo.genesisQuantity),
    maxTrade: ethers.utils.formatEther(tokenInfo.maxTrade),
    priceInRToken: ethers.utils.formatEther(tokenInfo.priceInRToken),
    rateLimit: ethers.utils.formatEther(tokenInfo.rateLimit),
    slippageTolerance: ethers.utils.formatEther(tokenInfo.slippageTolerance),
  }
}

const useRTokenBasket = (RTokenContract: Contract) => {
  const [state, setState] = useState<{
    loading: boolean
    tokens: IBasketToken[]
  }>({ loading: false, tokens: [] })
  const { library } = useEthers()

  useEffect(() => {
    const fetchTokens = async () => {
      setState({ loading: true, tokens: [] })
      const contract = RTokenContract.connect(library as Web3Provider)

      const basketSize = await contract.basketSize()
      const basketTokens: Promise<IBasketToken>[] = []

      for (let i = 0; i < basketSize; i++) {
        basketTokens.push(getBasketToken(contract, library, i))
      }

      const tokens: IBasketToken[] = await Promise.all(basketTokens)

      setState({ loading: false, tokens })
    }

    if (RTokenContract && library) fetchTokens()
  }, [RTokenContract, library])

  return [state.tokens, state.loading]
}

export default useRTokenBasket
