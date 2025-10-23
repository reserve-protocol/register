import { formatCurrency } from '@/utils'

interface ChainMetricsCardProps {
  chainName: string
  chainType: string
  badgeColor: string
  badgeText: string
  revenue: number
  tvl: number
}

const ChainMetricsCard = ({
  chainName,
  chainType,
  badgeColor,
  badgeText,
  revenue,
  tvl
}: ChainMetricsCardProps) => {
  return (
    <div className="p-4 rounded-lg bg-secondary/50 border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold">{chainName}</p>
          <p className="text-sm text-muted-foreground">{chainType}</p>
        </div>
        <span className={`px-2 py-1 text-xs ${badgeColor} rounded`}>
          {badgeText}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-lg font-bold">
            ${formatCurrency(revenue, 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">TVL</p>
          <p className="text-lg font-bold">
            ${formatCurrency(tvl, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChainMetricsCard