import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import {
  AccountRTokenPosition,
  AccountToken,
} from 'state/wallet/updaters/AccountUpdater'
import { getAddress } from 'viem'

const accountQuery = gql`
  query getAccountTokens($ids: [String]!) {
    accounts(where: { id_in: $ids }) {
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
  accounts: {
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
  }[]
}

export interface AccountData {
  tokens: AccountRTokenPosition[]
  accountTokens: AccountToken[]
  holdings: number
}

const useAccounts = (addresses: string[]) => {
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const { data, error } = useMultichainQuery(accountQuery, {
    ids: addresses.map((address) => address.toLowerCase()),
  })

  const accountDataMap: Record<string, AccountData> = {}

  useEffect(() => {
    if (data && !error) {
      const addressMap: Record<string, AccountData> = {}

      addresses.forEach((address) => {
        addressMap[address.toLowerCase()] = {
          tokens: [],
          accountTokens: [],
          holdings: 0,
        }
      })

      for (const chainId of Object.keys(data)) {
        const chainResult = data[Number(chainId)] as AccountQueryResult

        for (const account of chainResult.accounts ?? []) {
          const accountData = addressMap[account.id]

          for (const rToken of account?.rTokens ?? []) {
            const balance = Number(rToken.balance.amount)
            const stake = Number(rToken.governance[0]?.tokenBalance ?? 0)

            if (balance > 0 || stake > 0) {
              accountData.accountTokens.push({
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
              accountData.holdings += balanceUsdAmount + stakedUsdAmount

              accountData.tokens.push({
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
      }

      Object.keys(addressMap).forEach((address) => {
        addressMap[address].tokens.sort(
          (a, b) =>
            b.usdAmount + b.stakedRSRUsd - (a.usdAmount + a.stakedRSRUsd)
        )
        accountDataMap[address] = addressMap[address]
      })
    }
  }, [data, error, addresses, rsrPrice])

  return accountDataMap
}

export default useAccounts
