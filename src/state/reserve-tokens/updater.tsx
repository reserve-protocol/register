import { useEthers } from '@usedapp/core'
import RTokenAbi from 'abis/RToken.json'
import { getAddress } from 'constants/addresses'
import { Multicall } from 'ethereum-multicall'
import useMulticall, {
  getTokensInfo,
  mapContractResults,
  tokenInfoCalls,
} from 'hooks/useMulticall'
import useTokensBalance from 'hooks/useTokensBalance'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Falsy, StringMap } from 'types'
import { useAppSelector } from '../hooks'
import {
  IBasketToken,
  IReserveToken,
  loadBasket,
  loadTokens,
  setCurrent,
  updateBalance,
} from './reducer'

interface T {
  token: IReserveToken
  basket: IBasketToken[]
}

const getRToken = async (
  multicall: Multicall,
  address: string
): Promise<IReserveToken> => {
  const contractConfig = {
    reference: 'tokenInfo',
    contractAddress: address,
    abi: RTokenAbi,
  }

  const {
    results: { tokenInfo },
  } = await multicall.call({
    ...contractConfig,
    calls: [
      ...tokenInfoCalls,
      {
        reference: 'basketSize',
        methodName: 'basketSize',
        methodParameters: [],
      },
    ],
  })

  return {
    address,
    ...mapContractResults(tokenInfo.callsReturnContext),
  } as IReserveToken
}

const getRTokenBasket = async (
  multicall: Multicall,
  rToken: IReserveToken
): Promise<IBasketToken[]> => {
  const basketCalls = []
  for (let i = 0; i < rToken.basketSize; i++) {
    basketCalls.push({
      reference: 'tokenInfo',
      methodName: 'basketToken',
      methodParameters: [i],
    })
  }

  const {
    results: { basketTokensResult },
  } = await multicall.call({
    contractAddress: rToken.address,
    abi: RTokenAbi,
    reference: 'basketTokensResult',
    calls: basketCalls,
  })

  const basketTokens: StringMap = basketTokensResult.callsReturnContext.reduce(
    (acc, result) => {
      const [
        tokenAddress,
        genesisQuantity,
        rateLimit,
        maxTrade,
        priceInRToken,
        slippageTolerance,
      ] = result.returnValues
      const [basketIndex] = result.methodParameters

      return {
        ...acc,
        [tokenAddress]: {
          basketIndex,
          address: tokenAddress,
          genesisQuantity,
          rateLimit,
          maxTrade,
          priceInRToken,
          slippageTolerance,
        },
      }
    },
    {}
  )

  const basketTokensInfo = await getTokensInfo(
    multicall,
    Object.keys(basketTokens)
  )

  return basketTokensInfo.map(
    (basketTokenInfo) =>
      ({
        ...basketTokenInfo,
        ...basketTokens[basketTokenInfo.address],
      } as IBasketToken)
  )
}

/**
 * Get RToken information
 *
 * @param address - RToken address
 * @returns
 */
const useRToken = (address: string | Falsy): T | null => {
  const [data, setData] = useState<T | null>(null)
  const multicall = useMulticall()

  useEffect(() => {
    const fetchToken = async () => {
      if (!multicall || !address) {
        return
      }

      try {
        const rToken = await getRToken(multicall, address)
        const basket = await getRTokenBasket(multicall, rToken)

        setData({
          token: rToken,
          basket,
        })
      } catch (e) {
        console.error('Error getting rtoken info', e)
      }
    }

    fetchToken()
  }, [address ?? '', multicall])

  return data
}

const Updater = () => {
  const dispatch = useDispatch()
  const [currentRToken] = useAppSelector(({ reserveTokens }) => [
    reserveTokens.current,
  ])
  const { chainId } = useEthers()
  const rToken = useRToken(currentRToken ?? getAddress(chainId, 'RTOKEN'))
  const tokenBalances = useTokensBalance(
    rToken?.token.address
      ? [
          [rToken.token.address, rToken.token.decimals],
          ...rToken.basket.map((basketToken): [string, number] => [
            basketToken.address,
            basketToken.decimals,
          ]),
        ]
      : []
  )

  useEffect(() => {
    if (rToken) {
      dispatch(loadTokens({ [rToken.token.address]: rToken.token }))
      dispatch(loadBasket({ [rToken.token.address]: rToken.basket }))
      dispatch(setCurrent(rToken.token.address))
    }
  }, [JSON.stringify(rToken)])

  // Update RToken and baskets balance
  useEffect(() => {
    if (Object.keys(tokenBalances)) {
      dispatch(updateBalance(tokenBalances))
    }
  }, [JSON.stringify(tokenBalances)])

  return null
}

export default Updater
