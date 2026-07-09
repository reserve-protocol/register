import { formatCurrency } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import { portfolioRewardsAtom } from '../atoms'

const RewardsAvailable = () => {
  const rewards = useAtomValue(portfolioRewardsAtom)
  const totalRewardsUSD = rewards.reduce((sum, r) => sum + (r.value || 0), 0)

  if (totalRewardsUSD === 0) return null

  return (
    <div className="bg-card border border-border rounded-[20px] px-6 py-4 flex flex-col justify-between gap-2">
      <div>
        <h3 className="font-bold text-xl text-primary leading-[30px]">
          <Trans>Rewards Available</Trans>
        </h3>
        <p className="text-sm font-light text-legend">
          <Trans>
            Your total participation awards available across all chains
          </Trans>
        </p>
      </div>
      <p className="text-xl font-bold text-primary">
        ${formatCurrency(totalRewardsUSD)}
      </p>
      <button
        onClick={() =>
          document
            .getElementById('available-rewards')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-2xl w-fit"
      >
        <Trans>Collect Rewards</Trans>
      </button>
      <a
        href="/earn"
        className="flex items-center gap-0.5 text-xs font-light text-primary"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Learn more about how to earn APY</Trans>
        <ArrowUpRight size={16} />
      </a>
    </div>
  )
}

export default RewardsAvailable
