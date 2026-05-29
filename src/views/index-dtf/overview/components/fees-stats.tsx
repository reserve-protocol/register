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
    />
  )
}

const TxVolume = () => {
  const transactions = useAtomValue(indexDTFTransactionsAtom)
  const txVolume = useAtomValue(indexDTF24hVolumeAtom)

  return (
    <MetricsItem
      label={<Trans>24h Volume</Trans>}
      value={`$${formatCurrency(txVolume, 0)}`}
      icon={<ArrowUpDown size={16} />}
      loading={!transactions.length}
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
    />
  )
}

const FeesStats = () => {
  return (
    <Card className="group/section" id="fees-stats">
      <div className="p-4 sm:p-6 pb-0 sm:pb-0">
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
