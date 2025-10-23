import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReactNode } from 'react'

interface RevenueMetricsCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  loading?: boolean
  className?: string
}

const RevenueMetricsCard = ({
  title,
  value,
  subtitle,
  icon,
  loading = false,
  className = '',
}: RevenueMetricsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            {subtitle && <Skeleton className="h-4 w-16" />}
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueMetricsCard