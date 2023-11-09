import { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, rpayOverviewAtom } from 'state/atoms'
import { EUSD_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import {
  LISTED_RTOKEN_ADDRESSES,
  TIME_RANGES,
  supportedChainList,
} from 'utils/constants'
import RSV, { RSVOverview } from 'utils/rsv'
import { formatEther, getAddress } from 'viem'
import { useMultichainQuery } from './useQuery'
import useTimeFrom from './useTimeFrom'

export interface ListedToken {
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
  chain: number
}

// TODO: Cache only while the list is short
const tokenListAtom = atom<ListedToken[]>([])

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

  const { data } = useMultichainQuery(tokenListQuery, {
    [ChainId.Mainnet]: {
      tokenIds: LISTED_RTOKEN_ADDRESSES[ChainId.Mainnet],
      fromTime,
    },
    [ChainId.Base]: {
      tokenIds: LISTED_RTOKEN_ADDRESSES[ChainId.Base],
      fromTime,
    },
  })

  useEffect(() => {
    if (data) {
      const tokens: ListedToken[] = []

      for (const chain of supportedChainList) {
        tokens.push(
          ...data[chain].tokens.map((token: any): ListedToken => {
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
              chain,
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

      setList(tokens)
    }
  }, [data])

  return { list, isLoading: !data }
}

export default useTokenList
