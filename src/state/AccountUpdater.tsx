import { getAddress, isAddress } from '@ethersproject/address'
import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useQuery from 'hooks/useQuery'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { AccountPosition, AccountToken } from 'types'
import { calculateApy } from 'utils'
import RSV from 'utils/rsv'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountTokensAtom,
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
  const [lastFetched, setLastFetched] = useState(0)
  const blockNumber = useBlockNumber() ?? 0
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const timestamp = useAtomValue(blockTimestampAtom)
  const fromTime = useMemo(() => {
    return timestamp - 2592000
  }, [!!timestamp])
  const updateTokens = useUpdateAtom(accountTokensAtom)
  const updatePositions = useUpdateAtom(accountPositionsAtom)
  const updateHoldings = useUpdateAtom(accountHoldingsAtom)

  // TODO: poll from blockNumber
  const { data, error, mutate, isValidating } = useQuery(
    account ? accountQuery : null,
    {
      id: account?.toLowerCase(),
      fromTime,
      rsvAddress: RSV.address.toLowerCase(),
    },
    { refreshInterval: 5000 }
  )

  useEffect(() => {
    if (data && !error) {
      const tokens: AccountToken[] = []
      const positions: AccountPosition[] = []
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

      setLastFetched(blockNumber)
      updateTokens(tokens)
      updatePositions(positions)
      updateHoldings(holdings)
    }
  }, [data])

  // Update data on new block
  useEffect(() => {
    if (lastFetched && blockNumber > lastFetched && !isValidating) {
      mutate()
    }
  }, [blockNumber])

  return null
}

export default AccountUpdater
