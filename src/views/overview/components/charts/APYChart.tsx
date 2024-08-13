import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import TabMenu from 'components/tab-menu'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery, { useMultiFetch } from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { estimatedApyAtom, rsrPriceAtom, rTokenPriceAtom } from 'state/atoms'
import { symbolMap } from 'state/updaters/CollateralYieldUpdater'
import { Box, BoxProps } from 'theme-ui'
import { formatPercentage, getUTCStartOfDay } from 'utils'
import { ChainId } from 'utils/chains'
import { TIME_RANGES } from 'utils/constants'
import { formatEther } from 'viem'

const historicalBasketsQuery = gql`
  query getHistoricalBaskets($id: String!) {
    rtoken(id: $id) {
      historicalBaskets(orderBy: timestamp, orderDirection: desc) {
        timestamp
        collaterals {
          id
          symbol
        }
        collateralDistribution
        rTokenDist
        rsrDist
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

const APY_OPTIONS = [
  // {
  //   key: 'basketAPY',
  //   label: 'Basket',
  // },
  {
    key: 'rTokenAPY',
    label: 'RToken',
  },
  {
    key: 'rsrAPY',
    label: 'RSR Stakers',
  },
]

type APYOptions = (typeof APY_OPTIONS)[number]['key']

const today = getUTCStartOfDay(Date.now() / 1000)

const APYChart = (props: BoxProps) => {
  const rToken = useRToken()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const currentYields = useAtomValue(estimatedApyAtom)
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)
  const [selectedOption, setSelectedOption] = useState<APYOptions>('rsrAPY')

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
            symbol: c.symbol.replace('-VAULT', ''),
            distribution: +distribution[c.id]?.dist,
          })),
          rTokenDist: hb.rTokenDist / 10000,
          rsrDist: hb.rsrDist / 10000,
        }
      }),
    [historicalBaskets]
  )

  const allCollaterals = useMemo(
    () => [
      ...new Set(
        baskets
          .flatMap((b: any) => b.collaterals.map((c: any) => c.symbol))
          .filter((c: any) => symbolMap[c.toLowerCase()] !== undefined)
      ),
    ],
    [baskets, symbolMap]
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
    if (
      !historicalAPY ||
      !baskets ||
      !supplies ||
      (currentYields.basket === 0 &&
        currentYields.holders === 0 &&
        currentYields.stakers === 0)
    ) {
      return []
    }

    const supplyByDate = supplies?.token?.snapshots.reduce(
      (acc: any, curr: any) => {
        acc[getUTCStartOfDay(curr.timestamp)] =
          +formatEther(curr.supply) * rTokenPrice
        return acc
      }
    )

    const stakedRSRByDate = supplies?.rtoken?.snapshots.reduce(
      (acc: any, curr: any) => {
        acc[getUTCStartOfDay(curr.timestamp)] =
          +formatEther(curr.rsrStaked) * rsrPrice
        return acc
      }
    )

    const historicalAPYByDate = historicalAPY
      .flatMap((resultByChain, index) => {
        const apyByChain: any[] = resultByChain?.data || []
        return apyByChain.map((data: any, j) => {
          const last30d = apyByChain.slice(Math.max(0, j - 29), j + 1)
          const apy30d =
            last30d.reduce((acc: any, curr: any) => acc + curr.apy, 0) /
            last30d.length
          return {
            apy: apy30d,
            time: getUTCStartOfDay(new Date(data.timestamp).valueOf() / 1000),
            collateral: allCollaterals[index],
          }
        })
      })
      .reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = {}
        }
        acc[curr.time][curr.collateral as string] = curr.apy
        return acc
      }, {} as Record<string, Record<string, number>>)

    const historicalBasketAPY = Object.entries(historicalAPYByDate)
      .map(([time, values]) => {
        const basket = baskets.find((b: any) => Number(time) >= b.timestamp)
        return {
          time: Number(time),
          basket,
          values: {
            ...Object.entries(values as Record<string, number>).reduce(
              (acc, [symbol, value]) => {
                if (!basket.collaterals.some((c: any) => c.symbol === symbol)) {
                  return acc
                }
                return { ...acc, [symbol]: value }
              },
              {}
            ),
            ...(basket.collaterals.some((c: any) => c.symbol === 'wUSDM')
              ? { wUSDM: 5 } // Hardcoded wUSDM APY
              : {}),
          },
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
          basketAPY: apy,
          rTokenAPY: apy * basket.rTokenDist,
          rsrAPY:
            (apy * supplyByDate[time] * basket.rsrDist) / stakedRSRByDate[time],
          label: dayjs(time).format('YYYY-M-D'),
          time,
        }
      })
      .filter((e) => !isNaN(e.rsrAPY) && e.time !== today)

    historicalBasketAPY.push({
      basketAPY: currentYields.basket,
      rTokenAPY: currentYields.holders,
      rsrAPY: currentYields.stakers,
      label: dayjs(today).format('YYYY-M-D'),
      time: today,
    })

    return historicalBasketAPY
  }, [
    historicalAPY,
    baskets,
    allCollaterals,
    supplies,
    rsrPrice,
    rTokenPrice,
    currentYields,
  ])

  const filteredRows = useMemo(
    () =>
      rows
        .filter((e) => e.time / 1000 >= fromTime)
        .map((e) => ({
          value: e[selectedOption],
          label: e.label,
          display: `${formatPercentage(e[selectedOption])}`,
        })),
    [rows, fromTime, selectedOption]
  )

  const currentValue = useMemo(
    () =>
      filteredRows && filteredRows.length
        ? filteredRows[filteredRows.length - 1].value
        : 0,
    [filteredRows]
  )

  return (
    <AreaChart
      heading={t`APY`}
      title={`${formatPercentage(currentValue)}`}
      data={filteredRows}
      domain={['auto', 'auto']}
      timeRange={{
        WEEK: TIME_RANGES.WEEK,
        MONTH: TIME_RANGES.MONTH,
        YEAR: TIME_RANGES.YEAR,
      }}
      currentRange={current}
      onRangeChange={handleChange}
      moreActions={
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <TabMenu
            items={APY_OPTIONS}
            active={selectedOption}
            onMenuChange={(key) => setSelectedOption(key as APYOptions)}
          />
        </Box>
      }
      {...props}
    />
  )
}

export default APYChart
