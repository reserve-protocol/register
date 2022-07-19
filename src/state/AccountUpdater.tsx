import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import useQuery from 'hooks/useQuery'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { AccountPosition, AccountToken } from 'types'
import { accountPositionsAtom, accountTokensAtom, rsrPriceAtom } from './atoms'

// TODO: Include RSV hardcoded into the query and check for balance
const accountQuery = gql`
  query MyQuery {
    account(id: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
      id
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
  const blockNumber = useBlockNumber()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const updateTokens = useUpdateAtom(accountTokensAtom)
  const updatePositions = useUpdateAtom(accountPositionsAtom)
  // TODO: poll from blockNumber
  const { data, error } = useQuery(account ? accountQuery : null)

  useEffect(() => {
    if (data && !error) {
      const tokens: AccountToken[] = []
      const positions: AccountPosition[] = []

      for (const rToken of data?.account?.rTokens || []) {
        console.log('rToken', rToken)
        if (Number(rToken?.balance?.amount) > 0) {
          tokens.push({
            name: rToken.balance.token.name,
            symbol: rToken.balance.token.symbol,
            usdPrice: Number(rToken.balance.token.lastPriceUSD),
            usdAmount:
              Number(rToken.balance.token.lastPriceUSD) *
              Number(rToken.balance.amount),
            balance: Number(rToken.balance.amount),
            apy: 0, // TODO
          })
        }

        if (Number(rToken?.stake) > 0) {
          const rsrAmount = +rToken.stake * +rToken.rToken.rsrExchangeRate
          positions.push({
            name: rToken.rToken.rewardToken.token.name,
            symbol: rToken.rToken.rewardToken.token.symbol,
            balance: Number(rToken.stake),
            apy: 0, // TODO
            exchangeRate: Number(rToken.rToken.rsrExchangeRate),
            rsrAmount,
            usdAmount: rsrAmount * rsrPrice,
          })
        }
      }

      updateTokens(tokens)
      updatePositions(positions)
    }
  }, [data])

  return null
}

export default AccountUpdater
