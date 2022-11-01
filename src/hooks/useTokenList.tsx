import { gql } from 'graphql-request'
import { atom } from 'jotai'

interface TokenData {
  id: string
  name: string
  symbol: string
  supply: number
  holders: number
  price: number
  transactionCount: number
  cumulativeVolume: number
  targetUnits: string
  tokenApy: number
  backing: number
  backingInsurance: number
  stakingApy: number
}

const tokenListAtom = atom([])

const query = gql`
  query GetTokenListOverview {
    rtokens(orderBy: cumulativeUniqueUsers, orderDirection: desc, $tokenIds: [String]!, $fromTime: Int!) {
      id
      cumulativeUniqueUsers
      targetUnits
      rsrStaked
      rsrPriceUSD
      backing
      backingInsurance
      token {
        name
        symbol
        totalSupply
        holderCount
        transferCount
        cumulativeVolume
        lastPriceUSD
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
    }
    rsv($rsvId: String!) {
      name
        symbol
        totalSupply
        holderCount
        transferCount
        cumulativeVolume
        lastPriceUSD
    }
  }
`

const useTokenList = () => {}

export default useTokenList
