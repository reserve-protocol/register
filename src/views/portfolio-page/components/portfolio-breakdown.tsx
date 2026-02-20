import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils'
import { PortfolioResponse } from '../types'

const BreakdownRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-legend">{label}</span>
    <span className="text-sm font-semibold">${formatCurrency(value)}</span>
  </div>
)

const PortfolioBreakdown = ({ data }: { data: PortfolioResponse }) => {
  const indexValue = data.indexDTFs.reduce((sum, d) => sum + d.value, 0)
  const yieldValue = data.yieldDTFs.reduce((sum, d) => sum + d.value, 0)
  const rsrValue = data.rsrBalances.reduce((sum, d) => sum + d.value, 0)
  const stakedValue = data.stakedRSR.reduce((sum, d) => sum + d.valueUSD, 0)
  const voteLockValue = data.voteLocks.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="p-4 rounded-3xl">
      <h3 className="font-semibold mb-2">Portfolio Breakdown</h3>
      <div className="divide-y">
        <BreakdownRow label="Index DTFs" value={indexValue} />
        <BreakdownRow label="Yield DTFs" value={yieldValue} />
        <BreakdownRow label="RSR" value={rsrValue} />
        <BreakdownRow label="Staked RSR" value={stakedValue} />
        <BreakdownRow label="Vote-locked" value={voteLockValue} />
      </div>
    </Card>
  )
}

export default PortfolioBreakdown
