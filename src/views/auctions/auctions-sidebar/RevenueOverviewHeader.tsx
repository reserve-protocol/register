import Help from 'components/help'
import { Circle } from 'react-feather'
import { Box, BoxProps, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface RevenueOverviewHeader extends BoxProps {
  text: string
  help: string
  amount: number
  muted?: boolean
  loading?: boolean
}

const RevenueOverviewHeader = ({
  text,
  amount,
  help,
  muted,
  loading = false,
  ...props
}: RevenueOverviewHeader) => {
  return (
    <Box
      variant="layout.verticalAlign"
      mx={3}
      mb={3}
      sx={{ color: 'secondaryText' }}
      {...props}
    >
      <Circle
        size={8}
        fill={!muted ? '#11BB8D' : '#666666'}
        stroke={undefined}
      />
      <Text ml="2">{text}</Text>
      {loading ? (
        <Spinner ml="auto" size={16} />
      ) : (
        <>
          <Text variant="strong" sx={{ color: 'text' }} ml="auto" mr="2">
            ${formatCurrency(amount)}
          </Text>
          <Help content={help} />
        </>
      )}
    </Box>
  )
}

export default RevenueOverviewHeader
