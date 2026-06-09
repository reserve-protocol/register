import { Plural, Trans, useLingui } from '@lingui/react/macro'
import Help from 'components/help'
import GlobalMaxMintIcon from 'components/icons/GlobalMaxMintIcon'
import GlobalMaxRedeemIcon from 'components/icons/GlobalMaxRedeemIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatCurrency } from 'utils'

const IssuanceInfoStat = ({
  icon,
  title,
  subtitle,
  available,
  max,
  timeUntilCharged,
  tooltipContent,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  available: number
  max: number
  timeUntilCharged: number
  tooltipContent: ReactNode
}) => {
  const rToken = useRToken()

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between text-base mb-2">
          <span className="font-bold whitespace-nowrap">{subtitle}</span>
          <div className="flex items-center gap-1">
            <span className="font-bold whitespace-nowrap text-primary">
              {formatCurrency(available, 0)}
            </span>
            <span className="text-sm">{rToken?.symbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>
            <Trans>Time until fully charged</Trans>
          </span>
          {timeUntilCharged > 0 ? (
            <span className="font-bold">
              {timeUntilCharged < 1 ? '<1' : timeUntilCharged.toFixed(0)}{' '}
              <Plural
                value={timeUntilCharged >= 1.5 ? 2 : 1}
                one="minute"
                other="minutes"
              />
            </span>
          ) : (
            <span className="font-bold">
              <Trans>Fully Charged</Trans>
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>
            <Trans>0-100% Recharge time</Trans>
          </span>
          <span className="font-bold">1h</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span>
              <Trans>Current max charge</Trans>
            </span>
            <Help content={tooltipContent} placement="bottom" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold whitespace-nowrap">
              {formatCurrency(max, 0)}
            </span>
            <span className="text-sm">{rToken?.symbol}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const IssuanceInfo = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const rToken = useRToken()
  const {
    tokenSupply,
    issuanceAvailable,
    issuanceThrottleAmount,
    issuanceThrottleRate,
    redemptionAvailable,
    redemptionThrottleAmount,
    redemptionThrottleRate,
  } = useAtomValue(rTokenStateAtom)

  const [maxMint, timeUntilFullyChargedMint] = useMemo(() => {
    const limitByPctRate = tokenSupply * issuanceThrottleRate
    const maxIssuanceLimit = Math.max(issuanceThrottleAmount, limitByPctRate)

    const difference = maxIssuanceLimit - issuanceAvailable
    const timeUntilCharged =
      difference > 0 && maxIssuanceLimit > 0
        ? (difference / maxIssuanceLimit) * 60
        : 0
    const roundedTimeUntilCharged =
      timeUntilCharged < 0.001 ? 0 : timeUntilCharged
    return [maxIssuanceLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    issuanceThrottleAmount,
    issuanceThrottleRate,
    issuanceAvailable,
  ])

  const [maxRedeem, timeUntilFullyChargedRedeem] = useMemo(() => {
    const limitByPctRate = tokenSupply * redemptionThrottleRate

    let maxRedemptionLimit
    if (redemptionThrottleAmount > limitByPctRate) {
      maxRedemptionLimit =
        tokenSupply < redemptionThrottleAmount
          ? tokenSupply
          : redemptionThrottleAmount
    } else {
      maxRedemptionLimit = limitByPctRate
    }

    const difference = maxRedemptionLimit - redemptionAvailable
    const timeUntilCharged =
      difference > 0 && maxRedemptionLimit > 0
        ? (difference / maxRedemptionLimit) * 60
        : 0

    const roundedTimeUntilCharged =
      timeUntilCharged < 0.001 ? 0 : timeUntilCharged
    return [maxRedemptionLimit, roundedTimeUntilCharged]
  }, [
    tokenSupply,
    redemptionThrottleAmount,
    redemptionThrottleRate,
    redemptionAvailable,
  ])

  return (
    <div className={cn('p-0 xl:p-6 pt-6', className)}>
      <IssuanceInfoStat
        icon={<GlobalMaxMintIcon width={20} height={20} />}
        title={t`Mint - Global throttle`}
        subtitle={t`Mintable now`}
        available={issuanceAvailable}
        max={maxMint}
        timeUntilCharged={timeUntilFullyChargedMint}
        tooltipContent={
          <span className="text-sm">
            <Trans>
              The mint max charge is either{' '}
              {(issuanceThrottleRate * 100).toFixed(1)}% of {rToken?.symbol}{' '}
              supply or a lower bound of{' '}
              <span className="font-bold">
                {formatCurrency(issuanceThrottleAmount, 0)}
              </span>{' '}
              {rToken?.symbol}, whichever is the higher amount.
            </Trans>
          </span>
        }
      />
      <Separator className="my-4 border-secondary" />
      <IssuanceInfoStat
        icon={<GlobalMaxRedeemIcon width={20} height={20} />}
        title={t`Redeem - Global throttle`}
        subtitle={t`Redeemable now`}
        available={redemptionAvailable}
        max={maxRedeem}
        timeUntilCharged={timeUntilFullyChargedRedeem}
        tooltipContent={
          <span className="text-sm">
            <Trans>
              The redeem max charge is either{' '}
              {(redemptionThrottleRate * 100).toFixed(1)}% of {rToken?.symbol}{' '}
              supply or a lower bound of{' '}
              <span className="font-bold">
                {formatCurrency(redemptionThrottleAmount, 0)}
              </span>{' '}
              {rToken?.symbol}, whichever is the higher amount. If that exceeds
              the total supply, the limit is set to the total supply of{' '}
              {rToken?.symbol}.
            </Trans>
          </span>
        }
      />
    </div>
  )
}
export default IssuanceInfo
