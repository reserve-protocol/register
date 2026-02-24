import { formatCurrency } from '@/utils'
import { ArrowUpRight } from 'lucide-react'
import { PortfolioVoteLock } from '../types'

const RewardsAvailable = ({
  voteLocks,
}: {
  voteLocks: PortfolioVoteLock[]
}) => {
  const totalRewardsUSD = voteLocks.reduce(
    (sum, lock) =>
      sum + (lock.rewards || []).reduce((s, r) => s + (r.value || 0), 0),
    0
  )

  if (totalRewardsUSD === 0) return null

  return (
    <div className="bg-card border border-border rounded-[20px] px-6 py-4 flex flex-col justify-between gap-2">
      <div>
        <h3 className="font-bold text-xl text-primary leading-[30px]">
          Rewards Available
        </h3>
        <p className="text-sm font-light text-legend">
          Your total participation awards available across all chains
        </p>
      </div>
      <p className="text-xl font-bold text-primary">
        ${formatCurrency(totalRewardsUSD)}
      </p>
      <a
        href="#available-rewards"
        className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-2xl w-fit"
      >
        Collect Rewards
      </a>
      <a
        href="/earn"
        className="flex items-center gap-0.5 text-xs font-light text-primary"
        target="_blank"
        rel="noreferrer"
      >
        Learn more about how to earn APY
        <ArrowUpRight size={16} />
      </a>
    </div>
  )
}

export default RewardsAvailable
