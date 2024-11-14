import { FC, memo } from 'react'
import { Text } from 'theme-ui'
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
    <Text sx={{ fontWeight: '500' }}>
      {formatCurrency(Number(formatUnits(quantity, decimals)))}
      {price !== undefined && (
        <Text sx={{ color: 'secondaryText', fontSize: 14 }}>
          {' '}
          ($
          {formatCurrency(Number(formatUnits(quantity, decimals)) * price, 6)})
        </Text>
      )}
    </Text>
  )
}

export default memo(CollateralValue)
