import { Trans, t } from '@lingui/macro'
import GaugeIcon from 'components/icons/GaugeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from 'utils'
import { Auction } from '../atoms'
import SwapIcon from './SwapIcon'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const UnavailablePlaceholder = ({
  isBelowMinTrade,
}: {
  isBelowMinTrade: boolean
}) => (
  <span className="text-xs text-foreground hidden sm:block mr-2">
    {isBelowMinTrade ? (
      <Trans>Surplus below minimum trade</Trans>
    ) : (
      <Trans>Not available</Trans>
    )}
  </span>
)

// Info component inlined - simple icon + title + subtitle layout
const Info = ({
  title,
  subtitle,
  icon,
  className,
}: {
  title: React.ReactNode
  subtitle: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) => (
  <div className={cn('flex items-center', className)}>
    {icon}
    <div className={icon ? 'ml-4' : ''}>
      <span className="text-muted-foreground text-xs sm:text-sm block mb-1">
        {title}
      </span>
      <span className="text-sm sm:text-base">{subtitle}</span>
    </div>
  </div>
)

const RevenueAuctionItem = ({
  data,
  onSelect,
  selected = false,
}: {
  data: Auction
  onSelect(): void
  selected?: boolean
}) => {
  const [isOpen, setOpen] = useState(false)
  const isBelowMinTrade = +data.minAmount > +data.amount
  const rToken = useRToken()
  const unavailable = !Number(data.amount)

  return (
    <div className="mt-4">
      {/* Header with SelectableBox functionality */}
      <div
        className="flex items-center cursor-pointer w-full"
        onClick={() => setOpen(!isOpen)}
      >
        {/* SelectableBox content */}
        <div className="flex items-center w-full">
          <Info
            title="Surplus"
            icon={<SwapIcon buy={data.buy.symbol} sell={data.sell.symbol} />}
            subtitle={`${formatCurrency(+data.amount)} ${
              data.sell.symbol
            } for ${data.buy.symbol}`}
          />
          <div className="ml-auto flex items-center">
            {unavailable ? (
              <UnavailablePlaceholder isBelowMinTrade={isBelowMinTrade} />
            ) : (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect()}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              />
            )}
          </div>
        </div>
        {/* Chevron */}
        <div className="flex items-center ml-auto pl-2">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <>
          <div className="border-t border-border my-4 -mx-6" />
          {data.canStart && (
            <Info
              icon={
                <TokenLogo
                  symbol={data.buy.symbol}
                  width={20}
                  src={data.buy.symbol === 'RSR' ? undefined : rToken?.logo}
                />
              }
              title={t`Tokens to match trade`}
              subtitle={`≈${formatCurrency(data.output)} ${data.buy.symbol}`}
              className="mb-4"
            />
          )}
          <Info
            icon={<GaugeIcon />}
            title={t`Minimum trade size`}
            subtitle={`${formatCurrency(+data.minAmount)} ${data.sell.symbol}`}
          />
        </>
      )}
    </div>
  )
}

export default RevenueAuctionItem
