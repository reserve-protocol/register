import Help from 'components/help'
import Spinner from '@/components/ui/spinner'
import { Circle } from 'lucide-react'
import { formatCurrency } from 'utils'
import { cn } from '@/lib/utils'

interface RevenueOverviewHeaderProps {
  text: string
  help?: string
  amount?: number
  muted?: boolean
  loading?: boolean
  className?: string
}

const RevenueOverviewHeader = ({
  text,
  amount,
  help,
  muted,
  loading = false,
  className,
}: RevenueOverviewHeaderProps) => {
  return (
    <div
      className={cn(
        'flex items-center mx-1 sm:mx-4 mb-4 text-legend',
        className
      )}
    >
      <Circle
        size={8}
        className={cn(
          'shrink-0',
          !muted ? 'fill-success' : 'fill-muted-foreground'
        )}
        stroke="transparent"
      />
      <span className="mx-2">{text}</span>
      {loading ? (
        <Spinner className="ml-auto" size={16} />
      ) : (
        <div className="flex items-center ml-auto shrink-0">
          {amount !== undefined && (
            <span className="font-semibold text-primary mr-2">
              ${formatCurrency(amount)}
            </span>
          )}
          {help && <Help content={help} />}
        </div>
      )}
    </div>
  )
}

export default RevenueOverviewHeader
