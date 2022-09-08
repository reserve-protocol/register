import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useQuery from 'hooks/useQuery'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { AccountPosition, AccountToken } from 'types'
import {
  accountHoldingsAtom,
  accountPositionsAtom,
  accountTokensAtom,
  rsrPriceAtom,
} from './atoms'

// TODO: Include RSV hardcoded into the query and check for balance
const accountQuery = gql`
  query getAccountTokens($id: String!) {
    account(id: $id) {
      id
      balances(where: { token: "0x196f4727526ea7fb1e17b2071b3d8eaa38486988" }) {
        amount
        token {
          lastPriceUSD
        }
      }
      rTokens {
        id
        stake
        rToken {
          rsrExchangeRate
          rewardToken {
            token {
              name
              symbol
            }
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
  const updateTokens = useUpdateAtom(accountTokensAtom)
  const updatePositions = useUpdateAtom(accountPositionsAtom)
  const updateHoldings = useUpdateAtom(accountHoldingsAtom)

  // TODO: poll from blockNumber
  const { data, error, mutate, isValidating } = useQuery(
    account ? accountQuery : null,
    {
      id: account?.toLocaleLowerCase(),
    }
  )

  useEffect(() => {
    if (data && !error) {
      const tokens: AccountToken[] = []
      const positions: AccountPosition[] = []
      let holdings = 0

      for (const rToken of data?.account?.rTokens || []) {
        const balance = Number(rToken?.balance?.amount)
        const stake = Number(rToken?.stake)

        if (balance > 0) {
          const usdAmount = Number(rToken.balance.token.lastPriceUSD) * balance
          holdings += usdAmount

          tokens.push({
            name: rToken.balance.token.name,
            symbol: rToken.balance.token.symbol,
            usdPrice: Number(rToken.balance.token.lastPriceUSD),
            usdAmount,
            balance,
            apy: 0, // TODO
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
            apy: 0, // TODO
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
            name: 'Reserve',
            symbol: 'RSV',
            usdPrice,
            usdAmount: balance * usdPrice,
            balance,
            apy: 0,
          })
        }
      }

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
