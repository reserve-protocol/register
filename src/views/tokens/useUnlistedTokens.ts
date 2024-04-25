import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { tokenFilterAtom } from './atoms'
import { useMultichainQuery } from 'hooks/useQuery'
import { useEffect, useState } from 'react'
import { supportedChainList } from 'utils/constants'
import { Address, formatEther, getAddress } from 'viem'
import { rsrPriceAtom } from 'state/atoms'

const query = gql`
  query GetTokenListOverview(
    $listed: [String]!
    $limit: Int!
    $search: String!
    $by: String!
    $direction: OrderDirection!
  ) {
    rtokens(
      orderBy: $by
      orderDirection: $direction
      first: $limit
      where: {
        id_not_in: $listed
        token_: {
          or: [
            { name_contains_nocase: $search }
            { symbol_contains_nocase: $search }
          ]
        }
      }
    ) {
      id
      cumulativeUniqueUsers
      targetUnits
      rsrStaked
      token {
        name
        symbol
        lastPriceUSD
        holderCount
        transferCount
        totalSupply
        cumulativeVolume
      }
    }
  }
`

export interface RTokenRow {
  id: Address
  targetUnits: string
  name: string
  symbol: string
  price: number
  transactionCount: number
  cumulativeVolume: number
  staked: number
  marketCap: number
  chain: number
}

const useUnlistedTokens = () => {
  const filters = useAtomValue(tokenFilterAtom)
  const { data } = useMultichainQuery(query, filters)
  const currentRsrPrice = useAtomValue(rsrPriceAtom)

  const [tokens, setTokens] = useState<RTokenRow[]>([])

  useEffect(() => {
    if (data) {
      const tokens: RTokenRow[] = []

      for (const chain of supportedChainList) {
        if (data[chain]) {
          tokens.push(
            ...data[chain].rtokens.map((rtoken: any) => ({
              id: getAddress(rtoken.id),
              targetUnits: rtoken.targetUnits,
              chain,
              name: rtoken.token.name,
              symbol: rtoken.token.symbol,
              price: rtoken.token.lastPriceUSD,
              transactionCount: rtoken.token.transferCount,
              cumulativeVolume:
                +formatEther(rtoken.token.cumulativeVolume) *
                +rtoken.token.lastPriceUSD,
              staked: +formatEther(rtoken.rsrStaked) * currentRsrPrice,
              marketCap:
                +formatEther(rtoken.token.totalSupply) *
                rtoken.token.lastPriceUSD,
            }))
          )
        }
      }

      setTokens(tokens)
    }
  }, [data, currentRsrPrice])

  return tokens
}

export default useUnlistedTokens
