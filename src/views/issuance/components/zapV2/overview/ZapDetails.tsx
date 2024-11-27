import { Box, BoxProps, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { formatNumber, formatSlippage } from '../utils'
import ZapGasCost from './ZapGasCost'
import ZapRate from './ZapRate'
import { PRICE_IMPACT_THRESHOLD } from '../constants'
import Skeleton from 'react-loading-skeleton'

interface Props extends BoxProps {
  hideGasCost?: boolean
}

const ZapDetails = ({ hideGasCost, ...props }: Props) => {
  const { priceImpact, slippage, loadingZap, zapToYieldPosition } = useZap()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} {...props}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
      >
        <Text sx={{ fontSize: 14 }}>Price Impact</Text>
        {loadingZap ? (
          <Skeleton width={36} height={10} />
        ) : (
          <Text
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color:
                (priceImpact || 0) > PRICE_IMPACT_THRESHOLD ? 'danger' : 'text',
            }}
          >
            {formatNumber(priceImpact || 0, 2)}%
          </Text>
        )}
      </Box>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
      >
        <Text sx={{ fontSize: 14 }}>Max. slippage</Text>
        <Text sx={{ fontSize: 14, fontWeight: 500 }}>
          {formatSlippage(slippage)}
        </Text>
      </Box>
      {!zapToYieldPosition && (
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'space-between' }}
        >
          <Text sx={{ fontSize: 14 }}>Rate</Text>
          <ZapRate sx={{ fontSize: 14, fontWeight: 500 }} />
        </Box>
      )}
      {!hideGasCost && <ZapGasCost />}
    </Box>
  )
}

export default ZapDetails
