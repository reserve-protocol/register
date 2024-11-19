import { Button } from 'components'
import { Zap } from 'react-feather'
import { Box, Text } from 'theme-ui'
import { ZAP_EARN } from 'views/earn/utils/constants'

const PoolZapToEarn = ({ pool }: { pool: string }) => {
  const isAvailable = !!ZAP_EARN[pool]

  if (!isAvailable) return null

  return (
    <Box
      variant="layout.verticalAlign"
      py="3"
      px="4"
      sx={{ borderBottom: '1px solid', gap: 2, borderColor: 'border' }}
    >
      <Zap size={16} />
      <Box mr="auto">
        <Text variant="strong">This pool has "1-click earn" enabled</Text>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          This allows you to deposit and earn "without already having the LP
          token in your wallet"
        </Text>
      </Box>
      <Button>
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <Zap size={16} />
          Deposit
        </Box>
      </Button>
      <Button>
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <Zap size={16} />
          Withdraw
        </Box>
      </Button>
    </Box>
  )
}

export default PoolZapToEarn
