import { useEffect, useMemo, useState } from 'react'
import {
  useBlockNumber,
  useContractCall,
  useEthers,
  useTokenBalance,
} from '@usedapp/core'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumberish, Contract, ethers } from 'ethers'
import RTokenAbi from '../abis/RToken.json'
import ERC20 from '../abis/ERC20.json'
import { RToken as IRToken, ERC20 as IERC20 } from '../abis/types'
import useTokenInfo from './useTokenInfo'

export interface IBasketToken {
  address: string
  symbol?: string
  name?: string
  balance?: BigNumberish
  genesisQuantity: BigNumberish
  maxTrade: BigNumberish
  priceInRToken: BigNumberish
  rateLimit: BigNumberish
  slippageTolerance: BigNumberish
}

export interface IRTokenInfo {
  address: string
  symbol?: string
  balance?: BigNumberish
  basket?: IBasketToken[]
}

const getBasketToken = async (
  account: string | null | undefined,
  RTokenContract: Contract,
  provider: ethers.providers.Web3Provider | undefined,
  tokenIndex: number
): Promise<IBasketToken> => {
  const tokenInfo = await RTokenContract.basketToken(tokenIndex)
  const token = <IERC20>(
    new ethers.Contract(tokenInfo.tokenAddress, ERC20, provider)
  )
  let tokenBalance: BigNumberish = ''

  if (account) {
    tokenBalance = await token.balanceOf(account)
  }

  return {
    address: tokenInfo.tokenAddress,
    symbol: await token.symbol(),
    name: await token.name(),
    balance: tokenBalance,
    genesisQuantity: tokenInfo.genesisQuantity,
    maxTrade: tokenInfo.maxTrade,
    priceInRToken: tokenInfo.priceInRToken,
    rateLimit: tokenInfo.rateLimit,
    slippageTolerance: tokenInfo.slippageTolerance,
  }
}

export const useRTokenBasket = (
  RTokenContract: IRToken,
  account: string | null | undefined
): [IBasketToken[], boolean] => {
  const [state, setState] = useState<{
    loading: boolean
    tokens: IBasketToken[]
  }>({ loading: false, tokens: [] })
  const { library } = useEthers()
  // const blockNumber = useBlockNumber()

  useEffect(() => {
    const fetchTokens = async () => {
      setState({ loading: true, tokens: [] })
      console.log('fetch tokens')
      const contract = RTokenContract.connect(library as Web3Provider)

      const basketSize = await contract.basketSize()
      const basketTokens: Promise<IBasketToken>[] = []

      for (let i = 0; i < basketSize; i++) {
        basketTokens.push(getBasketToken(account, contract, library, i))
      }

      const tokens: IBasketToken[] = await Promise.all(basketTokens)

      setState({ loading: false, tokens })
    }

    if (RTokenContract && library && account) fetchTokens()
  }, [RTokenContract?.address, library, account])

  return [state.tokens, state.loading]
}

export const useRToken = (address: string): [IRTokenInfo, boolean] => {
  const { account } = useEthers()

  const contract = useMemo((): IRToken => {
    return <IRToken>new Contract(address, RTokenAbi)
  }, [address])

  const [tokenInfo, loadingInfo] = useTokenInfo(address, account)
  const [basket, loadingBasket] = useRTokenBasket(contract, account)

  const info: IRTokenInfo = {
    ...tokenInfo,
    basket,
  }

  return [info, loadingInfo || loadingBasket]
}

export default useRToken
