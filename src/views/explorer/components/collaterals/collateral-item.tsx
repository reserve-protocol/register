import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import MobileField from '../kit/mobile-field'
import { WithChainBadge } from '../kit/token-cell'
import { type Plugin } from './atoms'
import { getProtocolLabel } from './utils'

export const compact = (value: number | null) =>
  value === null
    ? '—'
    : formatCurrency(value, 0, { notation: 'compact', compactDisplay: 'short' })

export const getUnderlying = (plugin: Plugin) => ({
  symbol: plugin.underlyingToken || plugin.symbol,
  address: plugin.underlyingAddress || plugin.erc20,
})

export const AddressLink = ({
  address,
  chainId,
  children,
  className,
}: {
  address: string
  chainId: number
  children: React.ReactNode
  className?: string
}) => (
  <a
    href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
    target="_blank"
    rel="noreferrer"
    className={cn(
      'inline-flex min-w-0 items-center gap-1.5 text-foreground hover:text-primary',
      className
    )}
  >
    <span className="truncate">{children}</span>
    <ArrowUpRight size={14} className="shrink-0 text-legend" aria-hidden />
  </a>
)

export const CollateralName = ({
  plugin,
  size,
}: {
  plugin: Plugin
  size: number
}) => (
  <span className="flex min-w-0 items-center gap-3">
    <WithChainBadge chain={plugin.chainId} size={size}>
      <TokenLogo symbol={plugin.symbol} width={size} />
    </WithChainBadge>
    <AddressLink
      address={plugin.address}
      chainId={plugin.chainId}
      className="font-semibold"
    >
      {plugin.symbol}
    </AddressLink>
  </span>
)

const CollateralItem = ({ plugin }: { plugin: Plugin }) => {
  const underlying = getUnderlying(plugin)

  return (
    <div className="flex flex-col gap-2 tabular-nums">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-col">
          <CollateralName plugin={plugin} size={36} />
        </div>
        <div className="ml-auto flex shrink-0 flex-col text-right">
          <span className="text-[17px] font-semibold text-primary">
            {formatPercentage(plugin.apy)}
          </span>
          <span className="text-[11px] text-legend">APY</span>
        </div>
      </div>
      <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-2 gap-y-1.5">
        <MobileField label={<Trans>Underlying</Trans>}>
          <AddressLink address={underlying.address} chainId={plugin.chainId}>
            {underlying.symbol}
          </AddressLink>
        </MobileField>
        <MobileField label={<Trans>Supply</Trans>} className="text-right">
          {compact(plugin.supply)}
        </MobileField>
        <MobileField label={<Trans>Max trade</Trans>} className="text-right">
          {compact(+plugin.maxTradeVolume)}
        </MobileField>
        <MobileField label={<Trans>Protocol</Trans>}>
          {getProtocolLabel(plugin.protocol)}
        </MobileField>
        <MobileField label={<Trans>Delay</Trans>} className="text-right">
          {parseDuration(+plugin.delayUntilDefault)}
        </MobileField>
        <MobileField label={<Trans>Version</Trans>} className="text-right">
          {plugin.version}
        </MobileField>
        <MobileField label={<Trans>Target</Trans>} className="col-span-3">
          {plugin.targetName}
        </MobileField>
      </div>
    </div>
  )
}

export default CollateralItem
