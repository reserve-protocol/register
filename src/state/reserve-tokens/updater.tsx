import { gql, useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { RTOKEN_ADDRESS } from 'constants/addresses'
import RSV from 'constants/rsv'
import useTokensBalance from 'hooks/useTokensBalance'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ReserveToken } from 'types'
import { useAppSelector } from '../hooks'
import {
  loadTokens,
  selectCurrentRToken,
  setCurrent,
  updateBalance,
} from './reducer'

const getTokensQuery = gql`
  query GetTokens {
    mains {
      id
      staked
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
      vault {
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
const formatTokens = (mains: any): { [x: string]: ReserveToken } =>
  mains.payload.reduce((acc: any, data: any) => {
    acc[data.id.toLowerCase()] = {
      id: data.id.toLowerCase(),
      token: {
        ...data.token,
        supply: data.token.supply?.total || 0,
      },
      vault: data.vault,
      insurance: {
        staked: data.staked,
        token: data.stToken,
      },
    } as ReserveToken

    return acc
  })

/**
 * ReserveTokensUpdater
 *
 * Fetchs the list of RTokens from theGraph
 * Sets the default token
 */
const ReserveTokensUpdater = () => {
  const dispatch = useDispatch()
  const { data, loading: loadingTokens } = useQuery(getTokensQuery)
  const [currentRToken] = useAppSelector(({ reserveTokens }) => [
    reserveTokens.current,
  ])
  const { chainId } = useEthers()

  useEffect(() => {
    // TODO: Remove hardcoded RSV
    if (chainId) {
      dispatch(loadTokens({ [RSV[chainId].id.toLowerCase()]: RSV[chainId] }))
    }
    // TODO: Handle error scenario
    if (!loadingTokens && data) {
      const tokens = formatTokens(data.mains)

      // Verify if RSV exists on this chain
      if (chainId && RSV[chainId]) {
        tokens[RSV[chainId].id] = RSV[chainId]
      }

      dispatch(loadTokens(tokens))
    }
  }, [loadingTokens, chainId])

  return null
}

// Gets ReserveToken related token addresses and decimals
// TODO: ST TOKEN AND RSR
const getTokens = (reserveToken: ReserveToken): [string, number][] => [
  [reserveToken.token.address, reserveToken.token.decimals],
  // [reserveToken.stToken.address, reserveToken.stToken.decimals],
  ...reserveToken.vault.collaterals.map(({ token }): [string, number] => [
    token.address,
    token.decimals,
  ]),
]

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
