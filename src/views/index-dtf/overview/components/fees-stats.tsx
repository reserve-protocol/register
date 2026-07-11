import { Card } from '@/components/ui/card'
import { dateLocale } from '@/utils/locale'
import {
  indexDTF24hVolumeAtom,
  indexDTFAtom,
  indexDTFMarketCapAtom,
  indexDTFTransactionsAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  ArrowUpDown,
  BadgeDollarSign,
  Cake,
  ChartPie,
  TableRowsSplit,
  Wallet,
} from 'lucide-react'
import MetricsItem from './metrics-item'
import SectionAnchor from '@/components/section-anchor'
import { Trans } from '@lingui/react/macro'
import usePoolSwaps24hVolume from './index-transaction-table-with-swaps/use-pool-swaps-24h-volume'

const FEES_METRIC_CLASSNAME = 'px-5 py-3 last:pb-5 sm:px-5 sm:py-5'

const AnnualizedTvlFee = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label={<Trans>Annualized TVL Fee</Trans>}
      value={
        dtf?.annualizedTvlFee
          ? formatPercentage(dtf?.annualizedTvlFee * 100)
          : ''
      }
      icon={<TableRowsSplit size={16} />}
      loading={!dtf?.annualizedTvlFee}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const MintingFee = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label={<Trans>Minting Fee</Trans>}
      value={dtf?.mintingFee ? formatPercentage(dtf?.mintingFee * 100) : ''}
      icon={<ChartPie size={16} />}
      loading={!dtf?.mintingFee}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const MarketCap = () => {
  const marketCap = useAtomValue(indexDTFMarketCapAtom)
  return (
    <MetricsItem
      label={<Trans>Market Cap</Trans>}
      value={marketCap ? `$${formatCurrency(marketCap, 0)}` : '$0'}
      icon={<BadgeDollarSign size={16} />}
      loading={!marketCap}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const TxVolume = () => {
  const transactions = useAtomValue(indexDTFTransactionsAtom)
  const txVolume = useAtomValue(indexDTF24hVolumeAtom)
  const { volume: swapVolume, isLoading: swapVolumeLoading } =
    usePoolSwaps24hVolume()

  return (
    <MetricsItem
      label={<Trans>24h Volume</Trans>}
      value={`$${formatCurrency(txVolume + swapVolume, 0)}`}
      icon={<ArrowUpDown size={16} />}
      loading={!transactions.length || swapVolumeLoading}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const UniqueHolders = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label={<Trans>Unique Holders</Trans>}
      value={formatCurrency(dtf?.token?.currentHolderCount || 0, 0)}
      icon={<Wallet size={16} />}
      loading={!dtf?.token?.currentHolderCount}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const Created = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label={<Trans>Created</Trans>}
      value={
        dtf?.timestamp
          ? new Date(dtf.timestamp * 1000).toLocaleDateString(dateLocale(), {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : ''
      }
      icon={<Cake size={16} />}
      loading={!dtf?.timestamp}
      className={FEES_METRIC_CLASSNAME}
    />
  )
}

const FeesStats = () => {
  return (
    <Card className="group/section" id="fees-stats">
      <div className="p-5 pb-1 sm:p-6 sm:pb-1">
        <div className="flex items-center gap-1">
          <h2 className="text-2xl font-light mb-1">
            <Trans>Fees & Stats</Trans>
          </h2>
          <SectionAnchor id="fees-stats" />
        </div>
      </div>
      {/* Mobile view */}
      <div className="flex flex-col sm:hidden">
        <AnnualizedTvlFee />
        <MintingFee />
        <MarketCap />
        <TxVolume />
        <UniqueHolders />
        <Created />
      </div>
      {/* Desktop view */}
      <div className="hidden sm:flex flex-row">
        <div className="flex-1 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-secondary border-r border-secondary">
          <AnnualizedTvlFee />
          <MarketCap />
          <UniqueHolders />
        </div>
        <div className="flex-1 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-secondary">
          <MintingFee />
          <TxVolume />
          <Created />
        </div>
      </div>
    </Card>
  )
}

export default FeesStats
