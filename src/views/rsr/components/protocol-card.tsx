import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils'
import { ReactNode } from 'react'

interface BreakdownItem {
  icon: ReactNode
  iconColor: string
  label: string
  value: number
  percentage?: number
  subValue?: string
}

interface ProtocolCardProps {
  title: string
  icon: ReactNode
  iconColor: string
  badge: string
  badgeColor: string
  totalRevenue: number
  breakdownItems: BreakdownItem[]
  stats: Array<{
    label: string
    value: string | number
  }>
  isLoading: boolean
}

const ProtocolCard = ({
  title,
  icon,
  iconColor,
  badge,
  badgeColor,
  totalRevenue,
  breakdownItems,
  stats,
  isLoading
}: ProtocolCardProps) => {
  return (
    <Card className="border-2 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-2">
              {icon}
            </div>
            {title}
          </span>
          <span className={`px-2 py-1 text-xs ${badgeColor} rounded-md`}>
            {badge}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <div className="space-y-6">
            {/* Total */}
            <div className="text-center py-4">
              <p className="text-3xl font-bold">
                ${formatCurrency(totalRevenue, 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Revenue Generated
              </p>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="space-y-4">
              {breakdownItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <div className={item.iconColor}>{item.icon}</div>
                    <span>{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${formatCurrency(item.value, 0)}
                    </p>
                    {item.percentage !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </p>
                    )}
                    {item.subValue && (
                      <p className="text-xs text-muted-foreground">
                        {item.subValue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProtocolCard