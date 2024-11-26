import Skeleton from 'react-loading-skeleton'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'
import Help from 'components/help'

const ZapOutputUSD = () => {
  const { tokenOut, amountOut, zapDustUSD, loadingZap } = useZap()

  if (loadingZap) {
    return <Skeleton height={18} width={240} />
  }

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
      <Text
        variant="legend"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        ${formatCurrency((tokenOut?.price || 0) * Number(amountOut), 2)}
      </Text>
      {zapDustUSD !== undefined && zapDustUSD !== 0 && (
        <>
          <Text>
            {' '}
            +{' '}
            <Text variant="legend" sx={{ fontWeight: 'strong' }}>
              ${formatCurrency(+zapDustUSD, 2)}
            </Text>{' '}
            in dust
          </Text>
          <Help
            mt="2px"
            content={`Dust is the leftover amount of tokens that cannot be exchanged or included in the RToken mint, due to the zapper route. It will be sent back to your wallet.`}
          />
        </>
      )}
    </Box>
  )
}

export default ZapOutputUSD
