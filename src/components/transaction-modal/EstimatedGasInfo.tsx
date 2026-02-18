import { Trans } from '@lingui/macro'
import Spinner from '@/components/ui/spinner'
import { formatCurrency } from 'utils'

interface Props {
  fee?: number | null
  className?: string
}

const EstimatedGasInfo = ({ fee, className }: Props) => {
  return (
    <div className={`text-sm text-center ${className ?? ''}`}>
      <span className="text-legend mr-1">
        <Trans>Estimated gas cost:</Trans>
      </span>
      {fee ? (
        <span className="font-medium">${formatCurrency(fee)}</span>
      ) : (
        <Spinner size={12} />
      )}
    </div>
  )
}

export default EstimatedGasInfo
