import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils'
import { PortfolioVoteLock } from '../types'
import { Gift } from 'lucide-react'

const RewardsAvailable = ({ voteLocks }: { voteLocks: PortfolioVoteLock[] }) => {
  const totalRewardsUSD = voteLocks.reduce(
    (sum, lock) => sum + (lock.rewards || []).reduce((s, r) => s + r.value, 0),
    0
  )

  if (totalRewardsUSD === 0) return null

  return (
    <Card className="p-4 rounded-3xl">
      <div className="flex items-center gap-2 mb-2">
        <Gift size={16} className="text-primary" />
        <h3 className="font-semibold">Rewards Available</h3>
      </div>
      <p className="text-2xl font-bold text-primary">
        ${formatCurrency(totalRewardsUSD)}
      </p>
      <a
        href="#available-rewards"
        className="text-sm text-primary hover:underline mt-1 inline-block"
      >
        View & Claim rewards
      </a>
    </Card>
  )
}

export default RewardsAvailable
