import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { getAddress } from 'viem'
import {
  accountHoldingsAtom,
  accountRTokensAtom,
  accountTokensAtom,
  rsrPriceAtom,
  walletAtom,
} from '../../atoms'

// TODO: Include RSV hardcoded into the query and check for balance
const accountQuery = gql`
  query getAccountTokens($id: String!) {
    account(id: $id) {
      id
      rTokens {
        id
        governance {
          tokenBalance
        }
        rToken {
          id
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

interface AccountQueryResult {
  account: {
    id: string
    rTokens: {
      id: string
      governance: {
        tokenBalance: string
      }[]
      rToken: {
        id: string
        rsrExchangeRate: string
        rewardToken: {
          token: {
            name: string
            symbol: string
          }
        }
      }
      balance: {
        amount: string
        token: {
          name: string
          symbol: string
          lastPriceUSD: string
        }
      }
    }[]
  }
}

export interface AccountRTokenPosition {
  address: string
  name: string
  symbol: string
  usdPrice: number
  balance: number
  usdAmount: number
  stakedRSR: number
  stakedRSRUsd: number
  chain: number
}

const AccountUpdater = () => {
  const account = useAtomValue(walletAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  const updateTokens = useSetAtom(accountTokensAtom)
  const updateHoldings = useSetAtom(accountHoldingsAtom)
  const updateAccountTokens = useSetAtom(accountRTokensAtom)

  const { data, error } = useMultichainQuery(account ? accountQuery : null, {
    id: account?.toLowerCase(),
  })

  // TODO: Move this code to a independent function outside of component
  useEffect(() => {
    if (data && !error) {
      const tokens: AccountRTokenPosition[] = []
      const accountRTokens: {
        address: string
        name: string
        symbol: string
        chainId: number
      }[] = []
      let holdings = 0

      for (const chainId of Object.keys(data)) {
        const chainResult = data[Number(chainId)] as AccountQueryResult

        for (const rToken of chainResult.account?.rTokens ?? []) {
          const balance = Number(rToken.balance.amount)
          const stake = Number(rToken.governance[0]?.tokenBalance ?? 0)

          if (balance > 0 || stake > 0) {
            accountRTokens.push({
              address: getAddress(rToken.rToken.id),
              name: rToken.balance.token.name,
              symbol: rToken.balance.token.symbol,
              chainId: Number(chainId),
            })
          }

          if (balance > 0 || stake > 0) {
            const balanceUsdAmount =
              Number(rToken.balance.token.lastPriceUSD) * balance
            const rate = Number(rToken.rToken.rsrExchangeRate)
            const rsrAmount = stake * rate
            const stakedUsdAmount = rsrAmount * rsrPrice
            holdings += balanceUsdAmount + stakedUsdAmount

            tokens.push({
              address: getAddress(rToken.rToken.id),
              name: rToken.balance.token.name,
              symbol: rToken.balance.token.symbol,
              usdPrice: Number(rToken.balance.token.lastPriceUSD),
              usdAmount: balanceUsdAmount,
              balance,
              stakedRSR: stake * rate,
              stakedRSRUsd: stakedUsdAmount,
              chain: Number(chainId),
            })
          }
        }
      }

      tokens.sort(
        (a, b) => b.usdAmount + b.stakedRSRUsd - (a.usdAmount + a.stakedRSRUsd)
      )

      updateTokens(tokens)
      updateHoldings(holdings)
      updateAccountTokens(accountRTokens)
    }
  }, [data])

  return null
}

export default AccountUpdater
