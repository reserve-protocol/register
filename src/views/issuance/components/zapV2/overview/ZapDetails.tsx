import { Box, BoxProps, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { formatSlippage } from '../utils'
import ZapRate from './ZapRate'
import { formatCurrency } from 'utils'
import GasIcon from 'components/icons/GasIcon'

const ZapDetails = (props: BoxProps) => {
  const { priceImpact, slippage, gasCost } = useZap()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} {...props}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
      >
        <Text sx={{ fontSize: 14 }}>Price Imapct</Text>
        <Text
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: (priceImpact || 0) > 0 ? 'danger' : 'text',
          }}
        >
          {priceImpact || 0}%
        </Text>
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
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
      >
        <Text sx={{ fontSize: 14 }}>Rate</Text>
        <ZapRate sx={{ fontSize: 14, fontWeight: 500 }} />
      </Box>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
      >
        <Text sx={{ fontSize: 14 }}>Estimated gas cost</Text>
        <Box variant="layout.verticalAlign" sx={{ gap: 1, color: 'primary' }}>
          <GasIcon />
          <Text sx={{ fontSize: 14, fontWeight: 500 }}>
            ${gasCost ? formatCurrency(+gasCost, 2) : 0}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default ZapDetails
