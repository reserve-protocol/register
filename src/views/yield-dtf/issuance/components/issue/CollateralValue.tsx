import { FC, memo } from 'react'
import { formatCurrency } from 'utils'
import { formatUnits } from 'viem'

type CollateralValueProps = {
  quantity: bigint
  decimals: number
  price?: number
}

const CollateralValue: FC<CollateralValueProps> = ({
  quantity,
  decimals,
  price,
}) => {
  return (
    <span className="font-medium">
      {formatCurrency(Number(formatUnits(quantity, decimals)))}
      {price !== undefined && (
        <span className="text-legend text-sm">
          {' '}
          ($
          {formatCurrency(Number(formatUnits(quantity, decimals)) * price, 6)})
        </span>
      )}
    </span>
  )
}

export default memo(CollateralValue)
