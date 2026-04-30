import { Card } from '@/components/ui/card'
import {
  indexDTF24hVolumeAtom,
  indexDTFAtom,
  indexDTFFeeFloorAtom,
  indexDTFMarketCapAtom,
  indexDTFTransactionsAtom,
} from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { formatDtfFeePercentage } from '@/utils/fees'
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

const AnnualizedTvlFee = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const feeFloor = useAtomValue(indexDTFFeeFloorAtom)
  return (
    <MetricsItem
      label="Annualized TVL Fee"
      value={dtf ? formatDtfFeePercentage(dtf.annualizedTvlFee, feeFloor) : ''}
      icon={<TableRowsSplit size={16} />}
      loading={!dtf}
    />
  )
}

const MintingFee = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const feeFloor = useAtomValue(indexDTFFeeFloorAtom)
  return (
    <MetricsItem
      label="Minting Fee"
      value={dtf ? formatDtfFeePercentage(dtf.mintingFee, feeFloor) : ''}
      icon={<ChartPie size={16} />}
      loading={!dtf}
    />
  )
}

const MarketCap = () => {
  const marketCap = useAtomValue(indexDTFMarketCapAtom)
  return (
    <MetricsItem
      label="Market Cap"
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
      label="24h Volume"
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
      label="Unique Holders"
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
      label="Created"
      value={
        dtf?.timestamp
          ? new Date(dtf.timestamp * 1000).toLocaleDateString('en-US', {
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
          <h2 className="text-2xl font-light mb-1">Fees & Stats</h2>
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
