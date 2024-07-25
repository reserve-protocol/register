import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { useMultiFetch } from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { symbolMap } from 'state/updaters/CollateralYieldUpdater'
import { BoxProps } from 'theme-ui'
import { formatCurrency, formatPercentage, getUTCStartOfDay } from 'utils'
import { ChainId } from 'utils/chains'
import { TIME_RANGES } from 'utils/constants'

const APYChart = (props: BoxProps) => {
  const rToken = useRToken()
  const rTokenCollaterals = useAtomValue(rTokenCollateralDetailedAtom)
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  const { data: historicalAPY } = useMultiFetch(
    rTokenCollaterals?.map(
      (collateral) =>
        `https://yields.llama.fi/chart/${
          symbolMap[collateral.symbol.toLowerCase()]?.[
            rToken?.chainId || ChainId.Mainnet
          ] || symbolMap[collateral.symbol.toLowerCase()]?.[ChainId.Mainnet]
        }`
    ) || []
  )

  const rows: any[] = useMemo(() => {
    if (!historicalAPY || !rTokenCollaterals) {
      return []
    }

    const historicalAPYByDate = historicalAPY
      .flatMap((resultByChain, index) =>
        resultByChain?.data?.map((data: any) => ({
          apy: data.apy,
          time: getUTCStartOfDay(new Date(data.timestamp).valueOf() / 1000),
          collateral: rTokenCollaterals[index].symbol,
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
      .map(([time, values]) => ({
        time: Number(time),
        values: values as Record<string, number>,
      }))
      .filter(
        ({ values }) =>
          Object.values(values).length === rTokenCollaterals.length
      )
      .map(({ time, values }) => {
        const apy = Object.entries(values).reduce(
          (acc, [symbol, collateralAPY]) =>
            acc +
            collateralAPY *
              ((rTokenCollaterals.find((c) => c.symbol === symbol)
                ?.distribution || 0) /
                100) *
              collateralAPY,
          0
        )
        return {
          value: apy,
          label: dayjs(time).format('YYYY-M-D'),
          time,
          display: `${formatPercentage(apy)}`,
        }
      })
    return historicalBasketAPY.filter((e) => e.time / 1000 >= fromTime)
  }, [historicalAPY, rTokenCollaterals, fromTime])

  const currentValue = rows && rows.length ? rows[rows.length - 1].value : 0

  return (
    <AreaChart
      heading={t`APY`}
      title={`$${formatCurrency(currentValue)}`}
      data={rows}
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
