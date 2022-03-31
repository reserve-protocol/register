import { gql, useQuery } from '@apollo/client'
import { getAddress } from 'ethers/lib/utils'
import useTokensBalance from 'hooks/useTokensBalance'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ReserveToken } from 'types'
import { CHAIN_ID } from '../../constants'
import { RSV_MANAGER_ADDRESS } from '../../constants/addresses'
import { RSR } from '../../constants/tokens'
import { useAppSelector } from '../hooks'
import { loadTokens, selectCurrentRToken, updateBalance } from './reducer'

const getTokensQuery = gql`
  query GetTokens {
    mains {
      id
      staked
      facade
      basketHandler
      stToken {
        address
        name
        symbol
        decimals
      }
      token {
        address
        name
        symbol
        decimals
        transfersCount
        holdersCount
        supply {
          total
        }
      }
      basket {
        id
        collaterals {
          id
          index
          token {
            address
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

// TODO: Proper typing
const formatTokens = (mains: any[]): { [x: string]: ReserveToken } =>
  mains.reduce((acc: any, data: any) => {
    try {
      const address = getAddress(data.id.toLowerCase())
      const isRSV = address === RSV_MANAGER_ADDRESS[CHAIN_ID]
      let basket = { id: '', collaterals: [] }
      let insurance = null

      if (!isRSV) {
        insurance = {
          staked: data.staked,
          token: {
            ...data.stToken,
            address: getAddress(data.stToken.address.toLowerCase()),
          },
        }
      }

      if (data.basket) {
        basket = {
          ...data.basket,
          collaterals: data.basket.collaterals.map((collateral: any) => ({
            ...collateral,
            token: {
              ...collateral.token,
              address: getAddress(collateral.token.address.toLowerCase()),
            },
          })),
        }
      }

      acc[address] = {
        id: address,
        token: {
          ...data.token,
          address: getAddress(data.token.address.toLowerCase()),
          supply: data.token.supply?.total || 0,
        },
        basket,
        insurance,
        facade: isRSV ? null : getAddress(data.facade.toLowerCase()),
        basketHandler: isRSV
          ? null
          : getAddress(data.basketHandler.toLowerCase()),
        isRSV,
      } as ReserveToken
    } catch (e) {
      console.error('Fail to format token', e)
    }

    return acc
  }, {})

/**
 * ReserveTokensUpdater
 *
 * Fetchs the list of RTokens from theGraph
 * Sets the default token
 */
const ReserveTokensUpdater = () => {
  const dispatch = useDispatch()
  const { data, loading: loadingTokens } = useQuery(getTokensQuery)

  useEffect(() => {
    // TODO: Handle error scenario
    if (!loadingTokens && data?.mains) {
      const tokens = formatTokens(data.mains)
      dispatch(loadTokens(tokens))
    }
  }, [loadingTokens])

  return null
}

// Gets ReserveToken related token addresses and decimals
// TODO: ST TOKEN AND RSR
const getTokens = (reserveToken: ReserveToken): [string, number][] => {
  const addresses: [string, number][] = [
    [reserveToken.token.address, reserveToken.token.decimals],
    [RSR.address, RSR.decimals],
    ...reserveToken.basket.collaterals.map(({ token }): [string, number] => [
      token.address,
      token.decimals,
    ]),
  ]

  if (reserveToken.insurance?.token) {
    addresses.push([
      reserveToken.insurance.token.address,
      reserveToken.insurance.token.decimals,
    ])
  }

  return addresses
}
/**
 * Updates the balances of the current ReserveToken related tokens
 */
const TokensBalanceUpdater = () => {
  const dispatch = useDispatch()
  const reserveToken = useAppSelector(selectCurrentRToken)
  const balances = useTokensBalance(reserveToken ? getTokens(reserveToken) : [])

  useEffect(() => {
    dispatch(updateBalance(balances))
  }, [JSON.stringify(balances)])

  return null
}

/**
 * Updater
 */
const Updater = () => (
  <>
    <ReserveTokensUpdater />
    <TokensBalanceUpdater />
  </>
)

export default Updater
