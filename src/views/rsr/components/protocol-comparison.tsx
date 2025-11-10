import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtocolComparisonProps {
  yieldRevenue: number
  indexRevenue: number
  yieldPercentage: number
  indexPercentage: number
  rsrPrice: number
  isLoading: boolean
}

const ProtocolComparison = ({
  yieldRevenue,
  indexRevenue,
  yieldPercentage,
  indexPercentage,
  rsrPrice,
  isLoading
}: ProtocolComparisonProps) => {
  if (isLoading) {
    return (
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-2">
              <BarChart3 className="h-4 w-4" />
            </div>
            Protocol Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-2">
              <BarChart3 className="h-4 w-4" />
            </div>
            Protocol Comparison
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-secondary rounded-md">All Chains</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Comparison Bar */}
          <div className="relative h-16 bg-secondary/30 rounded-lg overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${yieldPercentage}%` }}
            >
              {yieldPercentage > 20 && (
                <span className="text-white font-semibold">
                  {yieldPercentage.toFixed(1)}%
                </span>
              )}
            </div>
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${indexPercentage}%` }}
            >
              {indexPercentage > 20 && (
                <span className="text-white font-semibold">
                  {indexPercentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-around">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-400" />
              <span>Yield DTF: ${formatCurrency(yieldRevenue, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-400" />
              <span>Index DTF: ${formatCurrency(indexRevenue, 0)}</span>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Leading Protocol</p>
              <p className="font-semibold">
                {yieldRevenue > indexRevenue ? 'Yield DTF' : 'Index DTF'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Revenue Difference</p>
              <p className="font-semibold flex items-center justify-center gap-1">
                {yieldRevenue > indexRevenue ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                ${formatCurrency(Math.abs(yieldRevenue - indexRevenue), 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">RSR Price</p>
              <p className="font-semibold">${rsrPrice.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProtocolComparison