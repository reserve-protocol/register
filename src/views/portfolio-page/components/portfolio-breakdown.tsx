import { formatUSD } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { portfolioBreakdownAtom } from '../atoms'

const BreakdownRow = ({
  label,
  value,
}: {
  label: ReactNode
  value: number
}) => (
  <div className="flex items-center justify-between">
    <span className="text-base font-light">{label}</span>
    <span className="text-base font-bold whitespace-nowrap">{formatUSD(value)}</span>
  </div>
)

const PortfolioBreakdown = () => {
  const breakdown = useAtomValue(portfolioBreakdownAtom)
  if (!breakdown) return null
  const { indexValue, yieldValue, rsrValue, stakedValue, voteLockValue } = breakdown

  return (
    <div className="bg-card border border-border rounded-[20px] px-6 py-4">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-primary leading-[30px]">
          <Trans>Portfolio Breakdown</Trans>
        </h3>
        <p className="text-sm font-light text-legend">
          <Trans>Value by asset type</Trans>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <BreakdownRow label={<Trans>Index DTFs</Trans>} value={indexValue} />
        <BreakdownRow label={<Trans>Yield DTFs</Trans>} value={yieldValue} />
        <BreakdownRow label={<Trans>Staked RSR</Trans>} value={stakedValue} />
        <BreakdownRow label={<Trans>Vote-locked</Trans>} value={voteLockValue} />
        <BreakdownRow label="RSR" value={rsrValue} />
      </div>
    </div>
  )
}

export default PortfolioBreakdown
