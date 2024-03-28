import rtokens from '@lc-labs/rtokens'
import { RevenueSplit } from 'components/rtoken-setup/atoms'
import { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, collateralYieldAtom, rsrPriceAtom } from 'state/atoms'
import { formatDistribution } from 'state/rtoken/atoms/rTokenRevenueSplitAtom'
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
  overcollaterization: number
  stakingApy: number
  basketApy: number
  chain: number
  logo: string
  distribution: RevenueSplit
  collaterals: { id: string; symbol: string }[]
  collateralDistribution: Record<string, { dist: string; target: string }>
  rsrStaked: number
}

// TODO: Cache only while the list is short
// TODO: Use this as cache and use it as soon as a listed token is selected, 99% of the use cases
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
        rsrStaked
        rsrLocked
        collaterals {
          id
          symbol
        }
        collateralDistribution
        revenueDistribution {
          id
          rTokenDist
          rsrDist
          destination
        }
      }
    }
  }
`

const useTokenList = () => {
  const [list, setList] = useAtom(tokenListAtom)
  const fromTime = useTimeFrom(TIME_RANGES.MONTH)
  const collateralYield = useAtomValue(collateralYieldAtom)
  const currentRsrPrice = useAtomValue(rsrPriceAtom)

  const { data, isLoading } = useMultichainQuery(
    tokenListQuery,
    {
      [ChainId.Mainnet]: {
        tokenIds: LISTED_RTOKEN_ADDRESSES[ChainId.Mainnet],
        fromTime,
      },
      [ChainId.Base]: {
        tokenIds: LISTED_RTOKEN_ADDRESSES[ChainId.Base],
        fromTime,
      },
    },
    { keepPreviousData: true }
  )

  useEffect(() => {
    if (data) {
      const tokens: ListedToken[] = []

      for (const chain of supportedChainList) {
        tokens.push(
          ...data[chain].tokens.map((token: any): ListedToken => {
            let distribution: Record<string, { dist: string; target: string }> =
              {}
            // TODO: pool APY from theGraph
            try {
              const raw = JSON.parse(token?.rToken.collateralDistribution)
              distribution = Object.keys(raw).reduce((acc, curr) => {
                acc[curr.toString().toLowerCase()] = raw[curr]
                return acc
              }, distribution)
            } catch {}

            let tokenApy = 0
            let stakingApy = 0
            let basketApy = 0
            const rsrPrice = currentRsrPrice || 0
            const supply: number =
              +formatEther(token.totalSupply) * +token.lastPriceUSD
            const collaterals = (token?.rToken?.collaterals ?? []).map(
              (t: any) => {
                let symbol = t.symbol

                if (
                  t.id ===
                  '0xa8d818C719c1034E731Feba2088F4F011D44ACB3'.toLowerCase()
                ) {
                  symbol = 'wcusdbcv3'
                }

                return { ...t, symbol }
              }
            )
            const revenueSplit = formatDistribution(
              token?.rToken?.revenueDistribution
            )

            for (const collateral of collaterals) {
              basketApy +=
                (collateralYield[collateral.symbol.toLowerCase()] || 0) *
                (Number(distribution[collateral.id.toLowerCase()]?.dist) || 0)
            }

            const stakeUsd =
              +formatEther(token?.rToken?.rsrLocked ?? '0') * rsrPrice
            const holdersShare = +(revenueSplit.holders || 0) / 100
            const stakersShare = +(revenueSplit.stakers || 0) / 100

            tokenApy = basketApy * holdersShare
            stakingApy = stakeUsd
              ? ((basketApy * supply) / stakeUsd) * stakersShare
              : basketApy * stakersShare

            const tokenData = {
              id: getAddress(token.id),
              name: token.name,
              symbol: token.symbol,
              supply,
              holders: Number(token.holderCount),
              price: token.lastPriceUSD,
              transactionCount: Number(token.transferCount),
              cumulativeVolume:
                +formatEther(token.cumulativeVolume) * +token.lastPriceUSD,
              targetUnits: token?.rToken?.targetUnits,
              tokenApy,
              basketApy,
              backing: Number(formatEther(token?.rToken?.backing ?? '1')) * 100,
              overcollaterization: supply ? (stakeUsd / supply) * 100 : 0,
              stakingApy,
              chain,
              logo: `/svgs/${rtokens[chain][
                getAddress(token.id)
              ].logo?.toLowerCase()}`,
              distribution: revenueSplit,
              collaterals,
              collateralDistribution: distribution,
              rsrStaked: Number(formatEther(token?.rToken?.rsrStaked ?? '0')),
            }

            // RSV Data
            if (token.id === RSV.address.toLowerCase()) {
              tokenData.transactionCount += RSVOverview.txCount
              tokenData.cumulativeVolume += RSVOverview.volume
              tokenData.targetUnits = 'USD'
            }

            return tokenData
          })
        )
      }

      tokens.sort((a, b) => b.supply - a.supply)

      setList(tokens)
    }
  }, [data, collateralYield, currentRsrPrice])

  return { list, isLoading }
}

export default useTokenList
