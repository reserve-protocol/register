import { cn } from '@/lib/utils'
import Help from '@/components/ui/help'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { trackClick } from '@/hooks/useTrackPage'
import { relativeTime } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import dayjs from 'dayjs'
import { Receipt } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import type {
  UnderlyingFees,
  UnderlyingFeesPeriod,
} from './underlying-fees/api'
import FeesTable from './underlying-fees/fees-table'
import { formatDragPercent, formatFeeUsd } from './underlying-fees/rates'
import useUnderlyingFees from './underlying-fees/use-underlying-fees'

const PERIOD_ITEM_CLASS =
  'px-3 h-8 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary'

const Stat = ({
  label,
  value,
  help,
}: {
  label: ReactNode
  value: ReactNode
  help?: string
}) => (
  <div className="flex flex-col p-3 border border-secondary bg-card rounded-xl grow sm:grow-0 sm:min-w-48">
    <span className="flex items-center gap-1 text-sm text-legend">
      {label}
      {help && <Help content={help} />}
    </span>
    <span className="font-bold">{value}</span>
  </div>
)

const useNowSeconds = () => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 60_000)
    return () => clearInterval(id)
  }, [])

  return now
}

const Freshness = ({
  data,
  hasRefreshFailed,
}: {
  data: UnderlyingFees
  hasRefreshFailed: boolean
}) => {
  const now = useNowSeconds()
  const { trackingSince, lastSnapshotAt } = data
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-legend">
      {trackingSince !== null && (
        <span>
          <Trans>
            Tracking since {dayjs.unix(trackingSince).format('MMM D, YYYY')}
          </Trans>
        </span>
      )}
      {lastSnapshotAt !== null && (
        <span>
          <Trans>Updated {relativeTime(lastSnapshotAt, now)} ago</Trans>
        </span>
      )}
      {hasRefreshFailed && (
        <span className="text-warning">
          <Trans>Could not refresh, showing the last data</Trans>
        </span>
      )}
    </div>
  )
}

const Header = ({ action }: { action: ReactNode }) => {
  const { t } = useLingui()

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-2 text-2xl">
        <Receipt size={24} />
        <span className="font-semibold">
          <Trans>Underlying protocol fees</Trans>
        </span>
        <Help
          content={t`Morpho vaults charge fees by minting new shares, which dilutes holders. Aave and Compound keep part of the interest paid by borrowers before it reaches suppliers. In no case is it a separate payment.`}
        />
        <div className="ml-auto text-base">{action}</div>
      </div>
      <p className="mb-4 text-legend max-w-[640px]">
        <Trans>
          Fees charged by the protocols and curators of the collateral. They are
          already reflected in the collateral yield and are not deducted again
          from the APY shown.
        </Trans>
      </p>
    </>
  )
}

const UnderlyingFeesSection = () => {
  const { t } = useLingui()
  const [period, setPeriod] = useState<UnderlyingFeesPeriod>('30d')
  const { data, isLoading, isError, isPlaceholderData, isEnabled } =
    useUnderlyingFees(period)

  if (!isEnabled) return null
  // Visibility follows the default period so a failed toggle keeps the section.
  if (period === '30d' && !isLoading && !data?.collaterals.length) return null

  const handlePeriodChange = (value: string) => {
    if (!value) return
    setPeriod(value as UnderlyingFeesPeriod)
    trackClick('overview', `underlying_fees_period_${value}`, data?.rToken)
  }

  return (
    <>
      <hr className="my-10 border-border" />
      <div className="px-4 pb-3">
        <Header
          action={
            <ToggleGroup
              type="single"
              className="bg-muted-foreground/10 p-1 rounded-lg justify-start w-max"
              value={period}
              onValueChange={handlePeriodChange}
            >
              <ToggleGroupItem className={PERIOD_ITEM_CLASS} value="30d">
                <Trans>30D</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem className={PERIOD_ITEM_CLASS} value="ytd">
                <Trans>YTD</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem className={PERIOD_ITEM_CLASS} value="1y">
                <Trans>1Y</Trans>
              </ToggleGroupItem>
            </ToggleGroup>
          }
        />
        {!!data && (
          <div className="flex flex-wrap gap-4 mb-3">
            <Stat
              label={<Trans>Paid in period</Trans>}
              value={formatFeeUsd(data.totals.total)}
            />
            <Stat
              label={<Trans>Annualized drag</Trans>}
              value={formatDragPercent(data.annualizedDragBps)}
              help={t`Realized cost over the last 7 days, weighted by position. It is not a projection.`}
            />
          </div>
        )}
        {!data && isError && (
          <p className="text-legend">
            <Trans>Fee data for this period is not available right now.</Trans>
          </p>
        )}
        {!data && !isError && <Skeleton height={64} count={3} />}
        {!!data && (
          <div
            className={cn(
              'transition-opacity',
              isPlaceholderData && 'opacity-50'
            )}
          >
            <div className="mb-4">
              <Freshness data={data} hasRefreshFailed={isError} />
            </div>
            <FeesTable collaterals={data.collaterals} />
          </div>
        )}
      </div>
    </>
  )
}

export default UnderlyingFeesSection
