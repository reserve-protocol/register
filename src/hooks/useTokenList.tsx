import { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, rpayOverviewAtom } from 'state/atoms'
import { EUSD_ADDRESS } from 'utils/addresses'
import { TIME_RANGES } from 'utils/constants'
import tokenList from 'utils/rtokens'
import useQuery from './useQuery'
import useTimeFrom from './useTimeFrom'
import { formatEther, getAddress } from 'viem'
import RSV, { RSVOverview } from 'utils/rsv'

interface ListedToken {
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
  staked: number
  stakingApy: number
}

// TODO: Cache only while the list is short
const tokenListAtom = atom<ListedToken[]>([])

const tokenKeys = [...Object.keys(tokenList).map((s) => s.toLowerCase())]

const tokenListQuery = gql`
  query GetTokenListOverview($tokenIds: [String]!, $fromTime: Int!) {
    tokens(
      where: { id_in: $tokenIds }
      orderBy: totalSupply
      orderDirection: desc
    ) {
      id
      lastPriceUSD
      name
      symbol
      totalSupply
      holderCount
      transferCount
      cumulativeVolume
      rToken {
        backing
        backingRSR
        targetUnits
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
  }
`

const useTokenList = () => {
  const [list, setList] = useAtom(tokenListAtom)
  const rpayOverview = useAtomValue(rpayOverviewAtom)
  const fromTime = useTimeFrom(TIME_RANGES.MONTH)
  const chainId = useAtomValue(chainIdAtom)

  const { data } = useQuery(tokenListQuery, {
    tokenIds: tokenKeys,
    fromTime,
    chainId,
  })

  useEffect(() => {
    if (data) {
      setList(
        data.tokens.map((token: any): ListedToken => {
          // TODO: pool APY from theGraph
          let tokenApy = 0
          let stakingApy = 0

          const tokenData = {
            id: getAddress(token.id),
            name: token.name,
            symbol: token.symbol,
            supply: +formatEther(token.totalSupply) * +token.lastPriceUSD,
            holders: Number(token.holderCount),
            price: token.lastPriceUSD,
            transactionCount: Number(token.transferCount),
            cumulativeVolume:
              +formatEther(token.cumulativeVolume) * +token.lastPriceUSD,
            targetUnits: token?.rToken?.targetUnits,
            tokenApy: +tokenApy.toFixed(2),
            backing: token?.rToken?.backing || 100,
            staked: token?.rToken?.backingRSR || 0,
            stakingApy: +stakingApy.toFixed(2),
          }

          // RSV Data
          if (token.id === RSV.address.toLowerCase()) {
            tokenData.transactionCount += RSVOverview.txCount
            tokenData.cumulativeVolume += RSVOverview.volume
            tokenData.targetUnits = 'USD'
          } else if (token.id === EUSD_ADDRESS[chainId]?.toLowerCase()) {
            tokenData.transactionCount += rpayOverview.txCount
            tokenData.cumulativeVolume += rpayOverview.volume
          }

          return tokenData
        })
      )
    }
  }, [data])

  return list
}

export default useTokenList
