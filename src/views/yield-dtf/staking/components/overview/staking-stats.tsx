import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import useTokenStats from 'hooks/useTokenStats'
import { useAtomValue } from 'jotai'
import {
  estimatedApyAtom,
  rTokenBackingDistributionAtom,
  rTokenConfigurationAtom,
} from 'state/atoms'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'
import { cn } from '@/lib/utils'

const IconInfo = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) => (
  <div className="flex items-center">
    {icon}
    <div className="ml-2">
      <span className="text-sm text-legend">{title}</span>
      <span className="block">{text}</span>
    </div>
  </div>
)

interface StakingStatsProps {
  className?: string
}

const StakingStats = ({ className }: StakingStatsProps) => {
  const { stakers } = useAtomValue(estimatedApyAtom)
  const distribution = useAtomValue(rTokenBackingDistributionAtom)
  const params = useAtomValue(rTokenConfigurationAtom)
  const rToken = useRToken()
  const stats = useTokenStats(rToken?.address.toLowerCase() ?? '')

  return (
    <div className={cn('rounded-3xl border border-border p-0', className)}>
      <div className="grid grid-cols-2 gap-0">
        <div className="p-4 border-r border-b border-border">
          <div className="mb-3 flex flex-row items-center">
            <span className="mr-2 text-sm text-muted-foreground">
              <Trans>Stake pool</Trans>
            </span>
          </div>
          <IconInfo
            icon={<img src="/svgs/trendup.svg" alt="" />}
            title={t`Total RSR staked`}
            text={`${formatCurrency(stats.staked)}`}
          />
        </div>
        <div className="p-4 border-b border-border">
          <div className="mb-3 flex items-center">
            <span className="mr-2 text-sm text-muted-foreground">
              <Trans>Est. Staking APY</Trans>
            </span>
            <Help content="Manually estimated APY base on basket averaged yield, Calculation = [avgCollateralYield * rTokenMarketCap / rsrStaked]" />
          </div>
          <IconInfo
            icon={<img src="/svgs/trendup.svg" alt="" />}
            title={t`Current`}
            text={formatPercentage(stakers || 0)}
          />
        </div>
        <div className="p-4 border-r border-border">
          <span className="mr-2 text-sm text-muted-foreground mb-3 block">
            <Trans>Unstaking Delay</Trans>
          </span>
          <IconInfo
            icon={<img src="/svgs/unstakingdelay.svg" alt="" />}
            title={t`Current`}
            text={parseDuration(+params?.unstakingDelay || 0)}
          />
        </div>
        <div className="p-4 border-b border-border">
          <span className="text-sm text-muted-foreground mb-3 block">
            <Trans>Backing + Staked</Trans>
          </span>
          <IconInfo
            icon={<img src="/svgs/staked.svg" alt="" />}
            title={t`Current`}
            text={`${
              (distribution?.backing ?? 0) + (distribution?.staked ?? 0)
            }%`}
          />
        </div>
      </div>
    </div>
  )
}

export default StakingStats
