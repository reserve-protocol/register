import GasIcon from 'components/icons/GasIcon'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapGasCost = (props: BoxProps) => {
  const { gasCost } = useZap()

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
      {...props}
    >
      <Text sx={{ fontSize: 14 }}>Estimated gas cost</Text>
      <Box variant="layout.verticalAlign" sx={{ gap: 1, color: 'primary' }}>
        <GasIcon />
        <Text sx={{ fontSize: 14, fontWeight: 500 }}>
          ${gasCost ? formatCurrency(+gasCost, 2) : 0}
        </Text>
      </Box>
    </Box>
  )
}

export default ZapGasCost
