import { formatUSD } from '@/utils'
import { PortfolioResponse } from '../types'

const BreakdownRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-base font-light">{label}</span>
    <span className="text-base font-bold">{formatUSD(value)}</span>
  </div>
)

const PortfolioBreakdown = ({ data }: { data: PortfolioResponse }) => {
  const indexValue = data.indexDTFs.reduce((sum, d) => sum + (d.value || 0), 0)
  const yieldValue = data.yieldDTFs.reduce((sum, d) => sum + (d.value || 0), 0)
  const rsrValue = data.rsrBalances.reduce((sum, d) => sum + (d.value || 0), 0)
  const stakedValue = data.stakedRSR.reduce((sum, d) => sum + (d.value || 0), 0)
  const voteLockValue = data.voteLocks.reduce(
    (sum, d) => sum + (d.value || 0),
    0
  )

  return (
    <div className="bg-card border border-border rounded-[20px] px-6 py-4">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-primary leading-[30px]">
          Portfolio Breakdown
        </h3>
        <p className="text-sm font-light text-legend">Value by asset type</p>
      </div>
      <div className="flex flex-col gap-2">
        <BreakdownRow label="Index DTFs" value={indexValue} />
        <BreakdownRow label="Yield DTFs" value={yieldValue} />
        <BreakdownRow label="Staked RSR" value={stakedValue} />
        <BreakdownRow label="Vote-locked" value={voteLockValue} />
        <BreakdownRow label="RSR" value={rsrValue} />
      </div>
    </div>
  )
}

export default PortfolioBreakdown
