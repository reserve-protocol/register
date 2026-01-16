import { Trans } from '@lingui/macro'
import GasIcon from 'components/icons/GasIcon'
import { formatCurrency } from 'utils'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface GasEstimateProps {
  total: number
  breakdown?: { label: string; value: number }[]
  className?: string
}

const GasEstimate = ({ total, breakdown, className }: GasEstimateProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      <GasIcon />
      <span className="ml-2 mr-1">
        <Trans>Estimated gas cost</Trans>:
      </span>
      {total ? (
        <span className="font-semibold">${formatCurrency(total, 3)}</span>
      ) : (
        <Skeleton className="h-4 w-12" />
      )}
    </div>
  )
}

export default GasEstimate
