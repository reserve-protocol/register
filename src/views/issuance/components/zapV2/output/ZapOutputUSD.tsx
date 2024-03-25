import Skeleton from 'react-loading-skeleton'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapOutputUSD = () => {
  const {
    tokenOut,
    amountOut,
    zapDustUSD,
    loadingZap,
    validatingZap,
    zapResult,
  } = useZap()

  if ((!zapResult?.tx && validatingZap) || loadingZap) {
    return <Skeleton height={18} width={240} />
  }

  return (
    <Box>
      <Text
        variant="legend"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        ${formatCurrency((tokenOut?.price || 0) * Number(amountOut), 2)}
      </Text>
      {zapDustUSD !== undefined && zapDustUSD !== 0 && (
        <Text>
          {' '}
          +{' '}
          <Text variant="legend" sx={{ fontWeight: 'strong' }}>
            ${formatCurrency(+zapDustUSD, 2)}
          </Text>{' '}
          in dust
        </Text>
      )}
    </Box>
  )
}

export default ZapOutputUSD
