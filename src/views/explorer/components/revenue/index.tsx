import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { useMemo, useState } from 'react'
import { formatCurrency } from 'utils'
import {
  ExplorerCard,
  ExplorerHeader,
  ExplorerSubtitle,
  ExplorerToolbar,
} from '../kit/explorer-layout'
import Segmented from '../kit/segmented'
import IndexRevenue from './index-revenue'
import Trades from './trades'
import useAvailableRevenue from './use-available-revenue'
import useIndexDTFRevenue from './use-index-dtf-revenue'
import YieldRevenue from './yield-revenue'

type RevenueView = 'index' | 'yield' | 'trades'

const VIEWS: { value: RevenueView; label: MessageDescriptor }[] = [
  { value: 'index', label: msg`Index` },
  { value: 'yield', label: msg`Yield` },
  { value: 'trades', label: msg`Trades` },
]

const AvailableRevenue = () => {
  const { t } = useLingui()
  const [view, setView] = useState<RevenueView>('index')
  const yieldRevenue = useAvailableRevenue()
  const indexRevenue = useIndexDTFRevenue()
  const trades = useMemo(
    () => yieldRevenue?.tokens.flatMap((token) => token.trades) ?? [],
    [yieldRevenue]
  )
  const pendingFees = indexRevenue?.reduce(
    (sum, item) => sum + item.pendingUsd,
    0
  )

  const subtitle =
    view === 'index'
      ? indexRevenue && (
          <ExplorerSubtitle value={`$${formatCurrency(pendingFees ?? 0)}`}>
            <Plural
              value={indexRevenue.length}
              one="pending fees in # Index DTF"
              other="pending fees in # Index DTFs"
            />
          </ExplorerSubtitle>
        )
      : yieldRevenue && (
          <ExplorerSubtitle value={`$${formatCurrency(yieldRevenue.revenue)}`}>
            <Plural value={yieldRevenue.trades} one="# trade" other="# trades" />
            {', '}
            <Trans>{yieldRevenue.outstandingTrades} available</Trans>
          </ExplorerSubtitle>
        )

  return (
    <>
      <ExplorerHeader title={<Trans>Revenue</Trans>} subtitle={subtitle} />
      <ExplorerCard>
        <ExplorerToolbar>
          <Segmented
            label={t`Revenue view`}
            items={VIEWS.map((item) => ({ ...item, label: t(item.label) }))}
            value={view}
            onChange={setView}
          />
        </ExplorerToolbar>
        {view === 'index' && <IndexRevenue data={indexRevenue} />}
        {view === 'yield' && <YieldRevenue data={yieldRevenue} />}
        {view === 'trades' && (
          <Trades trades={trades} isLoading={!yieldRevenue} />
        )}
      </ExplorerCard>
    </>
  )
}

export default AvailableRevenue
