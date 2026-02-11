import { cn } from '@/lib/utils'
import About from './about'
import StakingMetrics from './staking-metrics'
import UnstakeDelayOverview from './unstake-delay-overview'
import StakeApy from './stake-apy'

interface OverviewProps {
  className?: string
}

const Overview = ({ className }: OverviewProps) => (
  <div className={cn('pb-4', className)}>
    <StakingMetrics />
    <StakeApy />
    <UnstakeDelayOverview />
    <About className="mt-3 sm:mt-4" />
  </div>
)

export default Overview
