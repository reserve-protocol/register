import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery, { useMultiFetch } from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rsrPriceAtom, rTokenPriceAtom, rTokenStateAtom } from 'state/atoms'
import { symbolMap } from 'state/updaters/CollateralYieldUpdater'
import { BoxProps } from 'theme-ui'
import { formatCurrency, formatPercentage, getUTCStartOfDay } from 'utils'
import { ChainId } from 'utils/chains'
import { TIME_RANGES } from 'utils/constants'
import { formatEther } from 'viem'

const historicalBasketsQuery = gql`
  query getHistoricalBaskets($id: String!) {
    rtoken(id: $id) {
      historicalBaskets {
        timestamp
        collaterals {
          id
          symbol
        }
        collateralDistribution
        rTokenDist
      }
    }
  }
`

const supplyQuery = gql`
  query getTokenDailyPrice($id: String!) {
    rtoken(id: $id) {
      snapshots: dailySnapshots(
        first: 365
        orderBy: timestamp
        orderDirection: desc
      ) {
        timestamp
        rsrStaked
      }
    }
    token(id: $id) {
      snapshots: dailyTokenSnapshot(
        first: 365
        orderBy: timestamp
        orderDirection: desc
      ) {
        timestamp
        supply: dailyTotalSupply
      }
    }
  }
`

const APYChart = (props: BoxProps) => {
  const rToken = useRToken()
  const rTokenState = useAtomValue(rTokenStateAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)

  const { data: historicalBaskets } = useQuery(
    rToken ? historicalBasketsQuery : null,
    {
      id: rToken?.address.toLowerCase(),
    }
  )

  const { data: supplies } = useQuery(rToken ? supplyQuery : null, {
    id: rToken?.address.toLowerCase(),
  })

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  const baskets = useMemo(
    () =>
      (historicalBaskets?.rtoken?.historicalBaskets || []).map((hb: any) => {
        const distribution = JSON.parse(hb.collateralDistribution)
        return {
          timestamp: hb.timestamp,
          collaterals: hb.collaterals.map((c: any) => ({
            symbol: c.symbol,
            distribution: +distribution[c.id]?.dist,
          })),
          rTokenDist: hb.rTokenDist / 10000,
          rsrDist: (10000 - hb.rTokenDist) / 10000,
        }
      }),
    [historicalBaskets]
  )

  const allCollaterals = useMemo(
    () => baskets.flatMap((b: any) => b.collaterals.map((c: any) => c.symbol)),
    [baskets]
  )

  const { data: historicalAPY } = useMultiFetch(
    allCollaterals.map(
      (collateral: any) =>
        `https://yields.llama.fi/chart/${
          symbolMap[collateral.toLowerCase()]?.[
            rToken?.chainId || ChainId.Mainnet
          ] || symbolMap[collateral.toLowerCase()]?.[ChainId.Mainnet]
        }`
    )
  )

  const rows: any[] = useMemo(() => {
    if (!historicalAPY || !baskets || !supplies) {
      return []
    }

    const supplyByDate = supplies?.token?.snapshots.reduce(
      (acc: any, curr: any) => {
        acc[getUTCStartOfDay(curr.timestamp)] =
          +formatEther(curr.supply) * rTokenPrice
        return acc
      }
    )
    supplyByDate[getUTCStartOfDay(Date.now() / 1000)] =
      rTokenState.tokenSupply * rTokenPrice

    const stakedRSRByDate = supplies?.rtoken?.snapshots.reduce(
      (acc: any, curr: any) => {
        acc[getUTCStartOfDay(curr.timestamp)] =
          +formatEther(curr.rsrStaked) * rsrPrice
        return acc
      }
    )
    stakedRSRByDate[getUTCStartOfDay(Date.now() / 1000)] =
      rTokenState.stTokenSupply * rTokenState.exchangeRate * rsrPrice

    const historicalAPYByDate = historicalAPY
      .flatMap((resultByChain, index) =>
        resultByChain?.data?.map((data: any) => ({
          apy: data.apy,
          time: getUTCStartOfDay(new Date(data.timestamp).valueOf() / 1000),
          collateral: allCollaterals[index],
        }))
      )
      .reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = {}
        }
        acc[curr.time][curr.collateral] = curr.apy
        return acc
      }, {})

    const historicalBasketAPY = Object.entries(historicalAPYByDate)
      .map(([time, values]) => {
        const basket = baskets.find((b: any) => Number(time) >= b.timestamp)
        return {
          time: Number(time),
          basket,
          values: Object.entries(values as Record<string, number>).reduce(
            (acc, [symbol, value]) => {
              if (!basket.collaterals.some((c: any) => c.symbol === symbol)) {
                return acc
              }
              return { ...acc, [symbol]: value }
            },
            {}
          ),
        }
      })
      .filter(
        ({ basket, values }) =>
          Object.values(values).length === basket.collaterals.length
      )

      .map(({ time, basket, values }) => {
        const apy = Object.entries(values).reduce(
          (acc, [symbol, collateralAPY]) =>
            acc +
            (collateralAPY as number) *
              (basket.collaterals.find((c: any) => c.symbol === symbol)
                ?.distribution || 0),
          0
        )
        return {
          value: apy,
          rTokenAPY: apy * basket.rTokenDist,
          rsrAPY:
            (apy * supplyByDate[time] * basket.rsrDist) / stakedRSRByDate[time],
          label: dayjs(time).format('YYYY-M-D'),
          time,
          display: `${formatPercentage(apy)}`,
        }
      })
      .filter((e) => !isNaN(e.rsrAPY))
    return historicalBasketAPY
  }, [
    historicalAPY,
    baskets,
    allCollaterals,
    supplies,
    rsrPrice,
    rTokenPrice,
    rTokenState,
  ])

  const filteredRows = useMemo(
    () => rows.filter((e) => e.time / 1000 >= fromTime),
    [rows, fromTime]
  )

  const currentValue = useMemo(
    () => (rows && rows.length ? rows[rows.length - 1].value : 0),
    [rows]
  )

  return (
    <AreaChart
      heading={t`APY`}
      title={`$${formatCurrency(currentValue)}`}
      data={filteredRows}
      domain={['auto', 'auto']}
      timeRange={{
        WEEK: TIME_RANGES.WEEK,
        MONTH: TIME_RANGES.MONTH,
        YEAR: TIME_RANGES.YEAR,
      }}
      currentRange={current}
      onRangeChange={handleChange}
      {...props}
    />
  )
}

export default APYChart
