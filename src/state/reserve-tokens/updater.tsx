import { gql, useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { RTOKEN_ADDRESS } from 'constants/addresses'
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
      mood
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
    // TODO: Handle error scenario
    if (!loadingTokens && data) {
      dispatch(loadTokens(data.mains))
    }

    if (!currentRToken) {
      dispatch(
        setCurrent((RTOKEN_ADDRESS[chainId as number] || '').toLowerCase())
      )
    }
  }, [loadingTokens])

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
