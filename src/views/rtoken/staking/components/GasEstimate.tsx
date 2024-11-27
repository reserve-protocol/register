import { Trans } from '@lingui/macro'
import GasIcon from 'components/icons/GasIcon'
import { Box, BoxProps, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface IGasEstimate extends BoxProps {
  total: number
  breakdown?: { label: string; value: number }[]
}

const GasEstimate = ({ total, breakdown, ...props }: IGasEstimate) => {
  return (
    <Box variant="layout.verticalAlign" {...props}>
      <GasIcon />
      <Text ml="2" mr={1}>
        <Trans>Estimated gas cost</Trans>:
      </Text>
      {total ? (
        <Text variant="bold">${formatCurrency(total, 3)}</Text>
      ) : (
        <Spinner size={16} />
      )}

      {/* <ChevronDown size={16} /> */}
    </Box>
  )
}

export default GasEstimate
