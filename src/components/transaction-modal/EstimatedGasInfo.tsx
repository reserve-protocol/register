import { Trans } from '@lingui/macro'
import { Box, BoxProps, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  fee?: number | null
}

const EstimatedGasInfo = ({ fee, ...props }: Props) => {
  return (
    <Box sx={{ fontSize: 1, textAlign: 'center' }} {...props}>
      <Text variant="legend" mr={1}>
        <Trans>Estimated gas cost:</Trans>
      </Text>
      {fee ? (
        <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
      ) : (
        <Spinner color="black" size={12} />
      )}
    </Box>
  )
}

export default EstimatedGasInfo
