import { cn } from '@/lib/utils'
import Help from '@/components/ui/help'
import TokenLogo from 'components/icons/TokenLogo'
import { Trans, useLingui } from '@lingui/react/macro'
import { ReactNode } from 'react'
import type { FeeCategory, FeeCollateral, FeeRate } from './api'
import {
  CategoryRate,
  FEE_CATEGORIES,
  formatFeeUsd,
  formatRatePercent,
  getCategoryRates,
  groupRateLayers,
} from './rates'

const GRID = 'sm:grid-cols-[2.2fr_1fr_1fr_1fr_0.8fr]'

const NotTracked = () => {
  const { t } = useLingui()

  return (
    <span className="flex items-center gap-1 text-legend">
      —
      <Help content={t`This protocol is not tracked yet.`} />
    </span>
  )
}

const RateLabel = ({ rate }: { rate: CategoryRate }) => {
  const percent = formatRatePercent(rate.rate)

  return rate.basis === 'aum' ? (
    <Trans>{percent} / yr</Trans>
  ) : (
    <Trans>{percent} of yield</Trans>
  )
}

const Chip = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => (
  <span
    className={cn(
      'w-fit whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full',
      className
    )}
  >
    {children}
  </span>
)

const StatusChip = ({ status }: { status: FeeCollateral['status'] }) => {
  if (status === 'onchain') {
    return (
      <Chip className="bg-primary/10 text-primary">
        <Trans>Observed</Trans>
      </Chip>
    )
  }

  if (status === 'estimated') {
    return (
      <Chip className="bg-warning/15 text-warning">
        <Trans>Estimated</Trans>
      </Chip>
    )
  }

  return (
    <Chip className="bg-muted text-legend">
      <Trans>Unavailable</Trans>
    </Chip>
  )
}

const CategoryLabel = ({ category }: { category: FeeCategory }) => {
  if (category === 'management') return <Trans>Management</Trans>
  if (category === 'performance') return <Trans>Performance</Trans>
  return <Trans>Protocol</Trans>
}

const LayerLine = ({ rate }: { rate: FeeRate }) => {
  const exposure = formatRatePercent(rate.weight)

  return (
    <li className="flex justify-between gap-3">
      <span className="truncate">
        {rate.layer.label}
        {rate.category !== 'protocol' && (
          <span className="text-legend">
            {' · '}
            <CategoryLabel category={rate.category} />
          </span>
        )}
      </span>
      <span className="whitespace-nowrap">
        <RateLabel rate={rate} />
        {rate.weight < 1 && (
          <span className="text-legend">
            {' · '}
            <Trans>{exposure} exposure</Trans>
          </span>
        )}
      </span>
    </li>
  )
}

const LayersBreakdown = ({ rates }: { rates: FeeRate[] }) => {
  const { layers, zeroRateMarkets } = groupRateLayers(rates)

  return (
    <ul className="flex flex-col gap-1 text-xs min-w-56">
      {layers.map((rate) => (
        <LayerLine key={`${rate.category}-${rate.layer.address}`} rate={rate} />
      ))}
      {zeroRateMarkets > 0 && (
        <li className="text-legend">
          <Trans>+ {zeroRateMarkets} markets at 0%</Trans>
        </li>
      )}
    </ul>
  )
}

const FeeCell = ({
  category,
  rate,
  amount,
  isTracked,
}: {
  category: FeeCategory
  rate: CategoryRate | null
  amount: number
  isTracked: boolean
}) => (
  <div className="flex sm:flex-col gap-1 sm:gap-0">
    <span className="font-semibold sm:hidden">
      <CategoryLabel category={category} />:
    </span>
    {!isTracked ? (
      <NotTracked />
    ) : (
      <>
        <span>{rate ? <RateLabel rate={rate} /> : '—'}</span>
        {(!!rate || amount > 0) && (
          <span className="text-sm text-legend">{formatFeeUsd(amount)}</span>
        )}
      </>
    )}
  </div>
)

const CollateralRow = ({ collateral }: { collateral: FeeCollateral }) => {
  const categoryRates = getCategoryRates(collateral.rates)
  const isTracked = collateral.status !== 'unavailable'
  const hasExited = collateral.positionUsd === 0 && collateral.accrued.total > 0

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 sm:gap-4 items-center p-3 sm:p-4 border-b border-border last:border-b-0',
        GRID,
        hasExited && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <TokenLogo symbol={collateral.symbol} />
        <span className="font-semibold">{collateral.label}</span>
        {isTracked && collateral.rates.length > 0 && (
          <Help
            content={<LayersBreakdown rates={collateral.rates} />}
            className="text-legend"
          />
        )}
        <StatusChip status={collateral.status} />
        {hasExited && (
          <Chip className="bg-muted text-legend">
            <Trans>Exited</Trans>
          </Chip>
        )}
      </div>
      {FEE_CATEGORIES.map((category) => (
        <FeeCell
          key={category}
          category={category}
          rate={categoryRates[category]}
          amount={collateral.accrued[category]}
          isTracked={isTracked}
        />
      ))}
      <div className="flex gap-1 sm:justify-end font-semibold">
        <span className="sm:hidden">
          <Trans>Total:</Trans>
        </span>
        {isTracked ? formatFeeUsd(collateral.accrued.total) : <NotTracked />}
      </div>
    </div>
  )
}

const FeesTable = ({ collaterals }: { collaterals: FeeCollateral[] }) => (
  <div className="bg-card rounded-2xl overflow-hidden">
    <div
      className={cn(
        'hidden sm:grid gap-4 py-2.5 px-4 text-legend text-sm border-b border-border',
        GRID
      )}
    >
      <span>
        <Trans>Collateral</Trans>
      </span>
      {FEE_CATEGORIES.map((category) => (
        <span key={category}>
          <CategoryLabel category={category} />
        </span>
      ))}
      <span className="text-right">
        <Trans>Total</Trans>
      </span>
    </div>
    {collaterals.map((collateral) => (
      <CollateralRow key={collateral.address} collateral={collateral} />
    ))}
  </div>
)

export default FeesTable
