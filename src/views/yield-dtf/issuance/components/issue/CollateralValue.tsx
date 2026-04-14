import { FC, memo } from 'react'
import { formatCurrency, formatToSignificantDigits } from 'utils'
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
  const amount = Number(formatUnits(quantity, decimals))

  return (
    <span className="font-medium">
      {formatToSignificantDigits(amount)}
      {price !== undefined && (
        <span className="text-legend text-sm">
          {' '}
          (${formatCurrency(amount * price, 2)})
        </span>
      )}
    </span>
  )
}

export default memo(CollateralValue)
