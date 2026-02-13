import { cn } from '@/lib/utils'
import GasIcon from 'components/icons/GasIcon'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'
import Skeleton from 'react-loading-skeleton'

interface Props {
  className?: string
}

const ZapGasCost = ({ className }: Props) => {
  const { gasCost, loadingZap } = useZap()

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm">Estimated gas cost</span>
      <div className="flex items-center gap-1 text-primary">
        <GasIcon />
        {loadingZap ? (
          <Skeleton height={10} width={60} />
        ) : (
          <span className="text-sm font-medium">
            ${gasCost ? formatCurrency(+gasCost, 2) : 0}
          </span>
        )}
      </div>
    </div>
  )
}

export default ZapGasCost
