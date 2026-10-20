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

const StatusNote = ({ status }: { status: FeeCollateral['status'] }) => {
  if (status === 'onchain') return <Trans>Rates read on-chain.</Trans>
  if (status === 'estimated') {
    return <Trans>Rates estimated, not read on-chain.</Trans>
  }
  return <Trans>This protocol is not tracked yet.</Trans>
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

const RowDetails = ({ collateral }: { collateral: FeeCollateral }) => {
  const { layers, zeroRateMarkets } = groupRateLayers(collateral.rates)

  return (
    <div className="flex flex-col gap-2 text-xs min-w-56">
      <span className="text-legend">
        <StatusNote status={collateral.status} />
      </span>
      {layers.length > 0 && (
        <ul className="flex flex-col gap-1">
          {layers.map((rate) => (
            <LayerLine
              key={`${rate.category}-${rate.layer.address}`}
              rate={rate}
            />
          ))}
          {zeroRateMarkets > 0 && (
            <li className="text-legend">
              <Trans>+ {zeroRateMarkets} markets at 0%</Trans>
            </li>
          )}
        </ul>
      )}
    </div>
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
  <div
    className={cn(
      'flex-col text-sm sm:text-base',
      isTracked ? 'flex' : 'hidden sm:flex'
    )}
  >
    <span className="text-xs text-legend sm:hidden">
      <CategoryLabel category={category} />
    </span>
    {!isTracked ? (
      <NotTracked />
    ) : (
      <>
        <span>{rate ? <RateLabel rate={rate} /> : '—'}</span>
        {(!!rate || amount > 0) && (
          <span className="text-xs sm:text-sm text-legend">
            {formatFeeUsd(amount)}
          </span>
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
        'grid grid-cols-3 gap-x-3 gap-y-2 sm:gap-4 items-start sm:items-center p-3 sm:p-4 border-b border-border last:border-b-0',
        GRID,
        hasExited && 'opacity-60'
      )}
    >
      <div className="col-span-2 sm:col-span-1 flex items-center gap-2 min-w-0">
        <TokenLogo symbol={collateral.symbol} className="shrink-0" />
        <span className="text-sm sm:text-base font-semibold">
          {collateral.label}{' '}
          <Help
            content={<RowDetails collateral={collateral} />}
            className="inline-flex align-middle text-legend"
          />
          {hasExited && (
            <Chip className="ml-2 inline-block align-middle bg-muted text-legend">
              <Trans>Exited</Trans>
            </Chip>
          )}
        </span>
      </div>
      <div className="col-start-3 row-start-1 sm:col-start-5 self-center flex justify-end font-semibold">
        {isTracked ? formatFeeUsd(collateral.accrued.total) : <NotTracked />}
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
      {!isTracked && (
        <span className="col-span-3 text-sm text-legend sm:hidden">
          <Trans>This protocol is not tracked yet.</Trans>
        </span>
      )}
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
