import GasIcon from 'components/icons/GasIcon'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'
import Skeleton from 'react-loading-skeleton'

const ZapGasCost = (props: BoxProps) => {
  const { gasCost, loadingZap } = useZap()

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
      {...props}
    >
      <Text sx={{ fontSize: 14 }}>Estimated gas cost</Text>
      <Box variant="layout.verticalAlign" sx={{ gap: 1, color: 'primary' }}>
        <GasIcon />
        {loadingZap ? (
          <Skeleton height={10} width={60} />
        ) : (
          <Text sx={{ fontSize: 14, fontWeight: 500 }}>
            ${gasCost ? formatCurrency(+gasCost, 2) : 0}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default ZapGasCost
