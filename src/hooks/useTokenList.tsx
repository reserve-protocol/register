import { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue } from 'jotai'
import { TIME_RANGES } from 'utils/constants'
import useQuery from './useQuery'
import useTimeFrom from './useTimeFrom'
import tokenList from 'utils/rtokens'
import { useEffect } from 'react'
import { calculateApy } from 'utils'
import { formatEther, getAddress } from 'ethers/lib/utils'
import { RSV_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { rpayOverviewAtom } from 'state/atoms'

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

// TODO: Remove backing from theGraph "backingInsurance"
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
        backingInsurance
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

  const { data } = useQuery(tokenListQuery, {
    tokenIds: tokenKeys,
    fromTime,
  })

  useEffect(() => {
    if (data) {
      setList(
        data.tokens.map((token: any): ListedToken => {
          let tokenApy = 0
          let stakingApy = 0

          const recentRate = token?.rToken?.recentRate[0]
          const lastRate = token?.rToken?.lastRate[0]

          if (
            recentRate &&
            lastRate &&
            recentRate.timestamp !== lastRate.timestamp
          ) {
            ;[tokenApy, stakingApy] = calculateApy(recentRate, lastRate)
          }

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
            staked: token?.rToken?.backingInsurance || 0,
            stakingApy: +stakingApy.toFixed(2),
          }

          // RSV Data
          if (token.id === RSV_ADDRESS[CHAIN_ID].toLowerCase()) {
            tokenData.holders += rpayOverview.holders
            tokenData.transactionCount += rpayOverview.txCount
            tokenData.cumulativeVolume += rpayOverview.volume
            tokenData.targetUnits = 'USD'
          }

          return tokenData
        })
      )
    }
  }, [data])

  return list
}

export default useTokenList
