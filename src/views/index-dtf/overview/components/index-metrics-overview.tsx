import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFMarketCapAtom,
  indexDTFTransactionsAtom,
} from '@/state/dtf/atoms'
import {
  formatCurrency,
  formatPercentage,
  humanizeDateToNow,
  shortenAddress,
} from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import {
  ArrowUpDown,
  ArrowUpRight,
  BadgeDollarSign,
  Cake,
  ChartPie,
  Crown,
  Link2,
  TableRowsSplit,
  Wallet,
} from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'

const MetricsItem = ({
  label,
  value,
  icon,
  valueHover,
  help,
  link,
  loading,
}: {
  label: string
  value: string
  icon: ReactNode
  valueHover?: string
  help?: string
  link?: string
  loading?: boolean
}) => {
  return (
    <div className="px-4 py-2 sm:px-5 sm:py-5 flex items-center gap-1 justify-between">
      <div className="flex items-center gap-1">
        <div className="p-2">{icon}</div>
        {label}
      </div>
      {loading ? (
        <Skeleton className="w-24 h-6" />
      ) : (
        <div className="flex items-center gap-1">
          {valueHover ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>{value}</TooltipTrigger>
                <TooltipContent side="top">{valueHover || ''}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            value
          )}
          {help && (
            <Help content={help} size={16} className="text-muted-foreground" />
          )}
          {link && (
            <Link to={link} target="_blank">
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

const Creator = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <MetricsItem
      label="Creator"
      value={brandData?.creator?.name || shortenAddress(dtf?.deployer || '')}
      icon={
        brandData?.creator?.icon ? (
          <TokenLogo src={brandData.creator.icon} size="sm" />
        ) : (
          <Crown size={16} />
        )
      }
      link={
        brandData?.creator?.link ||
        getExplorerLink(dtf?.deployer || '', chainId, ExplorerDataType.ADDRESS)
      }
      loading={!dtf?.deployer}
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

const Website = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)

  return (
    <MetricsItem
      label="Website"
      value={
        brandData?.socials?.website !== undefined
          ? brandData?.socials?.website
              ?.replace('https://', '')
              .replace('http://', '')
              .replace('www.', '')
              .slice(0, 14) + '...'
          : '-'
      }
      valueHover={brandData?.socials?.website || ''}
      icon={<Link2 size={16} />}
      loading={brandData?.socials && brandData?.socials?.website === undefined}
      link={brandData?.socials?.website || ''}
    />
  )
}

const TxVolume = () => {
  const transactions = useAtomValue(indexDTFTransactionsAtom)
  const last24h = Date.now() / 1000 - 24 * 60 * 60

  const txVolume = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.timestamp > last24h)
        .reduce((acc, transaction) => acc + transaction.amountUSD, 0),
    [transactions]
  )

  return (
    <MetricsItem
      label="24h Tx Volume"
      value={`$${formatCurrency(txVolume, 0)}`}
      icon={<ArrowUpDown size={16} />}
      loading={!transactions.length}
    />
  )
}

const Created = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label="Created"
      value={dtf?.timestamp ? humanizeDateToNow(dtf?.timestamp) : ''}
      icon={<Cake size={16} />}
      loading={!dtf?.timestamp}
    />
  )
}

const AnnualizedTvlFee = () => {
  const dtf = useAtomValue(indexDTFAtom)
  return (
    <MetricsItem
      label="Annualized TVL Fee"
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
      label="Minting Fee"
      value={dtf?.mintingFee ? formatPercentage(dtf?.mintingFee * 100) : ''}
      icon={<ChartPie size={16} />}
      loading={!dtf?.mintingFee}
    />
  )
}

const IndexMetricsOverview = () => {
  return (
    <div className="flex flex-col sm:flex-row border-t border-secondary pb-1 sm:pb-0">
      <div className="flex-1 sm:[&>*:not(:first-child)]:border-t sm:[&>*:not(:first-child)]:border-secondary border-r-0 sm:border-r border-secondary">
        <Creator />
        <MarketCap />
        <UniqueHolders />
        <AnnualizedTvlFee />
      </div>
      <div className="flex-1 sm:[&>*:not(:first-child)]:border-t sm:[&>*:not(:first-child)]:border-secondary">
        <Website />
        <TxVolume />
        <Created />
        <MintingFee />
      </div>
    </div>
  )
}

export default IndexMetricsOverview
