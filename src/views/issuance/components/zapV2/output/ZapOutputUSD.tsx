import { useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { rTokenPriceAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapOutputUSD = () => {
  const { amountOut, zapDustUSD, loadingZap } = useZap()
  const price = useAtomValue(rTokenPriceAtom)

  if (loadingZap) {
    return <Skeleton height={18} width={48} />
  }

  return (
    <Box>
      <Text
        variant="legend"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        ${formatCurrency(price * Number(amountOut), 2)}
      </Text>
      {zapDustUSD && (
        <Text>
          {' '}
          +{' '}
          <Text variant="legend" color="black">
            ${zapDustUSD}
          </Text>{' '}
          in dust
        </Text>
      )}
    </Box>
  )
}

export default ZapOutputUSD
