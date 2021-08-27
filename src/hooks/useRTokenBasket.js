import { useMemo, useState, useEffect, useCallback } from 'react'
import { useEthers } from '@usedapp/core'
import { ethers } from 'ethers'
import ERC20 from '../abis/ERC20.json'

const getBasketToken = async (RTokenContract, provider, tokenIndex) => {
  const tokenInfo = await RTokenContract.basketToken(tokenIndex)
  const token = new ethers.Contract(tokenInfo.tokenAddress, ERC20, provider)

  return {
    address: token.address,
    // symbol: await token.symbol(),
    genesisQuantity: ethers.utils.formatEther(tokenInfo.genesisQuantity),
    maxTrade: ethers.utils.formatEther(tokenInfo.maxTrade),
    priceInRToken: ethers.utils.formatEther(tokenInfo.priceInRToken),
    rateLimit: ethers.utils.formatEther(tokenInfo.rateLimit),
    slippageTolerance: ethers.utils.formatEther(tokenInfo.slippageTolerance),
  }
}

const useRTokenBasket = (RTokenContract) => {
  const [state, setState] = useState({ loading: false, tokens: [] })
  const { library } = useEthers()

  useEffect(() => {
    const fetchTokens = async () => {
      setState({ loading: true, tokens: [] })
      const contract = RTokenContract.connect(library)

      const basketSize = await contract.basketSize()
      const basketTokens = []

      for (let i = 0; i < basketSize; i++) {
        basketTokens.push(getBasketToken(contract, library, i))
      }

      const tokens = await Promise.all(basketTokens)

      setState({ loading: false, tokens })
    }

    if (RTokenContract) fetchTokens()
  }, [RTokenContract, library])

  return [state.tokens, state.loading]
}

export default useRTokenBasket
