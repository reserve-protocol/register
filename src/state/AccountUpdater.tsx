import { getAddress } from '@ethersproject/address'
import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useTokensBalance from 'hooks/useTokensBalance'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { AccountPosition, AccountToken } from 'types'
import { calculateApy } from 'utils'

import RSV from 'utils/rsv'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountRTokensAtom,
  accountTokensAtom,
  balancesAtom,
  blockTimestampAtom,
  rsrPriceAtom,
} from './atoms'

// TODO: Include RSV hardcoded into the query and check for balance
const accountQuery = gql`
  query getAccountTokens($id: String!, $fromTime: Int!, $rsvAddress: String!) {
    account(id: $id) {
      id
      balances(where: { token: $rsvAddress }) {
        amount
        token {
          lastPriceUSD
        }
      }
      rTokens {
        id
        stake
        rToken {
          id
          rsrExchangeRate
          rewardToken {
            token {
              name
              symbol
            }
          }
          recentRate: hourlySnapshots(
            first: 1
            orderBy: timestamp
            where: { timestamp_gte: $fromTime }
            orderDirection: desc
          ) {
            rsrExchangeRate
            basketRate
            timestamp
          }
          lastRate: hourlySnapshots(
            first: 1
            orderBy: timestamp
            where: { timestamp_gte: $fromTime }
            orderDirection: asc
          ) {
            rsrExchangeRate
            basketRate
            timestamp
          }
        }
        balance {
          amount
          token {
            name
            symbol
            lastPriceUSD
          }
        }
      }
    }
  }
`

const AccountUpdater = () => {
  const { account } = useWeb3React()
  const balances = useTokensBalance()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const timestamp = useAtomValue(blockTimestampAtom)
  const fromTime = useMemo(() => {
    return timestamp - 2592000
  }, [!!timestamp])
  const updateBalances = useSetAtom(balancesAtom)
  const updateTokens = useSetAtom(accountTokensAtom)
  const updatePositions = useSetAtom(accountPositionsAtom)
  const updateHoldings = useSetAtom(accountHoldingsAtom)
  const updateAccountTokens = useSetAtom(accountRTokensAtom)

  const { data, error } = useQuery(account ? accountQuery : null, {
    id: account?.toLowerCase(),
    fromTime,
    rsvAddress: RSV.address.toLowerCase(),
  })

  // TODO: Move this code to a independent function outside of component
  useEffect(() => {
    if (data && !error) {
      const tokens: AccountToken[] = []
      const positions: AccountPosition[] = []
      const accountRTokens: {
        address: string
        name: string
        symbol: string
      }[] = []
      let holdings = 0

      for (const rToken of data?.account?.rTokens || []) {
        const balance = Number(rToken?.balance?.amount)
        const stake = Number(rToken?.stake)
        let tokenApy = 0
        let stakingApy = 0
        const recentRate = rToken?.rToken?.recentRate[0]
        const lastRate = rToken?.rToken?.lastRate[0]

        if (
          recentRate &&
          lastRate &&
          recentRate.timestamp !== lastRate.timestamp
        ) {
          ;[tokenApy, stakingApy] = calculateApy(recentRate, lastRate)
        }

        // Relate RToken to account
        if (balance > 0 || stake > 0) {
          accountRTokens.push({
            address: getAddress(rToken.rToken.id),
            name: rToken.balance.token.name,
            symbol: rToken.balance.token.symbol,
          })
        }

        if (balance > 0) {
          const usdAmount = Number(rToken.balance.token.lastPriceUSD) * balance
          holdings += usdAmount

          tokens.push({
            address: getAddress(rToken.rToken.id),
            name: rToken.balance.token.name,
            symbol: rToken.balance.token.symbol,
            usdPrice: Number(rToken.balance.token.lastPriceUSD),
            usdAmount,
            balance,
            apy: +tokenApy.toFixed(2),
          })
        }

        if (stake > 0) {
          const rate = Number(rToken.rToken.rsrExchangeRate)
          const rsrAmount = stake * rate
          const usdAmount = rsrAmount * rsrPrice
          holdings += usdAmount

          positions.push({
            name: rToken.rToken.rewardToken.token.name,
            symbol: rToken.rToken.rewardToken.token.symbol,
            balance: stake,
            apy: +stakingApy.toFixed(2),
            exchangeRate: rate,
            rsrAmount,
            usdAmount,
          })
        }
      }

      // Check if the account has RSV balance
      if (data?.account?.balances?.length) {
        const balance = Number(data.account.balances[0]?.amount)
        const usdPrice =
          Number(data.account.balances[0]?.token.lastPriceUSD) || 1

        if (balance > 0) {
          holdings += balance * usdPrice

          tokens.push({
            address: RSV.address,
            name: 'Reserve',
            symbol: 'RSV',
            usdPrice,
            usdAmount: balance * usdPrice,
            balance,
            apy: 0,
          })
        }
      }

      tokens.sort((a, b) => b.usdAmount - a.usdAmount)
      positions.sort((a, b) => b.usdAmount - a.usdAmount)

      updateTokens(tokens)
      updatePositions(positions)
      updateHoldings(holdings)
      updateAccountTokens(accountRTokens)
    }
  }, [data])

  useEffect(() => {
    updateBalances(balances)
  }, [balances])

  return null
}

export default AccountUpdater
